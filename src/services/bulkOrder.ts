import { FunctionsHttpError } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabaseClient';
import {
  BulkOrderRequest,
  BulkOrderStatus,
  BulkOrdersListResult,
} from '../types';

const DEFAULT_PAGE_SIZE = 20;

export interface BulkOrderFormInput {
  name: string;
  phone: string;
  company?: string;
  goodsType: string;
  quantity: string;
  note?: string;
  idempotencyKey: string;
}

export interface BulkOrderSubmitResult {
  bulkOrderId: number;
  trackId: number;
  paymentUrl: string;
  depositAmount: number;
}

export interface BulkOrdersQueryParams {
  search?: string;
  status?: BulkOrderStatus | 'all';
  page?: number;
  pageSize?: number;
}

const BULK_STATUS_LABELS: Record<BulkOrderStatus, string> = {
  pending_payment: 'در انتظار پرداخت سپرده',
  pending: 'در انتظار تماس',
  contacted: 'تماس گرفته شده',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
  expired: 'منقضی شده',
};

export { BULK_STATUS_LABELS };

function sanitizeSearchTerm(term: string): string {
  return term.trim().replace(/[%_,]/g, '');
}

function mapBulkOrder(row: Record<string, unknown>): BulkOrderRequest {
  return {
    id: Number(row.id),
    name: String(row.name ?? ''),
    phone: String(row.phone ?? ''),
    company: String(row.company ?? ''),
    goods_type: String(row.goods_type ?? ''),
    quantity: String(row.quantity ?? ''),
    note: String(row.note ?? ''),
    status: row.status as BulkOrderStatus,
    created_at: String(row.created_at ?? ''),
    zibal_track_id:
      row.zibal_track_id != null ? Number(row.zibal_track_id) : null,
    payment_amount:
      row.payment_amount != null ? Number(row.payment_amount) : null,
    payment_expires_at:
      row.payment_expires_at != null
        ? String(row.payment_expires_at)
        : null,
    paid_at: row.paid_at != null ? String(row.paid_at) : null,
  };
}

async function extractFunctionError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.json()) as { error?: string };
      if (body.error) {
        return body.error;
      }
    } catch {
      // fall through
    }
  }

  if (error instanceof Error && error.message) {
    if (error.message.includes('JWT') || error.message.includes('permission')) {
      return 'دسترسی مجاز نیست.';
    }
  }

  return 'خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.';
}

export async function fetchBulkOrderDepositAmount(): Promise<number> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('submit-bulk-order', {
    body: { action: 'getConfig' },
  });

  const payload = data as { depositAmount?: number; error?: string } | null;

  if (payload?.error) {
    throw new Error(payload.error);
  }

  if (error) {
    throw new Error(await extractFunctionError(error));
  }

  const depositAmount = Number(payload?.depositAmount);
  if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
    throw new Error('مبلغ سپرده از سرور دریافت نشد.');
  }

  return depositAmount;
}

export async function submitBulkOrderRequest(
  form: BulkOrderFormInput,
): Promise<BulkOrderSubmitResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('submit-bulk-order', {
    body: {
      name: form.name,
      phone: form.phone,
      company: form.company ?? '',
      goodsType: form.goodsType,
      quantity: form.quantity,
      note: form.note ?? '',
      idempotencyKey: form.idempotencyKey,
    },
  });

  const payload = data as {
    paymentUrl?: string;
    bulkOrderId?: number;
    trackId?: number;
    depositAmount?: number;
    error?: string;
    zibalCode?: number;
  } | null;

  if (payload?.error) {
    throw new Error(payload.error);
  }

  if (error) {
    throw new Error(await extractFunctionError(error));
  }

  if (!payload?.paymentUrl || payload.bulkOrderId == null || payload.trackId == null) {
    throw new Error('آدرس درگاه پرداخت از سرور دریافت نشد.');
  }

  return {
    bulkOrderId: Number(payload.bulkOrderId),
    trackId: Number(payload.trackId),
    paymentUrl: payload.paymentUrl,
    depositAmount: Number(payload.depositAmount ?? 0),
  };
}

export async function fetchBulkOrders(
  params: BulkOrdersQueryParams = {},
): Promise<BulkOrdersListResult> {
  const supabase = getSupabaseClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('bulk_order_requests')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  const q = params.search ? sanitizeSearchTerm(params.search) : '';
  if (q) {
    query = query.or(
      `name.ilike.%${q}%,phone.ilike.%${q}%,company.ilike.%${q}%,goods_type.ilike.%${q}%`,
    );
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error('خطا در بارگذاری درخواست‌ها.');
  }

  return {
    requests: (data ?? []).map((row) => mapBulkOrder(row as Record<string, unknown>)),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function updateBulkOrderStatusInDb(
  id: number,
  status: BulkOrderStatus,
): Promise<BulkOrderRequest> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('bulk_order_requests')
    .update({ status })
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error('خطا در به‌روزرسانی وضعیت.');
  }
  if (!data) {
    throw new Error('درخواست یافت نشد.');
  }

  return mapBulkOrder(data as Record<string, unknown>);
}

export function formatTomans(amount: number): string {
  return `${amount.toLocaleString('fa-IR')} تومان`;
}
