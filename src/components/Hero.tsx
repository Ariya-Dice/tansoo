import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export function Hero() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
             شیرآلات ساختمانی تانسو
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            بهترین کیفیت، مناسب‌ترین قیمت، سریع‌ترین ارسال
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              مشاهده محصولات
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Link>
            <Link
              href="/about"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              درباره ما
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Image src="/tap.png" alt="کیفیت شیرآلات" width={32} height={32} className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">کیفیت برتر</h3>
            <p className="text-blue-100"> محصولات با کیفیت بالا و استاندارد</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Image src="/warranty.png" alt="ضمانت" width={32} height={32} className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">ضمانت کیفیت</h3>
            <p className="text-blue-100">ضمانت 5 ساله برای تمام محصولات</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Image src="/globe.svg" alt="ارسال سریع" width={32} height={32} className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">ارسال سریع</h3>
            <p className="text-blue-100">ارسال سریع به سراسر کشور</p>
          </div>
        </div>
      </div>
    </div>
  )
}