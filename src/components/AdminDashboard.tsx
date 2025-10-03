'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  LogOut
} from 'lucide-react'
import { Product, Order } from '@/types'

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'stats'>('stats')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showAddProduct, setShowAddProduct] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if admin is logged in
    const adminSession = localStorage.getItem('admin-session')
    if (!adminSession) {
      router.push('/admin')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ])

      const productsData = await productsRes.json()
      const ordersData = await ordersRes.json()

      setProducts(productsData)
      setOrders(ordersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin-session')
    router.push('/admin')
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این محصول را حذف کنید؟')) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
      } else {
        alert('خطا در حذف محصول')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('خطا در حذف محصول')
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus as 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' } : order
        ))
      } else {
        alert('خطا در به‌روزرسانی وضعیت سفارش')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('خطا در به‌روزرسانی وضعیت سفارش')
    }
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0)
  const totalOrders = orders.length
  const totalProducts = products.length
  const pendingOrders = orders.filter(order => order.status === 'PENDING').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">پنل مدیریت</h1>
              <p className="text-gray-600">فروشگاه شیرآلات ساختمانی تانسو</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 space-x-reverse text-red-600 hover:text-red-700"
            >
              <LogOut className="h-5 w-5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">درآمد کل</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalRevenue.toLocaleString('fa-IR')} تومان
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">کل سفارشات</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">محصولات</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">سفارشات در انتظار</p>
                <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 space-x-reverse">
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                آمار کلی
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                مدیریت محصولات
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                مدیریت سفارشات
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'stats' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">آمار کلی فروشگاه</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">آخرین سفارشات</h4>
                    <div className="space-y-2">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-sm">#{order.id.slice(-8)}</span>
                          <span className="text-sm font-medium">
                            {order.totalPrice.toLocaleString('fa-IR')} تومان
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status === 'PENDING' ? 'در انتظار' :
                             order.status === 'PROCESSING' ? 'در حال پردازش' :
                             order.status === 'SHIPPED' ? 'ارسال شده' :
                             order.status === 'DELIVERED' ? 'تحویل داده شده' :
                             'لغو شده'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">محصولات پرفروش</h4>
                    <div className="space-y-2">
                      {products.slice(0, 5).map((product) => (
                        <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-sm">{product.name}</span>
                          <span className="text-sm font-medium">
                            {product.price.toLocaleString('fa-IR')} تومان
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">مدیریت محصولات</h3>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
                  >
                    <Plus className="h-4 w-4" />
                    <span>افزودن محصول</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          محصول
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          قیمت
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          موجودی
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          عملیات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => {
                        const images = Array.isArray(product.images) ? product.images : []
                        return (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                  {images.length > 0 ? (
                                    <Image
                                      src={images[0] as string}
                                      alt={product.name}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-gray-500 text-xs">تصویر</span>
                                    </div>
                                  )}
                                </div>
                                <div className="mr-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.price.toLocaleString('fa-IR')} تومان
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.stock > 10 ? 'bg-green-100 text-green-800' :
                                product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {product.stock} عدد
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-semibold mb-6">مدیریت سفارشات</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          شماره سفارش
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          مشتری
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          مبلغ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          وضعیت
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تاریخ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          عملیات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => {
                        const customerInfo = order.customerInfo as { name?: string; phone?: string; address?: string }
                        return (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order.id.slice(-8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {customerInfo?.name || 'نامشخص'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.totalPrice.toLocaleString('fa-IR')} تومان
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className={`text-xs px-2 py-1 rounded ${
                                  order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                <option value="PENDING">در انتظار</option>
                                <option value="PROCESSING">در حال پردازش</option>
                                <option value="SHIPPED">ارسال شده</option>
                                <option value="DELIVERED">تحویل داده شده</option>
                                <option value="CANCELLED">لغو شده</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
