import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './PaymentResultPage.css';

const PaymentFailedPage: React.FC = () => {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const reason = params.get('reason');

  return (
    <div className="payment-result-page payment-result-page--failed">
      <div className="payment-result-card">
        <div className="payment-result-icon payment-result-icon--failed" aria-hidden>✕</div>
        <h1>پرداخت ناموفق</h1>
        <p>تراکنش تکمیل نشد. در صورت کسر وجه، طی ۷۲ ساعت به حساب شما بازمی‌گردد.</p>
        {orderId && (
          <p className="payment-result-order-id">
            شماره پیگیری: <span dir="ltr">{orderId.slice(0, 8)}</span>
          </p>
        )}
        {reason && import.meta.env.DEV && (
          <p className="payment-result-debug">کد: {reason}</p>
        )}
        <div className="payment-result-actions">
          <Link to="/cart" className="payment-result-btn payment-result-btn-primary">
            بازگشت به سبد خرید
          </Link>
          <Link to="/contact" className="payment-result-btn payment-result-btn-secondary">
            تماس با پشتیبانی
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
