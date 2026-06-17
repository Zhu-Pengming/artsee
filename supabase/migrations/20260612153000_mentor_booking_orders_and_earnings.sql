ALTER TABLE mentor_bookings
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'checkout_created', 'paid', 'refunded', 'waived'));

CREATE INDEX IF NOT EXISTS idx_mentor_bookings_order_id
  ON mentor_bookings (order_id);

CREATE TABLE IF NOT EXISTS mentor_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  mentor_booking_id UUID NOT NULL UNIQUE REFERENCES mentor_bookings(id) ON DELETE CASCADE,
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  gross_amount INT NOT NULL CHECK (gross_amount >= 0),
  platform_fee_amount INT NOT NULL DEFAULT 0 CHECK (platform_fee_amount >= 0),
  net_amount INT NOT NULL CHECK (net_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'cny' CHECK (currency ~ '^[a-z]{3}$'),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'available', 'withdrawn', 'refunded', 'canceled')),
  available_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentor_earnings_mentor_status
  ON mentor_earnings (mentor_id, status, created_at DESC);

DROP TRIGGER IF EXISTS trg_mentor_earnings_updated_at ON mentor_earnings;
CREATE TRIGGER trg_mentor_earnings_updated_at
  BEFORE UPDATE ON mentor_earnings
  FOR EACH ROW
  EXECUTE FUNCTION set_mentors_updated_at();

ALTER TABLE mentor_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_earnings_select_owner" ON mentor_earnings;
CREATE POLICY "mentor_earnings_select_owner"
  ON mentor_earnings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mentors
      WHERE mentors.id = mentor_earnings.mentor_id
        AND mentors.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "mentor_earnings_no_direct_insert" ON mentor_earnings;
CREATE POLICY "mentor_earnings_no_direct_insert"
  ON mentor_earnings
  FOR INSERT
  WITH CHECK (false);
