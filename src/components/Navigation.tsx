'use client'

import Link from 'next/link'
import { useState } from 'react'
// router removed
import { ShoppingCart, Menu, X, Settings } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  // removed search field
  const { cart, getTotalItems } = useCart()

  const totalItems = getTotalItems()

  // removed handler

  return (
    <nav className="bg-white/80 backdrop-blur shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ت</span>
            </div>
            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-vazirmatn)' }}>تانسو</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              صفحه اصلی
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
              محصولات
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              درباره ما
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              تماس با ما
            </Link>
          </div>

      {/* Search Bar removed */}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Admin Link */}
            <Link href="/admin" className="hidden md:flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <Settings className="h-5 w-5 ml-1" />
              <span>مدیریت</span>
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                صفحه اصلی
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
                محصولات
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                درباره ما
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                تماس با ما
              </Link>
              <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                مدیریت
              </Link>
              
            {/* Mobile Search removed */}
            </div>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">سبد خرید</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              {cart.items.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">سبد خرید شما خالی است</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-4 space-x-reverse p-3 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">تصویر</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{item.product.name}</h3>
                        <p className="text-gray-500 text-sm">
                          {item.quantity} × {item.product.price.toLocaleString('fa-IR')} تومان
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">
                          {(item.product.price * item.quantity).toLocaleString('fa-IR')} تومان
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">مجموع:</span>
                      <span className="font-bold text-lg">
                        {cart.total.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                    <Link
                      href="/cart"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                      onClick={() => setIsCartOpen(false)}
                    >
                      مشاهده سبد خرید
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
