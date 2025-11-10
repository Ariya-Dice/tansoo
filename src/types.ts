export interface Product {
  id: number;
  model: string; // اردکی، لاله، تالیا، قاصدک، قاجاری، بامبو
  type: string; // آفتابه، دوش حمام، روشویی، سینک
  color: string; // کروم، سفید، سفید طلایی، مشکی طلایی، سفید کروم، مشکی کروم
  bodyWeight: string; // سبک، نیمه‌سنگین، سنگین
  hoseMaterial?: string; // آلومینیوم، استیل (فقط برای سینک و روشویی)
  valveMaterial?: string; // چدنی، برنجی (فقط برای آفتابه و دوش)
  tags: string[]; // اقتصادی، پرفروش، جدید
  price: number; // قیمت به تومان
  description: string;
  image: string; // URL تصویر اصلی
}

export interface Category {
  id: string;
  name: string;
}

export interface ProductType {
    id: string;
    name: string;
}

export interface Color {
  id: string;
  name: string;
  tailwindClass: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerDetails: {
    name: string;
    email: string;
    address: string;
  };
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Paid' | 'Shipped';
  date: Date;
}