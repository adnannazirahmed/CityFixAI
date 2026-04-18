// ─── Issue Categories ─────────────────────────────────────────────────────────
export type IssueCategory =
  | 'pothole'
  | 'broken_streetlight'
  | 'damaged_sidewalk'
  | 'road_obstruction'
  | 'trash_overflow'
  | 'illegal_dumping'
  | 'broken_sign'
  | 'accessibility_hazard'
  | 'flooding'
  | 'graffiti'
  | 'other';

// ─── Report Status ────────────────────────────────────────────────────────────
export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'resolved';

// ─── Priority Level ───────────────────────────────────────────────────────────
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

// ─── Main Report Type ─────────────────────────────────────────────────────────
export interface Report {
  id: string;
  user_id?: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  neighborhood: string | null;
  category: IssueCategory;
  ai_summary: string | null;
  urgency_score: number;   // 0-100
  impact_score: number;    // 0-100
  priority_score: number;  // 0-100
  priority_level: PriorityLevel;
  status: ReportStatus;
  duplicate_cluster_id: string | null;
  ai_reasoning: string | null;
  recommended_action: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  created_at: string;
  updated_at: string;
}

// ─── Duplicate Cluster ────────────────────────────────────────────────────────
export interface DuplicateCluster {
  id: string;
  category: IssueCategory;
  center_latitude: number;
  center_longitude: number;
  cluster_size: number;
  status: ReportStatus;
  neighborhood: string | null;
  created_at: string;
  reports?: Report[];
}

// ─── Status History ───────────────────────────────────────────────────────────
export interface StatusHistoryEntry {
  id: string;
  report_id: string;
  old_status: ReportStatus;
  new_status: ReportStatus;
  changed_by: string | null;
  note: string | null;
  changed_at: string;
}

// ─── Area Insight ─────────────────────────────────────────────────────────────
export interface AreaInsight {
  id: string;
  neighborhood: string;
  total_reports: number;
  unresolved_reports: number;
  avg_priority_score: number;
  avg_resolution_days: number | null;
  equity_flag: boolean;
  equity_score: number;   // 0-100 (higher = more underserved)
  top_issues: IssueCategory[];
  updated_at: string;
}

// ─── AI Analysis Result ───────────────────────────────────────────────────────
export interface AIAnalysisResult {
  category: IssueCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  urgency_score: number;
  impact_score: number;
  priority_score: number;
  reasoning: string;
  recommended_action: string;
  title: string;
  confidence: number;          // 0-100: how certain AI is about the classification
  mismatch_detected: boolean;  // photo shows something different from description
  mismatch_note?: string;      // explanation of what was seen vs described
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  total_reports: number;
  open_reports: number;
  resolved_reports: number;
  high_priority_reports: number;
  duplicate_clusters: number;
  avg_resolution_days: number;
  reports_this_week: number;
  resolution_rate: number;
}

// ─── Chart Data ───────────────────────────────────────────────────────────────
export interface CategoryChartData {
  category: string;
  count: number;
  fill: string;
}

export interface TrendChartData {
  date: string;
  submitted: number;
  resolved: number;
}

export interface NeighborhoodChartData {
  neighborhood: string;
  unresolved: number;
  total: number;
  equity_score: number;
}

// ─── Map Marker ───────────────────────────────────────────────────────────────
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: IssueCategory;
  priority_level: PriorityLevel;
  status: ReportStatus;
  neighborhood: string | null;
}

// ─── Report Form Data ─────────────────────────────────────────────────────────
export interface ReportFormData {
  title?: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  neighborhood?: string;
  image?: File;
}

// ─── Admin User ───────────────────────────────────────────────────────────────
export interface AdminUser {
  email: string;
  role: 'admin' | 'resident';
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// ─── Filter State ─────────────────────────────────────────────────────────────
export interface ReportFilters {
  status?: ReportStatus | 'all';
  category?: IssueCategory | 'all';
  priority_level?: PriorityLevel | 'all';
  neighborhood?: string | 'all';
  search?: string;
}
