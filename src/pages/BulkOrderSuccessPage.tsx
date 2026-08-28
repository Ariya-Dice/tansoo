import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import './BulkOrderSuccessPage.css';

const BulkOrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const state = location.state as { name?: string; phone?: string } | null;
  const bulkOrderId = params.get('bulkOrderId');

  return (
    <div className="bulk-success-page">
      <div className="bulk-success-card">
        <div className="bulk-success-icon" aria-hidden>✓</div>
        <h1>درخواست شما ثبت شد</h1>
        {state?.name && (
          <p className="bulk-success-greeting">{state.name} عزیز،</p>
        )}
        <p>
          {bulkOrderId
            ? 'سپرده ثبت درخواست با موفقیت پرداخت شد و درخواست خرید عمده شما ثبت گردید.'
            : 'درخواست خرید عمده شما دریافت شد.'}{' '}
          کارشناس فروشگاه در اسرع وقت
          {state?.phone ? ` با شماره ${state.phone}` : ''} تماس می‌گیرد و جزئیات سفارش، قیمت و ارسال را هماهنگ می‌کند.
        </p>
        {bulkOrderId && (
          <p className="bulk-success-order-id">
            شماره درخواست: <span dir="ltr">{bulkOrderId}</span>
          </p>
        )}
        <div className="bulk-success-actions">
          <Link to="/products" className="bulk-success-btn bulk-success-btn-primary">بازگشت به محصولات</Link>
          <Link to="/" className="bulk-success-btn bulk-success-btn-secondary">صفحه اصلی</Link>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderSuccessPage;
