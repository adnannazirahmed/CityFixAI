import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { store } from '@/lib/store';
import { createServiceClient } from '@/lib/supabase/server';
import { getCategoryLabel } from '@/lib/utils';
import type { IssueCategory } from '@/types';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const FALLBACK_INSIGHT = `Based on current report data, the city is experiencing a mix of infrastructure and safety issues across multiple neighborhoods. Pothole reports dominate road-related complaints, with streetlight outages creating safety concerns during night hours. High-priority clusters are concentrated near main arterial roads and older residential zones. Recommended focus: coordinate a joint DPW and Parks inspection of the top 3 affected neighborhoods this week.`;

// ─── POST /api/ai/neighborhood-insight ───────────────────────────────────────
// Accepts a snapshot of reports and returns a GPT-generated narrative insight
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { neighborhood } = body as { neighborhood?: string };

    // Load report data
    let reports: { category: IssueCategory; status: string; priority_score: number; neighborhood: string | null; created_at: string }[] = [];

    if (DEMO_MODE || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      reports = store.getAll({ limit: 200 }) as typeof reports;
    } else {
      const supabase = await createServiceClient();
      const { data } = await supabase
        .from('reports')
        .select('category, status, priority_score, neighborhood, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      reports = (data ?? []) as typeof reports;
    }

    // Filter by neighborhood if specified
    const filtered = neighborhood
      ? reports.filter(r => r.neighborhood?.toLowerCase() === neighborhood.toLowerCase())
      : reports;

    if (filtered.length === 0) {
      return NextResponse.json({ data: { narrative: 'No reports available to analyze.' }, error: null });
    }

    // Build a compact summary for GPT
    const total = filtered.length;
    const resolved = filtered.filter(r => r.status === 'resolved').length;
    const open = total - resolved;

    const catCounts: Record<string, number> = {};
    for (const r of filtered) {
      catCounts[r.category] = (catCounts[r.category] ?? 0) + 1;
    }
    const topCategories = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, count]) => `${getCategoryLabel(cat as IssueCategory)}: ${count}`)
      .join(', ');

    const avgPriority = Math.round(filtered.reduce((s, r) => s + (r.priority_score ?? 50), 0) / filtered.length);
    const critical = filtered.filter(r => r.priority_score >= 80 && r.status !== 'resolved').length;

    const neigh = neighborhood ?? 'all neighborhoods';
    const dataBlurb = `Neighborhood/scope: ${neigh}. Total reports: ${total} (${open} open, ${resolved} resolved). Avg priority score: ${avgPriority}/100. Critical unresolved: ${critical}. Top issue types: ${topCategories}.`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.startsWith('sk-placeholder')) {
      return NextResponse.json({ data: { narrative: FALLBACK_INSIGHT }, error: null });
    }

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a senior city data analyst writing a concise situation report for city officials. Write 3-4 sentences max. Be specific, use the numbers given, mention equity concerns if unresolved issues are high, and end with one concrete recommended action. Plain prose — no bullet points, no headers.`,
        },
        {
          role: 'user',
          content: `Write a civic infrastructure situation report based on this data:\n${dataBlurb}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 200,
    });

    const narrative = completion.choices[0]?.message?.content?.trim() ?? FALLBACK_INSIGHT;
    return NextResponse.json({ data: { narrative }, error: null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/ai/neighborhood-insight]', msg);
    return NextResponse.json({ data: { narrative: FALLBACK_INSIGHT }, error: null });
  }
}
