import { CartItem } from '../types';

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

interface PaymentSuccessBody {
  orderId?: string;
  orderNumber?: string;
  trackId?: number;
  paymentUrl?: string;
}

const PAYMENT_API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim() || '';

function getPaymentApiUrl(): string {
  const baseUrl = PAYMENT_API_BASE_URL.replace(/\/+$/, '');

  if (!baseUrl) {
    throw new Error('آدرس سرویس پرداخت تنظیم نشده است.');
  }

  return `${baseUrl}/api/payment/request`;
}

export async function requestPayment(
  customerDetails: PaymentCustomerDetails,
  cart: CartItem[],
): Promise<RequestPaymentResult> {
  if (!cart.length) {
    throw new Error('سبد خرید خالی است.');
  }

  const items = cart.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
  }));

  const apiUrl = getPaymentApiUrl();

  let response: Response;

  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: {
          name: customerDetails.name.trim(),
          phone: customerDetails.phone.trim(),
          email: customerDetails.email?.trim() || '',
          address: customerDetails.address.trim(),
          note: customerDetails.note?.trim() || '',
        },
        items,
      }),
    });
  } catch (error) {
    console.error('Payment request network error:', error);

    throw new Error(
      'ارتباط با سرور پرداخت برقرار نشد. لطفاً دوباره تلاش کنید.',
    );
  }

  let data:
    | PaymentSuccessBody
    | PaymentErrorBody
    | null = null;

    const rawResponse = await response.text();

    console.log('[PAYMENT] RESPONSE', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      body: rawResponse,
    });
    
    try {
      data = JSON.parse(rawResponse) as
        | PaymentSuccessBody
        | PaymentErrorBody;
    } catch {
      console.error('[PAYMENT] INVALID JSON', {
        status: response.status,
        statusText: response.statusText,
        body: rawResponse,
      });
    
      throw new Error(
        `پاسخ نامعتبر از سرور پرداخت دریافت شد. (${response.status})`,
      );
    }

  if (!response.ok) {
    const errorData = data as PaymentErrorBody;

    console.error('Payment server error:', {
      status: response.status,
      statusText: response.statusText,
      data,
    });

    throw new Error(
      errorData.error ||
        `خطا در درخواست پرداخت (${response.status})`,
    );
  }

  const paymentData = data as PaymentSuccessBody;

  if (!paymentData.paymentUrl) {
    console.error(
      'Payment server response does not contain paymentUrl:',
      paymentData,
    );

    throw new Error(
      'آدرس درگاه پرداخت از سرور دریافت نشد.',
    );
  }

  if (!paymentData.orderId) {
    console.error(
      'Payment server response does not contain orderId:',
      paymentData,
    );

    throw new Error(
      'شناسه سفارش از سرور دریافت نشد.',
    );
  }

  if (
    paymentData.trackId === undefined ||
    paymentData.trackId === null
  ) {
    console.error(
      'Payment server response does not contain trackId:',
      paymentData,
    );

    throw new Error(
      'شناسه پرداخت از سرور دریافت نشد.',
    );
  }

  return {
    orderId: paymentData.orderId,
    orderNumber: paymentData.orderNumber,
    trackId: Number(paymentData.trackId),
    paymentUrl: paymentData.paymentUrl,
  };
}