CREATE TABLE IF NOT EXISTS payment_reconciliation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('orders', 'refunds', 'payouts')),
  status TEXT NOT NULL DEFAULT 'processed'
    CHECK (status IN ('processed', 'failed')),
  source_name TEXT,
  row_count INT NOT NULL DEFAULT 0 CHECK (row_count >= 0),
  matched_count INT NOT NULL DEFAULT 0 CHECK (matched_count >= 0),
  unmatched_count INT NOT NULL DEFAULT 0 CHECK (unmatched_count >= 0),
  mismatch_count INT NOT NULL DEFAULT 0 CHECK (mismatch_count >= 0),
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_reconciliation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES payment_reconciliation_runs(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('orders', 'refunds', 'payouts')),
  external_id TEXT,
  matched_entity_type TEXT CHECK (matched_entity_type IN ('order', 'refund', 'payout_batch')),
  matched_entity_id UUID,
  status TEXT NOT NULL CHECK (status IN ('matched', 'unmatched', 'mismatch', 'auto_applied')),
  amount INT,
  expected_amount INT,
  currency TEXT,
  external_status TEXT,
  error_message TEXT,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_runs_provider_created
  ON payment_reconciliation_runs (provider, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reconciliation_items_run
  ON payment_reconciliation_items (run_id, status);

CREATE INDEX IF NOT EXISTS idx_reconciliation_items_entity
  ON payment_reconciliation_items (matched_entity_type, matched_entity_id);

ALTER TABLE payment_reconciliation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reconciliation_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reconciliation_runs_no_direct_select" ON payment_reconciliation_runs;
CREATE POLICY "reconciliation_runs_no_direct_select"
  ON payment_reconciliation_runs
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "reconciliation_runs_no_direct_insert" ON payment_reconciliation_runs;
CREATE POLICY "reconciliation_runs_no_direct_insert"
  ON payment_reconciliation_runs
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "reconciliation_items_no_direct_select" ON payment_reconciliation_items;
CREATE POLICY "reconciliation_items_no_direct_select"
  ON payment_reconciliation_items
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "reconciliation_items_no_direct_insert" ON payment_reconciliation_items;
CREATE POLICY "reconciliation_items_no_direct_insert"
  ON payment_reconciliation_items
  FOR INSERT WITH CHECK (false);
