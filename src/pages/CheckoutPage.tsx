import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getDefaultImage } from '../constants';
import { getProductGoodsType } from '../productSpecs';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { requestPayment } from '../services/payment';
import './CheckoutPage.css';

const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartTotal,
    showToast,
    getImage,
    replacementProgramSelected,
  } = useAppContext();

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // تبدیل اعداد فارسی و عربی به انگلیسی
  const normalizeDigits = (value: string) => {
    return value
      .replace(/[۰-۹]/g, (digit) =>
        String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)),
      )
      .replace(/[٠-٩]/g, (digit) =>
        String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)),
      );
  };

  // یکسان‌سازی حروف فارسی
  const normalizePersianText = (value: string) => {
    return value
      .replace(/ي/g, 'ی')
      .replace(/ى/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/\u200c+/g, '\u200c');
  };

  // فیلتر نام و نام خانوادگی
  const filterName = (value: string) => {
    const normalized = normalizePersianText(value);

    return normalized.replace(
      /[^\u0600-\u06FF\u200C\s]/g,
      '',
    );
  };

  // فیلتر شماره تماس
  const filterPhone = (value: string) => {
    const normalized = normalizeDigits(value);

    return normalized.replace(/\D/g, '').slice(0, 11);
  };

  // فیلتر آدرس
  const filterAddress = (value: string) => {
    const normalized = normalizePersianText(value);

    return normalized.replace(
      /[^\u0600-\u06FF\u200C\s0-9]/g,
      '',
    );
  };

  // مدیریت تغییر مقدار فیلدها
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    let filteredValue = value;

    if (name === 'name') {
      filteredValue = filterName(value);
    }

    if (name === 'phone') {
      filteredValue = filterPhone(value);
    }

    if (name === 'address') {
      filteredValue = filterAddress(value);
    }

    setCustomerDetails((prev) => ({
      ...prev,
      [name]: filteredValue,
    }));
  };

  // اعتبارسنجی نام و نام خانوادگی
  const validateName = (name: string) => {
    const value = normalizePersianText(name.trim());

    if (!value) {
      return 'لطفاً نام و نام خانوادگی را وارد کنید.';
    }

    if (!/^[\u0600-\u06FF\u200C\s]+$/.test(value)) {
      return 'نام و نام خانوادگی باید به زبان فارسی وارد شود.';
    }

    const parts = value.split(/\s+/).filter(Boolean);

    if (parts.length < 2) {
      return 'لطفاً نام و نام خانوادگی را کامل وارد کنید.';
    }

    if (parts.some((part) => part.length < 2)) {
      return 'نام و نام خانوادگی را به صورت کامل وارد کنید.';
    }

    return '';
  };

  // اعتبارسنجی شماره تماس
  const validatePhone = (phone: string) => {
    const normalized = normalizeDigits(phone.trim());

    if (!normalized) {
      return 'لطفاً شماره تماس را وارد کنید.';
    }

    if (!/^09\d{9}$/.test(normalized)) {
      return 'شماره تماس باید یک شماره موبایل معتبر ۱۱ رقمی باشد.';
    }

    return '';
  };

  // اعتبارسنجی ایمیل
  // ایمیل اختیاری است؛ فقط در صورت وارد شدن بررسی می‌شود.
  const validateEmail = (email: string) => {
    const value = email.trim();

    if (!value) {
      return '';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return 'ایمیل وارد شده صحیح نیست.';
    }

    return '';
  };

  // اعتبارسنجی آدرس
  const validateAddress = (address: string) => {
    const value = normalizePersianText(address.trim());

    if (!value) {
      return 'لطفاً آدرس کامل را وارد کنید.';
    }

    if (!/[\u0600-\u06FF]/.test(value)) {
      return 'آدرس باید به زبان فارسی وارد شود.';
    }

    if (value.length < 15) {
      return 'لطفاً آدرس کامل و دقیق را وارد کنید.';
    }

    return '';
  };

  // ارسال فرم
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // بررسی خالی بودن سبد خرید
    if (cart.length === 0) {
      showToast('سبد خرید شما خالی است.');
      return;
    }

    // -----------------------------
    // بررسی نام و نام خانوادگی
    // -----------------------------
    const nameError = validateName(customerDetails.name);

    if (nameError) {
      showToast(nameError);
      return;
    }

    // -----------------------------
    // بررسی شماره تماس
    // -----------------------------
    const phoneError = validatePhone(customerDetails.phone);

    if (phoneError) {
      showToast(phoneError);
      return;
    }

    // -----------------------------
    // بررسی ایمیل
    // ایمیل اختیاری است
    // -----------------------------
    const emailError = validateEmail(customerDetails.email);

    if (emailError) {
      showToast(emailError);
      return;
    }

    // -----------------------------
    // بررسی آدرس
    // -----------------------------
    const addressError = validateAddress(customerDetails.address);

    if (addressError) {
      showToast(addressError);
      return;
    }

    // -----------------------------
    // بررسی تنظیمات درگاه
    // -----------------------------
    if (!isSupabaseConfigured()) {
      showToast(
        'درگاه پرداخت پیکربندی نشده است',
      );
      return;
    }

    setIsProcessing(true);

    try {
      const replacementNote = replacementProgramSelected
        ? 'طرح تعویض شیرآلات کهنه با نو: بله'
        : '';

      const combinedNote = [
        replacementNote,
        customerDetails.note.trim(),
      ]
        .filter(Boolean)
        .join('\n');

      const result = await requestPayment(
        {
          ...customerDetails,
          note: combinedNote,
        },
        cart,
      );

      if (!result?.paymentUrl) {
        throw new Error('آدرس درگاه پرداخت دریافت نشد.');
      }

      window.location.assign(result.paymentUrl);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'خطا در شروع پرداخت';

      showToast(message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <header className="checkout-header">
          <h1 className="checkout-title">
            تسویه حساب
          </h1>

          <p className="checkout-subtitle">
            اطلاعات ارسال را تکمیل کنید
          </p>
        </header>

        <div className="checkout-container">
          <section className="checkout-form-section">
            <h2 className="checkout-form-title">
              اطلاعات تماس و ارسال
            </h2>

            <form
              onSubmit={handleSubmit}
              className="checkout-form"
              noValidate
            >
              {/* نام و شماره تماس */}
              <div className="checkout-form-row">
                {/* نام و نام خانوادگی */}
                <div className="checkout-form-group">
                  <label
                    className="checkout-form-label"
                    htmlFor="name"
                  >
                    نام و نام خانوادگی *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    inputMode="text"
                    dir="rtl"
                    className="checkout-form-input"
                    value={customerDetails.name}
                    onChange={handleInputChange}
                    placeholder=".نام و نام خانوادگی را با حروف فارسی وارد کنید"
                  />
                </div>

                {/* شماره تماس */}
                <div className="checkout-form-group">
                  <label
                    className="checkout-form-label"
                    htmlFor="phone"
                  >
                    شماره تماس *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="numeric"
                    dir="ltr"
                    maxLength={11}
                    className="checkout-form-input"
                    value={customerDetails.phone}
                    onChange={handleInputChange}
                    placeholder="09xxxxxxxxx"
                  />
                </div>
              </div>

              {/* ایمیل */}
              <div className="checkout-form-group">
                <label
                  className="checkout-form-label"
                  htmlFor="email"
                >
                  ایمیل
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  dir="ltr"
                  className="checkout-form-input"
                  value={customerDetails.email}
                  onChange={handleInputChange}
                  placeholder="ایمیل (اختیاری)"
                />
              </div>

              {/* آدرس */}
              <div className="checkout-form-group">
                <label
                  className="checkout-form-label"
                  htmlFor="address"
                >
                  آدرس کامل *
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  required
                  autoComplete="street-address"
                  inputMode="text"
                  dir="rtl"
                  className="checkout-form-textarea"
                  value={customerDetails.address}
                  onChange={handleInputChange}
                  placeholder=".آدرس را با حروف فارسی وارد کنید؛ شماره خیابان، پلاک و کد پستی را نیز درج کنید"
                />
              </div>

              {/* توضیحات اختیاری */}
              <div className="checkout-form-group">
                <label
                  className="checkout-form-label"
                  htmlFor="note"
                >
                  توضیحات (اختیاری)
                </label>

                <textarea
                  id="note"
                  name="note"
                  rows={2}
                  className="checkout-form-textarea"
                  value={customerDetails.note}
                  onChange={handleInputChange}
                  placeholder="توضیحات سفارش (اختیاری)"
                />
              </div>

              {/* دکمه پرداخت */}
              <button
                type="submit"
                disabled={isProcessing}
                className="checkout-submit-btn"
              >
                {isProcessing
                  ? 'در حال انتقال به درگاه...'
                  : `پرداخت — ${cartTotal.toLocaleString(
                      'fa-IR',
                    )} تومان`}
              </button>
            </form>

            <p className="checkout-hint">
              برای سفارش‌های عمده از{' '}
              <Link to="/bulk-order">
                صفحه خرید عمده
              </Link>{' '}
              استفاده کنید.
            </p>
          </section>

          {/* خلاصه سفارش */}
          <aside className="checkout-order-section">
            <h2 className="checkout-order-title">
              خلاصه سفارش
            </h2>

            <div className="checkout-order-items">
              {cart.map((item) => {
                const imageSrc = item.product.image
                  ? getImage(item.product.image)
                  : getDefaultImage(item.product.model);

                const goodsType =
                  getProductGoodsType(item.product);

                return (
                  <div
                    key={item.product.id}
                    className="checkout-order-item"
                  >
                    <div className="checkout-order-item-info">
                      <img
                        src={imageSrc}
                        alt=""
                        className="checkout-order-item-image"
                      />

                      <div className="checkout-order-item-details">
                        <p className="checkout-order-item-title">
                          {item.product.model} {goodsType}
                        </p>

                        <p className="checkout-order-item-meta">
                          {item.product.color} ×{' '}
                          {item.quantity}
                        </p>
                      </div>
                    </div>

                    <p className="checkout-order-item-price">
                      {(
                        item.product.price *
                        item.quantity
                      ).toLocaleString('fa-IR')}{' '}
                      تومان
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="checkout-order-summary">
              <div className="checkout-order-total">
                <span>مبلغ پرداختی</span>

                <span>
                  {cartTotal.toLocaleString('fa-IR')} تومان
                </span>
              </div>

              <p className="checkout-order-note">
هزینه ارسال: به صورت پس کرایه
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;