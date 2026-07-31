import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { Product, CartItem, Order, OrderDetail, OrderStatus, OrdersListResult, BulkOrderRequest, BulkOrderStatus, BulkOrdersListResult } from "../types";
import { initialImages } from "../utils/images";
import { productsApiHeaders } from "../utils/api";
import { readApiError } from "../utils/apiError";
import { formatProductTitle } from "../productSpecs";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabaseClient";
import { adminAuthErrorMessage, isAdminUser } from "../utils/adminAuth";
import {
  fetchOrders,
  fetchOrderById,
  updateOrderStatusInDb,
  type OrdersQueryParams,
} from "../services/orders";
import {
  fetchBulkOrders,
  updateBulkOrderStatusInDb,
  type BulkOrdersQueryParams,
} from "../services/bulkOrder";

const PRODUCTS_API = "/api/products";

function warnStorageMode(res: Response) {
  const mode = res.headers.get("X-Storage-Mode");
  if (mode === "sqlite" && import.meta.env.DEV) {
    console.info("ℹ️ Products stored in local SQLite (db/products.db).");
  }
  if (mode === "json" && import.meta.env.DEV) {
    console.warn(
      "⚠️ Products API is using legacy JSON storage. Restart the API to use SQLite/Supabase.",
    );
  }
}

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<Product | void>;
  updateProduct: (id: number, updates: Partial<Product>) => Promise<Product | void>;
  deleteProduct: (id: number) => Promise<void>;
  addToCart: (product: Product, quantity: number) => boolean;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  adjustProductStock: (id: number, payload: { stock?: number; delta?: number }) => Promise<Product | void>;
  showToast: (msg: string) => void;
  getImage: (filename: string) => string;

  // مدیریت ادمین (Supabase Auth + RLS)
  isAdmin: boolean;
  authLoading: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;

  // سفارشات (Database)
  getOrders: (params?: OrdersQueryParams) => Promise<OrdersListResult>;
  getOrder: (orderId: string) => Promise<OrderDetail>;
  searchOrders: (params: OrdersQueryParams) => Promise<OrdersListResult>;
  updateOrderStatus: (orderId: string, currentStatus: OrderStatus, newStatus: OrderStatus) => Promise<Order>;

  // خرید عمده
  getBulkOrders: (params?: BulkOrdersQueryParams) => Promise<BulkOrdersListResult>;
  updateBulkOrderStatus: (id: number, status: BulkOrderStatus) => Promise<BulkOrderRequest>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  // 🛡️ مدیریت ادمین — Supabase Auth
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const applyAuthSession = useCallback((session: Session | null) => {
    setIsAdmin(isAdminUser(session?.user ?? null));
  }, []);

  const loginAdmin = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase پیکربندی نشده است.' };
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: 'ایمیل یا رمز عبور نامعتبر است.' };
      }

      if (!isAdminUser(data.user)) {
        await supabase.auth.signOut();
        return { success: false, error: adminAuthErrorMessage() };
      }

      applyAuthSession(data.session);
      return { success: true };
    } catch {
      return { success: false, error: 'خطا در ورود. لطفاً دوباره تلاش کنید.' };
    }
  };

  const logoutAdmin = async () => {
    if (isSupabaseConfigured()) {
      try {
        await getSupabaseClient().auth.signOut();
      } catch {
        // ignore sign-out errors
      }
    }
    setIsAdmin(false);
  };

  // 🛒 مجموع سبد خرید
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // 🛒 تعداد کل آیتم‌های سبد خرید
  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // 🧩 ====== API HANDLERS ======
  // تابع برای نرمال‌سازی محصولات (تبدیل ساختار قدیمی به جدید)
  const normalizeProduct = (product: any): Product => {
    if (product.name && !product.model) {
      const legacyType = product.type || 'شیر روشویی';
      return {
        id: product.id,
        model: product.category || 'سایر',
        goodsType: legacyType,
        type: legacyType,
        color: Object.keys(product.images || {})[0] || 'کروم',
        bodyWeight: product.specs?.تنه || product.specs?.سبک || '',
        tags: [
          ...(product.isNew ? ['جدید'] : []),
          ...(product.isBestSeller ? ['پرفروش'] : []),
        ],
        price: product.price || 0,
        brand: product.brand || '',
        stock: Number(product.stock ?? 0),
        description: product.description || '',
        image: product.images ? Object.values(product.images)[0] as string : '/loading.gif',
      };
    }
    const goodsType = product.goodsType || product.type || '';
    return {
      ...product,
      goodsType,
      type: goodsType,
      brand: product.brand ?? '',
      stock: Number(product.stock ?? 0),
    };
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(PRODUCTS_API);
      warnStorageMode(res);

      if (!res.ok) {
        const msg = await readApiError(res, `HTTP error! status: ${res.status}`);
        throw new Error(msg);
      }

      const data = await res.json();
      // تبدیل داده‌های قدیمی به ساختار جدید
      const normalizedData = data.map((product: any) => normalizeProduct(product));
      setProducts(normalizedData);
    } catch (err) {
      let errorMessage = "خطا در دریافت محصولات";
      
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        errorMessage = import.meta.env.DEV
          ? "سرور API در دسترس نیست. دستور npm run dev را اجرا کنید."
          : "اتصال به API برقرار نشد. تنظیمات Vercel را بررسی کنید.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      console.error("❌ Error fetching products:", err);
      setError(errorMessage);
      
      // در صورت خطا، لیست خالی بگذار تا برنامه crash نکند
      setProducts([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addProduct = async (product: Omit<Product, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(PRODUCTS_API, {
        method: "POST",
        headers: productsApiHeaders(true),
        body: JSON.stringify(product),
      });
      warnStorageMode(res);
      
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || `HTTP error! status: ${res.status}`);
      }
      
      const newProduct = await res.json();
      setProducts((prev) => [...prev, newProduct]);
      showToast(`محصول "${formatProductTitle(product)}" اضافه شد ✅`);
      return newProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطا در افزودن محصول";
      console.error("❌ Error adding product:", err);
      setError(errorMessage);
      showToast("خطا در افزودن محصول");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${PRODUCTS_API}?id=${id}`, {
        method: "PUT",
        headers: productsApiHeaders(true),
        body: JSON.stringify(updates),
      });
      warnStorageMode(res);
      
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || `HTTP error! status: ${res.status}`);
      }
      
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
      showToast("محصول ویرایش شد");
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطا در ویرایش محصول";
      console.error("❌ Error updating product:", err);
      setError(errorMessage);
      showToast("خطا در ویرایش محصول");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${PRODUCTS_API}?id=${id}`, {
        method: "DELETE",
        headers: productsApiHeaders(),
      });
      
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || `HTTP error! status: ${res.status}`);
      }
      
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("محصول حذف شد");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطا در حذف محصول";
      console.error("❌ Error deleting product:", err);
      setError(errorMessage);
      showToast("خطا در حذف محصول");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requireAdminSession = () => {
    if (!isAdmin) {
      throw new Error('دسترسی ادمین مجاز نیست.');
    }
  };

  const getOrders = async (params?: OrdersQueryParams): Promise<OrdersListResult> => {
    requireAdminSession();
    return fetchOrders(params);
  };

  const searchOrders = async (params: OrdersQueryParams): Promise<OrdersListResult> => {
    requireAdminSession();
    return fetchOrders(params);
  };

  const getOrder = async (orderId: string): Promise<OrderDetail> => {
    requireAdminSession();
    return fetchOrderById(orderId);
  };

  const updateOrderStatus = async (
    orderId: string,
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): Promise<Order> => {
    requireAdminSession();
    const updated = await updateOrderStatusInDb(orderId, currentStatus, newStatus);
    showToast('وضعیت سفارش به‌روز شد');
    return updated;
  };

  const getBulkOrders = async (params?: BulkOrdersQueryParams): Promise<BulkOrdersListResult> => {
    requireAdminSession();
    return fetchBulkOrders(params);
  };

  const updateBulkOrderStatus = async (
    id: number,
    status: BulkOrderStatus,
  ): Promise<BulkOrderRequest> => {
    requireAdminSession();
    const updated = await updateBulkOrderStatusInDb(id, status);
    showToast('وضعیت درخواست به‌روز شد');
    return updated;
  };

  const adjustProductStock = async (
    id: number,
    payload: { stock?: number; delta?: number },
  ) => {
    setError(null);
    try {
      const res = await fetch(`/api/products/stock?id=${id}`, {
        method: 'PATCH',
        headers: productsApiHeaders(true),
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || body.error || 'خطا در به‌روزرسانی موجودی');
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...body } : p)),
      );
      showToast('موجودی به‌روز شد ✅');
      return body as Product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در به‌روزرسانی موجودی';
      showToast(errorMessage);
      throw err;
    }
  };

  // 🛒 ====== CART HANDLERS ======
  const addToCart = (product: Product, quantity: number): boolean => {
    const available = Number(product.stock ?? 0);
    if (available <= 0) {
      showToast('این محصول موجود نیست');
      return false;
    }

    const existingQty = cart.find((i) => i.product.id === product.id)?.quantity ?? 0;
    if (existingQty + quantity > available) {
      showToast(`حداکثر ${available.toLocaleString('fa-IR')} عدد از این محصول موجود است`);
      return false;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity, product }
            : i,
        );
      }
      return [...prev, { product, quantity }];
    });

    const label = formatProductTitle(product);
    const brandLabel = product.brand ? ` — برند: ${product.brand}` : '';
    showToast(`${label}${brandLabel} (${product.color}) به سبد خرید افزوده شد`);
    return true;
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    const available = Number(product?.stock ?? 0);
    if (product && quantity > available) {
      showToast(`حداکثر ${available.toLocaleString('fa-IR')} عدد موجود است`);
      return;
    }

    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity, product: product ?? i.product }
          : i,
      ),
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) =>
      prev.filter((i) => i.product.id !== productId)
    );
    showToast("محصول از سبد حذف شد");
  };

  const clearCart = () => {
    setCart([]);
    showToast("سبد خرید خالی شد");
  };

  // 🖼️ ====== IMAGE ======
  const getImage = (filenameOrUrl: string) => {
    if (!filenameOrUrl) return initialImages["default-placeholder"];
    // اگر URL کامل (Cloudinary یا Filestack) است، مستقیماً برگردان
    if (filenameOrUrl.startsWith("http://") || filenameOrUrl.startsWith("https://")) {
      return filenameOrUrl;
    }
    // اگر با / شروع می‌شود (URL نسبی)، مستقیماً برگردان
    if (filenameOrUrl.startsWith("/")) {
      return filenameOrUrl;
    }
    // در غیر این صورت، URL محلی یا API را برگردان
    if (import.meta.env.DEV) {
      return `http://localhost:4020/product-images/${filenameOrUrl}`;
    }
    return `/product-images/${filenameOrUrl}`;
  };

  // 🔔 ====== TOAST ======
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 3000);
  };

  // 🚀 Load products on start
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 🔐 Restore Supabase admin session
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        applyAuthSession(session);
        setAuthLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applyAuthSession(session);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [applyAuthSession]);

  return (
    <AppContext.Provider
      value={{
        products,
        cart,
        cartTotal,
        cartCount,
        loading,
        error,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        adjustProductStock,
        showToast,
        getImage,
        isAdmin,
        authLoading,
        loginAdmin,
        logoutAdmin,
        getOrders,
        getOrder,
        searchOrders,
        updateOrderStatus,
        getBulkOrders,
        updateBulkOrderStatus,
      }}
    >
      {children}
      {toast.visible && (
        <div className="fixed bottom-5 left-5 bg-blue-600 text-white py-2 px-4 rounded-lg shadow-lg z-50">
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  );
};

// ✅ Hook استفاده ساده
export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext باید داخل AppProvider استفاده شود");
  return ctx;
};
