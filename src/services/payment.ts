import { CartItem } from '../types';
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
  orderNumber?: string;
  trackId: number;
  paymentUrl: string;
}

interface PaymentErrorBody {
  error?: string;
}

export async function requestPayment(
  customerDetails: PaymentCustomerDetails,
  cart: CartItem[],
): Promise<RequestPaymentResult> {
  const supabase = getSupabaseClient();

  const items = cart.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
  }));

  const { data, error } = await supabase.functions.invoke<RequestPaymentResult>(
    'request-payment',
    {
      body: { customerDetails, items },
    },
  );

  if (error) {
    throw new Error(error.message || 'خطا در اتصال به درگاه پرداخت');
  }

  if (!data?.paymentUrl) {
    const errBody = data as PaymentErrorBody | null;
    throw new Error(errBody?.error || 'پاسخ نامعتبر از سرور پرداخت');
  }

  return data;
}
