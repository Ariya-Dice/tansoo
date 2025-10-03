import { ProductGrid } from '@/components/ProductGrid'

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">همه محصولات</h1>
        <p className="text-gray-600">مجموعه کاملی از شیرآلات ساختمانی با کیفیت بالا</p>
      </div>
      <ProductGrid />
    </div>
  )
}
