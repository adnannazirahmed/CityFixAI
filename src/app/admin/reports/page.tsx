'use client';

import { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportsTable } from '@/components/dashboard/reports-table';
import { toast } from 'sonner';
import { DEMO_REPORTS } from '@/lib/demo-data';
import { getStatusLabel } from '@/lib/utils';
import type { Report, ReportStatus } from '@/types';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>(DEMO_REPORTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports?limit=200')
      .then((r) => r.json())
      .then((d) => { if (d.data) setReports(d.data); })
      .catch(() => {/* keep demo data */})
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-black text-gray-900">All Reports</h1>
          <p className="text-sm text-gray-500">
            {reports.length} total reports · Use filters to narrow down
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <ReportsTable
              reports={reports}
              onStatusChange={handleStatusChange}
              showFilters={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
