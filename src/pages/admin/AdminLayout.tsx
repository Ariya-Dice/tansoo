import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { STORE_NAME } from '../../constants';
import AdminStockAlerts from '../../components/admin/AdminStockAlerts';
import './AdminLayout.css';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logoutAdmin } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar - Desktop */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">{STORE_NAME}</div>

        <nav className="admin-sidebar-nav">
          <NavLink to="/admin/products" className="admin-nav-link">
            محصولات
          </NavLink>

          <NavLink to="/admin/orders" className="admin-nav-link">
            سفارشات
          </NavLink>

          <NavLink to="/admin/bulk-orders" className="admin-nav-link">
            خرید عمده
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <div className="admin-main">

        <header className="admin-header">
          <button onClick={handleLogout} className="admin-logout-btn">
            خروج
          </button>
        </header>

        {/* Mobile Navigation */}
        <nav className="admin-mobile-nav">
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `admin-mobile-nav-link ${isActive ? 'active' : ''}`
            }
          >
            محصولات
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `admin-mobile-nav-link ${isActive ? 'active' : ''}`
            }
          >
            سفارشات
          </NavLink>

          <NavLink
            to="/admin/bulk-orders"
            className={({ isActive }) =>
              `admin-mobile-nav-link ${isActive ? 'active' : ''}`
            }
          >
            خرید عمده
          </NavLink>
        </nav>

        <main className="admin-content">
          <AdminStockAlerts />
          {children}
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;