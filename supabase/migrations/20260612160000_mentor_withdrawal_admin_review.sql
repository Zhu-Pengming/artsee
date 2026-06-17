ALTER TABLE mentor_withdrawal_requests
  ADD COLUMN IF NOT EXISTS reviewed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS paid_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS review_note TEXT;

CREATE INDEX IF NOT EXISTS idx_mentor_withdrawals_status_created
  ON mentor_withdrawal_requests (status, created_at DESC);
