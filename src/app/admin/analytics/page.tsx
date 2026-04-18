'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Loader2, Layers } from 'lucide-react';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { TrendsChart } from '@/components/dashboard/trends-chart';
import { EquityHeatmap } from '@/components/dashboard/equity-heatmap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  DEMO_INSIGHTS, DEMO_TRENDS, DEMO_CATEGORY_BREAKDOWN, DEMO_CLUSTERS,
} from '@/lib/demo-data';
import { getCategoryLabel, getCategoryIcon } from '@/lib/utils';
import type { AreaInsight, DuplicateCluster } from '@/types';

export default function AdminAnalyticsPage() {
  const [insights, setInsights] = useState<AreaInsight[]>(DEMO_INSIGHTS);
  const [clusters, setClusters] = useState<DuplicateCluster[]>(DEMO_CLUSTERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/insights').then(r => r.json()),
      fetch('/api/clusters').then(r => r.json()),
    ]).then(([insightsData, clustersData]) => {
      if (insightsData.data?.area_insights) setInsights(insightsData.data.area_insights);
      if (clustersData.data) setClusters(clustersData.data);
    }).catch(() => {/* keep demo */}).finally(() => setLoading(false));
  }, []);

  const neighborhoodData = insights.map((i) => ({
    name: i.neighborhood,
    unresolved: i.unresolved_reports,
    total: i.total_reports,
    avgPriority: i.avg_priority_score,
    fill: i.equity_flag ? '#EF4444' : i.equity_score >= 55 ? '#F97316' : '#22C55E',
  }));

  return (
    <div className="p-6 space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-black text-gray-900">Analytics & Insights</h1>
          <p className="text-sm text-gray-500">
            Data-driven intelligence for equitable city management
          </p>
        </div>
      </div>

      {/* ─── Trends + Categories ────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TrendsChart data={DEMO_TRENDS} />
        <CategoryChart data={DEMO_CATEGORY_BREAKDOWN} />
      </div>

      {/* ─── Neighborhood comparison bar chart ──────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Unresolved Issues by Neighborhood</CardTitle>
          <CardDescription>
            Red indicates potential equity concern — disproportionately high unresolved reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={neighborhoodData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                formatter={(value: number, name: string) => [value, name === 'unresolved' ? 'Unresolved' : 'Total']}
              />
              <Bar dataKey="unresolved" radius={[4, 4, 0, 0]} name="Unresolved">
                {neighborhoodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
              <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="#E5E7EB" name="Total" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-red-400" />Equity concern</div>
            <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-orange-400" />Moderate concern</div>
            <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-green-400" />Normal</div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Equity heatmap ─────────────────────────────────────────────── */}
      <EquityHeatmap insights={insights} />

      {/* ─── Duplicate clusters ──────────────────────────────────────────── */}
      <Card id="clusters">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-600" />
                Duplicate Issue Clusters
              </CardTitle>
              <CardDescription>
                Groups of similar reports from the same area — indicating a recurring problem
              </CardDescription>
            </div>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              {clusters.length} active clusters
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {clusters.map((cluster) => (
              <div key={cluster.id} className="rounded-xl border border-purple-100 bg-purple-50 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(cluster.category)}</span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {getCategoryLabel(cluster.category)}
                      </span>
                    </div>
                    {cluster.neighborhood && (
                      <p className="text-xs text-gray-500 mt-0.5">📍 {cluster.neighborhood}</p>
                    )}
                  </div>
                  <Badge className="bg-purple-200 text-purple-800 border-purple-300 text-xs font-bold">
                    {cluster.cluster_size} reports
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Cluster density</span>
                    <span className="font-medium">{cluster.cluster_size} reports nearby</span>
                  </div>
                  <Progress
                    value={Math.min((cluster.cluster_size / 5) * 100, 100)}
                    className="h-1.5 [&>div]:bg-purple-500"
                  />
                </div>

                <div className="text-xs text-gray-500">
                  Coordinates: {cluster.center_latitude.toFixed(4)}, {cluster.center_longitude.toFixed(4)}
                </div>
              </div>
            ))}
          </div>

          {clusters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Layers className="mx-auto h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No duplicate clusters detected</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Priority score distribution ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Priority Score Distribution</CardTitle>
          <CardDescription>How issues are distributed across priority levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: '🔴 Critical (85-100)', pct: 28, color: 'bg-red-500' },
              { label: '🟠 High (65-84)', pct: 36, color: 'bg-orange-500' },
              { label: '🟡 Medium (40-64)', pct: 24, color: 'bg-amber-500' },
              { label: '🟢 Low (0-39)', pct: 12, color: 'bg-green-500' },
            ].map(({ label, pct, color }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{label}</span>
                  <span className="font-semibold tabular-nums">{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
