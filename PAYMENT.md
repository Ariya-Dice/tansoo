# Payment Architecture (Zibal + Supabase)

Payment is implemented **only** via Supabase Edge Functions. There are **no** Express or Vercel API routes for payment.

```
React (CheckoutPage)
        ↓  supabase.functions.invoke('request-payment')
Supabase Edge Function: request-payment
        ↓  POST https://gateway.zibal.ir/v1/request
Zibal Gateway (user pays)
        ↓  GET callback
Supabase Edge Function: verify-payment
        ↓  POST https://gateway.zibal.ir/v1/verify
        ↓  UPDATE orders + deduct stock in PostgreSQL
React PaymentSuccessPage / PaymentFailedPage
```

## Setup

### 1. Database migration

Run in Supabase SQL Editor:

`supabase/migrations/20260723120000_orders_payments.sql`

### 2. Edge Function secrets

In Supabase Dashboard → Project Settings → Edge Functions → Secrets:

| Secret | Description |
|--------|-------------|
| `ZIBAL_MERCHANT` | Merchant ID from Zibal |
| `FRONTEND_URL` | Site URL, e.g. `https://your-domain.vercel.app` |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically.

### 3. Deploy Edge Functions

```bash
supabase functions deploy request-payment
supabase functions deploy verify-payment
```

### 4. Frontend environment (.env)

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Flow details

1. **Checkout** — user submits form → `requestPayment()` calls `request-payment`.
2. **request-payment** — creates `orders` + `order_items`, calls Zibal, returns `paymentUrl`.
3. **Browser** — redirects to `https://gateway.zibal.ir/start/{trackId}`.
4. **verify-payment** — Zibal callback; verifies payment; marks order `paid`; deducts stock; redirects to `/#/payment/success` or `/#/payment/failed`.

Amounts: storefront prices are in **Toman**; Zibal receives **Rials** (`toman × 10`).

## What is NOT used for payment

- `api/orders/fulfill.js` — stock fulfillment for non-payment flows only
- Express routes — products/admin only
- Vercel serverless — products/upload only

Do not add payment handlers to Express or Vercel API routes.
