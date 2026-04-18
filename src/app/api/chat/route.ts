import { NextRequest, NextResponse } from 'next/server';
import { processMessage } from '@/lib/openai/intake-chat';
import type { ChatMessage } from '@/lib/openai/intake-chat';

// ─── POST /api/chat ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: ChatMessage[] = body.messages ?? [];
    const language: string = body.language ?? 'en';

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages must be an array' }, { status: 400 });
    }

    const result = await processMessage(messages, language);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[POST /api/chat]', err);
    return NextResponse.json({ error: 'Chat processing failed' }, { status: 500 });
  }
}
