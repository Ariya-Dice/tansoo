import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { STORE_NAME } from '../../constants';
import './AdminLoginPage.css';

/**
 * فقط در محیط Development فعال است.
 *
 * در Production:
 * import.meta.env.DEV === false
 *
 * بنابراین Login واقعی Supabase همچنان فعال خواهد بود.
 */
const DEV_ADMIN_BYPASS = import.meta.env.DEV;

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    isAdmin,
    authLoading,
  } = useAppContext();

  /**
   * Development:
   * بدون نیاز به ایمیل و پسورد مستقیماً وارد پنل مدیریت شو.
   *
   * Production:
   * فقط اگر کاربر واقعاً Admin باشد وارد پنل می‌شود.
   */
  useEffect(() => {
    if (DEV_ADMIN_BYPASS) {
      navigate('/admin/products', { replace: true });
      return;
    }

    if (!authLoading && isAdmin) {
      navigate('/admin/products', { replace: true });
    }
  }, [isAdmin, authLoading, navigate]);

  /**
   * در Development اصلاً فرم Login نمایش داده نمی‌شود.
   */
  if (DEV_ADMIN_BYPASS) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-box">
          <div className="admin-login-header">
            <h1 className="admin-login-title">
              {STORE_NAME}
            </h1>

            <h2 className="admin-login-subtitle">
              پنل مدیریت
            </h2>
          </div>

          <div className="admin-login-form">
            <p className="admin-login-loading">
              ورود مستقیم به پنل مدیریت در حالت توسعه...
            </p>

            <button
              type="button"
              className="admin-login-btn"
              onClick={() =>
                navigate('/admin/products', { replace: true })
              }
            >
              ورود به پنل مدیریت
            </button>
          </div>

          <div className="admin-login-footer">
            <Link to="/" className="admin-login-back">
              بازگشت به فروشگاه
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Production:
   * Login واقعی فقط در Production اجرا می‌شود.
   *
   * این بخش را فعلاً دست نمی‌زنیم.
   */
  return <ProductionAdminLogin />;
};

/**
 * Login واقعی Admin
 *
 * این کامپوننت فقط در Production استفاده می‌شود.
 */
const ProductionAdminLogin: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const navigate = useNavigate();

  const {
    loginAdmin,
    isAdmin,
    authLoading,
  } = useAppContext();

  useEffect(() => {
    if (!authLoading && isAdmin) {
      navigate('/admin/products', { replace: true });
    }
  }, [isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      const result = await loginAdmin(email, password);

      if (result.success) {
        navigate('/admin/products', { replace: true });
      } else {
        setError(result.error ?? 'ورود ناموفق بود.');
        setPassword('');
      }
    } catch (err) {
      console.error('Admin login error:', err);

      setError('خطایی هنگام ورود رخ داد.');
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-box">
          <p className="admin-login-loading">
            در حال بررسی نشست...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">

        <div className="admin-login-header">
          <h1 className="admin-login-title">
            {STORE_NAME}
          </h1>

          <h2 className="admin-login-subtitle">
            ورود به پنل مدیریت
          </h2>
        </div>

        <form
          onSubmit={handleLogin}
          className="admin-login-form"
        >

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

          {error && (
            <p className="admin-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={submitting}
          >
            {submitting ? 'در حال ورود...' : 'ورود'}
          </button>

        </form>

        <div className="admin-login-footer">
          <Link
            to="/"
            className="admin-login-back"
          >
            بازگشت به فروشگاه
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminLoginPage;