
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { STORE_NAME } from '../../constants';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logoutAdmin } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 text-brand-light-text rounded-lg hover:bg-brand-surface transition-colors ${isActive ? 'bg-brand-neon-blue text-brand-dark-blue font-bold' : ''}`;

  return (
    <div className="flex h-screen bg-brand-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark-blue text-brand-light-text flex flex-col">
        <div className="h-20 flex items-center justify-center text-2xl font-bold border-b border-brand-neon-blue/20">
          {STORE_NAME}
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 text-right">
          <NavLink to="/admin/products" className={navLinkClass}>محصولات</NavLink>
          <NavLink to="/admin/orders" className={navLinkClass}>سفارشات</NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-brand-dark-blue shadow-md flex items-center justify-end px-6">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            خروج
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto text-right text-brand-light-text">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;