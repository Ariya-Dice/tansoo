import { Product } from './types';

/** نوع کالا */
export const GOODS_TYPES = [
  'شیر ظرفشویی',
  'شیر توالت',
  'شیر روشویی',
  'شیر حمام',
] as const;

export const SPEC_COLORS = [
  'کروم',
  'کروم طلایی',
  'طلایی',
  'سفید',
  'سفید طلایی',
  'مشکی',
  'مشکی کروم',
  'مشکی طلایی',
] as const;

export const BODY_MATERIALS = ['آلیاژ برنج', 'سایر'] as const;
export const HANDLE_MATERIALS = ['زاماک', 'سایر'] as const;
export const CARTRIDGE_SIZES = ['40 میلی متر', '35 میلی متر'] as const;
export const CARTRIDGE_NUT_MATERIALS = ['استیل', 'برنجی', 'چدنی', 'ABS'] as const;
export const LEFT_HANDED_NUTS = ['برنجی', 'استیل'] as const;
export const YES_NO_OPTIONS = ['دارد', 'ندارد'] as const;
export const ESCUTCHEON_OPTIONS = ['کروم'] as const;
export const VALVE_BODY_MATERIALS = ['برنجی', 'ABS', 'ندارد'] as const;
export const SPOUT_MATERIALS = ['برنجی', 'استیل', 'ABS', 'ندارد'] as const;
export const PLATOR_MATERIALS = ['ABS', 'برنجی'] as const;

export type SpecFieldType = 'select' | 'text';

export interface ProductSpecFieldDef {
  key: keyof Product;
  label: string;
  type: SpecFieldType;
  options?: readonly string[];
  required?: boolean;
  placeholder?: string;
}

/** فیلدهای مشخصات فنی — برای فرم ادمین و جدول جزئیات */
export const PRODUCT_SPEC_FIELDS: ProductSpecFieldDef[] = [
  { key: 'goodsType', label: 'نوع کالا', type: 'select', options: GOODS_TYPES, required: true },
  { key: 'color', label: 'رنگ', type: 'select', options: SPEC_COLORS, required: true },
  { key: 'bodyMaterial', label: 'جنس بدنه', type: 'select', options: BODY_MATERIALS },
  { key: 'handleMaterial', label: 'جنس دسته', type: 'select', options: HANDLE_MATERIALS },
  { key: 'bodyWeight', label: 'وزن تنه', type: 'text', required: true, placeholder: 'مثال: 600 گرم' },
  { key: 'packageWeight', label: 'وزن تقریبی بسته‌بندی', type: 'text', placeholder: 'مثال: 650 گرم' },
  { key: 'cartridgeSize', label: 'سایز کارتریج', type: 'select', options: CARTRIDGE_SIZES },
  { key: 'cartridgeNutMaterial', label: 'جنس مهره کارتریج', type: 'select', options: CARTRIDGE_NUT_MATERIALS },
  { key: 'leftHandedNut', label: 'چپ‌گرد و مهره چپ‌گرد', type: 'select', options: LEFT_HANDED_NUTS },
  { key: 'hotColdOutput', label: 'خروجی آب سرد و گرم', type: 'select', options: YES_NO_OPTIONS },
  { key: 'packageDimensions', label: 'ابعاد تقریبی بسته‌بندی', type: 'text', placeholder: 'مثال: 6×15×32 سانتی‌متر' },
  { key: 'postalHose', label: 'شیلنگ پستوال', type: 'select', options: YES_NO_OPTIONS },
  { key: 'escutcheon', label: 'قالپاق', type: 'select', options: ESCUTCHEON_OPTIONS },
  { key: 'valveMaterial', label: 'جنس سوپاپ', type: 'select', options: VALVE_BODY_MATERIALS },
  { key: 'spoutMaterial', label: 'جنس علم', type: 'select', options: SPOUT_MATERIALS },
  { key: 'platorMaterial', label: 'جنس پلاتور', type: 'select', options: PLATOR_MATERIALS },
];

export function emptyProduct(): Omit<Product, 'id'> {
  return {
    model: '',
    goodsType: '',
    type: '',
    color: '',
    bodyMaterial: '',
    handleMaterial: '',
    bodyWeight: '',
    packageWeight: '',
    cartridgeSize: '',
    cartridgeNutMaterial: '',
    leftHandedNut: '',
    hotColdOutput: '',
    packageDimensions: '',
    postalHose: '',
    escutcheon: '',
    valveMaterial: '',
    spoutMaterial: '',
    platorMaterial: '',
    tags: [],
    price: 0,
    description: '',
    image: '',
  };
}

/** نوع کالا برای نمایش (سازگاری با داده قدیمی) */
export function getProductGoodsType(product: Product): string {
  return product.goodsType || product.type || '';
}

/** ردیف‌های جدول مشخصات برای صفحه جزئیات */
export function getProductSpecRows(product: Product): { label: string; value: string }[] {
  return PRODUCT_SPEC_FIELDS.map(({ key, label }) => {
    const raw = product[key];
    const value = raw != null && String(raw).trim() !== '' ? String(raw) : '—';
    return { label, value };
  });
}
