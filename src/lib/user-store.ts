import {
  applyReportEvent,
  applyResolution,
  newUser,
  rankUsers,
  type ScoreEvent,
  type UserScore,
} from '@/lib/scoring/user-score';

export { BADGES, type ScoreEvent, type UserScore } from '@/lib/scoring/user-score';

// ─── In-memory store ──────────────────────────────────────────────────────────
const SEED_USERS: UserScore[] = [
  {
    user_id: 'maria_j',
    reports_submitted: 12, reports_resolved: 4, accurate_reports: 11, mismatches: 0,
    accuracy_score: 92, activity_score: 220, total_score: 169,
    badges: ['first_report', 'reporter_x5', 'reporter_x10', 'accurate_x3', 'no_mismatches', 'resolved_x3', 'score_100'],
    created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    last_active: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    user_id: 'james_w',
    reports_submitted: 8, reports_resolved: 3, accurate_reports: 7, mismatches: 1,
    accuracy_score: 88, activity_score: 155, total_score: 128,
    badges: ['first_report', 'reporter_x5', 'accurate_x3', 'resolved_x3', 'score_100'],
    created_at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    last_active: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    user_id: 'lucia_gbv',
    reports_submitted: 10, reports_resolved: 2, accurate_reports: 9, mismatches: 0,
    accuracy_score: 90, activity_score: 150, total_score: 126,
    badges: ['first_report', 'reporter_x5', 'reporter_x10', 'accurate_x3', 'no_mismatches', 'score_100'],
    created_at: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
    last_active: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    user_id: 'tom_downtown',
    reports_submitted: 6, reports_resolved: 1, accurate_reports: 5, mismatches: 0,
    accuracy_score: 83, activity_score: 85, total_score: 84,
    badges: ['first_report', 'reporter_x5', 'accurate_x3', 'no_mismatches'],
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    last_active: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    user_id: 'david_g',
    reports_submitted: 3, reports_resolved: 1, accurate_reports: 3, mismatches: 0,
    accuracy_score: 100, activity_score: 55, total_score: 73,
    badges: ['first_report', 'accurate_x3', 'no_mismatches'],
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    last_active: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    user_id: 'sarah_ms',
    reports_submitted: 5, reports_resolved: 0, accurate_reports: 4, mismatches: 1,
    accuracy_score: 80, activity_score: 50, total_score: 62,
    badges: ['first_report', 'reporter_x5', 'accurate_x3'],
    created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    last_active: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    user_id: 'priya_s',
    reports_submitted: 4, reports_resolved: 0, accurate_reports: 3, mismatches: 0,
    accuracy_score: 75, activity_score: 40, total_score: 54,
    badges: ['first_report', 'accurate_x3', 'no_mismatches'],
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    last_active: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
  {
    user_id: 'carlos_c',
    reports_submitted: 2, reports_resolved: 0, accurate_reports: 2, mismatches: 0,
    accuracy_score: 100, activity_score: 20, total_score: 52,
    badges: ['first_report'],
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    last_active: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
  },
];

const users = new Map<string, UserScore>(SEED_USERS.map(u => [u.user_id, u]));

function getOrCreate(user_id: string): UserScore {
  if (!users.has(user_id)) users.set(user_id, newUser(user_id));
  return users.get(user_id)!;
}

export const userStore = {
  get(user_id: string): UserScore {
    return getOrCreate(user_id);
  },

  /** Seed user by id, or null. Never creates a user (used in read-only demo mode). */
  getSeed(user_id: string): UserScore | null {
    return SEED_USERS.find(u => u.user_id === user_id) ?? null;
  },

  recordReport(user_id: string, event: ScoreEvent): UserScore {
    const u = applyReportEvent(getOrCreate(user_id), event);
    users.set(user_id, u);
    return u;
  },

  recordResolution(user_id: string): UserScore {
    const u = applyResolution(getOrCreate(user_id));
    users.set(user_id, u);
    return u;
  },

  leaderboard(limit = 10): UserScore[] {
    return rankUsers(Array.from(users.values()), limit);
  },

  /** Seed users only, ranked (used in read-only demo mode). */
  seedLeaderboard(limit = 10): UserScore[] {
    return rankUsers(SEED_USERS, limit);
  },
};
