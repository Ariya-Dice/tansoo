```ts
const ZIBAL_BASE = 'https://gateway.zibal.ir';

export interface ZibalRequestResponse {
  result: number;
  message?: string;
  trackId?: number;
}

export interface ZibalVerifyResponse {
  result: number;
  message?: string;
  refNumber?: number | string;
  amount?: number;
  orderId?: string;
}

export async function zibalRequest(payload: {
  merchant: string;
  amount: number;
  callbackUrl: string;
  description?: string;
  orderId?: string;
  mobile?: string;
}): Promise<ZibalRequestResponse> {
  console.log('[ZIBAL] Request started', {
    endpoint: `${ZIBAL_BASE}/v1/request`,
    amount: payload.amount,
    callbackUrl: payload.callbackUrl,
    description: payload.description,
    orderId: payload.orderId,
    mobile: payload.mobile,
  });

  let res: Response;

  try {
    res = await fetch(`${ZIBAL_BASE}/v1/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('[ZIBAL] Request network error', {
      error: error instanceof Error ? error.message : String(error),
    });

    throw new Error(
      `Zibal request network error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  const responseText = await res.text();

  console.log('[ZIBAL] Request response', {
    httpStatus: res.status,
    ok: res.ok,
    body: responseText,
  });

  if (!res.ok) {
    throw new Error(
      `Zibal request HTTP ${res.status}: ${responseText || 'empty response'}`,
    );
  }

  let data: ZibalRequestResponse;

  try {
    data = JSON.parse(responseText) as ZibalRequestResponse;
  } catch (error) {
    console.error('[ZIBAL] Invalid JSON response', {
      httpStatus: res.status,
      body: responseText,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new Error(
      `Zibal request returned invalid JSON: ${
        responseText || 'empty response'
      }`,
    );
  }

  console.log('[ZIBAL] Request parsed result', {
    result: data.result,
    message: data.message,
    trackId: data.trackId,
  });

  return data;
}

export async function zibalVerify(payload: {
  merchant: string;
  trackId: number;
}): Promise<ZibalVerifyResponse> {
  console.log('[ZIBAL] Verify started', {
    endpoint: `${ZIBAL_BASE}/v1/verify`,
    trackId: payload.trackId,
  });

  let res: Response;

  try {
    res = await fetch(`${ZIBAL_BASE}/v1/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('[ZIBAL] Verify network error', {
      error: error instanceof Error ? error.message : String(error),
    });

    throw new Error(
      `Zibal verify network error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  const responseText = await res.text();

  console.log('[ZIBAL] Verify response', {
    httpStatus: res.status,
    ok: res.ok,
    body: responseText,
  });

  if (!res.ok) {
    throw new Error(
      `Zibal verify HTTP ${res.status}: ${responseText || 'empty response'}`,
    );
  }

  let data: ZibalVerifyResponse;

  try {
    data = JSON.parse(responseText) as ZibalVerifyResponse;
  } catch (error) {
    console.error('[ZIBAL] Invalid verify JSON response', {
      httpStatus: res.status,
      body: responseText,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new Error(
      `Zibal verify returned invalid JSON: ${
        responseText || 'empty response'
      }`,
    );
  }

  console.log('[ZIBAL] Verify parsed result', {
    result: data.result,
    message: data.message,
    refNumber: data.refNumber,
    amount: data.amount,
    orderId: data.orderId,
  });

  return data;
}

export function zibalStartUrl(trackId: number): string {
  return `${ZIBAL_BASE}/start/${trackId}`;
}

/** User-facing Persian message for Zibal /request result codes. */
export function zibalRequestErrorMessage(
  result: number,
  message?: string,
): string {
  const map: Record<number, string> = {
    102: 'کد درگاه (merchant) در زیبال یافت نشد. ZIBAL_MERCHANT را در Secrets بررسی کنید.',
    103: 'درگاه زیبال غیرفعال است. قرارداد درگاه را در پنل زیبال تکمیل کنید.',
    104: 'کد درگاه (merchant) نامعتبر است.',
    105: 'مبلغ سپرده کمتر از حداقل مجاز زیبال (۱٬۰۰۰ ریال) است. BULK_ORDER_DEPOSIT_AMOUNT را افزایش دهید.',
    106: 'آدرس callback نامعتبر است. در پنل زیبال این آدرس را تأیید کنید.',
    113: 'مبلغ سپرده بیش از سقف مجاز تراکنش در زیبال است.',
    115: 'IP سرور در پنل زیبال ثبت نشده است.',
  };

  if (map[result]) {
    return map[result];
  }

  if (message?.trim()) {
    return `خطا در ایجاد تراکنش پرداخت (کد ${result}): ${message.trim()}`;
  }

  return `خطا در ایجاد تراکنش پرداخت (کد ${result}). لطفاً دوباره تلاش کنید.`;
}
```
