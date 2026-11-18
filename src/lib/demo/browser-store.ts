// Demo-mode persistence in the visitor's own browser.
//
// In demo mode the server is read-only and serves seed data only (on serverless,
// instances neither share memory nor survive cold starts, and a shared store would
// leak one visitor's submissions to others). Each visitor's reports, status changes
// and contributor score are kept here in localStorage and merged into API responses
// by `apiFetch`. Outside demo mode `apiFetch` is plain `fetch`.

import { IS_DEMO } from '@/lib/demo/config';
import {
  applyReportEvent,
  applyResolution,
  newUser,
  rankUsers,
  type UserScore,
} from '@/lib/scoring/user-score';
import type { Report, ReportStatus } from '@/types';

const STORAGE_KEY = 'cityfix-demo-v1';
const USER_ID_KEY = 'cityfix_user_id';
const MAX_REPORTS = 15;
const DEFAULT_LIMIT = 100; // matches GET /api/reports

interface StatusOverride {
  status: ReportStatus;
  updated_at: string;
}

interface DemoState {
  reports: Report[];
  statusOverrides: Record<string, StatusOverride>;
  user: UserScore | null;
}

// ─── Storage (every access guarded: storage can be missing, blocked or full) ──

function emptyState(): DemoState {
  return { reports: [], statusOverrides: {}, user: null };
}

function loadState(): DemoState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<DemoState> | null;
    return {
      reports: Array.isArray(parsed?.reports) ? parsed.reports : [],
      statusOverrides:
        parsed?.statusOverrides && typeof parsed.statusOverrides === 'object'
          ? parsed.statusOverrides
          : {},
      user: parsed?.user && typeof parsed.user === 'object' ? parsed.user : null,
    };
  } catch {
    return emptyState();
  }
}

function saveState(state: DemoState): void {
  const reports = state.reports.slice(0, MAX_REPORTS);
  // Photos are base64 data URLs and can blow the quota. On failure, drop the
  // image of the oldest report that still has one and retry.
  for (;;) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, reports }));
      return;
    } catch {
      let idx = -1;
      for (let i = reports.length - 1; i >= 0; i--) {
        if (reports[i].image_url) { idx = i; break; }
      }
      if (idx === -1) return; // nothing left to strip (or storage unavailable)
      reports[idx] = { ...reports[idx], image_url: null };
    }
  }
}

function getVisitorId(): string | null {
  try {
    return window.localStorage.getItem(USER_ID_KEY);
  } catch {
    return null;
  }
}

