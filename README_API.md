# راهنمای API و Serverless Functions

این پروژه از Serverless Functions روی Vercel استفاده می‌کند و از Filestack برای ذخیره‌سازی پایدار داده‌ها پشتیبانی می‌کند.

## ساختار API

### 1. Serverless Functions

تمام API endpoints در پوشه `api/` قرار دارند:

- `api/products.js` - مدیریت CRUD محصولات
- `api/upload-image.js` - آپلود تصاویر

### 2. Environment Variables

برای استفاده از Filestack و Cloudinary، متغیرهای زیر را در Vercel تنظیم کنید:

```env
# Cloudinary (برای آپلود تصویر)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Filestack (برای ذخیره‌سازی پایدار داده‌ها)
FILESTACK_API_KEY=your_filestack_api_key
FILESTACK_SECURITY=your_filestack_security (اختیاری)
FILESTACK_STORE_URL=https://www.filestackapi.com/api/store/S3 (پیش‌فرض)
```

### 3. API Endpoints

#### GET /api/products
دریافت همه محصولات

**Response:**
```json
[
  {
    "id": 1,
    "name": "محصول نمونه",
    "category": "شیرآلات اردکی",
    "price": 1500000,
    "description": "توضیحات محصول",
    "specs": {
      "جنس": "برنج",
      "تنه": "سبک"
    },
    "images": {
      "کروم": "https://...",
      "سفید": "/product-images/..."
    }
  }
]
```

#### POST /api/products
افزودن محصول جدید

**Request Body:**
```json
{
  "name": "محصول جدید",
  "category": "شیرآلات اردکی",
  "type": "روشویی",
  "price": 1500000,
  "description": "توضیحات",
  "specs": {
    "جنس": "برنج",
    "تنه": "سبک"
  },
  "images": {
    "کروم": "https://...",
    "سفید": "/product-images/..."
  }
}
```

#### PUT /api/products?id=1
ویرایش محصول

**Query Parameters:**
- `id`: شناسه محصول

**Request Body:**
```json
{
  "name": "محصول ویرایش شده",
  "price": 2000000
}
```

#### DELETE /api/products?id=1
حذف محصول

**Query Parameters:**
- `id`: شناسه محصول

#### POST /api/upload-image
آپلود تصویر

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `image`

**Response:**
```json
{
  "filename": "prod-1234567890.png",
  "url": "https://res.cloudinary.com/.../products/prod-1234567890.png"
}
```

### 4. Filestack Integration

اگر `FILESTACK_API_KEY` تنظیم شده باشد، سیستم از Filestack برای ذخیره‌سازی پایدار استفاده می‌کند. در غیر این صورت، از فایل JSON موقت در `public/products.json` استفاده می‌شود.

**نکته:** فایل JSON موقت در Vercel ممکن است با هر deploy حذف شود. برای داده‌های واقعی، از Filestack استفاده کنید.

### 5. Cloudinary Integration

اگر `CLOUDINARY_CLOUD_NAME`، `CLOUDINARY_API_KEY` و `CLOUDINARY_API_SECRET` تنظیم شده باشند، تصاویر به Cloudinary آپلود می‌شوند. در غیر این صورت، در پوشه `public/product-images` ذخیره می‌شوند.

### 6. Local Development

برای development محلی، از سرور Express استفاده می‌شود:

```bash
node local-products-api.js
```

سرور روی `http://localhost:4020` اجرا می‌شود.

### 7. Deployment روی Vercel

1. پروژه را به Vercel متصل کنید
2. Environment variables را در تنظیمات Vercel اضافه کنید
3. پروژه را deploy کنید

Vercel به صورت خودکار serverless functions را شناسایی و اجرا می‌کند.

## نکات مهم

1. **داده‌های موقت:** فایل JSON در Vercel موقت است و ممکن است حذف شود
2. **Filestack:** برای داده‌های پایدار، از Filestack استفاده کنید
3. **Cloudinary:** برای آپلود تصویر، از Cloudinary استفاده کنید
4. **CORS:** تمام endpoints CORS را پشتیبانی می‌کنند
5. **Error Handling:** تمام خطاها به صورت مناسب handle می‌شوند

## Troubleshooting

### مشکل: API endpoint کار نمی‌کند
- بررسی کنید که فایل در پوشه `api/` قرار دارد
- بررسی کنید که `vercel.json` به درستی تنظیم شده است
- Logs را در Vercel dashboard بررسی کنید

### مشکل: تصاویر آپلود نمی‌شوند
- بررسی کنید که Cloudinary credentials درست تنظیم شده باشند
- بررسی کنید که پوشه `public/product-images` وجود دارد
- Logs را برای خطاهای آپلود بررسی کنید

### مشکل: داده‌ها ذخیره نمی‌شوند
- بررسی کنید که Filestack API key درست تنظیم شده است
- اگر از JSON موقت استفاده می‌کنید، بررسی کنید که فایل `public/products.json` قابل نوشتن است
- Logs را برای خطاهای ذخیره‌سازی بررسی کنید

