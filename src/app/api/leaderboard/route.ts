import { NextResponse } from 'next/server';
import { userStore } from '@/lib/user-store';

export async function GET() {
  const data = userStore.leaderboard(20);
  return NextResponse.json({ data, error: null });
}
