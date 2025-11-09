import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import { useAppContext } from './context/AppContext';

const App: React.FC = () => {
  const { isAdmin } = useAppContext();

  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes isAdminLoggedIn={isAdmin} />} />
          <Route path="/*" element={<StorefrontRoutes />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

const StorefrontRoutes: React.FC = () => (
  <>
    <Header />
    <main className="main-content">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </main>
    <Footer />
  </>
);

interface AdminRoutesProps {
    isAdminLoggedIn: boolean;
}

const AdminRoutes: React.FC<AdminRoutesProps> = ({ isAdminLoggedIn }) => (
  <Routes>
    <Route path="login" element={<AdminLoginPage />} />
    <Route
      path="*"
      element={
        isAdminLoggedIn ? (
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<Navigate to="/admin/products" />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
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