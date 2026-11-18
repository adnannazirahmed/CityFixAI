// Pure contributor-scoring logic. No server-only imports, so this is safe to use
// from client code (e.g. the demo-mode browser store) as well as the server.

export interface UserScore {
  user_id: string;
  reports_submitted: number;
  reports_resolved: number;
  accurate_reports: number;   // high confidence + no mismatch
  mismatches: number;
  accuracy_score: number;     // 0-100
  activity_score: number;
  total_score: number;
  badges: string[];
  created_at: string;
  last_active: string;
}

export interface ScoreEvent {
  type: 'report_submitted';
  confidence: number;
  mismatch_detected: boolean;
}

// ─── Badge definitions ────────────────────────────────────────────────────────
export const BADGES: { id: string; label: string; emoji: string; check: (u: UserScore) => boolean }[] = [
  { id: 'first_report',    label: 'First Report',       emoji: '🌱', check: u => u.reports_submitted >= 1 },
  { id: 'reporter_x5',    label: 'Active Reporter',     emoji: '📋', check: u => u.reports_submitted >= 5 },
  { id: 'reporter_x10',   label: 'Community Watch',     emoji: '👀', check: u => u.reports_submitted >= 10 },
  { id: 'accurate_x3',    label: 'Sharp Eye',           emoji: '🎯', check: u => u.accurate_reports >= 3 },
  { id: 'no_mismatches',  label: 'Verified Reporter',   emoji: '✅', check: u => u.reports_submitted >= 3 && u.mismatches === 0 },
  { id: 'resolved_x3',    label: 'Problem Solver',      emoji: '🔧', check: u => u.reports_resolved >= 3 },
  { id: 'score_100',      label: 'Top Contributor',     emoji: '⭐', check: u => u.total_score >= 100 },
];

export function computeBadges(u: UserScore): string[] {
  return BADGES.filter(b => b.check(u)).map(b => b.id);
}

export function computeScores(u: UserScore): Pick<UserScore, 'accuracy_score' | 'activity_score' | 'total_score'> {
  const total = u.reports_submitted;
  const accuracy_score = total === 0 ? 100 : Math.round((u.accurate_reports / total) * 100);
  const activity_score = u.reports_submitted * 10 + u.reports_resolved * 25;
  const total_score = Math.round(activity_score * 0.6 + accuracy_score * 0.4);
  return { accuracy_score, activity_score, total_score };
}

export function newUser(user_id: string): UserScore {
  const now = new Date().toISOString();
  return {
    user_id,
    reports_submitted: 0,
    reports_resolved: 0,
    accurate_reports: 0,
    mismatches: 0,
    accuracy_score: 100,
    activity_score: 0,
    total_score: 0,
    badges: [],
    created_at: now,
    last_active: now,
  };
}

/** Recompute derived scores, then badges (badges depend on total_score). */
function rescore(u: UserScore): UserScore {
  const scored = { ...u, ...computeScores(u) };
  return { ...scored, badges: computeBadges(scored) };
}

/** Returns a new UserScore with a submitted report applied. Does not mutate `user`. */
export function applyReportEvent(user: UserScore, event: ScoreEvent): UserScore {
  const u: UserScore = {
    ...user,
    reports_submitted: user.reports_submitted + 1,
    last_active: new Date().toISOString(),
  };
  if (event.mismatch_detected) {
    u.mismatches += 1;
  } else if (event.confidence >= 75) {
    u.accurate_reports += 1;
  }
  return rescore(u);
}

/** Returns a new UserScore with one resolved report applied. Does not mutate `user`. */
export function applyResolution(user: UserScore): UserScore {
  return rescore({
    ...user,
    reports_resolved: user.reports_resolved + 1,
    last_active: new Date().toISOString(),
  });
}

export function rankUsers(users: UserScore[], limit?: number): UserScore[] {
  const sorted = [...users].sort((a, b) => b.total_score - a.total_score);
  return limit === undefined ? sorted : sorted.slice(0, limit);
}
