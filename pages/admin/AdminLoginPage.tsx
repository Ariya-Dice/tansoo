import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { STORE_NAME } from '../../constants';

const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginAdmin } = useAppContext();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a secure API call.
    // For this demo, we'll use a simple hardcoded password.
    if (password === 'admin123') {
      loginAdmin();
      navigate('/admin/dashboard');
    } else {
      setError('رمز عبور نامعتبر است.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark-blue">
      <div className="w-full max-w-md p-8 space-y-6 bg-brand-surface rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-light-text">{STORE_NAME}</h1>
          <h2 className="mt-2 text-xl text-brand-muted-text">ورود به پنل مدیریت</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">رمز عبور</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-brand-neon-blue/30 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-neon-blue focus:border-brand-neon-blue text-right bg-brand-dark-blue text-brand-light-text"
              placeholder="رمز عبور"
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-brand-dark-blue bg-brand-neon-blue hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-neon-blue transition-colors"
            >
              ورود
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-brand-muted-text hover:text-brand-neon-blue transition-colors duration-300">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;