# راهنمای تنظیم Filestack

این پروژه از Filestack Picker برای آپلود تصاویر استفاده می‌کند.

## 1️⃣ ایجاد حساب Filestack

1. به [Filestack](https://www.filestack.com/) بروید
2. یک حساب رایگان ایجاد کنید
3. بعد از ورود، به Dashboard بروید
4. API Key خود را کپی کنید

## 2️⃣ تنظیم Filestack SDK

Filestack SDK به صورت خودکار از CDN لود می‌شود (در `index.html`).

## 3️⃣ تنظیم Environment Variables

برای استفاده از Filestack، متغیرهای زیر را تنظیم کنید:

### در Development (`.env.local` یا `.env`):

```env
VITE_FILESTACK_API_KEY=AQn7j9WGfTKhHvu6rWEBTz
VITE_FILESTACK_WORKFLOW_ID=9b26e277-54f2-4d87-b2c8-acc449bb299a
```

### در Production (Vercel):

در تنظیمات Vercel، Environment Variables را اضافه کنید:
- `VITE_FILESTACK_API_KEY`: API Key شما
- `VITE_FILESTACK_WORKFLOW_ID`: Workflow ID برای پردازش تصاویر (اختیاری)

## 4️⃣ استفاده از Filestack Picker

در صفحه مدیریت محصولات (`AdminProductsPage`)، دکمه "انتخاب تصویر از Filestack" نمایش داده می‌شود.

### ویژگی‌ها:

- ✅ **UI کامل**: Filestack Picker یک رابط کاربری کامل برای آپلود ارائه می‌دهد
- ✅ **پشتیبانی از منابع مختلف**: می‌توانید از کامپیوتر، Google Drive، Dropbox، و غیره آپلود کنید
- ✅ **Workflow Integration**: تصاویر به صورت خودکار پردازش می‌شوند
- ✅ **CDN**: تصاویر از طریق CDN سریع‌تر لود می‌شوند

## 5️⃣ Fallback

اگر Filestack SDK لود نشده باشد، سیستم به صورت خودکار از input file معمولی استفاده می‌کند که تصاویر را به Cloudinary یا سرور آپلود می‌کند.

## 6️⃣ Workflow Configuration

Workflow ID برای پردازش خودکار تصاویر استفاده می‌شود. می‌توانید workflow خود را در Filestack Dashboard تنظیم کنید.

### مثال Workflow:

```javascript
const options = {
  storeTo: {
    workflows: ["9b26e277-54f2-4d87-b2c8-acc449bb299a"]
  }
};
```

## 7️⃣ API Key

API Key فعلی: `AQn7j9WGfTKhHvu6rWEBTz`

**⚠️ توجه:** این API Key برای تست است. برای استفاده در production، از API Key خود استفاده کنید.

## 8️⃣ Troubleshooting

### مشکل: Filestack Picker باز نمی‌شود
- بررسی کنید که Filestack SDK در `index.html` لود شده است
- بررسی کنید که API Key درست تنظیم شده است
- Console را برای خطاها بررسی کنید

### مشکل: تصاویر آپلود نمی‌شوند
- بررسی کنید که Workflow ID درست است
- بررسی کنید که API Key معتبر است
- بررسی کنید که Filestack account فعال است

### مشکل: SDK در دسترس نیست
- بررسی کنید که script tag در `index.html` وجود دارد
- بررسی کنید که اینترنت برقرار است
- صفحه را رفرش کنید

## 9️⃣ کد نمونه

```typescript
import { openFilestackPicker, isFilestackAvailable } from '../../utils/filestack';

// بررسی دسترسی
if (isFilestackAvailable()) {
  // باز کردن Picker
  openFilestackPicker(
    (result) => {
      // آپلود موفق
      console.log('URL:', result.url);
      console.log('Filename:', result.filename);
    },
    (error) => {
      // خطا
      console.error('Error:', error);
    }
  );
}
```

## 🔟 مزایای Filestack

✅ **UI کامل**: رابط کاربری حرفه‌ای برای آپلود
✅ **پشتیبانی از منابع مختلف**: کامپیوتر، Cloud Storage، Social Media
✅ **پردازش خودکار**: تبدیل، بهینه‌سازی، و ویرایش تصاویر
✅ **CDN**: تحویل سریع تصاویر
✅ **امنیت**: مدیریت دسترسی و امنیت فایل‌ها
✅ **مقیاس‌پذیری**: بدون نگرانی از فضای سرور

## 📚 منابع

- [Filestack Documentation](https://www.filestack.com/docs/)
- [Filestack Picker API](https://www.filestack.com/docs/api/picker/)
- [Filestack Workflows](https://www.filestack.com/docs/workflows/)

