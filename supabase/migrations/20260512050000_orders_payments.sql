-- Orders and payment status records.
-- Card details and fund custody stay in the payment provider. We only keep
-- order state and provider identifiers needed for reconciliation.

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  order_no TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'service',
  item_id TEXT,
  amount_total INT NOT NULL CHECK (amount_total > 0),
  currency TEXT NOT NULL DEFAULT 'cny' CHECK (currency ~ '^[a-z]{3}$'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',
      'checkout_created',
      'paid',
      'canceled',
      'expired',
      'failed',
      'refunded'
    )
  ),
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_checkout_session_id TEXT UNIQUE,
  provider_payment_intent_id TEXT,
  provider_customer_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  paid_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders (user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_provider_session ON orders (provider, provider_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON orders (paid_at DESC) WHERE paid_at IS NOT NULL;

CREATE OR REPLACE FUNCTION set_orders_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_orders_updated_at();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'orders_select_own'
  ) THEN
    CREATE POLICY orders_select_own ON orders
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'orders_no_direct_insert'
  ) THEN
    CREATE POLICY orders_no_direct_insert ON orders
      FOR INSERT WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'orders_no_direct_update'
  ) THEN
    CREATE POLICY orders_no_direct_update ON orders
      FOR UPDATE USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'orders_no_direct_delete'
  ) THEN
    CREATE POLICY orders_no_direct_delete ON orders
      FOR DELETE USING (false);
  END IF;
END
$$;

NOTIFY pgrst, 'reload schema';
