import { OrderStatus } from '../types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
  failed: 'ناموفق',
};

export const ORDER_STATUS_FILTER_OPTIONS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'همه' },
  { value: 'pending', label: ORDER_STATUS_LABELS.pending },
  { value: 'paid', label: ORDER_STATUS_LABELS.paid },
  { value: 'processing', label: ORDER_STATUS_LABELS.processing },
  { value: 'shipped', label: ORDER_STATUS_LABELS.shipped },
  { value: 'delivered', label: ORDER_STATUS_LABELS.delivered },
  { value: 'cancelled', label: ORDER_STATUS_LABELS.cancelled },
  { value: 'failed', label: ORDER_STATUS_LABELS.failed },
];

/** Allowed admin status transitions (from → to[]) */
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  failed: ['processing', 'cancelled'],
};

export function canTransitionStatus(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false;
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}

export function getAllowedNextStatuses(current: OrderStatus): OrderStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[current];
}

export function formatOrderDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fa-IR');
}
