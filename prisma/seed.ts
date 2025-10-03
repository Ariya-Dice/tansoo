import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const designs = ['اردکی', 'لاله', 'تالیا', 'قاصدک', 'بامبو']
const categories = ['سینک', 'روشویی', 'دوش', 'آفتابه']
const colors = ['کروم', 'سفید', 'سفید طلایی', 'مشکی طلایی']

// Generate product names based on categories and designs
const productNames: string[] = []
designs.forEach(design => {
  categories.forEach(category => {
    productNames.push(`${category} ${design}`)
  })
})
const basePrice = 150000 // Base price in Iranian Rials

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@tansoo.com' },
    update: {},
    create: {
      email: 'admin@tansoo.com',
      password: hashedPassword,
      name: 'مدیر سیستم'
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // Create products
  const products = []
  for (let i = 0; i < productNames.length; i++) {
    const name = productNames[i]
    const [category, design] = name.split(' ')
    
    // Different base prices for different categories
    let categoryBasePrice = basePrice
    switch (category) {
      case 'سینک':
        categoryBasePrice = basePrice + 100000
        break
      case 'روشویی':
        categoryBasePrice = basePrice + 80000
        break
      case 'دوش':
        categoryBasePrice = basePrice + 120000
        break
      case 'آفتابه':
        categoryBasePrice = basePrice + 60000
        break
    }
    
    const price = categoryBasePrice + (Math.random() * 200000) // Random price variation
    
    const product = await prisma.product.create({
      data: {
        name,
        description: `${name} با کیفیت بالا و طراحی زیبا، مناسب برای ${category === 'سینک' || category === 'روشویی' ? 'آشپزخانه و حمام' : 'استفاده روزمره'}`,
        price: Math.round(price),
        images: [
          'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Image+1',
          'https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Image+2'
        ],
        colors,
        stock: Math.floor(Math.random() * 50) + 10 // Random stock between 10-60
      }
    })
    products.push(product)
  }

  console.log(`✅ Created ${products.length} products`)

  // Create some sample orders
  const sampleOrders = []
  for (let i = 0; i < 5; i++) {
    const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1)
    let totalPrice = 0

    const order = await prisma.order.create({
      data: {
        totalPrice: 0, // Will be updated after creating order items
        status: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'][Math.floor(Math.random() * 4)] as any,
        customerInfo: {
          name: `مشتری ${i + 1}`,
          phone: `0912345678${i}`,
          address: `آدرس ${i + 1}، تهران`
        }
      }
    })

    // Create order items
    for (const product of randomProducts) {
      const quantity = Math.floor(Math.random() * 3) + 1
      totalPrice += product.price * quantity

      await prisma.orderItem.create({
        data: {
          quantity,
          price: product.price,
          productId: product.id,
          orderId: order.id
        }
      })
    }

    // Update order total
    await prisma.order.update({
      where: { id: order.id },
      data: { totalPrice }
    })

    sampleOrders.push(order)
  }

  console.log(`✅ Created ${sampleOrders.length} sample orders`)
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