/** Clears this visitor's demo data (reports, status changes, score). */
export function resetDemo(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ─── Merge helpers ────────────────────────────────────────────────────────────

function withOverride(report: Report, overrides: Record<string, StatusOverride>): Report {
  const o = overrides[report.id];
  return o ? { ...report, status: o.status, updated_at: o.updated_at } : report;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseBody(init?: RequestInit): Record<string, unknown> {
  try {
    return typeof init?.body === 'string' ? JSON.parse(init.body) : {};
  } catch {
    return {};
  }
}

async function readJson(res: Response): Promise<{ data?: unknown; [k: string]: unknown }> {
  return res.clone().json();
}

/** Same filters as GET /api/reports (and store.getAll). */
function filterReports(list: Report[], params: URLSearchParams): Report[] {
  const match = (key: 'status' | 'category' | 'neighborhood' | 'priority_level') => {
    const v = params.get(key);
    return v && v !== 'all' ? v : null;
  };
  const status = match('status');
  const category = match('category');
  const neighborhood = match('neighborhood');
  const priority = match('priority_level');
  const limit = parseInt(params.get('limit') ?? String(DEFAULT_LIMIT));

  return list
    .filter(r => !status || r.status === status)
    .filter(r => !category || r.category === category)
    .filter(r => !neighborhood || r.neighborhood === neighborhood)
    .filter(r => !priority || r.priority_level === priority)
    .slice(0, Number.isNaN(limit) ? DEFAULT_LIMIT : limit);
}

// ─── Route handlers ───────────────────────────────────────────────────────────

async function listReports(url: URL, init?: RequestInit): Promise<Response> {
  // Fetch all seed reports unfiltered, then filter here, so a status override
  // can move a report into or out of a filtered view.
  const res = await fetch('/api/reports?limit=1000', init);
  if (!res.ok) return res;
  const json = await readJson(res);
  const seed = Array.isArray(json.data) ? (json.data as Report[]) : [];
  const state = loadState();

  const seen = new Set<string>();
  const merged: Report[] = [];
  for (const r of [...state.reports, ...seed]) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    merged.push(withOverride(r, state.statusOverrides));
  }
  return jsonResponse({ ...json, data: filterReports(merged, url.searchParams) });
}

async function getReport(id: string, input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  const state = loadState();
  if (res.status === 404) {
    const own = state.reports.find(r => r.id === id);
    if (!own) return res;
    return jsonResponse({ data: withOverride(own, state.statusOverrides), error: null });
  }
  if (!res.ok) return res;
  const json = await readJson(res);
  const report = json.data as Report | null;
  if (!report) return res;
  return jsonResponse({ ...json, data: withOverride(report, state.statusOverrides) });
}

async function createReport(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (!res.ok) return res;
  const json = await readJson(res);
  const report = json.data as Report | null;
  if (!report) return res;

  const body = parseBody(init);
  const userId = (typeof body.user_id === 'string' && body.user_id) || getVisitorId();
  const saved: Report = { ...report, user_id: userId ?? null };

  const state = loadState();
  state.reports = [saved, ...state.reports.filter(r => r.id !== saved.id)];

  let userScore: UserScore | null = null;
  const event = json.scoreEvent as { confidence?: unknown; mismatch_detected?: unknown } | undefined;
  if (userId && event) {
    const base = state.user?.user_id === userId ? state.user : newUser(userId);
    userScore = applyReportEvent(base, {
      type: 'report_submitted',
      confidence: Number(event.confidence) || 0,
      mismatch_detected: Boolean(event.mismatch_detected),
    });
    state.user = userScore;
  }

  saveState(state);
  return jsonResponse({ ...json, data: saved, userScore }, res.status);
}

async function updateReport(id: string, input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (!res.ok) return res;
  const json = await readJson(res);
  const serverData = (json.data ?? {}) as Partial<Report>;
  const status = (serverData.status ?? parseBody(init).status) as ReportStatus | undefined;
  if (!status) return res;

  const state = loadState();
  const own = state.reports.find(r => r.id === id);
  const previous = state.statusOverrides[id]?.status ?? own?.status ?? null;
  const override = { status, updated_at: serverData.updated_at ?? new Date().toISOString() };
  state.statusOverrides[id] = override;

  // Resolution points for the visitor's own reports (once per transition to resolved).
  if (
    status === 'resolved' &&
    previous !== 'resolved' &&
    own?.user_id &&
    state.user?.user_id === own.user_id
  ) {
    state.user = applyResolution(state.user);
  }

  saveState(state);
  const data = own ? { ...own, ...override } : serverData;
  return jsonResponse({ ...json, data });
}

async function getUser(id: string, input: string, init?: RequestInit): Promise<Response> {
  const state = loadState();
  if (state.user && state.user.user_id === id) {
    return jsonResponse({ data: state.user, error: null });
  }
  return fetch(input, init);
}

async function getLeaderboard(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (!res.ok) return res;
  const { user } = loadState();
  if (!user) return res;
  const json = await readJson(res);
  const others = (Array.isArray(json.data) ? (json.data as UserScore[]) : [])
    .filter(u => u.user_id !== user.user_id);
  return jsonResponse({ ...json, data: rankUsers([...others, user]) });
}

// ─── Public fetch wrapper ─────────────────────────────────────────────────────

/**
 * Drop-in replacement for `fetch` for this app's own `/api/...` routes.
 * Outside demo mode (or on the server) it is exactly `fetch`. In demo mode it
 * calls the server and merges in this visitor's localStorage overlay, returning
 * a real `Response`.
 */
export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  if (!IS_DEMO || typeof window === 'undefined') return fetch(input, init);

  const url = new URL(input, window.location.origin);
  const method = (init?.method ?? 'GET').toUpperCase();
  const path = url.pathname.replace(/\/+$/, '');
  const reportMatch = path.match(/^\/api\/reports\/([^/]+)$/);
  const userMatch = path.match(/^\/api\/users\/([^/]+)$/);

  if (path === '/api/reports' && method === 'GET') return listReports(url, init);
  if (path === '/api/reports' && method === 'POST') return createReport(input, init);
  if (reportMatch && method === 'GET') return getReport(decodeURIComponent(reportMatch[1]), input, init);
  if (reportMatch && method === 'PATCH') return updateReport(decodeURIComponent(reportMatch[1]), input, init);
  if (userMatch && method === 'GET') return getUser(decodeURIComponent(userMatch[1]), input, init);
  if (path === '/api/leaderboard' && method === 'GET') return getLeaderboard(input, init);

  return fetch(input, init);
}
