import { createServiceClient } from "@/lib/api/supabase-service";

type Supabase = ReturnType<typeof createServiceClient>;
type Row = Record<string, unknown>;

export type FinancialLedgerEntry = {
  entryType: string;
  account: string;
  sourceType: string;
  sourceId: string;
  orderId?: string | null;
  userId?: string | null;
  mentorId?: string | null;
  amount: number;
  currency?: string | null;
  metadata?: Row | null;
  occurredAt?: string | null;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

export async function writeFinancialLedgerEntries(
  supabase: Supabase,
  entries: FinancialLedgerEntry[]
) {
  const rows = entries
    .filter((entry) => Number.isInteger(entry.amount) && entry.amount >= 0)
    .map((entry) => ({
      entry_type: entry.entryType,
      account: entry.account,
      source_type: entry.sourceType,
      source_id: entry.sourceId,
      order_id: entry.orderId || null,
      user_id: entry.userId || null,
      mentor_id: entry.mentorId || null,
      amount: entry.amount,
      currency: cleanText(entry.currency) || "cny",
      metadata: objectValue(entry.metadata),
      occurred_at: entry.occurredAt || new Date().toISOString(),
    }));
  if (rows.length === 0) return;

  try {
    await supabase.from("financial_ledger_entries").insert(rows);
  } catch {
    // Ledger is an audit trail. Legacy environments that have not applied the
    // migration should not block the primary payment/refund/payout operation.
  }
}
