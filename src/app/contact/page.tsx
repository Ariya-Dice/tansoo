'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'
import { GoogleMap } from '@/components/GoogleMap'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    alert('پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.')
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">تماس با ما</h1>
        <p className="text-xl text-gray-600">
          سوالی دارید؟ ما اینجا هستیم تا به شما کمک کنیم
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">اطلاعات تماس</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">تلفن تماس</h3>
                <p className="text-gray-600">021-12345678</p>
                <p className="text-gray-600">09123456789</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="p-3 bg-green-100 rounded-lg">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">ایمیل</h3>
                <p className="text-gray-600">info@tansoo.com</p>
                <p className="text-gray-600">support@tansoo.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">آدرس</h3>
                <p className="text-gray-600">
                  استان اردبیل. شهرک کشاورزی. کوچه طلاییه چهارم شرقی
                </p>
                <a
                  href="https://maps.app.goo.gl/uGSsaZ4MwHGWSwCh8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 hover:text-blue-700 underline"
                >
                  مشاهده در نقشه گوگل
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">ساعات کاری</h3>
                <p className="text-gray-600">شنبه تا پنج‌شنبه: 8:00 - 18:00</p>
                <p className="text-gray-600">جمعه: 9:00 - 14:00</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">پشتیبانی آنلاین</h3>
            <p className="text-gray-600 text-sm mb-4">
              برای دریافت پاسخ سریع، می‌توانید از طریق واتساپ با ما در ارتباط باشید
            </p>
            <a
              href="https://wa.me/989123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Phone className="h-4 w-4 ml-2" />
              تماس از طریق واتساپ
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ارسال پیام</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="نام خود را وارد کنید"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  ایمیل
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ایمیل خود را وارد کنید"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                شماره تماس
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="شماره تماس خود را وارد کنید"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                موضوع
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="موضوع پیام خود را وارد کنید"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                پیام
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="پیام خود را وارد کنید"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse font-semibold"
            >
              <Send className="h-5 w-5" />
              <span>ارسال پیام</span>
            </button>
          </form>
        </div>
      </div>

      {/* Google Maps Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">موقعیت فروشگاه</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <GoogleMap
            center={{ lat: 35.7219, lng: 51.3347 }}
            zoom={15}
            className="w-full h-96"
            address="استان اردبیل. شهرک کشاورزی. کوچه طلاییه چهارم شرقی"
          />
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              <strong>آدرس دقیق:</strong> استان اردبیل. شهرک کشاورزی. کوچه طلاییه چهارم شرقی
            </p>
            <p className="text-sm text-gray-500 mt-2">
              برای دسترسی آسان‌تر، می‌توانید از نقشه بالا استفاده کنید
            </p>
            <a
              href="https://maps.app.goo.gl/uGSsaZ4MwHGWSwCh8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              باز کردن مسیر در Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
