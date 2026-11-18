import { NextResponse } from 'next/server';
import { userStore } from '@/lib/user-store';
import { IS_DEMO } from '@/lib/demo/config';

// Never prerender at build time: this reads live (Supabase or in-memory) data.
export const dynamic = 'force-dynamic';

export async function GET() {
  // Demo mode is read-only: seed users only (the browser adds the visitor's entry).
  const data = IS_DEMO ? userStore.seedLeaderboard(20) : userStore.leaderboard(20);
  return NextResponse.json({ data, error: null });
}
