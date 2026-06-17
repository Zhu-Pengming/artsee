ALTER TABLE payment_reconciliation_items
  ADD COLUMN IF NOT EXISTS resolution_status TEXT NOT NULL DEFAULT 'open'
    CHECK (resolution_status IN ('open', 'resolved', 'ignored')),
  ADD COLUMN IF NOT EXISTS resolution_note TEXT,
  ADD COLUMN IF NOT EXISTS resolved_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_reconciliation_items_resolution
  ON payment_reconciliation_items (resolution_status, status, created_at DESC);
