// src/pages/CartPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart, getImage } =
    useAppContext();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">سبد خرید خالی است</h1>
        <p className="text-gray-600 mb-6">
          هنوز هیچ محصولی به سبد خرید خود اضافه نکرده‌اید.
        </p>
        <Link
          to="/products"
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg shadow-md"
        >
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-right">
          سبد خرید شما
        </h1>

        {/* لیست محصولات */}
        <div className="divide-y">
          {cart.map((item) => (
            <div
              key={`${item.product.id}-${item.color}`}
              className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={getImage(item.product.images[item.color])}
                  alt={item.product.name}
                  className="w-24 h-24 rounded-lg border object-cover"
                />
                <div className="text-right">
                  <h3 className="font-semibold text-gray-800">
                    {item.product.name}
                  </h3>
                  <p className="text-gray-500 text-sm">رنگ: {item.color}</p>
                  <p className="text-blue-600 font-medium">
                    {item.product.price.toLocaleString("fa-IR")} تومان
                  </p>
                </div>
              </div>

              {/* کنترل‌ها */}
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(
                      item.product.id,
                      item.color,
                      parseInt(e.target.value)
                    )
                  }
                  className="w-16 border rounded-md text-center"
                />
                <button
                  onClick={() => removeFromCart(item.product.id, item.color)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* جمع کل */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t gap-4">
          <div className="text-lg font-semibold text-gray-700">
            مجموع:{" "}
            <span className="text-blue-600">
              {cartTotal.toLocaleString("fa-IR")} تومان
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={clearCart}
              className="border border-gray-400 hover:bg-gray-100 text-gray-700 py-2 px-5 rounded-md transition-all"
            >
              خالی کردن سبد
            </button>
            <Link
              to="/checkout"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md shadow-md"
            >
              ادامه فرآیند خرید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
