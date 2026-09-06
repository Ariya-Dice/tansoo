import type { ZibalVerifyResponse } from './zibal.ts';

const PROXY_TIMEOUT_MS = 15_000;

export interface BulkZibalRequestResponse {
  result: number;
  message?: string | null;
  trackId?: number;
  paymentUrl?: string;
}

interface ProxyConfig {
  baseUrl: string;
  secret: string;
}

function getProxyConfig(): ProxyConfig {
  const baseUrl =
    Deno.env.get('BULK_ZIBAL_PROXY_URL')?.trim().replace(/\/+$/, '') ?? '';
  const secret =
    Deno.env.get('BULK_ZIBAL_PROXY_SECRET')?.trim() ?? '';

  if (!baseUrl || !secret) {
    throw new Error('bulk_zibal_proxy_not_configured');
  }

  return { baseUrl, secret };
}

async function callBulkProxy<T>(
  path: string,
  body: Record<string, unknown>,
  requestId: string,
): Promise<T> {
  const { baseUrl, secret } = getProxyConfig();
  const endpoint = `${baseUrl}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    PROXY_TIMEOUT_MS,
  );

  try {
    console.log(
      `[ BULK_ZIBAL_PROXY ] requestId=${requestId} endpoint=${endpoint}`,
    );

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bulk-zibal-secret': secret,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const responseText = await response.text();

    let payload: T & { error?: string };

    try {
      payload = JSON.parse(responseText) as T & { error?: string };
    } catch {
      console.error(
        `[ BULK_ZIBAL_PROXY ] requestId=${requestId} invalid JSON status=${response.status}`,
      );
      throw new Error('bulk_zibal_proxy_invalid_response');
    }

    if (response.status === 401) {
      console.error(
        `[ BULK_ZIBAL_PROXY ] requestId=${requestId} unauthorized status=401`,
      );
      throw new Error('bulk_zibal_proxy_unauthorized');
    }

    if (!response.ok) {
      const resultPayload = payload as {
        result?: number;
        message?: string | null;
        trackId?: number | null;
      };

      if (typeof resultPayload.result === 'number') {
        console.error(
          `[ BULK_ZIBAL_PROXY ] requestId=${requestId} zibal status=${response.status} result=${resultPayload.result}`,
        );
        return payload;
      }

      console.error(
        `[ BULK_ZIBAL_PROXY ] requestId=${requestId} http status=${response.status}`,
      );
      throw new Error('bulk_zibal_proxy_http_error');
    }

    return payload;
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === 'AbortError'
    ) {
      console.error(
        `[ BULK_ZIBAL_PROXY ] requestId=${requestId} timeout endpoint=${endpoint}`,
      );
      throw new Error('bulk_zibal_proxy_timeout');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('bulk_zibal_proxy_unknown_error');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function zibalBulkRequest(
  payload: {
    amount: number;
    callbackUrl: string;
    description?: string;
    orderId?: string;
    mobile?: string;
  },
  requestId: string,
): Promise<BulkZibalRequestResponse> {
  return callBulkProxy<BulkZibalRequestResponse>(
    '/api/payment/bulk-request',
    payload,
    requestId,
  );
}

export async function zibalBulkVerify(
  trackId: number,
  requestId: string,
): Promise<ZibalVerifyResponse> {
  return callBulkProxy<ZibalVerifyResponse>(
    '/api/payment/bulk-verify',
    { trackId },
    requestId,
  );
}

export function bulkZibalProxyErrorMessage(code: string): string {
  const map: Record<string, string> = {
    bulk_zibal_proxy_not_configured:
      'تنظیمات پروکسی پرداخت عمده کامل نیست.',
    bulk_zibal_proxy_unauthorized:
      'دسترسی پروکسی پرداخت عمده مجاز نیست.',
    bulk_zibal_proxy_timeout:
      'ارتباط با سرور پرداخت عمده برقرار نشد. لطفاً دوباره تلاش کنید.',
    bulk_zibal_proxy_invalid_response:
      'پاسخ نامعتبر از سرور پرداخت عمده دریافت شد.',
    bulk_zibal_proxy_http_error:
      'خطا در ارتباط با سرور پرداخت عمده.',
    bulk_zibal_proxy_unknown_error:
      'خطا در پردازش درخواست پرداخت عمده.',
  };

  return map[code] ?? map.bulk_zibal_proxy_unknown_error;
}
