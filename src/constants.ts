
export const STORE_NAME = "شیرآلات ساختمانی تانسو";

// پسورد ادمین — در .env مقدار VITE_ADMIN_PASSWORD را تنظیم کنید
export const ADMIN_PASSWORD =
  import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

// مدل‌های محصول
export const MODELS = [
  'اردکی',
  'لاله',
  'تالیا',
  'قاصدک',
  'قاجاری',
  'بامبو',
  'سایر',
];

// انواع محصول (نوع کالا) — برای فیلتر لیست
export { GOODS_TYPES as TYPES, SPEC_COLORS as COLORS } from './productSpecs';

// تگ‌های محصول
export const TAGS = ['اقتصادی', 'پرفروش', 'جدید'];

// تصاویر پیش‌فرض برای هر مدل
export const DEFAULT_MODEL_IMAGES: { [key: string]: string } = {
  'اردکی': '/ordak.jpg',
  'لاله': '/lale.jpg',
  'بامبو': '/bambo.jpg',
  'تالیا': '/taliya.jpg',
  'قاصدک': '/gasedak.jpg',
  'قاجاری': '/ordak.jpg', // استفاده از تصویر پیش‌فرض تا زمانی که qajari.jpg اضافه شود
};

// تابع برای دریافت تصویر پیش‌فرض بر اساس مدل
export function getDefaultImage(model: string): string {
  return DEFAULT_MODEL_IMAGES[model] || '/loading.gif';
}