import { NextRequest, NextResponse } from 'next/server';
import { userStore } from '@/lib/user-store';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const score = userStore.get(params.id);
  return NextResponse.json({ data: score, error: null });
}
