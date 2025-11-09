import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { STORE_NAME } from '../../constants';
import './AdminLoginPage.css';

const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginAdmin, isAdmin } = useAppContext();

  useEffect(() => {
    if (isAdmin) navigate('/admin/products');
  }, [isAdmin, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = loginAdmin(password);
    if (success) {
      navigate('/admin/products');
    } else {
      setError('رمز عبور نامعتبر است.');
      setPassword('');
    }
  };

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
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              required
              className="admin-login-input"
            />
          </div>

          {error && <p className="admin-login-error">{error}</p>}

          <button type="submit" className="admin-login-btn">
            ورود
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
