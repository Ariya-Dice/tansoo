'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Filter, SortAsc, SortDesc } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Product } from '@/types'

function ProductGridContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const { addToCart } = useCart()

  const colors = ['کروم', 'سفید', 'سفید طلایی', 'مشکی طلایی']
  const categories = ['سینک', 'روشویی', 'دوش', 'آفتابه']

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = [...products]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by color
    if (selectedColor) {
      filtered = filtered.filter(product => {
        const productColors = Array.isArray(product.colors) ? product.colors : []
        return productColors.includes(selectedColor)
      })
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => {
        return product.name.includes(selectedCategory)
      })
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'name':
          return a.name.localeCompare(b.name, 'fa')
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }, [products, sortBy, selectedColor, selectedCategory, searchQuery])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1)
    // You could add a toast notification here
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="جستجو در محصولات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Filter className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Sort */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-sm font-medium text-gray-700">مرتب‌سازی:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price-asc' | 'price-desc' | 'name')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">نام</option>
              <option value="price-asc">قیمت: کم به زیاد</option>
              <option value="price-desc">قیمت: زیاد به کم</option>
            </select>
            {sortBy === 'price-asc' ? (
              <SortAsc className="h-4 w-4 text-gray-500" />
            ) : sortBy === 'price-desc' ? (
              <SortDesc className="h-4 w-4 text-gray-500" />
            ) : null}
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-sm font-medium text-gray-700">دسته‌بندی:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">همه دسته‌ها</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Color Filter */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-sm font-medium text-gray-700">رنگ:</span>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">همه رنگ‌ها</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500">
            {filteredProducts.length} محصول یافت شد
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const images = Array.isArray(product.images) ? product.images : []
          const productColors = Array.isArray(product.colors) ? product.colors : []
          
          return (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/products/${product.id}`}>
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    {images.length > 0 ? (
                      <Image
                        src={images[0] as string}
                        alt={product.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">تصویر محصول</span>
                    )}
                  </div>
                  {product.stock === 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                      ناموجود
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="mb-3">
                  <p className="text-lg font-bold text-blue-600">
                    {product.price.toLocaleString('fa-IR')} تومان
                  </p>
                </div>

                {/* Colors */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {productColors.slice(0, 3).map((color, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {color as string}
                      </span>
                    ))}
                    {productColors.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{productColors.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{product.stock === 0 ? 'ناموجود' : 'افزودن به سبد'}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">محصولی یافت نشد</p>
          <p className="text-gray-400 text-sm mt-2">لطفاً فیلترهای جستجو را تغییر دهید</p>
        </div>
      )}
    </div>
  )
}

export function ProductGrid() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    }>
      <ProductGridContent />
    </Suspense>
  )
}
