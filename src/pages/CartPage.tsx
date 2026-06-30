import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getDefaultImage } from '../constants';
import { getProductGoodsType } from '../productSpecs';
import { TrashIcon } from '../components/icons';
import './CartPage.css';

const BULK_THRESHOLD = 20;

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart, getImage, cartCount } =
    useAppContext();

  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
  const suggestBulk = totalQty >= BULK_THRESHOLD;

  if (cart.length === 0) {
    return (
      <div className="cart-page cart-empty">
        <div className="cart-empty-card">
          <div className="cart-empty-icon" aria-hidden>🛒</div>
          <h1 className="cart-empty-title">سبد خرید خالی است</h1>
          <p className="cart-empty-text">هنوز محصولی اضافه نکرده‌اید.</p>
          <div className="cart-empty-actions">
            <Link to="/products" className="cart-btn cart-btn-primary">مشاهده محصولات</Link>
            <Link to="/bulk-order" className="cart-btn cart-btn-secondary">خرید عمده / تعداد بالا</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container cart-layout">
        <header className="cart-header">
          <h1 className="cart-title">سبد خرید</h1>
          <p className="cart-subtitle">{cartCount} قلم در سبد شما</p>
        </header>

        {suggestBulk && (
          <div className="cart-bulk-banner">
            <p>با توجه به تعداد بالا، پیشنهاد می‌شود از <strong>خرید عمده</strong> استفاده کنید.</p>
            <Link to="/bulk-order" className="cart-btn cart-btn-secondary cart-btn-sm">ثبت درخواست عمده</Link>
          </div>
        )}

        <div className="cart-grid">
          <div className="cart-items">
            {cart.map((item) => {
              const imageSrc = item.product.image
                ? getImage(item.product.image)
                : getDefaultImage(item.product.model);
              const goodsType = getProductGoodsType(item.product);

              return (
                <article key={item.product.id} className="cart-item">
                  <Link to={`/product/${item.product.id}`} className="cart-item-image-link">
                    <img
                      src={imageSrc}
                      alt={`${item.product.model} ${goodsType}`}
                      className="cart-item-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getDefaultImage(item.product.model);
                      }}
                    />
                  </Link>
                  <div className="cart-item-body">
                    <h3 className="cart-item-title">
                      {item.product.model} <span>{goodsType}</span>
                    </h3>
                    <p className="cart-item-meta">رنگ: {item.product.color} · {item.product.bodyWeight}</p>
                    <p className="cart-item-price">
                      {item.product.price.toLocaleString('fa-IR')} <small>تومان</small>
                    </p>
                  </div>
                  <div className="cart-item-actions">
                    <div className="cart-qty" role="group" aria-label="تعداد">
                      <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label="کم کردن">−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label="زیاد کردن">+</button>
                    </div>
                    <button type="button" className="cart-remove" onClick={() => removeFromCart(item.product.id)} aria-label="حذف">
                      <TrashIcon />
                    </button>
                  </div>
                  <p className="cart-item-line-total">
                    {(item.product.price * item.quantity).toLocaleString('fa-IR')} تومان
                  </p>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2 className="cart-summary-title">خلاصه سفارش</h2>
            <div className="cart-summary-row">
              <span>تعداد اقلام</span>
              <span>{totalQty} عدد</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>جمع کل</span>
              <span>{cartTotal.toLocaleString('fa-IR')} تومان</span>
            </div>
            <Link to="/checkout" className="cart-btn cart-btn-primary cart-btn-block">ادامه و تسویه حساب</Link>
            <Link to="/bulk-order" className="cart-btn cart-btn-secondary cart-btn-block">خرید عمده</Link>
            <button type="button" onClick={clearCart} className="cart-btn cart-btn-ghost cart-btn-block">خالی کردن سبد</button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
