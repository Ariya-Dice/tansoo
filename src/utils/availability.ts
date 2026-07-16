import { Product } from '../types';

export type AvailabilityLabel = 'موجود' | 'ناموجود';

export function isProductAvailable(product: Pick<Product, 'stock'>): boolean {
  return Number(product.stock ?? 0) > 0;
}

export function getAvailabilityLabel(product: Pick<Product, 'stock'>): AvailabilityLabel {
  return isProductAvailable(product) ? 'موجود' : 'ناموجود';
}

export function stockFromAvailability(
  status: AvailabilityLabel,
  currentStock = 0,
): number {
  if (status === 'ناموجود') return 0;
  return Math.max(1, Number(currentStock) || 0);
}
