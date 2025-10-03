// Central mock data mirroring prisma/seed.ts logic

type MockProduct = {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  colors: string[]
  stock: number
  createdAt: Date
  updatedAt: Date
}

const designs = ['اردکی', 'لاله', 'تالیا', 'قاصدک', 'بامبو']
const categories = ['سینک', 'روشویی', 'دوش', 'آفتابه']
const colors = ['کروم', 'سفید', 'سفید طلایی', 'مشکی طلایی']

const basePrice = 150000

function categoryBase(category: string): number {
  switch (category) {
    case 'سینک':
      return basePrice + 100000
    case 'روشویی':
      return basePrice + 80000
    case 'دوش':
      return basePrice + 120000
    case 'آفتابه':
      return basePrice + 60000
    default:
      return basePrice
  }
}

// Build a small, deterministic subset for mock (12 items)
export const mockProducts: MockProduct[] = (() => {
  const list: MockProduct[] = []
  let idCounter = 1
  for (const design of designs) {
    for (const category of categories) {
      const name = `${category} ${design}`
      const base = categoryBase(category)
      const price = Math.round(base + (idCounter % 5) * 20000)
      list.push({
        id: `mock-${idCounter++}`,
        name,
        description: `${name} با کیفیت بالا و طراحی زیبا، مناسب برای ${category === 'سینک' || category === 'روشویی' ? 'آشپزخانه و حمام' : 'استفاده روزمره'}`,
        price,
        images: [
          'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Image+1',
          'https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Image+2',
        ],
        colors,
        stock: 10 + (idCounter % 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      if (list.length >= 12) break
    }
    if (list.length >= 12) break
  }
  return list
})()

export type { MockProduct }


