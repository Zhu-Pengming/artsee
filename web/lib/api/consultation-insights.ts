import { createServiceClient } from "./supabase-service";

export type ServiceClient = ReturnType<typeof createServiceClient>;

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const MATCH_LEVELS = new Set(["strong", "moderate", "weak"]);
export const RISK_LEVELS = new Set(["low", "medium", "high"]);

export function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function cleanNullableText(value: unknown) {
  if (value === null) return null;
  const text = cleanText(value);
  return text || null;
}

export function jsonArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export function isMissingInsightTable(error: unknown, tableName: string) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    Boolean(err.message?.includes(tableName))
  );
}

export async function getStudentConsultation(
  supabase: ServiceClient,
  consultationId: string,
  userId: string
) {
  return supabase
    .from("consultations")
    .select("*")
    .eq("id", consultationId)
    .eq("user_id", userId)
    .maybeSingle();
}

export async function getConsultation(
  supabase: ServiceClient,
  consultationId: string
) {
  return supabase
    .from("consultations")
    .select("*")
    .eq("id", consultationId)
    .maybeSingle();
}

export async function getLatestAssessment(
  supabase: ServiceClient,
  consultationId: string
) {
  return supabase
    .from("consultation_assessments")
    .select("*")
    .eq("consultation_id", consultationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

export async function getLatestRecommendation(
  supabase: ServiceClient,
  consultationId: string
) {
  return supabase
    .from("consultation_recommendations")
    .select("*")
    .eq("consultation_id", consultationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}
