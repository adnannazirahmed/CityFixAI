import { DEMO_REPORTS } from '@/lib/demo-data';
import type { Report, ReportStatus } from '@/types';

// ─── In-memory report store ───────────────────────────────────────────────────
// Pre-seeded with 25 demo reports. New submissions are prepended.
// Persists for the lifetime of the Next.js server process.

const _reports: Report[] = [...DEMO_REPORTS];

export const store = {
  getAll(filters?: {
    status?: string;
    category?: string;
    neighborhood?: string;
    priority_level?: string;
    limit?: number;
  }): Report[] {
    let list = [..._reports];
    if (filters?.status && filters.status !== 'all') {
      list = list.filter(r => r.status === filters.status);
    }
    if (filters?.category && filters.category !== 'all') {
      list = list.filter(r => r.category === filters.category);
    }
    if (filters?.neighborhood && filters.neighborhood !== 'all') {
      list = list.filter(r => r.neighborhood === filters.neighborhood);
    }
    if (filters?.priority_level && filters.priority_level !== 'all') {
      list = list.filter(r => r.priority_level === filters.priority_level);
    }
    return list.slice(0, filters?.limit ?? 200);
  },

  getById(id: string): Report | null {
    return _reports.find(r => r.id === id) ?? null;
  },

  add(report: Report): void {
    _reports.unshift(report); // newest first
  },

  updateStatus(id: string, status: ReportStatus): Report | null {
    const idx = _reports.findIndex(r => r.id === id);
    if (idx === -1) return null;
    _reports[idx] = { ..._reports[idx], status, updated_at: new Date().toISOString() };
    return _reports[idx];
  },
};
