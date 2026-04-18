-- ─────────────────────────────────────────────────────────────────────────────
-- CityFix AI — Initial Database Schema
-- Run this in your Supabase SQL Editor or via Supabase CLI
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Duplicate Clusters ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS duplicate_clusters (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category          TEXT NOT NULL,
  center_latitude   DOUBLE PRECISION NOT NULL,
  center_longitude  DOUBLE PRECISION NOT NULL,
  cluster_size      INTEGER NOT NULL DEFAULT 1,
  status            TEXT NOT NULL DEFAULT 'submitted',
  neighborhood      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Reports ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID,
  title                 TEXT NOT NULL,
  description           TEXT,
  image_url             TEXT,
  latitude              DOUBLE PRECISION NOT NULL,
  longitude             DOUBLE PRECISION NOT NULL,
  address               TEXT,
  neighborhood          TEXT,
  category              TEXT NOT NULL DEFAULT 'other',
  severity              TEXT,
  ai_summary            TEXT,
  urgency_score         INTEGER NOT NULL DEFAULT 50 CHECK (urgency_score >= 0 AND urgency_score <= 100),
  impact_score          INTEGER NOT NULL DEFAULT 50 CHECK (impact_score >= 0 AND impact_score <= 100),
  priority_score        INTEGER NOT NULL DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100),
  priority_level        TEXT NOT NULL DEFAULT 'medium',
  ai_reasoning          TEXT,
  recommended_action    TEXT,
  status                TEXT NOT NULL DEFAULT 'submitted',
  duplicate_cluster_id  UUID REFERENCES duplicate_clusters(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Report Status History ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id   UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  old_status  TEXT,
  new_status  TEXT NOT NULL,
  changed_by  TEXT,
  note        TEXT,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Area Insights ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS area_insights (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  neighborhood          TEXT NOT NULL UNIQUE,
  total_reports         INTEGER NOT NULL DEFAULT 0,
  unresolved_reports    INTEGER NOT NULL DEFAULT 0,
  avg_priority_score    NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_resolution_days   NUMERIC(8,2),
  equity_flag           BOOLEAN NOT NULL DEFAULT FALSE,
  equity_score          INTEGER NOT NULL DEFAULT 0,
  top_issues            TEXT[] NOT NULL DEFAULT '{}',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reports_status          ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority_level  ON reports(priority_level);
CREATE INDEX IF NOT EXISTS idx_reports_category        ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_neighborhood    ON reports(neighborhood);
CREATE INDEX IF NOT EXISTS idx_reports_cluster         ON reports(duplicate_cluster_id);
CREATE INDEX IF NOT EXISTS idx_reports_created         ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_location        ON reports USING gist (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX IF NOT EXISTS idx_status_history_report   ON report_status_history(report_id);

-- ─── Updated_at auto-update trigger ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Increment cluster size RPC ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_cluster_size(cluster_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE duplicate_clusters
  SET cluster_size = cluster_size + 1
  WHERE id = cluster_id;
END;
$$ LANGUAGE plpgsql;

-- ─── RLS Policies ─────────────────────────────────────────────────────────────
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_insights ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads for public map/status pages
CREATE POLICY "public_read_reports" ON reports
  FOR SELECT USING (true);

CREATE POLICY "public_insert_reports" ON reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_read_clusters" ON duplicate_clusters
  FOR SELECT USING (true);

CREATE POLICY "public_read_insights" ON area_insights
  FOR SELECT USING (true);

CREATE POLICY "public_read_history" ON report_status_history
  FOR SELECT USING (true);

-- Service role can do everything (used by admin API routes with service key)
CREATE POLICY "service_all_reports" ON reports
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_all_clusters" ON duplicate_clusters
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_all_history" ON report_status_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_all_insights" ON area_insights
  FOR ALL USING (auth.role() = 'service_role');

-- ─── Storage bucket ───────────────────────────────────────────────────────────
-- Run this separately in Supabase Dashboard > Storage, or via CLI:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('report-images', 'report-images', true);
