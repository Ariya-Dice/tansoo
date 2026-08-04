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
  const apiUrl = import.meta.env.VITE_API_URL?.trim();

  if (!apiUrl) {
    throw new Error('Payment API URL is not configured');
  }

  const items = cart.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
  }));

  let response: Response;

  try {
    response = await fetch(
      `${apiUrl.replace(/\/+$/, '')}/api/payment/request`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerDetails,
          items,
        }),
      },
    );
  } catch {
    throw new Error('Unable to connect to the payment server');
  }

  const data = (await response.json()) as
    | RequestPaymentResult
    | PaymentErrorBody;

  if (!response.ok) {
    const errorData = data as PaymentErrorBody;

    throw new Error(
      errorData.error || 'Payment request failed',
    );
  }

  const paymentData = data as RequestPaymentResult;

  if (!paymentData.paymentUrl) {
    throw new Error('Invalid payment server response');
  }

  return paymentData;
}