const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** تبدیل ارقام فارسی/عربی به انگلیسی */
export function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

/** استخراج عدد از ورودی قیمت (با پشتیبانی ارقام فارسی و جداکننده) */
export function parsePriceInput(value: string): number {
  const digits = toEnglishDigits(value).replace(/\D/g, '');
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** نمایش قیمت با جداکننده هزارگان فارسی */
export function formatPriceInput(price: number): string {
  if (!price) return '';
  return price.toLocaleString('fa-IR');
}
