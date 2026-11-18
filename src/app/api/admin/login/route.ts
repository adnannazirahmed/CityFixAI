import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '@/lib/demo/config';
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifySessionToken,
} from '@/lib/auth/session';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? DEMO_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? DEMO_ADMIN_PASSWORD;

// Session state depends on the request cookie; never cache.
export const dynamic = 'force-dynamic';

// ─── POST /api/admin/login ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let email: unknown;
  let password: unknown;
  try {
    ({ email, password } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  let sessionToken: string;
  try {
    sessionToken = await createSessionToken(ADMIN_EMAIL);
  } catch (err) {
    console.error('[POST /api/admin/login]', err);
    return NextResponse.json(
      { error: 'Admin login is not configured (ADMIN_SESSION_SECRET missing)' },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  });

  return NextResponse.json({ success: true, email: ADMIN_EMAIL });
}

// ─── DELETE /api/admin/login ──────────────────────────────────────────────────
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ success: true });
}

// ─── GET /api/admin/login ─────────────────────────────────────────────────────
// Verifies the session cookie's signature and expiry.
export async function GET() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ authenticated: !!session });
}
