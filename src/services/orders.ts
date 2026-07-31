import { getSupabaseClient } from '../lib/supabaseClient';
import {
  Order,
  OrderDetail,
  OrderItem,
  OrderStatus,
  OrderStatusHistory,
  OrdersListResult,
} from '../types';
import { canTransitionStatus } from '../utils/orderStatus';

const DEFAULT_PAGE_SIZE = 20;

export interface OrdersQueryParams {
  search?: string;
  status?: OrderStatus | 'all';
  page?: number;
  pageSize?: number;
}

function sanitizeSearchTerm(term: string): string {
  return term.trim().replace(/[%_,]/g, '');
}

function buildSearchFilter(search: string): string {
  const q = sanitizeSearchTerm(search);
  if (!q) return '';

  const parts = [
    `order_number.ilike.%${q}%`,
    `customer_name.ilike.%${q}%`,
    `customer_phone.ilike.%${q}%`,
    `customer_email.ilike.%${q}%`,
    `zibal_ref_number.ilike.%${q}%`,
  ];

  const numeric = Number(q);
  if (Number.isFinite(numeric) && Number.isInteger(numeric) && numeric > 0) {
    parts.push(`zibal_track_id.eq.${numeric}`);
  }

  return parts.join(',');
}

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    order_number: String(row.order_number ?? ''),
    customer_name: String(row.customer_name ?? ''),
    customer_phone: String(row.customer_phone ?? ''),
    customer_email: String(row.customer_email ?? ''),
    customer_address: String(row.customer_address ?? ''),
    customer_note: String(row.customer_note ?? ''),
    total_amount: Number(row.total_amount ?? 0),
    status: row.status as OrderStatus,
    zibal_track_id: row.zibal_track_id != null ? Number(row.zibal_track_id) : null,
    zibal_ref_number: row.zibal_ref_number != null ? String(row.zibal_ref_number) : null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
    paid_at: row.paid_at != null ? String(row.paid_at) : null,
  };
}

function mapOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: Number(row.id),
    order_id: String(row.order_id),
    product_id: Number(row.product_id),
    product_model: String(row.product_model ?? ''),
    product_goods_type: String(row.product_goods_type ?? ''),
    product_color: String(row.product_color ?? ''),
    quantity: Number(row.quantity ?? 0),
    unit_price: Number(row.unit_price ?? 0),
  };
}

function mapStatusHistory(row: Record<string, unknown>): OrderStatusHistory {
  return {
    id: Number(row.id),
    order_id: String(row.order_id),
    old_status: row.old_status != null ? (row.old_status as OrderStatus) : null,
    new_status: row.new_status as OrderStatus,
    changed_by: String(row.changed_by ?? 'system'),
    created_at: String(row.created_at ?? ''),
  };
}

function friendlyDbError(message: string): string {
  if (message.includes('JWT') || message.includes('permission')) {
    return 'دسترسی به سفارش‌ها مجاز نیست.';
  }
  return 'خطا در دریافت اطلاعات سفارش. لطفاً دوباره تلاش کنید.';
}

export async function fetchOrders(params: OrdersQueryParams = {}): Promise<OrdersListResult> {
  const supabase = getSupabaseClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  const searchFilter = params.search ? buildSearchFilter(params.search) : '';
  if (searchFilter) {
    query = query.or(searchFilter);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(friendlyDbError(error.message));
  }

  return {
    orders: (data ?? []).map((row) => mapOrder(row as Record<string, unknown>)),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function fetchOrderById(orderId: string): Promise<OrderDetail> {
  const supabase = getSupabaseClient();

  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (orderError) {
    throw new Error(friendlyDbError(orderError.message));
  }
  if (!orderRow) {
    throw new Error('سفارش یافت نشد.');
  }

  const [itemsResult, historyResult] = await Promise.all([
    supabase.from('order_items').select('*').eq('order_id', orderId).order('id'),
    supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true }),
  ]);

  if (itemsResult.error) {
    throw new Error(friendlyDbError(itemsResult.error.message));
  }
  if (historyResult.error) {
    throw new Error(friendlyDbError(historyResult.error.message));
  }

  return {
    ...mapOrder(orderRow as Record<string, unknown>),
    items: (itemsResult.data ?? []).map((row) =>
      mapOrderItem(row as Record<string, unknown>),
    ),
    status_history: (historyResult.data ?? []).map((row) =>
      mapStatusHistory(row as Record<string, unknown>),
    ),
  };
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('id');

  if (error) {
    throw new Error(friendlyDbError(error.message));
  }

  return (data ?? []).map((row) => mapOrderItem(row as Record<string, unknown>));
}

export async function fetchOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(friendlyDbError(error.message));
  }

  return (data ?? []).map((row) => mapStatusHistory(row as Record<string, unknown>));
}

export async function updateOrderStatusInDb(
  orderId: string,
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): Promise<Order> {
  if (!canTransitionStatus(currentStatus, newStatus)) {
    throw new Error('تغییر وضعیت درخواستی مجاز نیست.');
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
    .eq('status', currentStatus)
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(friendlyDbError(error.message));
  }
  if (!data) {
    throw new Error('سفارش یافت نشد یا وضعیت آن توسط کاربر دیگری تغییر کرده است.');
  }

  return mapOrder(data as Record<string, unknown>);
}
