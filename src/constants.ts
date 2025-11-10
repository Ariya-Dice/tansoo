import { Product } from './types';

export const STORE_NAME = "شیرآلات ساختمانی تانسو";

// پسورد ادمین (در تولید باید از environment variable استفاده شود)
export const ADMIN_PASSWORD = "admin123";

// مدل‌های محصول
export const MODELS = [
  'اردکی',
  'لاله',
  'تالیا',
  'قاصدک',
  'قاجاری',
  'بامبو',
  'سایر...'
];

// انواع محصول
export const TYPES = [
  'آفتابه',
  'دوش حمام',
  'روشویی',
  'سینک',
  'سایر...'
];

// رنگ‌های محصول
export const COLORS = [
  'کروم',
  'سفید',
  'سفید طلایی',
  'مشکی طلایی',
  'سفید کروم',
  'مشکی کروم',
  'سایر...'
];

// وزن تنه
export const BODY_WEIGHTS = [
  'سبک',
  'نیمه‌سنگین',
  'سنگین',
  'سایر...'
];

// جنس شیلنگ (فقط برای سینک و روشویی)
export const HOSE_MATERIALS = [
  'آلومینیوم',
  'استیل',
  'سایر...'
];

// جنس شیر (فقط برای آفتابه و دوش)
export const VALVE_MATERIALS = [
  'چدنی',
  'برنجی',
  'سایر...'
];

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

const placeholderImages = {
  'کروم': 'placeholder-chrome',
  'سفید': 'placeholder-white',
  'مشکی': 'placeholder-black',
  'سفید–طلایی': 'placeholder-white-gold',
  'مشکی–طلایی': 'placeholder-black-gold',
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'شیر روشویی کلاسیک اردکی',
    category: 'شیرآلات اردکی',
    type: 'روشویی',
    price: 1500000,
    description: 'یک قطعه طراحی جاودانه، شیر کلاسیک اردکی ظرافت را به هر حمامی می‌آورد. ساخته شده از برنج جامد و با پوشش درجه یک.',
    specs: { 'جنس': 'برنج جامد', 'پوشش': 'کروم براق', 'گارانتی': '۵ سال', 'تنه': 'نیمه سنگین' },
    images: placeholderImages,
    isBestSeller: true,
  },
  {
    id: 2,
    name: 'شیر آشپزخانه مدرن تالیا',
    category: 'شیرآلات تالیا',
    type: 'آشپزخانه',
    price: 2200000,
    description: 'با داشتن اسپری کشویی و طراحی شیک و مینیمال، شیر تالیا نقطه کانونی عالی برای یک آشپزخانه مدرن است.',
    specs: { 'جنس': 'فولاد ضد زنگ', 'نوع علمک': 'شیلنگدار', 'گارانتی': '۷ سال', 'تنه': 'سبک' },
    images: placeholderImages,
    isNew: true,
  },
  {
    id: 3,
    name: 'دوش لاله',
    category: 'شیرآلات لاله',
    type: 'دوش',
    price: 3500000,
    description: 'با سیستم دوش آبشاری لاله، دوش گرفتن لوکس را تجربه کنید. خروجی پهن آن جریانی ملایم و بارانی برای آرامش نهایی فراهم می‌کند.',
    specs: { 'جنس': 'برنج', 'نرخ جریان': '۲.۵ GPM', 'گارانتی': '۱۰ سال', 'تنه': 'سنگین' },
    images: placeholderImages,
    isBestSeller: true,
  },
    {
    id: 4,
    name: 'شیر توالت اکو بامبو',
    category: 'شیرآلات بامبو',
    type: 'توالت',
    price: 1200000,
    description: 'با الهام از طبیعت، شیر توالت اکو بامبو اشکال ارگانیک را با فناوری صرفه‌جویی در مصرف آب ترکیب می‌کند.',
    specs: { 'جنس': 'برنج جامد', 'آبفشان': 'صرفه‌جویی در آب', 'گارانتی': '۵ سال', 'تنه': 'سبک' },
    images: placeholderImages,
  },
  {
    id: 5,
    name: 'شیر روشویی قاجاری',
    category: 'شیرآلات قاجاری',
    type: 'روشویی',
    price: 2800000,
    description: 'یک شیر آراسته و مجلل که به دوران سلطنت بازمی‌گردد. شیر قاجاری با جزئیات پیچیده خود یک قطعه برجسته است.',
    specs: { 'جنس': 'برنج با آبکاری طلا', 'دستگیره‌ها': 'کریستال', 'گارانتی': 'مادام العمر', 'تنه': 'سنگین' },
    images: placeholderImages,
    isNew: true,
  },
   {
    id: 6,
    name: 'سیستم دوش ارداکی',
    category: 'شیرآلات اردکی',
    type: 'دوش',
    price: 2900000,
    description: 'یک راه حل کامل دوش با طراحی مینیمالیستی که هم سر دوش بارانی و هم اسپری دستی را ارائه می‌دهد.',
    specs: { 'جنس': 'برنج جامد', 'شیر': 'ترموستاتیک', 'گارانتی': '۵ سال', 'تنه': 'نیمه سنگین' },
    images: placeholderImages,
  },
  {
    id: 7,
    name: 'شیر روشویی کامپکت تالیا',
    category: 'شیرآلات تالیا',
    type: 'روشویی',
    price: 1800000,
    description: 'ایده‌آل برای حمام‌های کوچکتر یا سرویس‌های بهداشتی مهمان، تالیا کامپکت سبک مدرن را در یک طراحی صرفه‌جویی در فضا ارائه می‌دهد.',
    specs: { 'جنس': 'برنج جامد', 'ارتفاع': '۱۵ سانتی‌متر', 'گارانتی': '۷ سال', 'تنه': 'سبک' },
    images: placeholderImages,
    isBestSeller: true,
  },
   {
    id: 8,
    name: 'شیر آشپزخانه لاله',
    category: 'شیرآلات لاله',
    type: 'آشپزخانه',
    price: 2600000,
    description: 'علمک بلند و زیبای آن فضای کافی برای پر کردن قابلمه‌ها و تابه‌ها را فراهم می‌کند. عملکرد روان با یک دستگیره.',
    specs: { 'جنس': 'برنج جامد', 'چرخش علمک': '۳۶۰ درجه', 'گارانتی': '۱۰ سال', 'تنه': 'نیمه سنگین' },
    images: placeholderImages,
    isNew: true,
  }
];