CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (
    target_type IN (
      'user',
      'event',
      'opportunity',
      'artwork',
      'artist',
      'post',
      'comment',
      'message',
      'consultation',
      'other'
    )
  ),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (
    reason IN (
      'spam',
      'scam',
      'harassment',
      'copyright',
      'false_info',
      'inappropriate',
      'privacy',
      'other'
    )
  ),
  detail TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_reports_status_created
  ON content_reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_reports_target
  ON content_reports (target_type, target_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_reports_reporter_created
  ON content_reports (reporter_user_id, created_at DESC);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_reports_no_direct_select" ON content_reports;
CREATE POLICY "content_reports_no_direct_select"
  ON content_reports
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "content_reports_no_direct_insert" ON content_reports;
CREATE POLICY "content_reports_no_direct_insert"
  ON content_reports
  FOR INSERT WITH CHECK (false);

CREATE OR REPLACE FUNCTION set_content_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_content_reports_updated_at ON content_reports;
CREATE TRIGGER trg_content_reports_updated_at
  BEFORE UPDATE ON content_reports
  FOR EACH ROW
  EXECUTE FUNCTION set_content_reports_updated_at();
