ALTER TABLE content_reports
  ADD COLUMN IF NOT EXISTS risk_score INT NOT NULL DEFAULT 0 CHECK (risk_score >= 0),
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('normal', 'high', 'critical')),
  ADD COLUMN IF NOT EXISTS target_report_count INT NOT NULL DEFAULT 1 CHECK (target_report_count >= 1);

CREATE INDEX IF NOT EXISTS idx_content_reports_priority_status_created
  ON content_reports (priority, status, created_at DESC);
