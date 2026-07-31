import type { User } from '@supabase/supabase-js';

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const appRole = user.app_metadata?.role;
  const userRole = user.user_metadata?.role;
  return appRole === 'admin' || userRole === 'admin';
}

export function adminAuthErrorMessage(): string {
  return 'دسترسی ادمین مجاز نیست. با حساب دارای نقش admin وارد شوید.';
}
