# راهنمای Deploy روی Vercel

این پروژه (Vite + React) روی Vercel به‌صورت **Static Site + Serverless API** اجرا می‌شود.

> **مهم:** روی Vercel از SQLite استفاده **نمی‌شود**. باید **Supabase** (PostgreSQL ابری) و برای آپلود تصویر **Cloudinary** تنظیم کنید.

---

## پیش‌نیازها

| سرویس | هزینه | کاربرد |
|--------|-------|--------|
| [GitHub](https://github.com) | رایگان | نگه‌داری کد |
| [Vercel](https://vercel.com) | رایگان | هاست و API |
| [Supabase](https://supabase.com) | رایگان | دیتابیس محصولات |
| [Cloudinary](https://cloudinary.com) | رایگان | ذخیره تصاویر |

---

## مرحله ۱ — Supabase (دیتابیس)

### ۱.۱ ساخت پروژه

1. وارد [supabase.com](https://supabase.com) شوید
2. **New Project** → نام و رمز دیتابیس را انتخاب کنید
3. منتظر بمانید تا پروژه آماده شود (۱–۲ دقیقه)

### ۱.۲ اجرای اسکیما

1. از منوی چپ: **SQL Editor** → **New query**
2. محتوای فایل `supabase/schema.sql` را کپی و **Run** کنید
3. پیام موفقیت باید بیاید

### ۱.۳ گرفتن کلیدها

1. **Project Settings** → **API**
2. این دو مقدار را یادداشت کنید:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ کلید `service_role` را فقط در Vercel Environment Variables بگذارید، نه در کد فرانت‌اند.

### ۱.۴ (اختیاری) انتقال محصولات فعلی

اگر روی کامپیوتر خودتان محصول دارید (`db/products.json`):

```bash
# در .env محلی
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

npm run seed:supabase
```

---

## مرحله ۲ — Cloudinary (تصاویر)

1. در [cloudinary.com](https://cloudinary.com) حساب بسازید
2. از **Dashboard** این سه مقدار را بردارید:
   - Cloud Name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

بدون Cloudinary، آپلود تصویر در پنل ادمین روی Vercel **کار نمی‌کند** (فضای دیسک Vercel موقت است).

---

## مرحله ۳ — Push به GitHub

```bash
cd D:\myprojects\tansoo
git add .
git commit -m "Prepare for Vercel deployment"
git remote add origin https://github.com/YOUR_USERNAME/tansoo.git
git push -u origin main
```

اگر repository از قبل وجود دارد، فقط `git push` کافی است.

---

## مرحله ۴ — اتصال به Vercel

1. وارد [vercel.com](https://vercel.com) شوید
2. **Add New…** → **Project**
3. repository مربوط به `tansoo` را **Import** کنید
4. تنظیمات Build (معمولاً خودکار تشخیص داده می‌شود):

| تنظیم | مقدار |
|-------|--------|
| Framework Preset | **Other** (یا Vite) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

5. **هنوز Deploy نزنید** — ابتدا Environment Variables را تنظیم کنید.

---

## مرحله ۵ — Environment Variables در Vercel

در صفحه Import پروژه (یا بعداً **Settings → Environment Variables**) این متغیرها را اضافه کنید:

### الزامی

| Name | Value | توضیح |
|------|-------|--------|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | از Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | کلید service_role |
| `PRODUCTS_API_SECRET` | یک رمز طولانی تصادفی | محافظت API نوشتن |
| `VITE_PRODUCTS_API_SECRET` | **همان** رمز بالا | embed در build فرانت |
| `VITE_ADMIN_PASSWORD` | رمز ورود پنل ادمین | embed در build فرانت |
| `CLOUDINARY_CLOUD_NAME` | از Cloudinary | |
| `CLOUDINARY_API_KEY` | از Cloudinary | |
| `CLOUDINARY_API_SECRET` | از Cloudinary | |

### نکات مهم

- `VITE_*` فقط **هنگام build** خوانده می‌شوند. بعد از تغییر، **Redeploy** لازم است.
- `PRODUCTS_API_SECRET` و `VITE_PRODUCTS_API_SECRET` باید **یکسان** باشند.
- Environment را برای **Production** (و در صورت نیاز Preview) تیک بزنید.

### تولید رمز تصادفی (PowerShell)

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## مرحله ۶ — Deploy

1. **Deploy** را بزنید
2. منتظر بمانید (معمولاً ۱–۳ دقیقه)
3. آدرس شما شبیه این است: `https://tansoo-xxxx.vercel.app`

---

## مرحله ۷ — تست بعد از Deploy

| آدرس | انتظار |
|------|--------|
| `https://YOUR-DOMAIN.vercel.app/` | صفحه اصلی فروشگاه |
| `https://YOUR-DOMAIN.vercel.app/api/health` | `{"ok":true,"mode":"supabase",...}` |
| `https://YOUR-DOMAIN.vercel.app/api/products` | لیست JSON محصولات |
| `https://YOUR-DOMAIN.vercel.app/#/admin/login` | ورود ادمین |

اگر `/api/health` خطای دیتابیس داد → Supabase URL/Key را بررسی کنید.

---

## مرحله ۸ — دامنه اختصاصی (اختیاری)

1. Vercel → پروژه → **Settings → Domains**
2. دامنه خود را اضافه کنید (مثلاً `shop.example.com`)
3. DNS را طبق راهنمای Vercel تنظیم کنید (CNAME یا A record)

---

## APIهای Serverless

| مسیر | کار |
|------|-----|
| `GET /api/products` | لیست محصولات |
| `POST /api/products` | افزودن (نیاز به secret) |
| `PUT /api/products?id=1` | ویرایش |
| `DELETE /api/products?id=1` | حذف |
| `POST /api/products/bulk-price` | تنظیم قیمت گروهی |
| `POST /api/upload-image` | آپلود (Cloudinary) |
| `GET /api/health` | وضعیت دیتابیس |

---

## Redeploy بعد از تغییر `.env`

1. Vercel → **Deployments**
2. آخرین deploy → **⋯** → **Redeploy**
3. یا push جدید به GitHub (auto-deploy)

---

## عیب‌یابی

| خطا | راه‌حل |
|-----|--------|
| `npm install` failed | `better-sqlite3` به optionalDependencies منتقل شده؛ `.npmrc` با `optional=true` وجود دارد. Redeploy کنید. |
| Database not configured | `SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY` را در Vercel تنظیم کنید |
| Unauthorized در ادمین | `PRODUCTS_API_SECRET` = `VITE_PRODUCTS_API_SECRET` + Redeploy |
| آپلود تصویر 503 | Cloudinary را کامل تنظیم کنید |
| صفحه سفید | Build log را ببینید؛ `npm run build` را محلی تست کنید |
| محصولات خالی | `npm run seed:supabase` یا از پنل ادمین اضافه کنید |

---

## مقایسه: Vercel vs VPS ویندوز

| | Vercel | VPS ویندوز |
|---|--------|------------|
| راه‌اندازی | آسان‌تر | سخت‌تر |
| دیتابیس | Supabase (ابری) | SQLite (محلی) |
| هزینه | رایگان تا محدودیت | هزینه VPS |
| آپلود تصویر | Cloudinary | Cloudinary یا دیسک |
| مناسب | شروع سریع، بدون سرور | کنترل کامل |

راهنمای VPS: [`DEPLOY.md`](DEPLOY.md)
