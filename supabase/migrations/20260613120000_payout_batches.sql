CREATE TABLE IF NOT EXISTS payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_no TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'processing', 'paid', 'failed', 'canceled')),
  currency TEXT NOT NULL DEFAULT 'cny' CHECK (currency ~ '^[a-z]{3}$'),
  total_amount INT NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  item_count INT NOT NULL DEFAULT 0 CHECK (item_count >= 0),
  provider TEXT,
  provider_batch_id TEXT,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payout_batch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES payout_batches(id) ON DELETE CASCADE,
  withdrawal_request_id UUID NOT NULL UNIQUE REFERENCES mentor_withdrawal_requests(id) ON DELETE RESTRICT,
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE RESTRICT,
  amount INT NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'cny' CHECK (currency ~ '^[a-z]{3}$'),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'canceled')),
  provider_transfer_id TEXT,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payout_batches_status_created
  ON payout_batches (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payout_items_batch
  ON payout_batch_items (batch_id, status);

CREATE INDEX IF NOT EXISTS idx_payout_items_withdrawal
  ON payout_batch_items (withdrawal_request_id);

DROP TRIGGER IF EXISTS trg_payout_batches_updated_at ON payout_batches;
CREATE TRIGGER trg_payout_batches_updated_at
  BEFORE UPDATE ON payout_batches
  FOR EACH ROW
  EXECUTE FUNCTION set_orders_updated_at();

DROP TRIGGER IF EXISTS trg_payout_items_updated_at ON payout_batch_items;
CREATE TRIGGER trg_payout_items_updated_at
  BEFORE UPDATE ON payout_batch_items
  FOR EACH ROW
  EXECUTE FUNCTION set_orders_updated_at();

ALTER TABLE payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_batch_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payout_batches_no_direct_select" ON payout_batches;
CREATE POLICY "payout_batches_no_direct_select"
  ON payout_batches
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "payout_batches_no_direct_insert" ON payout_batches;
CREATE POLICY "payout_batches_no_direct_insert"
  ON payout_batches
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "payout_batches_no_direct_update" ON payout_batches;
CREATE POLICY "payout_batches_no_direct_update"
  ON payout_batches
  FOR UPDATE USING (false);

DROP POLICY IF EXISTS "payout_items_no_direct_select" ON payout_batch_items;
CREATE POLICY "payout_items_no_direct_select"
  ON payout_batch_items
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "payout_items_no_direct_insert" ON payout_batch_items;
CREATE POLICY "payout_items_no_direct_insert"
  ON payout_batch_items
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "payout_items_no_direct_update" ON payout_batch_items;
CREATE POLICY "payout_items_no_direct_update"
  ON payout_batch_items
  FOR UPDATE USING (false);
