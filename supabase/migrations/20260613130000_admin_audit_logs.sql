CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  target_label TEXT,
  request_ip TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor_created
  ON admin_audit_logs (actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_created
  ON admin_audit_logs (target_type, target_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action_created
  ON admin_audit_logs (action, created_at DESC);

ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_audit_logs_no_direct_select" ON admin_audit_logs;
CREATE POLICY "admin_audit_logs_no_direct_select"
  ON admin_audit_logs
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "admin_audit_logs_no_direct_insert" ON admin_audit_logs;
CREATE POLICY "admin_audit_logs_no_direct_insert"
  ON admin_audit_logs
  FOR INSERT WITH CHECK (false);
