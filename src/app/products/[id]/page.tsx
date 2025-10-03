import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/ProductDetail'
import { prisma } from '@/lib/db'

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

async function getProduct(id: string) {
  try {
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
  const products = await prisma.product.findMany({
    select: { id: true }
  })

  return products.map((product) => ({
    id: product.id,
  }))
}
