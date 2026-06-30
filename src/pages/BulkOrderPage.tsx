import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { GOODS_TYPES } from '../productSpecs';
import './BulkOrderPage.css';

const BulkOrderPage: React.FC = () => {
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    company: '',
    goodsType: '',
    quantity: '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.goodsType || !form.quantity) {
      showToast('لطفاً فیلدهای الزامی را پر کنید');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigate('/bulk-order/success', {
        state: { name: form.name, phone: form.phone },
      });
    }, 800);
  };

  return (
    <div className="bulk-order-page">
      <div className="container bulk-order-layout">
        <header className="bulk-order-header">
          <h1>خرید عمده / تعداد بالا</h1>
          <p>
            برای سفارش‌های با تعداد بالا، درخواست خود را ثبت کنید. پس از ثبت، کارشناس فروش با شما تماس می‌گیرد
            و ادامه فرآیند به صورت تلفنی هماهنگ می‌شود.
          </p>
        </header>

        <div className="bulk-order-card">
          <form onSubmit={handleSubmit} className="bulk-order-form">
            <div className="bulk-order-row">
              <div className="bulk-order-field">
                <label htmlFor="name">نام و نام خانوادگی *</label>
                <input id="name" name="name" required value={form.name} onChange={handleChange} />
              </div>
              <div className="bulk-order-field">
                <label htmlFor="phone">شماره تماس *</label>
                <input id="phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="bulk-order-field">
              <label htmlFor="company">نام شرکت / فروشگاه (اختیاری)</label>
              <input id="company" name="company" value={form.company} onChange={handleChange} />
            </div>
            <div className="bulk-order-row">
              <div className="bulk-order-field">
                <label htmlFor="goodsType">نوع کالا *</label>
                <select id="goodsType" name="goodsType" required value={form.goodsType} onChange={handleChange}>
                  <option value="">انتخاب کنید...</option>
                  {GOODS_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="سایر">سایر</option>
                </select>
              </div>
              <div className="bulk-order-field">
                <label htmlFor="quantity">تعداد تقریبی *</label>
                <input id="quantity" name="quantity" required placeholder="مثال: ۵۰ عدد" value={form.quantity} onChange={handleChange} />
              </div>
            </div>
            <div className="bulk-order-field">
              <label htmlFor="note">توضیحات</label>
              <textarea id="note" name="note" rows={4} value={form.note} onChange={handleChange} placeholder="مدل، رنگ، زمان تحویل و ..." />
            </div>
            <button type="submit" className="bulk-order-submit" disabled={submitting}>
              {submitting ? 'در حال ارسال...' : 'ثبت درخواست خرید عمده'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderPage;
