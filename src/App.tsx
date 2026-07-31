import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import BulkOrderPage from './pages/BulkOrderPage';
import BulkOrderSuccessPage from './pages/BulkOrderSuccessPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminBulkOrdersPage from './pages/admin/AdminBulkOrdersPage';
import { useAppContext } from './context/AppContext';

const App: React.FC = () => {
  const { isAdmin, authLoading } = useAppContext();

  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes isAdminLoggedIn={isAdmin} authLoading={authLoading} />} />
          <Route path="/*" element={<StorefrontRoutes />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

const StorefrontRoutes: React.FC = () => (
  <>
    <Header />
    <main className="main-content page-enter">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/bulk-order" element={<BulkOrderPage />} />
        <Route path="/bulk-order/success" element={<BulkOrderSuccessPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/failed" element={<PaymentFailedPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </main>
    <Footer />
  </>
);

interface AdminRoutesProps {
    isAdminLoggedIn: boolean;
    authLoading: boolean;
}

const AdminRoutes: React.FC<AdminRoutesProps> = ({ isAdminLoggedIn, authLoading }) => (
  <Routes>
    <Route path="login" element={<AdminLoginPage />} />
    <Route
      path="*"
      element={
        authLoading ? (
          <div className="admin-auth-loading">در حال بررسی نشست...</div>
        ) : isAdminLoggedIn ? (
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<Navigate to="/admin/products" />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="bulk-orders" element={<AdminBulkOrdersPage />} />
              <Route path="*" element={<Navigate to="/admin/products" />} />
            </Routes>
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" />
        )
      }
    />
  </Routes>
);

export default App;