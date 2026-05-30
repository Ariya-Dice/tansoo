// src/context/AppContext.tsx
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from "react";
import { Product, CartItem } from "../types";
import { initialImages } from "../db/ImageDB";
import { ADMIN_PASSWORD } from "../constants";

// همیشه از API یکسان استفاده می‌شود (در dev با Vite proxy به localhost:4020)
const PRODUCTS_API = "/api/products";

function productsApiHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  const secret = import.meta.env.VITE_PRODUCTS_API_SECRET;
  if (secret) headers["X-Api-Secret"] = secret;
  return headers;
}

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
  addToCart: (product: Product, quantity: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  showToast: (msg: string) => void;
  getImage: (filename: string) => string;

  // مدیریت ادمین
  isAdmin: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
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

  // 🛡️ مدیریت ادمین
  const [isAdmin, setIsAdmin] = useState(false);
  const loginAdmin = (password: string): boolean => {
    // در تولید بهتر است از environment variable استفاده شود
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };
  const logoutAdmin = () => setIsAdmin(false);

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
    // اگر محصول ساختار قدیمی دارد، تبدیل می‌کنیم
    if (product.name && !product.model) {
      return {
        id: product.id,
        model: product.category || 'سایر',
        type: product.type || 'روشویی',
        color: Object.keys(product.images || {})[0] || 'کروم',
        bodyWeight: product.specs?.تنه || product.specs?.سبک || 'سبک',
        hoseMaterial: product.type === 'روشویی' || product.type === 'سینک' ? 'آلومینیوم' : undefined,
        valveMaterial: product.type === 'آفتابه' || product.type === 'دوش' ? 'برنجی' : undefined,
        tags: [
          ...(product.isNew ? ['جدید'] : []),
          ...(product.isBestSeller ? ['پرفروش'] : []),
        ],
        price: product.price || 0,
        description: product.description || '',
        image: product.images ? Object.values(product.images)[0] as string : '/loading.gif',
      };
    }
    return product;
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(PRODUCTS_API);
      warnStorageMode(res);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      // تبدیل داده‌های قدیمی به ساختار جدید
      const normalizedData = data.map((product: any) => normalizeProduct(product));
      setProducts(normalizedData);
    } catch (err) {
      let errorMessage = "خطا در دریافت محصولات";
      
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        errorMessage = "سرور API در دسترس نیست. دستور npm run dev را اجرا کنید (هم Vite و هم API روی پورت 4020).";
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
      showToast(`محصول "${product.model} ${product.type}" اضافه شد ✅`);
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

  // 🛒 ====== CART HANDLERS ======
  const addToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        return [...prev, { product, quantity }];
      }
    });
    showToast(`${product.model} ${product.type} (${product.color}) به سبد خرید افزوده شد`);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity }
          : i
      )
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
        showToast,
        getImage,
        isAdmin,
        loginAdmin,
        logoutAdmin,
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
