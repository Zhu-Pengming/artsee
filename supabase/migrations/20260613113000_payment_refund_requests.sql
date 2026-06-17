CREATE TABLE IF NOT EXISTS payment_refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'cny' CHECK (currency ~ '^[a-z]{3}$'),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'approved', 'rejected', 'processing', 'succeeded', 'failed', 'canceled')),
  provider TEXT,
  provider_refund_id TEXT,
  reviewed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_note TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_refunds_order
  ON payment_refund_requests (order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_refunds_user_status
  ON payment_refund_requests (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_refunds_status_created
  ON payment_refund_requests (status, created_at DESC);

DROP TRIGGER IF EXISTS trg_payment_refunds_updated_at ON payment_refund_requests;
CREATE TRIGGER trg_payment_refunds_updated_at
  BEFORE UPDATE ON payment_refund_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_orders_updated_at();

ALTER TABLE payment_refund_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_refunds_select_own" ON payment_refund_requests;
CREATE POLICY "payment_refunds_select_own"
  ON payment_refund_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "payment_refunds_no_direct_insert" ON payment_refund_requests;
CREATE POLICY "payment_refunds_no_direct_insert"
  ON payment_refund_requests
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "payment_refunds_no_direct_update" ON payment_refund_requests;
CREATE POLICY "payment_refunds_no_direct_update"
  ON payment_refund_requests
  FOR UPDATE USING (false);

DROP POLICY IF EXISTS "payment_refunds_no_direct_delete" ON payment_refund_requests;
CREATE POLICY "payment_refunds_no_direct_delete"
  ON payment_refund_requests
  FOR DELETE USING (false);
