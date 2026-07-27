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
  const res = await fetch(`${ZIBAL_BASE}/v1/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Zibal request HTTP ${res.status}`);
  }

  return (await res.json()) as ZibalRequestResponse;
}

export async function zibalVerify(payload: {
  merchant: string;
  trackId: number;
}): Promise<ZibalVerifyResponse> {
  const res = await fetch(`${ZIBAL_BASE}/v1/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Zibal verify HTTP ${res.status}`);
  }

  return (await res.json()) as ZibalVerifyResponse;
}

export function zibalStartUrl(trackId: number): string {
  return `${ZIBAL_BASE}/start/${trackId}`;
}
