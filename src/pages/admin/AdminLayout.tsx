import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { STORE_NAME } from '../../constants';
import './AdminLayout.css';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logoutAdmin } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">{STORE_NAME}</div>
        <nav className="admin-sidebar-nav">
          <NavLink to="/admin/products" className="admin-nav-link">
            محصولات
          </NavLink>
          <NavLink to="/admin/orders" className="admin-nav-link">
            سفارشات
          </NavLink>
        </nav>
      </aside>

      {/* Content */}
      <div className="admin-main">
        <header className="admin-header">
          <button onClick={handleLogout} className="admin-logout-btn">
            خروج
          </button>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
