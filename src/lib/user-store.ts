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
const BADGES: { id: string; label: string; emoji: string; check: (u: UserScore) => boolean }[] = [
  { id: 'first_report',    label: 'First Report',       emoji: '🌱', check: u => u.reports_submitted >= 1 },
  { id: 'reporter_x5',    label: 'Active Reporter',     emoji: '📋', check: u => u.reports_submitted >= 5 },
  { id: 'reporter_x10',   label: 'Community Watch',     emoji: '👀', check: u => u.reports_submitted >= 10 },
  { id: 'accurate_x3',    label: 'Sharp Eye',           emoji: '🎯', check: u => u.accurate_reports >= 3 },
  { id: 'no_mismatches',  label: 'Verified Reporter',   emoji: '✅', check: u => u.reports_submitted >= 3 && u.mismatches === 0 },
  { id: 'resolved_x3',    label: 'Problem Solver',      emoji: '🔧', check: u => u.reports_resolved >= 3 },
  { id: 'score_100',      label: 'Top Contributor',     emoji: '⭐', check: u => u.total_score >= 100 },
];

function computeBadges(u: UserScore): string[] {
  return BADGES.filter(b => b.check(u)).map(b => b.id);
}

function computeScores(u: UserScore): Pick<UserScore, 'accuracy_score' | 'activity_score' | 'total_score'> {
  const total = u.reports_submitted;
  const accuracy_score = total === 0 ? 100 : Math.round((u.accurate_reports / total) * 100);
  const activity_score = u.reports_submitted * 10 + u.reports_resolved * 25;
  const total_score = Math.round(activity_score * 0.6 + accuracy_score * 0.4);
  return { accuracy_score, activity_score, total_score };
}

// ─── In-memory store ──────────────────────────────────────────────────────────
const users = new Map<string, UserScore>();

function getOrCreate(user_id: string): UserScore {
  if (!users.has(user_id)) {
    users.set(user_id, {
      user_id,
      reports_submitted: 0,
      reports_resolved: 0,
      accurate_reports: 0,
      mismatches: 0,
      accuracy_score: 100,
      activity_score: 0,
      total_score: 0,
      badges: [],
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    });
  }
  return users.get(user_id)!;
}

export const userStore = {
  get(user_id: string): UserScore {
    return getOrCreate(user_id);
  },

  recordReport(user_id: string, event: ScoreEvent): UserScore {
    const u = getOrCreate(user_id);
    u.reports_submitted += 1;
    u.last_active = new Date().toISOString();

    if (event.mismatch_detected) {
      u.mismatches += 1;
    } else if (event.confidence >= 75) {
      u.accurate_reports += 1;
    }

    const scores = computeScores(u);
    u.accuracy_score = scores.accuracy_score;
    u.activity_score = scores.activity_score;
    u.total_score = scores.total_score;
    u.badges = computeBadges(u);

    users.set(user_id, u);
    return u;
  },

  recordResolution(user_id: string): UserScore {
    const u = getOrCreate(user_id);
    u.reports_resolved += 1;
    u.last_active = new Date().toISOString();

    const scores = computeScores(u);
    u.accuracy_score = scores.accuracy_score;
    u.activity_score = scores.activity_score;
    u.total_score = scores.total_score;
    u.badges = computeBadges(u);

    users.set(user_id, u);
    return u;
  },

  leaderboard(limit = 10): UserScore[] {
    const all: UserScore[] = [];
    users.forEach(u => all.push(u));
    return all.sort((a, b) => b.total_score - a.total_score).slice(0, limit);
  },
};

export { BADGES };
