# راهنمای استقرار — فروشگاه شیرآلات تانسو

این سند برای راه‌اندازی برنامه روی **سرور ویندوز (VPS)**، **هاست Node.js** یا **Vercel** نوشته شده است.

---

## ۱. انتخاب دیتابیس

| گزینه | مناسب برای | نصب جداگانه |
|--------|------------|-------------|
| **SQLite** (پیشنهاد VPS ویندوز) | یک سرور، ترافیک متوسط | ❌ خیر — با `npm install` آماده می‌شود |
| **Supabase** (PostgreSQL ابری) | Vercel، چند سرور، بک‌آپ ابری | ❌ فقط حساب رایگان Supabase |

### پیشنهاد برای سرور ویندوز شما: **SQLite**

- فایل دیتابیس: `db/products.db`
- تصاویر محصول (بدون Cloudinary): `db/product-images/`
- نیازی به نصب SQL Server، MySQL یا PostgreSQL روی ویندوز **نیست**
- در اولین اجرا، اگر `db/products.json` وجود داشته باشد، داده‌ها خودکار به SQLite منتقل می‌شوند

### گزینه جایگزین: Supabase

اگر بخواهید دیتابیس در ابر باشد (مثلاً همراه با Vercel):

1. در [supabase.com](https://supabase.com) پروژه بسازید
2. فایل `supabase/schema.sql` را در **SQL Editor** اجرا کنید
3. در `.env` مقداردهی کنید:
   ```env
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
4. متغیرهای Supabase را **خالی بگذارید** تا SQLite استفاده شود؛ اگر هر دو تنظیم باشند، Supabase اولویت دارد.

---

## ۲. نصب و راه‌اندازی روی Windows Server / VPS

### پیش‌نیازها

| نرم‌افزار | نسخه پیشنهادی |
|-----------|----------------|
| Node.js | 20 LTS یا 22 LTS — [nodejs.org](https://nodejs.org) |
| Git | اختیاری — برای clone از GitHub |

> **Windows Build Tools:** ماژول `better-sqlite3` روی ویندوز باید compile شود. اگر `npm install` خطای build داد:
> - Visual Studio Build Tools با workload **Desktop development with C++** نصب کنید
> - یا در PowerShell (Administrator): `npm install --global windows-build-tools` (در Node قدیمی‌تر)

### مرحله ۱ — کپی پروژه روی سرور

```powershell
cd C:\
git clone https://github.com/YOUR_USER/tansoo.git
cd tansoo
```

یا فایل ZIP پروژه را extract کنید.

### مرحله ۲ — نصب وابستگی‌ها

```powershell
npm install
```

### مرحله ۳ — تنظیم متغیرهای محیطی

```powershell
copy .env.example .env
notepad .env
```

حداقل این مقادیر را **حتماً** عوض کنید:

```env
NODE_ENV=production
PORT=4020
HOST=0.0.0.0

PRODUCTS_API_SECRET=یک-رمز-طولانی-تصادفی
VITE_PRODUCTS_API_SECRET=همان-رمز-بالا
VITE_ADMIN_PASSWORD=رمز-ورود-پنل-ادمین
```

> `VITE_*` هنگام `npm run build` در فایل JS جاسازی می‌شود. بعد از تغییر `.env` حتماً دوباره `npm run build` بزنید.

**Cloudinary (اختیاری ولی توصیه‌شده برای تصاویر):**

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

راهنمای جزئی: `CLOUDINARY_SETUP.md`

### مرحله ۴ — بیلد و اجرا

```powershell
npm run prod
```

این دستور:
1. فرانت‌اند را build می‌کند (`dist/`)
2. سرور Express را روی پورت 4020 بالا می‌آورد (API + سایت + تصاویر)

تست در مرورگر سرور:

- سایت: `http://SERVER_IP:4020`
- API سلامت: `http://SERVER_IP:4020/api/health`
- پنل ادمین: `http://SERVER_IP:4020/#/admin/login`

### مرحله ۵ — باز کردن پورت در فایروال ویندوز

```powershell
New-NetFirewallRule -DisplayName "Tansoo Web" -Direction Inbound -Protocol TCP -LocalPort 4020 -Action Allow
```

### مرحله ۶ — اجرای دائم با PM2 (پیشنهاد)

```powershell
npm install -g pm2
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

دستورات مفید:

```powershell
pm2 status
pm2 logs tansoo
pm2 restart tansoo
```

### مرحله ۷ — دامنه و HTTPS (اختیاری)

#### روش A — IIS به‌عنوان Reverse Proxy

1. **IIS** + **URL Rewrite** + **Application Request Routing (ARR)** نصب کنید
2. سایت IIS با binding دامنه `shop.example.com` و گواهی SSL
3. Rule: همه درخواست‌ها → `http://127.0.0.1:4020`

#### روش B — Cloudflare Tunnel (بدون باز کردن پورت)

Cloudflare Zero Trust → Tunnel → origin: `http://localhost:4020`

---

## ۳. بک‌آپ دیتابیس SQLite

روزانه این پوشه/فایل‌ها را کپی کنید:

```
db/products.db
db/products.db-wal      (در صورت وجود)
db/product-images/      (اگر Cloudinary ندارید)
```

PowerShell نمونه:

```powershell
$dest = "D:\Backups\tansoo-$(Get-Date -Format yyyy-MM-dd)"
New-Item -ItemType Directory -Path $dest -Force
Copy-Item db\products.db, db\product-images -Destination $dest -Recurse -Force
```

---

## ۴. استقرار روی Vercel (هاست بدون VPS)

> Vercel از SQLite پشتیبانی **نمی‌کند**. حتماً **Supabase** تنظیم کنید.

1. Repository را به Vercel وصل کنید
2. Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PRODUCTS_API_SECRET`
   - `VITE_PRODUCTS_API_SECRET`
   - `VITE_ADMIN_PASSWORD`
   - Cloudinary (اختیاری)
3. Build Command: `npm run build`
4. Output: `dist` (با rewrites در `vercel.json`)

---

## ۵. ساختار فایل‌های مهم

```
tansoo/
├── local-products-api.js   ← سرور production (API + static)
├── dist/                   ← خروجی build (بعد از npm run build)
├── db/
│   ├── products.db         ← دیتابیس SQLite (خودکار ساخته می‌شود)
│   └── product-images/     ← تصاویر آپلود شده
├── lib/                    ← لایه دیتابیس
├── supabase/schema.sql     ← اسکیما Supabase
├── .env                    ← تنظیمات (روی سرور — commit نشود)
└── ecosystem.config.cjs    ← تنظیم PM2
```

---

## ۶. عیب‌یابی

| مشکل | راه‌حل |
|------|--------|
| `dist/ not found` | `npm run build` |
| `Database not configured` روی Vercel | Supabase را در env تنظیم کنید |
| `npm install` خطای better-sqlite3 | Visual Studio Build Tools نصب کنید |
| ادمین محصول ذخیره نمی‌کند | `PRODUCTS_API_SECRET` و `VITE_PRODUCTS_API_SECRET` یکسان باشند + rebuild |
| تصاویر نمایش داده نمی‌شوند | Cloudinary تنظیم کنید یا `db/product-images` را بک‌آپ/restore کنید |
| پورت در دسترس نیست | فایروال ویندوز + Security Group VPS (پورت 4020) |

---

## ۷. دستورات سریع

```powershell
# توسعه (دو پروcess: Vite + API)
npm run dev

# production یک‌جا
npm run prod

# فقط API (بعد از build)
npm run build
set NODE_ENV=production
npm start

# تست دیتابیس
npm run test:db
```

---

## ۸. امنیت production

- [ ] رمزهای `.env` را قوی و یکتا انتخاب کنید
- [ ] `PRODUCTS_API_SECRET` را حتماً تنظیم کنید
- [ ] HTTPS فعال کنید (IIS / Cloudflare / nginx)
- [ ] بک‌آپ دوره‌ای `db/products.db`
- [ ] پسورد پیش‌فرض `admin123` را **هرگز** در production نگه ندارید
