/** Server-side configuration for bulk-order deposit and rate limits (tomans for amounts). */

export function getBulkOrderDepositAmountTomans(): number {
  const raw = Deno.env.get('BULK_ORDER_DEPOSIT_AMOUNT');
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('config_error');
  }
  return amount;
}

export function getPaymentExpiryMinutes(): number {
  const raw = Deno.env.get('BULK_ORDER_PAYMENT_EXPIRY_MINUTES');
  const minutes = raw != null && raw !== '' ? Number(raw) : 30;
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return 30;
  }
  return Math.floor(minutes);
}

export function getRateLimitPhoneMax(): number {
  const raw = Deno.env.get('BULK_ORDER_RATE_LIMIT_PHONE_MAX');
  const n = raw != null && raw !== '' ? Number(raw) : 3;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 3;
}

export function getRateLimitPhoneHours(): number {
  const raw = Deno.env.get('BULK_ORDER_RATE_LIMIT_PHONE_HOURS');
  const n = raw != null && raw !== '' ? Number(raw) : 24;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 24;
}

export function getRateLimitIpMax(): number {
  const raw = Deno.env.get('BULK_ORDER_RATE_LIMIT_IP_MAX');
  const n = raw != null && raw !== '' ? Number(raw) : 5;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 5;
}

export function getRateLimitIpHours(): number {
  const raw = Deno.env.get('BULK_ORDER_RATE_LIMIT_IP_HOURS');
  const n = raw != null && raw !== '' ? Number(raw) : 1;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export function tomansToRials(tomans: number): number {
  return Math.round(tomans * 10);
}
