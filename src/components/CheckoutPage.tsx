'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { User, Phone, MapPin, CreditCard, CheckCircle } from 'lucide-react'

interface CustomerInfo {
  name: string
  phone: string
  address: string
}

export function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const router = useRouter()
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    if (cart.items.length === 0) {
      router.push('/cart')
    }
  }, [cart.items.length, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        totalPrice: cart.total,
        customerInfo
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const result = await response.json()
        setOrderId(result.orderId)
        setOrderSuccess(true)
        clearCart()
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">سفارش شما با موفقیت ثبت شد!</h1>
        <p className="text-gray-600 mb-6">
          شماره سفارش شما: <span className="font-bold text-blue-600">{orderId}</span>
        </p>
        <p className="text-gray-600 mb-8">
          به زودی با شما تماس خواهیم گرفت تا جزئیات ارسال را هماهنگ کنیم.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            بازگشت به صفحه اصلی
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">تکمیل خرید</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Information Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">اطلاعات مشتری</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                نام و نام خانوادگی
              </label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="نام و نام خانوادگی خود را وارد کنید"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                شماره تماس
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="شماره تماس خود را وارد کنید"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                آدرس کامل
              </label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="address"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="آدرس کامل خود را وارد کنید"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center space-x-2 space-x-reverse"
            >
              <CreditCard className="h-5 w-5" />
              <span>{isSubmitting ? 'در حال پردازش...' : 'تایید و ثبت سفارش'}</span>
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">خلاصه سفارش</h2>
          
          <div className="space-y-4">
            {cart.items.map((item) => {
              const images = Array.isArray(item.product.images) ? item.product.images : []
              
              return (
                <div key={item.product.id} className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {images.length > 0 ? (
                      <Image
                        src={images[0] as string}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs">تصویر</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm">
                      {item.quantity} × {item.product.price.toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                  
                  <div className="text-left">
                    <p className="font-semibold">
                      {(item.product.price * item.quantity).toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t pt-4 mt-6">
            <div className="space-y-2">
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
              
              <div className="flex justify-between text-lg font-bold">
                <span>مجموع کل:</span>
                <span className="text-blue-600">
                  {cart.total.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>نکته:</strong> این یک نسخه نمایشی است. در نسخه واقعی، 
              درگاه پرداخت متصل خواهد شد و پرداخت انجام می‌شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
