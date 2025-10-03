import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/ProductDetail'
import { prisma } from '@/lib/db'
import { mockProducts } from '@/lib/mock'

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

const useMock = !process.env.DATABASE_URL || process.env.USE_MOCK_DATA === '1'

// mockProducts imported

async function getProduct(id: string) {
  try {
    if (useMock) {
      return mockProducts.find(p => p.id === id) ?? null
    }
    const product = await prisma.product.findUnique({
      where: { id }
    })
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const product = await getProduct(resolvedParams.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductDetail product={product} />
    </div>
  )
}

export async function generateStaticParams() {
  if (useMock) {
    return mockProducts.map((p) => ({ id: p.id }))
  }
  try {
    const products = await prisma.product.findMany({
      select: { id: true }
    })
    return products.map((product) => ({ id: product.id }))
  } catch {
    // Fallback to mock IDs if DB is unreachable during build
    return mockProducts.map((p) => ({ id: p.id }))
  }
}
