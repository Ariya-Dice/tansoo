import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './PaymentResultPage.css';

const PaymentSuccessPage: React.FC = () => {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const { clearCart, fetchProducts } = useAppContext();

  useEffect(() => {
    clearCart();
    fetchProducts();
  }, [clearCart, fetchProducts]);

  return (
    <div className="payment-result-page payment-result-page--success">
      <div className="payment-result-card">
        <div className="payment-result-icon payment-result-icon--success" aria-hidden>✓</div>
        <h1>پرداخت موفق</h1>
        <p>سفارش شما با موفقیت ثبت و پرداخت شد.</p>
        {orderId && (
          <p className="payment-result-order-id">
            شماره سفارش: <span dir="ltr">{orderId.slice(0, 8)}</span>
          </p>
        )}
        <div className="payment-result-actions">
          <Link to="/products" className="payment-result-btn payment-result-btn-primary">
            ادامه خرید
          </Link>
          <Link to="/" className="payment-result-btn payment-result-btn-secondary">
            بازگشت به خانه
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
