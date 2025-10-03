import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { mockProducts } from '@/lib/mock'

const useMock = !process.env.DATABASE_URL || process.env.USE_MOCK_DATA === '1'
// mockProducts imported

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json([])
    }

    if (useMock) {
      const filtered = mockProducts.filter(p => p.name.includes(query))
      return NextResponse.json(filtered)
    }

    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: query
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}
