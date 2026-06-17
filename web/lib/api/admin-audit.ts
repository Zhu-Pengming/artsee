import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";

type Supabase = ReturnType<typeof createServiceClient>;
type Row = Record<string, unknown>;

type AuditPayload = {
  actorUserId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  targetLabel?: string | null;
  metadata?: Row | null;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function requestIp(req?: NextRequest | null) {
  if (!req) return null;
  return (
    cleanText(req.headers.get("x-forwarded-for")).split(",")[0]?.trim() ||
    cleanText(req.headers.get("x-real-ip")) ||
    null
  );
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

export async function writeAdminAuditLog(
  supabase: Supabase,
  req: NextRequest | null,
  payload: AuditPayload
) {
  try {
    await supabase.from("admin_audit_logs").insert({
      actor_user_id: payload.actorUserId || null,
      action: payload.action,
      target_type: payload.targetType,
      target_id: payload.targetId || null,
      target_label: payload.targetLabel || null,
      request_ip: requestIp(req),
      user_agent: req?.headers.get("user-agent") ?? null,
      metadata: objectValue(payload.metadata),
    });
  } catch {
    // Audit logs are operational telemetry. They should never make the primary
    // admin action fail if a legacy environment has not applied the migration yet.
  }
}
