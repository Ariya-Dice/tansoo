import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

const useMock = !process.env.DATABASE_URL || process.env.USE_MOCK_DATA === '1'

interface MockOrderItem {
  productId: string
  quantity: number
}

interface MockOrder {
  id: string
  totalPrice: number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  customerInfo: unknown
  orderItems: MockOrderItem[]
  createdAt: Date
  updatedAt: Date
}

const mockOrders: MockOrder[] = []

export async function POST(request: NextRequest) {
  try {
    const { items, totalPrice, customerInfo } = await request.json() as {
      items: MockOrderItem[]
      totalPrice: number
      customerInfo: unknown
    }

    if (useMock) {
      const orderId = `mock-order-${Date.now()}`
      mockOrders.unshift({
        id: orderId,
        totalPrice,
        status: 'PENDING',
        customerInfo,
        orderItems: items,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      return NextResponse.json({ success: true, orderId, message: 'Order created successfully (mock)' })
    }

    // Create the order in DB
    const order = await prisma.order.create({
      data: {
        totalPrice,
        status: 'PENDING',
        customerInfo: customerInfo as Prisma.InputJsonValue,
        orderItems: {
          create: items.map((item: { productId: string; quantity: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: 0,
          }))
        }
      },
      include: {
        orderItems: { include: { product: true } }
      }
    })

    // Update order items with current product prices
    for (const orderItem of order.orderItems) {
      await prisma.orderItem.update({
        where: { id: orderItem.id },
        data: { price: orderItem.product.price }
      })
    }

    // Update stock for each product
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
    }

    return NextResponse.json({ success: true, orderId: order.id, message: 'Order created successfully' })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    if (useMock) {
      return NextResponse.json(mockOrders)
    }

    const orders = await prisma.order.findMany({
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
