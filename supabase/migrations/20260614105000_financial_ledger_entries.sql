CREATE TABLE IF NOT EXISTS financial_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL CHECK (
    entry_type IN (
      'order_payment_gross',
      'platform_fee_accrual',
      'mentor_earning_accrual',
      'order_refund_gross',
      'mentor_earning_reversal',
      'payout_paid'
    )
  ),
  account TEXT NOT NULL CHECK (
    account IN (
      'cash',
      'platform_fee_revenue',
      'mentor_payable',
      'refunds',
      'payouts'
    )
  ),
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  order_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  mentor_id UUID,
  amount INT NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'cny',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_ledger_source
  ON financial_ledger_entries (source_type, source_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_financial_ledger_order
  ON financial_ledger_entries (order_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_financial_ledger_account
  ON financial_ledger_entries (account, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_financial_ledger_mentor
  ON financial_ledger_entries (mentor_id, occurred_at DESC);

ALTER TABLE financial_ledger_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financial_ledger_entries_no_direct_select" ON financial_ledger_entries;
CREATE POLICY "financial_ledger_entries_no_direct_select"
  ON financial_ledger_entries
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "financial_ledger_entries_no_direct_insert" ON financial_ledger_entries;
CREATE POLICY "financial_ledger_entries_no_direct_insert"
  ON financial_ledger_entries
  FOR INSERT WITH CHECK (false);
