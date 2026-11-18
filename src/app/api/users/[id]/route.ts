import { NextRequest, NextResponse } from 'next/server';
import { userStore } from '@/lib/user-store';
import { newUser } from '@/lib/scoring/user-score';
import { IS_DEMO } from '@/lib/demo/config';

// Never prerender at build time: this reads live (Supabase or in-memory) data.
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  // Demo mode is read-only: seed users only, never create one on the server.
  const score = IS_DEMO
    ? userStore.getSeed(params.id) ?? newUser(params.id)
    : userStore.get(params.id);
  return NextResponse.json({ data: score, error: null });
}
