'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Product } from '@/types'

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState('')
  const [isCartonOrder, setIsCartonOrder] = useState(false)
  const { addToCart } = useCart()

  const images = Array.isArray(product.images) ? product.images : []
  const colors = Array.isArray(product.colors) ? product.colors : []

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleAddToCart = () => {
    const finalQuantity = isCartonOrder ? quantity * 12 : quantity
    addToCart(product, finalQuantity)
    // You could add a toast notification here
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Images */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative">
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
            {images.length > 0 ? (
              <Image
                src={images[selectedImageIndex] as string}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500 text-lg">تصویر محصول</span>
              </div>
            )}
          </div>
          
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Images */}
        {images.length > 1 && (
          <div className="flex space-x-2 space-x-reverse overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <Image
                  src={image as string}
                  alt={`${product.name} ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <div className="flex items-center space-x-2 space-x-reverse mb-4">
            <Image src="/warranty.png" alt="امتیاز و ضمانت" width={20} height={20} className="h-5 w-5" />
            <span className="text-gray-600 text-sm">(4.8) - 124 نظر</span>
          </div>
        </div>

        <div className="text-3xl font-bold text-blue-600">
          {product.price.toLocaleString('fa-IR')} تومان
        </div>

        {product.description && (
          <div>
            <h3 className="text-lg font-semibold mb-2">توضیحات محصول</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Color Selection */}
        {colors.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">انتخاب رنگ</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color as string)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    selectedColor === color
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {color as string}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-3">تعداد</h3>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              -
            </button>
            <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              +
            </button>
            <span className="text-sm text-gray-500">
              موجودی: {product.stock} عدد
            </span>
          </div>
        </div>

        {/* Carton Order Option */}
        <div>
          <h3 className="text-lg font-semibold mb-3">نوع سفارش</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 space-x-reverse">
              <input
                type="radio"
                name="orderType"
                checked={!isCartonOrder}
                onChange={() => setIsCartonOrder(false)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">تک عددی</span>
            </label>
            <label className="flex items-center space-x-3 space-x-reverse">
              <input
                type="radio"
                name="orderType"
                checked={isCartonOrder}
                onChange={() => setIsCartonOrder(true)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">کارتنی (هر کارتن 12 عدد)</span>
            </label>
            {isCartonOrder && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>توجه:</strong> با انتخاب گزینه کارتنی، هر {quantity} کارتن معادل {quantity * 12} عدد محصول خواهد بود.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 space-x-reverse text-lg font-semibold"
        >
          <ShoppingCart className="h-6 w-6" />
          <span>{product.stock === 0 ? 'ناموجود' : 'افزودن به سبد خرید'}</span>
        </button>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Image src="/warranty.png" alt="ضمانت کیفیت" width={24} height={24} className="h-6 w-6" />
            <div>
              <p className="font-semibold text-sm">ضمانت کیفیت</p>
              <p className="text-xs text-gray-500">2 سال ضمانت</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Image src="/globe.svg" alt="ارسال سریع" width={24} height={24} className="h-6 w-6" />
            <div>
              <p className="font-semibold text-sm">ارسال سریع</p>
              <p className="text-xs text-gray-500">1-2 روز کاری</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Image src="/tap1.png" alt="کیفیت برتر" width={24} height={24} className="h-6 w-6" />
            <div>
              <p className="font-semibold text-sm">کیفیت برتر</p>
              <p className="text-xs text-gray-500">استاندارد</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
