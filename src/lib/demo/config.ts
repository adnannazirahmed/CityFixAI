/**
 * Central demo-mode detection.
 *
 * Demo mode is on when NEXT_PUBLIC_DEMO_MODE=true, or when no Supabase URL is
 * configured. In demo mode the app uses the in-memory store and never calls OpenAI.
 */
export const IS_DEMO =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL;

/** True only outside demo mode with a real (non-placeholder) OpenAI key. Server-only. */
export function aiEnabled(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !IS_DEMO && !!key && !key.startsWith('sk-placeholder');
}

/**
 * Default admin credentials. They are the fallback when ADMIN_EMAIL / ADMIN_PASSWORD
 * are unset, and are shown (and used for one-click login) on the login page in demo mode.
 */
export const DEMO_ADMIN_EMAIL = 'admin@cityfix.ai';
export const DEMO_ADMIN_PASSWORD = 'cityfix-admin-2024';
