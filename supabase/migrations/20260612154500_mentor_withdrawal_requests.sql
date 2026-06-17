CREATE TABLE IF NOT EXISTS mentor_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  requested_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'cny' CHECK (currency ~ '^[a-z]{3}$'),
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'approved', 'rejected', 'paid', 'canceled')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentor_withdrawals_mentor_status
  ON mentor_withdrawal_requests (mentor_id, status, created_at DESC);

DROP TRIGGER IF EXISTS trg_mentor_withdrawals_updated_at ON mentor_withdrawal_requests;
CREATE TRIGGER trg_mentor_withdrawals_updated_at
  BEFORE UPDATE ON mentor_withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_mentors_updated_at();

ALTER TABLE mentor_withdrawal_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_withdrawals_select_owner" ON mentor_withdrawal_requests;
CREATE POLICY "mentor_withdrawals_select_owner"
  ON mentor_withdrawal_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mentors
      WHERE mentors.id = mentor_withdrawal_requests.mentor_id
        AND mentors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "mentor_withdrawals_no_direct_insert" ON mentor_withdrawal_requests;
CREATE POLICY "mentor_withdrawals_no_direct_insert"
  ON mentor_withdrawal_requests
  FOR INSERT
  WITH CHECK (false);
