import { CartItem } from '../types';
import { getProductGoodsType } from '../productSpecs';
import { getSupabaseClient } from '../lib/supabaseClient';

export interface PaymentCustomerDetails {
  name: string;
  phone: string;
  email?: string;
  address: string;
  note?: string;
}

export interface RequestPaymentResult {
  orderId: string;
  trackId: number;
  paymentUrl: string;
}

export async function requestPayment(
  customerDetails: PaymentCustomerDetails,
  cart: CartItem[],
  totalAmount: number,
): Promise<RequestPaymentResult> {
  const supabase = getSupabaseClient();

  const items = cart.map((item) => ({
    productId: item.product.id,
    model: item.product.model,
    goodsType: getProductGoodsType(item.product),
    color: item.product.color,
    quantity: item.quantity,
    unitPrice: item.product.price,
  }));

  const { data, error } = await supabase.functions.invoke<RequestPaymentResult>('request-payment', {
    body: { customerDetails, items, totalAmount },
  });

  if (error) {
    throw new Error(error.message || 'خطا در اتصال به درگاه پرداخت');
  }

  if (!data?.paymentUrl) {
    throw new Error('پاسخ نامعتبر از سرور پرداخت');
  }

  return data;
}
