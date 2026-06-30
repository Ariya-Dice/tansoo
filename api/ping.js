/** Simple ping — no database. Use to verify Vercel API routes work. */
import { resolveSupabaseConfig } from '../lib/supabaseConfig.js';

export const config = { runtime: 'nodejs' };

export default function handler(_req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  let supabaseUrl = null;
  let hasServiceKey = false;
  let configError = null;

  try {
    const cfg = resolveSupabaseConfig();
    supabaseUrl = cfg.url;
    hasServiceKey = Boolean(cfg.serviceKey);
  } catch (err) {
    configError = err.message;
  }

  res.status(200).json({
    ok: true,
    api: true,
    vercel: Boolean(process.env.VERCEL),
    supabaseConfigured: Boolean(supabaseUrl && hasServiceKey),
    supabaseUrlHost: supabaseUrl ? new URL(supabaseUrl).host : null,
    hasServiceRoleKey: hasServiceKey,
    configError,
  });
}
