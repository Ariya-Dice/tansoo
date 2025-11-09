// src/context/AppContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Product, CartItem } from "../types";
import { initialImages } from "../db/ImageDB";
import { ADMIN_PASSWORD } from "../constants";

const API_BASE = "http://localhost:4020";

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  cartTotal: number;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<Product | void>;
  updateProduct: (id: number, updates: Partial<Product>) => Promise<Product | void>;
  deleteProduct: (id: number) => Promise<void>;
  addToCart: (product: Product, color: string, quantity: number) => void;
  updateQuantity: (productId: number, color: string, quantity: number) => void;
  removeFromCart: (productId: number, color: string) => void;
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

  // 🧩 ====== API HANDLERS ======
  // تابع برای تبدیل کلید 'سبک' به 'تنه' در specs (برای سازگاری با داده‌های قدیمی)
  const normalizeProductSpecs = (product: Product): Product => {
    if (product.specs && product.specs['سبک'] !== undefined) {
      const { 'سبک': value, ...restSpecs } = product.specs;
      // تبدیل کلید 'سبک' به 'تنه' (مقادیر بدون تغییر باقی می‌مانند)
      return {
        ...product,
        specs: {
          ...restSpecs,
          'تنه': value
        }
      };
    }
    return product;
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      // تبدیل داده‌های قدیمی که ممکن است 'سبک' داشته باشند
      const normalizedData = data.map((product: Product) => normalizeProductSpecs(product));
      setProducts(normalizedData);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      showToast("خطا در دریافت محصولات از سرور");
    }
  };

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const newProduct = await res.json();
      setProducts((prev) => [...prev, newProduct]);
      showToast(`محصول "${product.name}" اضافه شد`);
      return newProduct;
    } catch (err) {
      console.error("❌ Error adding product:", err);
      showToast("خطا در افزودن محصول");
    }
  };

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
      showToast("محصول ویرایش شد");
      return updated;
    } catch (err) {
      console.error("❌ Error updating product:", err);
      showToast("خطا در ویرایش محصول");
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("محصول حذف شد");
    } catch (err) {
      console.error("❌ Error deleting product:", err);
      showToast("خطا در حذف محصول");
    }
  };

  // 🛒 ====== CART HANDLERS ======
  const addToCart = (product: Product, color: string, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.color === color
      );
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.color === color
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        return [...prev, { product, color, quantity }];
      }
    });
    showToast(`${product.name} (${color}) به سبد خرید افزوده شد`);
  };

  const updateQuantity = (productId: number, color: string, quantity: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.color === color
          ? { ...i, quantity }
          : i
      )
    );
  };

  const removeFromCart = (productId: number, color: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.color === color))
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
    // اگر URL کامل Cloudinary است، مستقیماً برگردان
    if (filenameOrUrl.startsWith("http://") || filenameOrUrl.startsWith("https://")) {
      return filenameOrUrl;
    }
    // در غیر این صورت، URL محلی را برگردان
    return `${API_BASE}/product-images/${filenameOrUrl}`;
  };

  // 🔔 ====== TOAST ======
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 3000);
  };

  // 🚀 Load products on start
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <AppContext.Provider
      value={{
        products,
        cart,
        cartTotal,
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
