import { createServiceClient } from "@/lib/api/supabase-service";

type Supabase = ReturnType<typeof createServiceClient>;
type Row = Record<string, unknown>;

const MEMBERSHIP_PRODUCT_DURATIONS: Record<string, number> = {
  membership_monthly: 1,
  membership_yearly: 12,
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isMissingMembershipColumn(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "PGRST204" ||
    err.code === "42703" ||
    Boolean(err.message?.includes("membership_status")) ||
    Boolean(err.message?.includes("membership_expires_at")) ||
    Boolean(err.message?.includes("schema cache"))
  );
}

function parseDate(value: unknown) {
  const text = cleanText(value);
  if (!text) return null;
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
}

function addMonths(date: Date, months: number) {
  const result = new Date(date.getTime());
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

export function membershipProductType(order: Row) {
  return cleanText(order.product_type) || cleanText(order.item_type);
}

export function membershipDurationMonths(productType: string) {
  return MEMBERSHIP_PRODUCT_DURATIONS[productType] ?? 0;
}

export function effectiveMembershipStatus(
  row: Row | null | undefined,
  now = new Date()
) {
  const storedStatus = cleanText(row?.membership_status) || "free";
  const expiresAt = parseDate(row?.membership_expires_at);
  if (storedStatus === "member" && expiresAt && expiresAt <= now) {
    return "expired";
  }
  if (storedStatus === "member") return "member";
  if (storedStatus === "expired") return "expired";
  return "free";
}

export async function getUserMembership(supabase: Supabase, userId: string) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id,membership_status,membership_started_at,membership_expires_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingMembershipColumn(error)) {
      return {
        data: {
          status: "free",
          stored_status: "free",
          is_member: false,
          started_at: null,
          expires_at: null,
          schema_ready: false,
        },
        error: null,
      };
    }
    return { data: null, error };
  }

  const status = effectiveMembershipStatus(data as Row | null);
  return {
    data: {
      status,
      stored_status: cleanText(data?.membership_status) || "free",
      is_member: status === "member",
      started_at: cleanText(data?.membership_started_at) || null,
      expires_at: cleanText(data?.membership_expires_at) || null,
      schema_ready: true,
    },
    error: null,
  };
}

export async function applyPaidMembershipOrder(
  supabase: Supabase,
  order: Row,
  paidAtIso: string
) {
  const productType = membershipProductType(order);
  const durationMonths = membershipDurationMonths(productType);
  if (!durationMonths) return { data: null, error: null };

  const userId = cleanText(order.user_id);
  if (!userId) return { data: null, error: new Error("membership order missing user_id") };

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id,membership_status,membership_started_at,membership_expires_at")
    .eq("id", userId)
    .maybeSingle();
  if (profileError && !isMissingMembershipColumn(profileError)) {
    return { data: null, error: profileError };
  }

  const paidAt = parseDate(paidAtIso) ?? new Date();
  const currentExpiresAt = parseDate(profile?.membership_expires_at);
  const base =
    currentExpiresAt && currentExpiresAt > paidAt ? currentExpiresAt : paidAt;
  const nextExpiresAt = addMonths(base, durationMonths).toISOString();
  const startedAt = cleanText(profile?.membership_started_at) || paidAt.toISOString();

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        id: userId,
        membership_status: "member",
        membership_started_at: startedAt,
        membership_expires_at: nextExpiresAt,
      },
      { onConflict: "id" }
    )
    .select("id,membership_status,membership_started_at,membership_expires_at")
    .single();

  return { data, error };
}
