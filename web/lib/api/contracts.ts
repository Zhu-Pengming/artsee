import { createServiceClient } from "./supabase-service";

type Supabase = ReturnType<typeof createServiceClient>;
type Row = Record<string, unknown>;

export const CONTRACT_STATUSES = new Set(["pending", "confirmed", "disputed"]);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

export function optionalUuid(value: unknown) {
  const text = cleanText(value);
  return text && UUID_RE.test(text) ? text : "";
}

export function isMissingContractsSchema(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "42P01" ||
    err.code === "42703" ||
    err.code === "PGRST204" ||
    err.code === "PGRST205" ||
    Boolean(err.message?.includes("contracts")) ||
    Boolean(err.message?.includes("schema cache"))
  );
}

export function normalizeContract(row: Row, profile?: Row | null) {
  const organization = objectValue(row.organization);
  const organizationMetadata = objectValue(organization.metadata);
  return {
    ...row,
    organization: row.organization
      ? {
          ...organization,
          avatar_url:
            cleanText(organizationMetadata.avatar_url) ||
            cleanText(organizationMetadata.logo_url) ||
            cleanText(organizationMetadata.image_url) ||
            null,
        }
      : null,
    consultation: row.consultation ?? null,
    user_profile: profile ?? row.user_profile ?? null,
  };
}

export async function refreshOrganizationContractCount(
  supabase: Supabase,
  organizationId: string
) {
  if (!organizationId) return { count: null, error: null };

  const { count, error } = await supabase
    .from("contracts")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (error) return { count: null, error };
  if (typeof count !== "number") return { count: null, error: null };

  const { error: updateError } = await supabase
    .from("organizations")
    .update({ contract_count: count })
    .eq("id", organizationId);

  return { count, error: updateError };
}
