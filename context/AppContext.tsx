
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, CartItem, Order } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { initialImages } from '../db/ImageDB';

// --- LocalStorage Helper Functions ---

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const savedItem = localStorage.getItem(key);
    if (savedItem !== null) {
      // Special handling for orders to restore Date objects
      if (key === 'tanso_orders') {
        const parsedOrders = JSON.parse(savedItem) as Order[];
        return parsedOrders.map(order => ({ ...order, date: new Date(order.date) })) as T;
      }
      return JSON.parse(savedItem);
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key “${key}”:`, error);
  }
};


interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (product: Product, color: string, quantity: number) => void;
  updateQuantity: (productId: number, color: string, quantity: number) => void;
  removeFromCart: (productId: number, color: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  isAdminLoggedIn: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;
  getImage: (id: string) => string;
  addImage: (id: string, base64: string) => void;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => getFromStorage<Product[]>('tanso_products', MOCK_PRODUCTS));
  const [cart, setCart] = useState<CartItem[]>(() => getFromStorage<CartItem[]>('tanso_cart', []));
  const [orders, setOrders] = useState<Order[]>(() => getFromStorage<Order[]>('tanso_orders', []));
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => getFromStorage<boolean>('tanso_isAdminLoggedIn', false));
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [imageStore, setImageStore] = useState<Record<string, string>>(() => getFromStorage<Record<string, string>>('tanso_imageStore', initialImages));

  // --- Effects to sync state with localStorage ---
  useEffect(() => { saveToStorage('tanso_products', products); }, [products]);
  useEffect(() => { saveToStorage('tanso_cart', cart); }, [cart]);
  useEffect(() => { saveToStorage('tanso_orders', orders); }, [orders]);
  useEffect(() => { saveToStorage('tanso_isAdminLoggedIn', isAdminLoggedIn); }, [isAdminLoggedIn]);
  useEffect(() => { saveToStorage('tanso_imageStore', imageStore); }, [imageStore]);


  const getImage = (id: string): string => {
    return imageStore[id] || initialImages['default-placeholder'];
  };

  const addImage = (id: string, base64: string) => {
    setImageStore(prev => ({ ...prev, [id]: base64 }));
  };

  const addToCart = (product: Product, color: string, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id && item.color === color);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, color, quantity }];
    });
    showToast(`${product.name} به سبد خرید اضافه شد`);
  };

  const updateQuantity = (productId: number, color: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId && item.color === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: number, color: string) => {
    setCart(prevCart => prevCart.filter(item => !(item.product.id === productId && item.color === color)));
    showToast('محصول از سبد خرید حذف شد');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const addOrder = (order: Order) => {
    setOrders(prevOrders => [order, ...prevOrders]);
  };
  
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {...o, status} : o));
    showToast(`وضعیت سفارش #${orderId.substring(0, 5)} به ${status} تغییر کرد`);
  };

  const loginAdmin = () => setIsAdminLoggedIn(true);
  const logoutAdmin = () => setIsAdminLoggedIn(false);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ message: '', visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <AppContext.Provider value={{
      products, setProducts, cart, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount, orders, addOrder, updateOrderStatus, isAdminLoggedIn, loginAdmin, logoutAdmin, getImage, addImage, showToast
    }}>
      {children}
      {toast.visible && (
        <div className="fixed bottom-5 left-5 bg-brand-neon-blue text-brand-dark-blue font-semibold py-2 px-4 rounded-lg shadow-lg animate-fade-in-out z-50">
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
