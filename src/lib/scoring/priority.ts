import type { IssueCategory, PriorityLevel } from '@/types';
import { haversineDistance, scoreToLevel } from '@/lib/utils';

// ─── Sensitive location types ─────────────────────────────────────────────────
interface SensitiveLocation {
  lat: number;
  lng: number;
  type: 'school' | 'hospital' | 'bus_stop' | 'intersection';
  weight: number; // priority boost multiplier
}

// Demo sensitive locations around our SF-area demo city
const SENSITIVE_LOCATIONS: SensitiveLocation[] = [
  { lat: 37.7751, lng: -122.4150, type: 'school', weight: 1.25 },
  { lat: 37.7730, lng: -122.4180, type: 'hospital', weight: 1.3 },
  { lat: 37.7760, lng: -122.4200, type: 'bus_stop', weight: 1.15 },
  { lat: 37.7720, lng: -122.4160, type: 'intersection', weight: 1.1 },
  { lat: 37.7800, lng: -122.4190, type: 'school', weight: 1.25 },
  { lat: 37.7785, lng: -122.4220, type: 'bus_stop', weight: 1.15 },
  { lat: 37.7695, lng: -122.4130, type: 'hospital', weight: 1.3 },
  { lat: 37.7740, lng: -122.4250, type: 'intersection', weight: 1.1 },
];

// ─── Base scores by category ──────────────────────────────────────────────────
const CATEGORY_BASE_URGENCY: Record<IssueCategory, number> = {
  pothole: 65,
  broken_streetlight: 72,
  damaged_sidewalk: 60,
  road_obstruction: 75,
  trash_overflow: 45,
  illegal_dumping: 58,
  broken_sign: 55,
  accessibility_hazard: 78,
  flooding: 80,
  graffiti: 25,
  other: 40,
};

const CATEGORY_BASE_IMPACT: Record<IssueCategory, number> = {
  pothole: 70,
  broken_streetlight: 68,
  damaged_sidewalk: 62,
  road_obstruction: 78,
  trash_overflow: 50,
  illegal_dumping: 60,
  broken_sign: 52,
  accessibility_hazard: 75,
  flooding: 82,
  graffiti: 20,
  other: 40,
};

// ─── Severity multiplier ──────────────────────────────────────────────────────
const SEVERITY_MULTIPLIER: Record<string, number> = {
  critical: 1.25,
  high: 1.1,
  medium: 1.0,
  low: 0.85,
};

// ─── Main scoring function ─────────────────────────────────────────────────────
export interface ScoringInput {
  category: IssueCategory;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  latitude?: number;
  longitude?: number;
  duplicate_count?: number;
  days_unresolved?: number;
  affects_accessibility?: boolean;
}

export interface ScoringResult {
  urgency_score: number;
  impact_score: number;
  priority_score: number;
  priority_level: PriorityLevel;
  score_breakdown: {
    base_urgency: number;
    base_impact: number;
    sensitive_location_boost: number;
    duplicate_boost: number;
    time_boost: number;
    severity_multiplier: number;
  };
}

export function calculatePriorityScore(input: ScoringInput): ScoringResult {
  const {
    category,
    severity = 'medium',
    latitude,
    longitude,
    duplicate_count = 0,
    days_unresolved = 0,
    affects_accessibility = false,
  } = input;

  // 1. Base scores from category
  let urgency = CATEGORY_BASE_URGENCY[category] ?? 40;
  let impact = CATEGORY_BASE_IMPACT[category] ?? 40;

  // 2. Severity multiplier
  const severityMult = SEVERITY_MULTIPLIER[severity] ?? 1.0;

  // 3. Sensitive location proximity boost
  let locationBoost = 0;
  if (latitude !== undefined && longitude !== undefined) {
    for (const loc of SENSITIVE_LOCATIONS) {
      const dist = haversineDistance(latitude, longitude, loc.lat, loc.lng);
      if (dist < 200) {
        // Within 200m of sensitive location
        locationBoost = Math.max(locationBoost, (loc.weight - 1) * 100);
      } else if (dist < 500) {
        // Within 500m
        locationBoost = Math.max(locationBoost, (loc.weight - 1) * 50);
      }
    }
  }

  // 4. Duplicate reports boost (repeated reports = bigger problem)
  const duplicateBoost = Math.min(duplicate_count * 5, 20);

  // 5. Time unresolved boost (older = more urgent)
  const timeBoost = Math.min(days_unresolved * 1.5, 15);

  // 6. Accessibility boost
  const accessBoost = affects_accessibility ? 10 : 0;

  // Calculate final scores
  urgency = Math.min(100, Math.round(urgency * severityMult + locationBoost + duplicateBoost + timeBoost + accessBoost));
  impact = Math.min(100, Math.round(impact * severityMult + locationBoost * 0.8 + duplicateBoost * 0.5 + accessBoost));

  // Priority is weighted toward urgency
  const priority = Math.min(100, Math.round(urgency * 0.6 + impact * 0.4));

  return {
    urgency_score: urgency,
    impact_score: impact,
    priority_score: priority,
    priority_level: scoreToLevel(priority),
    score_breakdown: {
      base_urgency: CATEGORY_BASE_URGENCY[category] ?? 40,
      base_impact: CATEGORY_BASE_IMPACT[category] ?? 40,
      sensitive_location_boost: locationBoost,
      duplicate_boost: duplicateBoost,
      time_boost: timeBoost,
      severity_multiplier: severityMult,
    },
  };
}

// ─── Duplicate detection ──────────────────────────────────────────────────────
export interface DuplicateCandidate {
  id: string;
  category: IssueCategory;
  latitude: number;
  longitude: number;
  status: string;
}

export function findDuplicates(
  newReport: { category: IssueCategory; latitude: number; longitude: number },
  existingReports: DuplicateCandidate[],
  radiusMeters = 300
): DuplicateCandidate[] {
  return existingReports.filter((report) => {
    // Must be same category
    if (report.category !== newReport.category) return false;
    // Must be unresolved
    if (report.status === 'resolved') return false;
    // Must be within radius
    const dist = haversineDistance(
      newReport.latitude, newReport.longitude,
      report.latitude, report.longitude
    );
    return dist <= radiusMeters;
  });
}

// ─── Equity scoring ───────────────────────────────────────────────────────────
export function calculateEquityScore(
  unresolvedCount: number,
  totalCount: number,
  avgResolutionDays: number | null,
  cityAvgResolutionDays: number
): number {
  if (totalCount === 0) return 0;

  const unresolvedRatio = unresolvedCount / totalCount;
  const resolutionPenalty = avgResolutionDays
    ? Math.max(0, (avgResolutionDays - cityAvgResolutionDays) / cityAvgResolutionDays) * 30
    : 0;

  const score = Math.min(100, Math.round(unresolvedRatio * 70 + resolutionPenalty));
  return score;
}
