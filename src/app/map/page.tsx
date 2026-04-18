'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Filter, Loader2, MapPin } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { getCategoryLabel, getCategoryIcon, formatRelativeTime } from '@/lib/utils';
import type { Report, PriorityLevel } from '@/types';

// Dynamic import — Leaflet requires browser APIs
const IssueMap = dynamic(
  () => import('@/components/map/issue-map').then((m) => m.IssueMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-gray-100 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    ),
  }
);

export default function MapPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'all'>('all');
  const [selected, setSelected] = useState<Report | null>(null);

  useEffect(() => {
    fetch('/api/reports?limit=200')
      .then((r) => r.json())
      .then((d) => setReports(d.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = priorityFilter === 'all'
    ? reports.filter((r) => r.status !== 'resolved')
    : reports.filter((r) => r.priority_level === priorityFilter && r.status !== 'resolved');

  const markers = filtered.map((r) => ({
    id: r.id,
    lat: r.latitude,
    lng: r.longitude,
    title: r.title,
    category: r.category,
    priority_level: r.priority_level,
    status: r.status,
    neighborhood: r.neighborhood,
  }));

  const handleMarkerClick = (id: string) => {
    const report = reports.find((r) => r.id === id);
    if (report) setSelected(report);
  };

  const priorityCounts = reports.reduce(
    (acc, r) => {
      if (r.status !== 'resolved') acc[r.priority_level] = (acc[r.priority_level] ?? 0) + 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 } as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              Live Issue Map
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {filtered.length} active issues shown · Click a pin for details
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select
              value={priorityFilter}
              onValueChange={(v) => setPriorityFilter(v as PriorityLevel | 'all')}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">🔴 Critical ({priorityCounts.critical})</SelectItem>
                <SelectItem value="high">🟠 High ({priorityCounts.high})</SelectItem>
                <SelectItem value="medium">🟡 Medium ({priorityCounts.medium})</SelectItem>
                <SelectItem value="low">🟢 Low ({priorityCounts.low})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          {[
            { level: 'critical', color: 'bg-red-500', label: `Critical (${priorityCounts.critical})` },
            { level: 'high', color: 'bg-orange-500', label: `High (${priorityCounts.high})` },
            { level: 'medium', color: 'bg-amber-500', label: `Medium (${priorityCounts.medium})` },
            { level: 'low', color: 'bg-green-500', label: `Low (${priorityCounts.low})` },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className={`h-3 w-3 rounded-full ${color}`} />
              {label}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex h-[540px] items-center justify-center bg-gray-100 rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <IssueMap
                markers={markers}
                height="540px"
                onMarkerClick={handleMarkerClick}
              />
            )}
          </div>

          {/* Sidebar: selected or list */}
          <div className="space-y-4 max-h-[560px] overflow-y-auto">
            {selected ? (
              <Card className="border-blue-100">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                      {selected.title}
                    </h3>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-gray-400 hover:text-gray-600 shrink-0"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <PriorityBadge level={selected.priority_level} score={selected.priority_score} />
                    <StatusBadge status={selected.status} />
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span>{getCategoryIcon(selected.category)}</span>
                    <span>{getCategoryLabel(selected.category)}</span>
                  </div>

                  {selected.ai_summary && (
                    <p className="text-xs text-gray-600 rounded bg-gray-50 p-2">
                      {selected.ai_summary}
                    </p>
                  )}

                  {selected.address && (
                    <p className="text-xs text-gray-500">📍 {selected.address}</p>
                  )}

                  <p className="text-xs text-gray-400">
                    Reported {formatRelativeTime(selected.created_at)}
                  </p>

                  {selected.recommended_action && (
                    <div className="rounded bg-green-50 border border-green-200 p-2">
                      <p className="text-xs text-green-800">
                        <strong>Action:</strong> {selected.recommended_action}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-xs text-gray-500 font-medium">Recent Open Issues</p>
                {filtered.slice(0, 12).map((report) => (
                  <Card
                    key={report.id}
                    className="cursor-pointer hover:shadow-sm transition-shadow border-gray-100"
                    onClick={() => setSelected(report)}
                  >
                    <CardContent className="pt-3 pb-3 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {getCategoryIcon(report.category)} {report.neighborhood ?? 'Unknown area'}
                          </p>
                        </div>
                        <PriorityBadge level={report.priority_level} className="shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
