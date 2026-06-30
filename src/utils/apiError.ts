/** Hint shown under API errors — dev vs production */
export function getApiErrorHint(errorMessage?: string | null): string {
  if (import.meta.env.DEV) {
    return 'در حالت توسعه: دستور npm run dev را اجرا کنید (Vite + API روی پورت 4020).';
  }

  if (errorMessage?.includes('Supabase') || errorMessage?.includes('not configured')) {
    return 'در Vercel: Settings → Environment Variables → SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY را تنظیم کنید، سپس Redeploy. راهنما: VERCEL_DEPLOY.md';
  }

  return 'اتصال API برقرار نشد. /api/health را در مرورگر باز کنید یا Environment Variables را در Vercel بررسی کنید.';
}

export async function readApiError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return body.message || body.error || fallback;
  } catch {
    return fallback;
  }
}
