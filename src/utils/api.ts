export function productsApiHeaders(json = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  const secret = import.meta.env.VITE_PRODUCTS_API_SECRET;
  if (secret) headers['X-Api-Secret'] = secret;
  return headers;
}
