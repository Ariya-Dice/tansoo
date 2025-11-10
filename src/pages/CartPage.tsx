// src/pages/CartPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { getDefaultImage } from "../constants";
import "./CartPage.css";

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart, getImage } =
    useAppContext();

  if (cart.length === 0) {
    return (
      <div className="cart-page cart-empty">
        <div className="cart-empty-content">
          <h1 className="cart-empty-title">سبد خرید خالی است</h1>
          <p className="cart-empty-text">
            هنوز هیچ محصولی به سبد خرید خود اضافه نکرده‌اید.
          </p>
          <Link to="/products" className="cart-empty-link">
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">سبد خرید شما</h1>

        {/* لیست محصولات */}
        <div className="cart-items">
          {cart.map((item) => {
            const imageSrc = item.product.image 
              ? getImage(item.product.image) 
              : getDefaultImage(item.product.model);
            
            return (
              <div key={item.product.id} className="cart-item">
                <div className="cart-item-image-wrapper">
                  <img
                    src={imageSrc}
                    alt={`${item.product.model} ${item.product.type}`}
                    className="cart-item-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getDefaultImage(item.product.model);
                    }}
                  />
                </div>
                <div className="cart-item-details">
                  <h3 className="cart-item-title">
                    {item.product.model} {item.product.type}
                  </h3>
                  <p className="cart-item-meta">
                    <span>رنگ: {item.product.color}</span>
                    <span>وزن: {item.product.bodyWeight}</span>
                  </p>
                  <p className="cart-item-price">
                    {item.product.price.toLocaleString("fa-IR")} تومان
                  </p>
                </div>
                <div className="cart-item-controls">
                  <div className="cart-quantity-control">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.product.id, parseInt(e.target.value) || 1)
                      }
                      className="cart-quantity-input"
                    />
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="cart-remove-btn"
                  >
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* جمع کل */}
        <div className="cart-summary">
          <div className="cart-summary-row">
            <span>تعداد کل:</span>
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} عدد</span>
          </div>
          <div className="cart-summary-row cart-total">
            <span>مجموع:</span>
            <span>{cartTotal.toLocaleString("fa-IR")} تومان</span>
          </div>
          <div className="cart-actions">
            <button onClick={clearCart} className="cart-clear-btn">
              خالی کردن سبد
            </button>
            <Link to="/checkout" className="cart-checkout-btn">
              ثبت سفارش
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
