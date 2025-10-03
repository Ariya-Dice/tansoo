'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleCheckout = () => {
    setIsCheckingOut(true)
    // Redirect to checkout page
    window.location.href = '/checkout'
  }

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">سبد خرید شما خالی است</h2>
        <p className="text-gray-600 mb-8">محصولات مورد نظر خود را به سبد خرید اضافه کنید</p>
        <Link
          href="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 space-x-reverse"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>مشاهده محصولات</span>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">سبد خرید</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          پاک کردن سبد خرید
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const images = Array.isArray(item.product.images) ? item.product.images : []
            
            return (
              <div key={item.product.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {images.length > 0 ? (
                      <Image
                        src={images[0] as string}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs">تصویر</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-gray-600 text-sm mt-1">
                      {item.product.price.toLocaleString('fa-IR')} تومان
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Total Price */}
                  <div className="text-left">
                    <p className="text-lg font-bold text-gray-900">
                      {(item.product.price * item.quantity).toLocaleString('fa-IR')} تومان
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">خلاصه سفارش</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">تعداد اقلام:</span>
                <span className="font-semibold">{cart.items.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">مجموع کالاها:</span>
                <span className="font-semibold">
                  {cart.total.toLocaleString('fa-IR')} تومان
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">هزینه ارسال:</span>
                <span className="font-semibold text-green-600">رایگان</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">مجموع کل:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {cart.total.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold mt-6"
            >
              {isCheckingOut ? 'در حال پردازش...' : 'ادامه خرید'}
            </button>

            <Link
              href="/products"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-semibold mt-3 block text-center"
            >
              ادامه خرید
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
