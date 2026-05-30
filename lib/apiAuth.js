/**
 * Protect product write endpoints when PRODUCTS_API_SECRET is set.
 * @param {import('http').IncomingMessage & { headers?: Record<string, string | string[] | undefined> }} req
 * @returns {boolean}
 */
export function isProductsWriteAuthorized(req) {
  const secret = process.env.PRODUCTS_API_SECRET;
  if (!secret) return true;

  const headers = req.headers ?? {};
  const authHeader = headers.authorization;
  const bearer =
    typeof authHeader === 'string'
      ? authHeader.replace(/^Bearer\s+/i, '').trim()
      : '';
  const headerSecret =
    bearer ||
    String(headers['x-api-secret'] ?? headers['X-Api-Secret'] ?? '').trim();

  return headerSecret === secret;
}

/**
 * @param {{ status?: (code: number) => { json: (body: unknown) => void }; statusCode?: number; setHeader?: (k: string, v: string) => void; end?: (body?: string) => void }} res
 */
export function sendUnauthorized(res) {
  const body = { error: 'Unauthorized', message: 'Invalid or missing API secret' };
  if (typeof res.status === 'function') {
    return res.status(401).json(body);
  }
  res.statusCode = 401;
  res.setHeader?.('Content-Type', 'application/json');
  res.end?.(JSON.stringify(body));
}
