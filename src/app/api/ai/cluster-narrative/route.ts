import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { store } from '@/lib/store';
import { createServiceClient } from '@/lib/supabase/server';
import { getCategoryLabel } from '@/lib/utils';
import type { IssueCategory } from '@/types';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// ─── POST /api/ai/cluster-narrative ──────────────────────────────────────────
// Returns an AI-generated narrative for duplicate clusters
export async function POST(_request: NextRequest) {
  try {
    // Load cluster data
    let clusters: { id: string; category: IssueCategory; cluster_size: number; neighborhood: string | null; status: string; created_at: string }[] = [];

    if (DEMO_MODE || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // Synthesize clusters from in-memory store by grouping nearby same-category reports
      const reports = store.getAll({ limit: 200 });
      const grouped: Record<string, typeof reports> = {};
      for (const r of reports) {
        const key = `${r.category}-${r.neighborhood ?? 'unknown'}`;
        grouped[key] = [...(grouped[key] ?? []), r];
      }
      clusters = Object.entries(grouped)
        .filter(([, rs]) => rs.length >= 2)
        .map(([key, rs], i) => ({
          id: `demo-cluster-${i}`,
          category: rs[0].category as IssueCategory,
          cluster_size: rs.length,
          neighborhood: rs[0].neighborhood,
          status: rs.some(r => r.status !== 'resolved') ? 'open' : 'resolved',
          created_at: rs[rs.length - 1].created_at,
        }))
        .sort((a, b) => b.cluster_size - a.cluster_size)
        .slice(0, 6);
    } else {
      const supabase = await createServiceClient();
      const { data } = await supabase
        .from('duplicate_clusters')
        .select('id, category, cluster_size, neighborhood, status, created_at')
        .order('cluster_size', { ascending: false })
        .limit(6);
      clusters = (data ?? []) as typeof clusters;
    }

    if (clusters.length === 0) {
      return NextResponse.json({ data: { narratives: [] }, error: null });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Build narratives — with or without GPT
    if (!apiKey || apiKey.startsWith('sk-placeholder')) {
      const narratives = clusters.map(c => ({
        cluster_id: c.id,
        category: c.category,
        neighborhood: c.neighborhood,
        cluster_size: c.cluster_size,
        narrative: `${c.cluster_size} residents reported ${getCategoryLabel(c.category).toLowerCase()} issues in ${c.neighborhood ?? 'this area'} — the repeated reports suggest a persistent structural problem, not isolated incidents. City staff should prioritize a site inspection.`,
      }));
      return NextResponse.json({ data: { narratives }, error: null });
    }

    const client = new OpenAI({ apiKey });

    // One GPT call with all clusters listed — more efficient than N calls
    const clusterList = clusters
      .map((c, i) => `${i + 1}. ${getCategoryLabel(c.category)} — ${c.cluster_size} reports in ${c.neighborhood ?? 'unknown area'} (status: ${c.status})`)
      .join('\n');

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a city analyst. For each cluster, write ONE sentence explaining why repeated reports indicate a structural problem, not random coincidence, and what action is implied. Number your responses to match the input. Plain text only.`,
        },
        {
          role: 'user',
          content: `Generate one-sentence narratives for each of these duplicate report clusters:\n${clusterList}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
    });

    const rawText = completion.choices[0]?.message?.content?.trim() ?? '';
    const lines = rawText.split('\n').filter(l => l.trim());

    const narratives = clusters.map((c, i) => {
      // Extract the line for this cluster (strip leading number/dot)
      const line = lines[i]?.replace(/^\d+\.\s*/, '').trim()
        ?? `${c.cluster_size} residents reported ${getCategoryLabel(c.category).toLowerCase()} issues in ${c.neighborhood ?? 'this area'} — this pattern indicates a persistent infrastructure problem requiring urgent inspection.`;
      return {
        cluster_id: c.id,
        category: c.category,
        neighborhood: c.neighborhood,
        cluster_size: c.cluster_size,
        narrative: line,
      };
    });

    return NextResponse.json({ data: { narratives }, error: null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/ai/cluster-narrative]', msg);
    return NextResponse.json({ data: { narratives: [] }, error: msg }, { status: 500 });
  }
}
