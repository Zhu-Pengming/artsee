import { createServiceClient } from "@/lib/api/supabase-service";

type Supabase = ReturnType<typeof createServiceClient>;
type Row = Record<string, unknown>;

const ORG_SUBSCRIPTION_PRODUCT = "org_subscription";
const ORG_SUBSCRIPTION_MONTHS = 12;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
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

function orderProductType(order: Row) {
  return cleanText(order.product_type) || cleanText(order.item_type);
}

function organizationIdFromOrder(order: Row) {
  const metadata = objectValue(order.metadata);
  return cleanText(order.item_id) || cleanText(metadata.organization_id);
}

export function isOrganizationSubscriptionOrder(order: Row) {
  return orderProductType(order) === ORG_SUBSCRIPTION_PRODUCT;
}

export function effectiveOrganizationSubscriptionStatus(
  row: Row | null | undefined,
  now = new Date()
) {
  const storedStatus = cleanText(row?.subscription_status) || "inactive";
  const expiresAt = parseDate(row?.subscription_expires_at);
  if (storedStatus === "active" && expiresAt && expiresAt <= now) {
    return "expired";
  }
  if (storedStatus === "active") return "active";
  if (storedStatus === "expired") return "expired";
  return "inactive";
}

export async function applyPaidOrganizationSubscriptionOrder(
  supabase: Supabase,
  order: Row,
  paidAtIso: string
) {
  if (!isOrganizationSubscriptionOrder(order)) return { data: null, error: null };

  const organizationId = organizationIdFromOrder(order);
  if (!organizationId) {
    return {
      data: null,
      error: new Error("organization subscription order missing organization_id"),
    };
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id,subscription_status,subscription_started_at,subscription_expires_at")
    .eq("id", organizationId)
    .maybeSingle();
  if (organizationError) return { data: null, error: organizationError };
  if (!organization) {
    return { data: null, error: new Error("organization not found") };
  }

  const paidAt = parseDate(paidAtIso) ?? new Date();
  const currentExpiresAt = parseDate(organization.subscription_expires_at);
  const base =
    currentExpiresAt && currentExpiresAt > paidAt ? currentExpiresAt : paidAt;
  const nextExpiresAt = addMonths(base, ORG_SUBSCRIPTION_MONTHS).toISOString();
  const startedAt =
    cleanText(organization.subscription_started_at) || paidAt.toISOString();

  const { data, error } = await supabase
    .from("organizations")
    .update({
      subscription_status: "active",
      subscription_started_at: startedAt,
      subscription_expires_at: nextExpiresAt,
      subscription_plan: "yearly",
    })
    .eq("id", organizationId)
    .select(
      "id,subscription_status,subscription_started_at,subscription_expires_at,subscription_plan"
    )
    .single();

  return { data, error };
}
