import { ProductGrid } from '@/components/ProductGrid'
import { Hero } from '@/components/Hero'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">محصولات محبوب</h2>
          <p className="text-gray-600">بهترین شیرآلات ساختمانی با کیفیت بالا و قیمت مناسب</p>
        </div>
        <ProductGrid />
      </div>
    </div>
  )
}
