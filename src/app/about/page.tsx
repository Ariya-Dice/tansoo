import { Star, Shield, Truck, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">درباره تانسو</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          فروشگاه آنلاین شیرآلات ساختمانی با بیش از 10 سال تجربه در زمینه تامین و فروش محصولات باکیفیت
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">داستان ما</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              تانسو در سال 1393 با هدف ارائه بهترین شیرآلات ساختمانی به مشتریان ایرانی تاسیس شد. 
              ما معتقدیم که کیفیت و رضایت مشتری اولویت اول ماست.
            </p>
            <p>
              طی این سال‌ها، هزاران مشتری راضی داشته‌ایم و توانسته‌ایم اعتماد آن‌ها را جلب کنیم. 
              محصولات ما از بهترین برندهای داخلی و خارجی انتخاب شده‌اند.
            </p>
            <p>
              امروز، تانسو به عنوان یکی از پیشروان فروش آنلاین شیرآلات ساختمانی شناخته می‌شود 
              و به طور مداوم در حال بهبود خدمات خود است.
            </p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">چرا تانسو؟</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 space-x-reverse">
              <Star className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">کیفیت برتر</h4>
                <p className="text-gray-600 text-sm">محصولات با کیفیت بالا و استانداردهای بین‌المللی</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-x-reverse">
              <Shield className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">ضمانت کیفیت</h4>
                <p className="text-gray-600 text-sm">ضمانت 2 ساله برای تمام محصولات</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-x-reverse">
              <Truck className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">ارسال سریع</h4>
                <p className="text-gray-600 text-sm">ارسال رایگان در تهران و ارسال سریع به سراسر کشور</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-x-reverse">
              <Award className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">پشتیبانی 24/7</h4>
                <p className="text-gray-600 text-sm">پشتیبانی کامل قبل و بعد از خرید</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">ماموریت ما</h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          ارائه بهترین شیرآلات ساختمانی با کیفیت بالا، قیمت مناسب و خدمات عالی 
          به مشتریان عزیزمان در سراسر ایران
        </p>
      </div>
    </div>
  )
}
