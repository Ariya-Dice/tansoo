# شیرآلات ساختمانی تانسو

فروشگاه آنلاین شیرآلات با پنل مدیریت محصولات، سبد خرید، و API محصولات.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Express (Node.js)
- **Database:** SQLite (VPS) یا Supabase PostgreSQL (Vercel)

## Quick Start (Development)

```bash
npm install
copy .env.example .env
npm run dev
```

- سایت: http://localhost:5173  
- API: http://localhost:4020/api/products  

## Production

| Platform | Guide |
|----------|--------|
| **Vercel** (recommended for quick launch) | [`VERCEL_DEPLOY.md`](VERCEL_DEPLOY.md) |
| **Windows VPS / self-hosted** | [`DEPLOY.md`](DEPLOY.md) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + API در حالت توسعه |
| `npm run build` | Build فرانت‌اند → `dist/` |
| `npm start` | فقط سرور (نیاز به build قبلی) |
| `npm run prod` | build + start production |
| `npm run test:db` | تست اتصال دیتابیس |

## Admin

- URL: `/#/admin/login`
- رمز: متغیر `VITE_ADMIN_PASSWORD` در `.env`

## Image Upload

- Local/VPS: `db/product-images/` یا Cloudinary — راهنما: `CLOUDINARY_SETUP.md`
