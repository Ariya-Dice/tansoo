
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { TrashIcon } from '../components/icons';

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, getImage } = useAppContext();

  return (
    <div className="bg-brand-dark-blue">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center text-brand-light-text">سبد خرید شما</h1>
        {cart.length === 0 ? (
          <div className="text-center py-16 bg-brand-surface rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-brand-light-text">سبد خرید شما خالی است.</h2>
            <p className="mt-2 text-brand-muted-text">به نظر می‌رسد هنوز چیزی به سبد خرید خود اضافه نکرده‌اید.</p>
            <Link to="/products" className="mt-6 inline-block bg-brand-neon-blue text-brand-dark-blue font-semibold py-3 px-8 rounded-md hover:bg-opacity-80 transition-all duration-300">
              ادامه خرید
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-brand-surface rounded-lg shadow p-6 space-y-6">
              {cart.map(item => (
                <div key={`${item.product.id}-${item.color}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-neon-blue/20 pb-6 last:border-b-0 text-right">
                  <div className="flex items-center gap-4">
                    <img src={getImage(item.product.images[item.color])} alt={item.product.name} className="w-24 h-24 rounded-md object-cover bg-brand-dark-blue" />
                    <div>
                      <h3 className="font-semibold text-lg text-brand-light-text">{item.product.name}</h3>
                      <p className="text-sm text-brand-muted-text">رنگ: {item.color}</p>
                      <p className="text-md font-bold text-brand-neon-blue">{item.product.price.toLocaleString('fa-IR')} تومان</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-brand-neon-blue/30 rounded-md">
                       <button onClick={() => updateQuantity(item.product.id, item.color, item.quantity + 1)} className="px-3 py-1 text-lg font-semibold text-brand-light-text hover:bg-brand-dark-blue rounded-l-md">+</button>
                      <span className="px-4 py-1">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.color, Math.max(1, item.quantity - 1))} className="px-3 py-1 text-lg font-semibold text-brand-light-text hover:bg-brand-dark-blue rounded-r-md">-</button>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id, item.color)} className="text-brand-muted-text hover:text-red-500 transition-colors p-2">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-brand-surface rounded-lg shadow p-6 sticky top-24 text-right">
                <h2 className="text-xl font-bold border-b border-brand-neon-blue/20 pb-4 text-brand-light-text">خلاصه سفارش</h2>
                <div className="space-y-4 my-4 text-brand-light-text">
                  <div className="flex justify-between">
                    <span>جمع کل ({cartCount} محصول)</span>
                    <span>{cartTotal.toLocaleString('fa-IR')} تومان</span>
                  </div>
                  <div className="flex justify-between">
                    <span>هزینه ارسال</span>
                    <span className="font-semibold text-green-400">رایگان</span>
                  </div>
                </div>
                <div className="border-t border-brand-neon-blue/20 pt-4 flex justify-between font-bold text-lg text-brand-light-text">
                  <span>مبلغ قابل پرداخت</span>
                  <span>{cartTotal.toLocaleString('fa-IR')} تومان</span>
                </div>
                <Link to="/checkout">
                  <button className="mt-6 w-full bg-brand-neon-blue text-brand-dark-blue py-3 rounded-md font-semibold hover:bg-opacity-80 transition-colors duration-300">
                    ادامه جهت تسویه حساب
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;