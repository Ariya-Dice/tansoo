import { toEnglishDigits } from './priceFormat';

/** یکسان‌سازی حروف فارسی */
export function normalizePersianText(value: string): string {
  return value
    .replace(/ي/g, 'ی')
    .replace(/ى/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c+/g, '\u200c');
}

/** فیلتر نام و نام خانوادگی — فقط حروف فارسی */
export function filterPersianName(value: string): string {
  const normalized = normalizePersianText(value);
  return normalized.replace(/[^\u0600-\u06FF\u200C\s]/g, '');
}

/** فیلتر متن فارسی با اعداد (آدرس، شرکت) */
export function filterPersianText(value: string): string {
  const normalized = normalizePersianText(value);
  return normalized.replace(/[^\u0600-\u06FF\u200C\s0-9]/g, '');
}

/** فیلتر توضیحات فارسی با اعداد و علائم رایج */
export function filterPersianNote(value: string): string {
  const normalized = normalizePersianText(value);
  return normalized.replace(/[^\u0600-\u06FF\u200C\s0-9،؛؟!.\-()]/g, '');
}

/** فیلتر شماره تماس — فقط رقم، حداکثر ۱۱ */
export function filterPhone(value: string): string {
  const normalized = toEnglishDigits(value);
  return normalized.replace(/\D/g, '').slice(0, 11);
}

/** اعتبارسنجی نام و نام خانوادگی */
export function validateName(name: string): string {
  const value = normalizePersianText(name.trim());

  if (!value) {
    return 'لطفاً نام و نام خانوادگی را وارد کنید.';
  }

  if (!/^[\u0600-\u06FF\u200C\s]+$/.test(value)) {
    return 'نام و نام خانوادگی باید به زبان فارسی وارد شود.';
  }

  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length < 2) {
    return 'لطفاً نام و نام خانوادگی را کامل وارد کنید.';
  }

  if (parts.some((part) => part.length < 2)) {
    return 'نام و نام خانوادگی را به صورت کامل وارد کنید.';
  }

  return '';
}

/** اعتبارسنجی شماره تماس */
export function validatePhone(phone: string): string {
  const normalized = toEnglishDigits(phone.trim());

  if (!normalized) {
    return 'لطفاً شماره تماس را وارد کنید.';
  }

  if (!/^09\d{9}$/.test(normalized)) {
    return 'شماره تماس باید یک شماره موبایل معتبر ۱۱ رقمی باشد.';
  }

  return '';
}

/** اعتبارسنجی نام شرکت (اختیاری) */
export function validateCompany(company: string): string {
  const value = normalizePersianText(company.trim());

  if (!value) {
    return '';
  }

  if (!/^[\u0600-\u06FF\u200C\s0-9]+$/.test(value)) {
    return 'نام شرکت باید به زبان فارسی وارد شود.';
  }

  if (value.length < 2) {
    return 'نام شرکت خیلی کوتاه است.';
  }

  return '';
}

/** اعتبارسنجی توضیحات (اختیاری) */
export function validateNote(note: string, maxLength = 2000): string {
  const value = normalizePersianText(note.trim());

  if (!value) {
    return '';
  }

  if (!/[\u0600-\u06FF]/.test(value)) {
    return 'توضیحات باید به زبان فارسی وارد شود.';
  }

  if (value.length > maxLength) {
    return `توضیحات نباید بیشتر از ${maxLength.toLocaleString('fa-IR')} کاراکتر باشد.`;
  }

  return '';
}
