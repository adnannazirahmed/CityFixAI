'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft, MapPin, Calendar, RefreshCw, Loader2,
  CheckCircle2, Clock, Hash, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIAnalysisCard } from '@/components/shared/ai-analysis-card';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatDateTime, formatRelativeTime, getCategoryIcon, getCategoryLabel, getStatusLabel } from '@/lib/utils';
import { DEMO_REPORTS } from '@/lib/demo-data';
import { getDepartmentByInternalCategory, DEPARTMENT_LABELS } from '@/data/seeclickfix-categories';
import type { Report, ReportStatus } from '@/types';

const IssueMap = dynamic(
  () => import('@/components/map/issue-map').then((m) => m.IssueMap),
  { ssr: false, loading: () => <div className="h-48 bg-gray-100 rounded-xl animate-pulse" /> }
);

const STATUS_OPTIONS: ReportStatus[] = [
  'submitted', 'under_review', 'assigned', 'in_progress', 'resolved',
];

export default function AdminReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    const demo = DEMO_REPORTS.find((r) => r.id === id);
    if (demo) {
      setReport(demo);
      setLoading(false);
      return;
    }

    fetch(`/api/reports/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.data) setReport(d.data); })
      .catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(status: ReportStatus) {
    if (!report) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      if (!res.ok) throw new Error();
      setReport((prev) => prev ? { ...prev, status, updated_at: new Date().toISOString() } : prev);
      toast.success(`Status updated to "${getStatusLabel(status)}"`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6 text-center space-y-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-300" />
        <p className="text-gray-500">Report not found.</p>
        <Link href="/admin/reports">
          <Button variant="outline">Back to Reports</Button>
        </Link>
      </div>
    );
  }

  const routing = getDepartmentByInternalCategory(report.category);

  const marker = [{
    id: report.id, lat: report.latitude, lng: report.longitude,
    title: report.title, category: report.category,
    priority_level: report.priority_level, status: report.status,
    neighborhood: report.neighborhood,
  }];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* ─── Back + Header ────────────────────────────────────────────────── */}
      <div>
        <Link href="/admin/reports">
          <Button variant="ghost" size="sm" className="gap-2 text-gray-500 hover:text-gray-700 mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4" /> All Reports
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900">{report.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge level={report.priority_level} score={report.priority_score} />
              <StatusBadge status={report.status} />
              <span className="text-sm text-gray-500">
                {getCategoryIcon(report.category)} {getCategoryLabel(report.category)}
              </span>
            </div>
          </div>

          {/* Status control */}
          <Card className="shrink-0 w-full sm:w-60 border-gray-200">
            <CardContent className="pt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Update Status</p>
              <Select
                value={report.status}
                onValueChange={(v) => handleStatusChange(v as ReportStatus)}
                disabled={updating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {updating && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Updating…
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ─── Left column ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {report.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resident Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">{report.description}</p>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          <AIAnalysisCard report={report} />

          {/* Location map */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IssueMap markers={marker} height="240px" zoom={15} center={[report.latitude, report.longitude]} />
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                {report.address && <p>📍 {report.address}</p>}
                {report.neighborhood && <p>🏘️ {report.neighborhood}</p>}
                <p className="text-xs text-gray-400">
                  Coordinates: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Right column ───────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <Hash className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Report ID</p>
                  <p className="font-mono text-xs">{report.id}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2 text-gray-600">
                <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Reported</p>
                  <p>{formatDateTime(report.created_at)}</p>
                  <p className="text-xs text-gray-400">{formatRelativeTime(report.created_at)}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2 text-gray-600">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Last Updated</p>
                  <p>{formatDateTime(report.updated_at)}</p>
                </div>
              </div>
              {report.duplicate_cluster_id && (
                <>
                  <Separator />
                  <div className="rounded-lg bg-purple-50 border border-purple-200 p-3">
                    <p className="text-xs font-semibold text-purple-800">
                      🔗 Part of Duplicate Cluster
                    </p>
                    <p className="text-xs text-purple-600 font-mono mt-1">
                      {report.duplicate_cluster_id}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Multiple nearby reports of the same issue type have been grouped together.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Department Routing */}
          <Card className={routing.auto_escalate ? 'border-red-300 bg-red-50' : 'border-blue-100'}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {routing.auto_escalate && <AlertTriangle className="h-4 w-4 text-red-500" />}
                Department Routing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Department</span>
                <span className="font-semibold text-gray-900">{DEPARTMENT_LABELS[routing.department]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SLA Target</span>
                <span className="font-medium">
                  {routing.sla_hours < 24 ? `${routing.sla_hours}h` : `${Math.round(routing.sla_hours / 24)}d`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="text-xs text-gray-600">{routing.label}</span>
              </div>
              {routing.auto_escalate && (
                <div className="rounded-lg bg-red-100 border border-red-200 p-2 text-xs text-red-800 font-semibold mt-1">
                  ⚠️ EMERGENCY — Immediate dispatch required
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image */}
          {report.image_url && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={report.image_url}
                  alt="Report photo"
                  className="w-full rounded-lg object-cover"
                  style={{ maxHeight: '240px' }}
                />
              </CardContent>
            </Card>
          )}

          {/* Timeline placeholder */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { status: 'submitted', date: report.created_at, label: 'Report submitted' },
                  ...(report.status !== 'submitted' ? [
                    { status: report.status, date: report.updated_at, label: `Moved to: ${getStatusLabel(report.status)}` }
                  ] : []),
                ].map((entry, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{entry.label}</p>
                      <p className="text-xs text-gray-400">{formatRelativeTime(entry.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
