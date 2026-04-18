import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@cityfix.ai';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'cityfix-admin-2024';
const SESSION_COOKIE = 'cityfix_admin_session';

// ─── POST /api/admin/login ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({ success: true, email });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

// ─── DELETE /api/admin/login ──────────────────────────────────────────────────
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ success: true });
}

// ─── GET /api/admin/login ─────────────────────────────────────────────────────
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return NextResponse.json({ authenticated: !!session });
}
