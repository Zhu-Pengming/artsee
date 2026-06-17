ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processed', 'failed', 'ignored')),
  error_message TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_events_provider_received
  ON payment_events (provider, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_events_order
  ON payment_events (order_id, received_at DESC);

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_events_no_direct_select" ON payment_events;
CREATE POLICY "payment_events_no_direct_select"
  ON payment_events
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "payment_events_no_direct_insert" ON payment_events;
CREATE POLICY "payment_events_no_direct_insert"
  ON payment_events
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "payment_events_no_direct_update" ON payment_events;
CREATE POLICY "payment_events_no_direct_update"
  ON payment_events
  FOR UPDATE USING (false);

DROP POLICY IF EXISTS "payment_events_no_direct_delete" ON payment_events;
CREATE POLICY "payment_events_no_direct_delete"
  ON payment_events
  FOR DELETE USING (false);
