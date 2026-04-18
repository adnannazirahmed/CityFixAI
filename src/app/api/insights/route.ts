import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { DEMO_INSIGHTS, DEMO_STATS, DEMO_REPORTS } from '@/lib/demo-data';
import { calculateEquityScore } from '@/lib/scoring/priority';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// ─── GET /api/insights ────────────────────────────────────────────────────────
export async function GET() {
  if (DEMO_MODE || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({
      data: {
        stats: DEMO_STATS,
        area_insights: DEMO_INSIGHTS,
      },
      error: null,
    });
  }

  try {
    const supabase = await createServiceClient();

    // Fetch all reports
    const { data: reports, error } = await supabase
      .from('reports')
      .select('id, status, priority_score, priority_level, category, neighborhood, created_at, updated_at');

    if (error) throw error;

    const allReports = reports ?? [];

    // ─── Dashboard Stats ───────────────────────────────────────────────────
    const total = allReports.length;
    const resolvedReports = allReports.filter(r => r.status === 'resolved');
    const open = allReports.length - resolvedReports.length;
    const resolved = resolvedReports.length;
    const highPriority = allReports.filter(
      r => (r.priority_level === 'critical' || r.priority_level === 'high') && r.status !== 'resolved'
    ).length;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = allReports.filter(r => new Date(r.created_at) > oneWeekAgo).length;

    // Average resolution time for resolved reports
    let avgResolutionDays = 0;
    if (resolvedReports.length > 0) {
      const totalDays = resolvedReports.reduce((sum, r) => {
        const created = new Date(r.created_at).getTime();
        const updated = new Date(r.updated_at).getTime();
        return sum + (updated - created) / (1000 * 3600 * 24);
      }, 0);
      avgResolutionDays = Math.round(totalDays / resolvedReports.length * 10) / 10;
    }

    // Get cluster count
    const { count: clusterCount } = await supabase
      .from('duplicate_clusters')
      .select('*', { count: 'exact', head: true });

    const stats = {
      total_reports: total,
      open_reports: open,
      resolved_reports: resolved,
      high_priority_reports: highPriority,
      duplicate_clusters: clusterCount ?? 0,
      avg_resolution_days: avgResolutionDays,
      reports_this_week: thisWeek,
      resolution_rate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    };

    // ─── Area Insights ─────────────────────────────────────────────────────
    const neighborhoodMap = new Map<string, typeof allReports>();
    for (const report of allReports) {
      const n = report.neighborhood ?? 'Unknown';
      if (!neighborhoodMap.has(n)) neighborhoodMap.set(n, []);
      neighborhoodMap.get(n)!.push(report);
    }

    const area_insights = Array.from(neighborhoodMap.entries()).map(([neighborhood, nReports]) => {
      const unresolvedReports = nReports.filter(r => r.status !== 'resolved');
      const avgPriority = nReports.length > 0
        ? Math.round(nReports.reduce((s, r) => s + (r.priority_score ?? 50), 0) / nReports.length)
        : 0;

      // Count categories
      const catCount: Record<string, number> = {};
      for (const r of nReports) {
        catCount[r.category] = (catCount[r.category] ?? 0) + 1;
      }
      const topIssues = Object.entries(catCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);

      const equityScore = calculateEquityScore(
        unresolvedReports.length,
        nReports.length,
        null,
        avgResolutionDays
      );

      return {
        id: `ins-${neighborhood.toLowerCase().replace(/\s+/g, '-')}`,
        neighborhood,
        total_reports: nReports.length,
        unresolved_reports: unresolvedReports.length,
        avg_priority_score: avgPriority,
        avg_resolution_days: null,
        equity_flag: equityScore >= 70,
        equity_score: equityScore,
        top_issues: topIssues,
        updated_at: new Date().toISOString(),
      };
    });

    // Sort by equity score descending (most underserved first)
    area_insights.sort((a, b) => b.equity_score - a.equity_score);

    return NextResponse.json({ data: { stats, area_insights }, error: null });
  } catch (err) {
    console.error('[GET /api/insights]', err);
    // Fall back to demo data on error
    return NextResponse.json({
      data: { stats: DEMO_STATS, area_insights: DEMO_INSIGHTS },
      error: null,
    });
  }
}
