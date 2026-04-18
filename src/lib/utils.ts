import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';
import type { IssueCategory, PriorityLevel, ReportStatus } from '@/types';

// ─── Tailwind Class Merge ─────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date Formatting ──────────────────────────────────────────────────────────
export function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

// ─── Score Formatting ─────────────────────────────────────────────────────────
export function formatScore(score: number): string {
  return Math.round(score).toString();
}

export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-red-500';
  if (score >= 70) return 'text-orange-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-green-500';
}

export function getScoreBg(score: number): string {
  if (score >= 85) return 'bg-red-500';
  if (score >= 70) return 'bg-orange-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-green-500';
}

// ─── Priority Helpers ─────────────────────────────────────────────────────────
export function getPriorityColor(level: PriorityLevel): string {
  const map: Record<PriorityLevel, string> = {
    critical: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    high: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
    medium: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
    low: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
  };
  return map[level] ?? map.low;
}

export function getPriorityDot(level: PriorityLevel): string {
  const map: Record<PriorityLevel, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500',
  };
  return map[level] ?? 'bg-gray-400';
}

// ─── Status Helpers ───────────────────────────────────────────────────────────
export function getStatusColor(status: ReportStatus): string {
  const map: Record<ReportStatus, string> = {
    submitted: 'text-blue-600 bg-blue-50 border-blue-200',
    under_review: 'text-purple-600 bg-purple-50 border-purple-200',
    assigned: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    in_progress: 'text-amber-600 bg-amber-50 border-amber-200',
    resolved: 'text-green-600 bg-green-50 border-green-200',
  };
  return map[status] ?? 'text-gray-600 bg-gray-50 border-gray-200';
}

export function getStatusLabel(status: ReportStatus): string {
  const map: Record<ReportStatus, string> = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  };
  return map[status] ?? status;
}

// ─── Category Helpers ─────────────────────────────────────────────────────────
export function getCategoryLabel(category: IssueCategory): string {
  const map: Record<IssueCategory, string> = {
    pothole: 'Pothole',
    broken_streetlight: 'Broken Streetlight',
    damaged_sidewalk: 'Damaged Sidewalk',
    road_obstruction: 'Road Obstruction',
    trash_overflow: 'Trash Overflow',
    illegal_dumping: 'Illegal Dumping',
    broken_sign: 'Broken Sign',
    accessibility_hazard: 'Accessibility Hazard',
    flooding: 'Flooding',
    graffiti: 'Graffiti',
    other: 'Other',
  };
  return map[category] ?? category;
}

export function getCategoryIcon(category: IssueCategory): string {
  const map: Record<IssueCategory, string> = {
    pothole: '🕳️',
    broken_streetlight: '💡',
    damaged_sidewalk: '🚶',
    road_obstruction: '🚧',
    trash_overflow: '🗑️',
    illegal_dumping: '♻️',
    broken_sign: '🪧',
    accessibility_hazard: '♿',
    flooding: '💧',
    graffiti: '🎨',
    other: '📌',
  };
  return map[category] ?? '📌';
}

export const CATEGORY_COLORS: Record<IssueCategory, string> = {
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

// ─── Map Marker Colors by Priority ───────────────────────────────────────────
export function getMarkerColor(priority: PriorityLevel): string {
  const map: Record<PriorityLevel, string> = {
    critical: '#EF4444',
    high: '#F97316',
    medium: '#F59E0B',
    low: '#22C55E',
  };
  return map[priority] ?? '#6B7280';
}

// ─── Misc Utilities ───────────────────────────────────────────────────────────
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function scoreToLevel(score: number): PriorityLevel {
  if (score >= 85) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlam = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlam / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
