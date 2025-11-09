# راهنمای تنظیم Cloudinary

این راهنما برای تنظیم Cloudinary برای آپلود تصاویر محصولات است.

## 1️⃣ ایجاد حساب Cloudinary

1. به [Cloudinary](https://cloudinary.com/) بروید
2. یک حساب رایگان ایجاد کنید
3. بعد از ورود، به Dashboard بروید
4. اطلاعات زیر را کپی کنید:
   - Cloud Name
   - API Key
   - API Secret

## 2️⃣ نصب پکیج‌های لازم

پکیج‌های لازم قبلاً نصب شده‌اند:
- `cloudinary`
- `multer`
- `dotenv`

اگر نیاز به نصب مجدد دارید:
```bash
npm install cloudinary multer dotenv
```

## 3️⃣ تنظیم متغیرهای محیطی

در ریشه پروژه، یک فایل `.env` ایجاد کنید و اطلاعات Cloudinary را وارد کنید:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**⚠️ توجه:** فایل `.env` را به `.gitignore` اضافه کنید تا اطلاعات محرمانه شما در Git commit نشود.

## 4️⃣ راه‌اندازی سرور

سرور Node.js (`local-products-api.js`) قبلاً برای کار با Cloudinary تنظیم شده است:

- آپلود تصویر به Cloudinary: `POST /upload-image`
- تصاویر در پوشه `products` در Cloudinary ذخیره می‌شوند
- بعد از آپلود موفق، فایل محلی حذف می‌شود
- URL تصویر Cloudinary در دیتابیس ذخیره می‌شود

برای راه‌اندازی سرور:
```bash
node local-products-api.js
```

## 5️⃣ استفاده در React

در صفحه مدیریت محصولات (`AdminProductsPage`)، آپلود تصویر به صورت خودکار انجام می‌شود:

1. کاربر فایل را انتخاب می‌کند
2. فایل به سرور ارسال می‌شود
3. سرور تصویر را به Cloudinary آپلود می‌کند
4. URL تصویر Cloudinary در فرم ذخیره می‌شود
5. وقتی محصول ذخیره می‌شود، URL Cloudinary در دیتابیس ذخیره می‌شود

## 6️⃣ نمایش تصاویر

تابع `getImage` در `AppContext` به صورت خودکار تشخیص می‌دهد که آیا URL کامل Cloudinary است یا فایل محلی:

- اگر URL با `http://` یا `https://` شروع شود، مستقیماً استفاده می‌شود
- در غیر این صورت، از سرور محلی استفاده می‌شود

## مزایای استفاده از Cloudinary

✅ **ذخیره‌سازی ابری**: تصاویر در سرورهای Cloudinary ذخیره می‌شوند
✅ **CDN**: تصاویر از طریق CDN سریع‌تر لود می‌شوند
✅ **بهینه‌سازی خودکار**: Cloudinary تصاویر را بهینه می‌کند
✅ **مقیاس‌پذیری**: بدون نگرانی از فضای سرور
✅ **بدون نیاز به پوشه محلی**: فایل‌ها بعد از آپلود حذف می‌شوند

## عیب‌یابی

### خطا: "Cloudinary config is missing"
- مطمئن شوید که فایل `.env` ایجاد شده است
- مطمئن شوید که متغیرهای محیطی به درستی تنظیم شده‌اند
- مطمئن شوید که `dotenv.config()` در فایل `local-products-api.js` فراخوانی شده است

### خطا: "Upload failed"
- مطمئن شوید که API Key و API Secret صحیح هستند
- مطمئن شوید که Cloud Name صحیح است
- بررسی کنید که اتصال اینترنت برقرار است

### تصاویر نمایش داده نمی‌شوند
- مطمئن شوید که URL تصویر در دیتابیس صحیح است
- بررسی کنید که `getImage` در `AppContext` به درستی کار می‌کند
- بررسی کنید که URL با `https://` شروع می‌شود

## پشتیبانی

برای اطلاعات بیشتر، به [مستندات Cloudinary](https://cloudinary.com/documentation) مراجعه کنید.

