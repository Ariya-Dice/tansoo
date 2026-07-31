import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { STORE_NAME } from '../../constants';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import './AdminLoginPage.css';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin, isAdmin, authLoading } = useAppContext();

  useEffect(() => {
    if (!authLoading && isAdmin) {
      navigate('/admin/products');
    }
  }, [isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isSupabaseConfigured()) {
      setError('Supabase پیکربندی نشده است. VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY را تنظیم کنید.');
      return;
    }

    setSubmitting(true);
    const result = await loginAdmin(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/admin/products');
    } else {
      setError(result.error ?? 'ورود ناموفق بود.');
      setPassword('');
    }
  };

  if (authLoading) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-box">
          <p className="admin-login-loading">در حال بررسی نشست...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h1 className="admin-login-title">{STORE_NAME}</h1>
          <h2 className="admin-login-subtitle">ورود به پنل مدیریت</h2>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-login-input-group">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ایمیل ادمین"
              required
              autoComplete="username"
              className="admin-login-input"
            />
          </div>

          <div className="admin-login-input-group">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              required
              autoComplete="current-password"
              className="admin-login-input"
            />
          </div>

          {error && <p className="admin-login-error">{error}</p>}

          <button type="submit" className="admin-login-btn" disabled={submitting}>
            {submitting ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/" className="admin-login-back">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
