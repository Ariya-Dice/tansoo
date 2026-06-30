/**
 * Normalize and validate Supabase env vars (common Vercel copy-paste mistakes).
 */

function stripQuotes(value) {
  if (!value) return '';
  return String(value).trim().replace(/^["']|["']$/g, '');
}

/**
 * @param {string | undefined} raw
 * @returns {string | null}
 */
export function normalizeSupabaseUrl(raw) {
  let url = stripQuotes(raw);
  if (!url) return null;

  if (url.includes('supabase.com/dashboard')) {
    throw new Error(
      'SUPABASE_URL is wrong: use Project URL from Supabase → Settings → API (https://xxxxx.supabase.co), not the dashboard link.',
    );
  }

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    url = `${parsed.protocol}//${parsed.host}`;
  } catch {
    throw new Error(
      `SUPABASE_URL is not a valid URL: "${url}". Example: https://abcdefghijklmnop.supabase.co`,
    );
  }

  url = url.replace(/\/+$/, '');

  if (!/\.supabase\.co$/i.test(url)) {
    throw new Error(
      `SUPABASE_URL must end with .supabase.co (got "${url}"). Find it in Supabase → Settings → API → Project URL.`,
    );
  }

  return url;
}

/**
 * @param {string | undefined} raw
 * @returns {string | null}
 */
export function normalizeSupabaseKey(raw) {
  const key = stripQuotes(raw);
  if (!key) return null;

  if (key.startsWith('http://') || key.startsWith('https://')) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY looks like a URL. Paste the service_role secret key (starts with eyJ...), not SUPABASE_URL.',
    );
  }

  if (!key.startsWith('eyJ')) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY should be a JWT starting with eyJ. Copy service_role from Supabase → Settings → API.',
    );
  }

  return key;
}

/**
 * @returns {{ url: string, key: string, serviceKey: string | null, anonKey: string | null }}
 */
export function resolveSupabaseConfig() {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL);
  const serviceKey = normalizeSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const anonKey = normalizeSupabaseKey(process.env.SUPABASE_ANON_KEY);
  const key = serviceKey || anonKey;

  if (url && !key) {
    throw new Error(
      'SUPABASE_URL is set but SUPABASE_SERVICE_ROLE_KEY is missing. Add service_role key in Vercel Environment Variables.',
    );
  }

  if (!url && key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is set but SUPABASE_URL is missing. Add Project URL in Vercel Environment Variables.',
    );
  }

  return { url, key, serviceKey, anonKey };
}
