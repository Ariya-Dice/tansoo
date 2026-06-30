import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getDefaultImage } from '../constants';
import { getProductGoodsType } from '../productSpecs';
import './CheckoutPage.css';

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, clearCart, showToast, getImage } = useAppContext();
  const navigate = useNavigate();
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('سبد خرید شما خالی است.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      clearCart();
      setIsProcessing(false);
      showToast('سفارش شما با موفقیت ثبت شد ✅');
      navigate('/');
    }, 1500);
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page checkout-empty">
        <div className="checkout-empty-card">
          <h1>سبد خرید خالی است</h1>
          <p>ابتدا محصولی به سبد اضافه کنید.</p>
          <Link to="/products" className="checkout-btn checkout-btn-primary">مشاهده محصولات</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <header className="checkout-header">
          <h1 className="checkout-title">تسویه حساب</h1>
          <p className="checkout-subtitle">اطلاعات ارسال را تکمیل کنید</p>
        </header>

        <div className="checkout-container">
          <section className="checkout-form-section">
            <h2 className="checkout-form-title">اطلاعات تماس و ارسال</h2>
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label className="checkout-form-label" htmlFor="name">نام و نام خانوادگی *</label>
                  <input id="name" name="name" type="text" required className="checkout-form-input" value={customerDetails.name} onChange={handleInputChange} />
                </div>
                <div className="checkout-form-group">
                  <label className="checkout-form-label" htmlFor="phone">شماره تماس *</label>
                  <input id="phone" name="phone" type="tel" required className="checkout-form-input" value={customerDetails.phone} onChange={handleInputChange} placeholder="09xxxxxxxxx" />
                </div>
              </div>
              <div className="checkout-form-group">
                <label className="checkout-form-label" htmlFor="email">ایمیل</label>
                <input id="email" name="email" type="email" className="checkout-form-input" value={customerDetails.email} onChange={handleInputChange} />
              </div>
              <div className="checkout-form-group">
                <label className="checkout-form-label" htmlFor="address">آدرس کامل *</label>
                <textarea id="address" name="address" rows={3} required className="checkout-form-textarea" value={customerDetails.address} onChange={handleInputChange} />
              </div>
              <div className="checkout-form-group">
                <label className="checkout-form-label" htmlFor="note">توضیحات (اختیاری)</label>
                <textarea id="note" name="note" rows={2} className="checkout-form-textarea" value={customerDetails.note} onChange={handleInputChange} />
              </div>
              <button type="submit" disabled={isProcessing} className="checkout-submit-btn">
                {isProcessing ? 'در حال ثبت سفارش...' : `ثبت سفارش — ${cartTotal.toLocaleString('fa-IR')} تومان`}
              </button>
            </form>
            <p className="checkout-hint">
              برای سفارش‌های عمده یا تعداد بالا از{' '}
              <Link to="/bulk-order">صفحه خرید عمده</Link> استفاده کنید.
            </p>
          </section>

          <aside className="checkout-order-section">
            <h2 className="checkout-order-title">خلاصه سفارش</h2>
            <div className="checkout-order-items">
              {cart.map((item) => {
                const imageSrc = item.product.image ? getImage(item.product.image) : getDefaultImage(item.product.model);
                const goodsType = getProductGoodsType(item.product);
                return (
                  <div key={item.product.id} className="checkout-order-item">
                    <div className="checkout-order-item-info">
                      <img src={imageSrc} alt="" className="checkout-order-item-image" />
                      <div className="checkout-order-item-details">
                        <p className="checkout-order-item-title">{item.product.model} {goodsType}</p>
                        <p className="checkout-order-item-meta">{item.product.color} × {item.quantity}</p>
                      </div>
                    </div>
                    <p className="checkout-order-item-price">
                      {(item.product.price * item.quantity).toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="checkout-order-summary">
              <div className="checkout-order-total">
                <span>مبلغ نهایی</span>
                <span>{cartTotal.toLocaleString('fa-IR')} تومان</span>
              </div>
              <p className="checkout-order-note">هزینه ارسال پس از هماهنگی محاسبه می‌شود.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
