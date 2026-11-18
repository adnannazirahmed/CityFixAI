import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { DEMO_CLUSTERS } from '@/lib/demo-data';

import { IS_DEMO } from '@/lib/demo/config';

// Never prerender at build time: this reads live (Supabase or in-memory) data.
export const dynamic = 'force-dynamic';

// ─── GET /api/clusters ────────────────────────────────────────────────────────
export async function GET() {
  if (IS_DEMO) {
    return NextResponse.json({ data: DEMO_CLUSTERS, error: null });
  }

  try {
    const supabase = await createServiceClient();

    // Get clusters with their report counts
    const { data: clusters, error: clusterError } = await supabase
      .from('duplicate_clusters')
      .select('*')
      .order('created_at', { ascending: false });

    if (clusterError) throw clusterError;

    // Enrich with report details
    const enriched = await Promise.all(
      (clusters ?? []).map(async (cluster) => {
        const { data: reports } = await supabase
          .from('reports')
          .select('id, title, status, priority_score, created_at')
          .eq('duplicate_cluster_id', cluster.id)
          .order('priority_score', { ascending: false });

        return { ...cluster, reports: reports ?? [] };
      })
    );

    return NextResponse.json({ data: enriched, error: null });
  } catch (err) {
    console.error('[GET /api/clusters]', err);
    return NextResponse.json({ data: null, error: 'Failed to fetch clusters' }, { status: 500 });
  }
}
