'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Bell, RefreshCw, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ReportsTable } from '@/components/dashboard/reports-table';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { TrendsChart } from '@/components/dashboard/trends-chart';
import { NeighborhoodInsightPanel } from '@/components/dashboard/neighborhood-insight-panel';
import { ClusterNarrativePanel } from '@/components/dashboard/cluster-narrative-panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { formatRelativeTime, getStatusLabel } from '@/lib/utils';
import { DEMO_STATS } from '@/lib/demo-data';
import type { Report, DashboardStats, ReportStatus, CategoryChartData, TrendChartData } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  pothole: '#EF4444',
  broken_streetlight: '#F97316',
  damaged_sidewalk: '#F59E0B',
  road_obstruction: '#EAB308',
  trash_overflow: '#84CC16',
  illegal_dumping: '#22C55E',
  broken_sign: '#06B6D4',
  accessibility_hazard: '#3B82F6',
  flooding: '#6366F1',
  graffiti: '#8B5CF6',
  other: '#6B7280',
};

function computeCategoryBreakdown(reports: Report[]): CategoryChartData[] {
  const counts: Record<string, number> = {};
  reports.forEach(r => { counts[r.category] = (counts[r.category] ?? 0) + 1; });
  return Object.entries(counts)
    .filter(([, c]) => c > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([category, count]) => ({ category, count, fill: CATEGORY_COLORS[category] ?? '#6B7280' }));
}

function computeTrends(reports: Report[]): TrendChartData[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayStr = d.toDateString();
    return {
      date: label,
      submitted: reports.filter(r => new Date(r.created_at).toDateString() === dayStr).length,
      resolved: reports.filter(r => r.status === 'resolved' && new Date(r.updated_at).toDateString() === dayStr).length,
    };
  });
}

const IssueMap = dynamic(
  () => import('@/components/map/issue-map').then((m) => m.IssueMap),
  { ssr: false, loading: () => <div className="h-64 bg-gray-100 rounded-xl animate-pulse" /> }
);

export default function AdminDashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats>(DEMO_STATS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  async function fetchData() {
    try {
      const [reportsRes, insightsRes] = await Promise.all([
        fetch('/api/reports?limit=100'),
        fetch('/api/insights'),
      ]);
      const [reportsData, insightsData] = await Promise.all([
        reportsRes.json(),
        insightsRes.json(),
      ]);

      if (reportsData.data) setReports(reportsData.data);
      if (insightsData.data?.stats) setStats(insightsData.data.stats);
    } catch {
      // Keep demo data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleStatusChange(id: string, status: ReportStatus) {
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setReports((prev) =>
        prev.map((r) => r.id === id ? { ...r, status, updated_at: new Date().toISOString() } : r)
      );
      toast.success(`Status updated to "${getStatusLabel(status)}"`);
    } catch {
      toast.error('Failed to update status');
    }
  }

  const refresh = async () => {
    setRefreshing(true);
    await fetchData();
    toast.success('Dashboard refreshed');
  };

  const criticalReports = reports
    .filter((r) => r.priority_level === 'critical' && r.status !== 'resolved')
    .slice(0, 3);

  const mapMarkers = reports
    .filter((r) => r.status !== 'resolved')
    .map((r) => ({
      id: r.id,
      lat: r.latitude,
      lng: r.longitude,
      title: r.title,
      category: r.category,
      priority_level: r.priority_level,
      status: r.status,
      neighborhood: r.neighborhood,
    }));

  return (
    <div className="p-6 space-y-6">
      {/* ─── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Last updated: {now} · {reports.filter(r => r.status !== 'resolved').length} open issues
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-700 border-green-200">
            ● Live
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/report">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              + New Report
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Critical Alerts ───────────────────────────────────────────────── */}
      {criticalReports.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-semibold text-red-800">
              {criticalReports.length} Critical Issue{criticalReports.length > 1 ? 's' : ''} Require Immediate Attention
            </span>
          </div>
          <div className="space-y-2">
            {criticalReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between bg-white rounded-lg border border-red-200 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{report.title}</p>
                  <p className="text-xs text-gray-500">
                    {report.neighborhood} · {formatRelativeTime(report.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">Priority {Math.round(report.priority_score)}</Badge>
                  <Link href={`/admin/reports/${report.id}`}>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600">
                      View <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Stats ────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <StatsCards stats={stats} />
      )}

      {/* ─── Charts row ───────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TrendsChart data={computeTrends(reports)} />
        <CategoryChart data={computeCategoryBreakdown(reports)} />
      </div>

      {/* ─── AI Insight Panels ────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <NeighborhoodInsightPanel />
        <ClusterNarrativePanel />
      </div>

      {/* ─── Map ──────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Active Issues Map</CardTitle>
            <Link href="/map">
              <Button variant="ghost" size="sm" className="text-blue-600 gap-1">
                Full Map <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {mapMarkers.length === 0 && !loading ? (
            <div className="h-[320px] flex items-center justify-center rounded-xl bg-gray-50 border border-dashed border-gray-200 text-gray-400 text-sm">
              No active reports to display on map
            </div>
          ) : (
            <IssueMap markers={mapMarkers} height="320px" />
          )}
        </CardContent>
      </Card>

      {/* ─── Recent reports table ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Reports</CardTitle>
            <Link href="/admin/reports">
              <Button variant="ghost" size="sm" className="text-blue-600 gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ReportsTable
            reports={reports.slice(0, 10)}
            onStatusChange={handleStatusChange}
            showFilters={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
