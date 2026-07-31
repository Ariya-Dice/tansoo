import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './PaymentResultPage.css';

const PaymentSuccessPage: React.FC = () => {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const orderNumber = params.get('orderNumber');
  const stockReview = params.get('stockReview') === '1';
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
        {stockReview ? (
          <p>
            پرداخت شما ثبت شد. به دلیل محدودیت موجودی، سفارش در وضعیت «نیازمند بررسی» قرار گرفت
            و تیم فروش با شما تماس خواهد گرفت.
          </p>
        ) : (
          <p>سفارش شما با موفقیت ثبت و پرداخت شد.</p>
        )}
        {orderNumber && (
          <p className="payment-result-order-id">
            شماره سفارش: <span dir="ltr">{orderNumber}</span>
          </p>
        )}
        {!orderNumber && orderId && (
          <p className="payment-result-order-id">
            شماره پیگیری: <span dir="ltr">{orderId.slice(0, 8)}</span>
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
