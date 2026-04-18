import { NextRequest, NextResponse } from 'next/server';
import { analyzeReport } from '@/lib/openai/analyze';

// ─── POST /api/ai/analyze ─────────────────────────────────────────────────────
// Called from the frontend before report submission to show AI preview
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, image_url } = body as {
      description?: string;
      image_url?: string;
    };

    if (!description && !image_url) {
      return NextResponse.json(
        { data: null, error: 'Either description or image_url is required' },
        { status: 400 }
      );
    }

    const result = await analyzeReport(description ?? '', image_url);
    return NextResponse.json({ data: result, error: null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/ai/analyze]', msg);
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}
