import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BulkOrderSuccessPage.css';

const BulkOrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { name?: string; phone?: string } | null;

  return (
    <div className="bulk-success-page">
      <div className="bulk-success-card">
        <div className="bulk-success-icon" aria-hidden>✓</div>
        <h1>درخواست شما ثبت شد</h1>
        {state?.name && (
          <p className="bulk-success-greeting">{state.name} عزیز،</p>
        )}
        <p>
          درخواست خرید عمده شما دریافت شد. کارشناس فروشگاه در اسرع وقت
          {state?.phone ? ` با شماره ${state.phone}` : ''} تماس می‌گیرد و جزئیات سفارش، قیمت و ارسال را هماهنگ می‌کند.
        </p>
        <div className="bulk-success-actions">
          <Link to="/products" className="bulk-success-btn bulk-success-btn-primary">بازگشت به محصولات</Link>
          <Link to="/" className="bulk-success-btn bulk-success-btn-secondary">صفحه اصلی</Link>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderSuccessPage;
