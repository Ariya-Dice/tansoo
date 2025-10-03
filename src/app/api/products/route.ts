import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { mockProducts } from '@/lib/mock'

const useMock = !process.env.DATABASE_URL || process.env.USE_MOCK_DATA === '1'

// mockProducts imported

export async function GET() {
  try {
    if (useMock) {
      return NextResponse.json(mockProducts)
    }

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    // Fallback to mock data if DB is unreachable
    return NextResponse.json(mockProducts)
  }
}
