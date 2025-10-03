import { Product, Order, OrderItem, Admin, OrderStatus } from '@prisma/client'

export type { Product, Order, OrderItem, Admin, OrderStatus }

export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  total: number
}

export interface ProductWithDetails extends Product {
  images: string[]
  colors: string[]
}

export interface OrderWithItems extends Order {
  orderItems: (OrderItem & {
    product: Product
  })[]
}

export interface CustomerInfo {
  name: string
  phone: string
  address: string
}

export interface OrderFormData extends CustomerInfo {
  items: {
    productId: string
    quantity: number
    isCarton?: boolean
  }[]
}
