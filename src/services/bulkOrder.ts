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
}

export interface BulkOrdersQueryParams {
  search?: string;
  status?: BulkOrderStatus | 'all';
  page?: number;
  pageSize?: number;
}

const BULK_STATUS_LABELS: Record<BulkOrderStatus, string> = {
  pending: 'در انتظار تماس',
  contacted: 'تماس گرفته شده',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
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
  };
}

function friendlyError(message: string): string {
  if (message.includes('JWT') || message.includes('permission')) {
    return 'دسترسی مجاز نیست.';
  }
  return 'خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.';
}

export async function submitBulkOrderRequest(form: BulkOrderFormInput): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.functions.invoke('submit-bulk-order', {
    body: {
      name: form.name,
      phone: form.phone,
      company: form.company ?? '',
      goodsType: form.goodsType,
      quantity: form.quantity,
      note: form.note ?? '',
    },
  });

  if (error) {
    throw new Error(friendlyError(error.message));
  }
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
    throw new Error(friendlyError(error.message));
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
    throw new Error(friendlyError(error.message));
  }
  if (!data) {
    throw new Error('درخواست یافت نشد.');
  }

  return mapBulkOrder(data as Record<string, unknown>);
}
