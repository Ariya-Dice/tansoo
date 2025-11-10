
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getDefaultImage } from '../constants';
import './CheckoutPage.css';

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, clearCart, showToast, getImage } = useAppContext();
  const navigate = useNavigate();
  const [customerDetails, setCustomerDetails] = useState({ name: '', email: '', address: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('سبد خرید شما خالی است.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment gateway processing
    setTimeout(() => {
        clearCart();
        setIsProcessing(false);
        alert('✅ سفارش شما با موفقیت ثبت شد!');
        showToast('✅ سفارش شما با موفقیت ثبت شد!');
        navigate('/');
    }, 2000);
  };

  return (
    <div className="bg-brand-dark-blue">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-right">
        <h1 className="text-3xl font-bold mb-8 text-center text-brand-light-text">تسویه حساب</h1>
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Customer Information Form */}
          <div className="bg-brand-surface p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-brand-light-text">اطلاعات ارسال</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand-muted-text">نام کامل</label>
                <input type="text" name="name" id="name" required className="mt-1 block w-full rounded-md border-brand-neon-blue/30 bg-brand-dark-blue shadow-sm focus:border-brand-neon-blue focus:ring-brand-neon-blue sm:text-sm text-brand-light-text" value={customerDetails.name} onChange={handleInputChange} />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-muted-text">آدرس ایمیل</label>
                <input type="email" name="email" id="email" required className="mt-1 block w-full rounded-md border-brand-neon-blue/30 bg-brand-dark-blue shadow-sm focus:border-brand-neon-blue focus:ring-brand-neon-blue sm:text-sm text-brand-light-text" value={customerDetails.email} onChange={handleInputChange} />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-brand-muted-text">آدرس</label>
                <textarea name="address" id="address" rows={3} required className="mt-1 block w-full rounded-md border-brand-neon-blue/30 bg-brand-dark-blue shadow-sm focus:border-brand-neon-blue focus:ring-brand-neon-blue sm:text-sm text-brand-light-text" value={customerDetails.address} onChange={handleInputChange}></textarea>
              </div>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-brand-neon-blue text-brand-dark-blue py-3 rounded-md font-semibold hover:bg-opacity-80 transition-colors duration-300 disabled:bg-brand-muted-text/50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -mr-1 ml-3 h-5 w-5 text-brand-dark-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    در حال پردازش...
                  </>
                ) : `پرداخت ${cartTotal.toLocaleString('fa-IR')} تومان`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-brand-surface p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-brand-light-text">سفارش شما</h2>
            <div className="space-y-4 max-h-80 overflow-y-auto pl-2">
              {cart.map(item => {
                const imageSrc = item.product.image 
                  ? getImage(item.product.image) 
                  : getDefaultImage(item.product.model);
                
                return (
                  <div key={item.product.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <img 
                        src={imageSrc} 
                        alt={`${item.product.model} ${item.product.type}`} 
                        className="w-16 h-16 rounded-md object-cover bg-brand-dark-blue"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getDefaultImage(item.product.model);
                        }}
                      />
                      <div>
                        <p className="font-semibold text-brand-light-text">
                          {item.product.model} {item.product.type}
                        </p>
                        <p className="text-sm text-brand-muted-text">
                          {item.product.color} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-brand-light-text">
                      {(item.product.price * item.quantity).toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-brand-neon-blue/20 mt-6 pt-6 space-y-2">
                <div className="flex justify-between text-brand-muted-text">
                    <span>جمع کل</span>
                    <span>{cartTotal.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between text-brand-muted-text">
                    <span>هزینه ارسال</span>
                    <span>۰ تومان</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-brand-light-text">
                    <span>مبلغ نهایی</span>
                    <span>{cartTotal.toLocaleString('fa-IR')} تومان</span>
                </div>
            </div>
            <p className="text-sm text-center mt-4 text-brand-muted-text">
                پرداخت توسط درگاه امن (شبیه‌سازی شده) انجام می‌شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;