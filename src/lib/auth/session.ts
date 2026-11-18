// Signed admin session tokens (HMAC-SHA256 via Web Crypto).
// Uses only Web APIs (crypto.subtle, TextEncoder, btoa/atob), so it runs in both
// edge middleware and Node route handlers.
//
// Token format: base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload))

import { IS_DEMO } from '@/lib/demo/config';

export const SESSION_COOKIE = 'cityfix_admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours

// Only ever used in demo mode, where admin access is intentionally public.
const DEMO_FALLBACK_SECRET = 'cityfix-demo-mode-only-not-a-secret';

export interface SessionPayload {
  sub: string; // admin email
  exp: number; // expiry, seconds since epoch
}

/** The signing secret, or null when none is configured (outside demo mode, that locks admin). */
function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  return IS_DEMO ? DEMO_FALLBACK_SECRET : null;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): ArrayBuffer {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

/** Creates a signed token. Throws if no secret is configured. */
export async function createSessionToken(email: string): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set');
  const payload: SessionPayload = { sub: email, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await importKey(secret), new TextEncoder().encode(body));
  return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

/** Returns the payload if the signature is valid and the token is unexpired, else null. */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  try {
    const secret = getSecret();
    if (!secret || !token) return null;
    const [body, sig, extra] = token.split('.');
    if (!body || !sig || extra !== undefined) return null;

    // crypto.subtle.verify compares in constant time.
    const valid = await crypto.subtle.verify(
      'HMAC',
      await importKey(secret),
      fromBase64Url(sig),
      new TextEncoder().encode(body),
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Partial<SessionPayload>;
    if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number') return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub, exp: payload.exp };
  } catch {
    return null;
  }
}
