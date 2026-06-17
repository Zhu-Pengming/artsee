import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Row = Record<string, unknown>;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cronSecret() {
  return (
    process.env.SUBSCRIPTION_EXPIRATION_CRON_SECRET ||
    process.env.ADMIN_MAINTENANCE_CRON_SECRET ||
    ""
  );
}

async function authorize(req: NextRequest) {
  const configuredSecret = cronSecret();
  const requestSecret = cleanText(req.headers.get("x-artiqore-cron-secret"));
  if (configuredSecret && requestSecret === configuredSecret) {
    return { ok: true, actor: "cron" };
  }

  const admin = await requireAdmin(req);
  if ("response" in admin) return { ok: false, response: admin.response };
  return { ok: true, actor: admin.user.id };
}

async function expireMemberships(nowIso: string) {
  const { data, error } = await createServiceClient()
    .from("user_profiles")
    .update({ membership_status: "expired" })
    .eq("membership_status", "member")
    .lt("membership_expires_at", nowIso)
    .select("id");
  if (error) return { data: null, error };
  return { data: (data ?? []) as Row[], error: null };
}

async function expireOrganizations(nowIso: string) {
  const { data, error } = await createServiceClient()
    .from("organizations")
    .update({ subscription_status: "expired" })
    .eq("subscription_status", "active")
    .lt("subscription_expires_at", nowIso)
    .select("id");
  if (error) return { data: null, error };
  return { data: (data ?? []) as Row[], error: null };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorize(req);
    if (!auth.ok) return auth.response;

    const nowIso = new Date().toISOString();
    const memberships = await expireMemberships(nowIso);
    if (memberships.error) return errorResponse(memberships.error);

    const organizations = await expireOrganizations(nowIso);
    if (organizations.error) return errorResponse(organizations.error);

    return NextResponse.json({
      success: true,
      ran_at: nowIso,
      actor: auth.actor,
      data: {
        expired_memberships: memberships.data?.length ?? 0,
        expired_organizations: organizations.data?.length ?? 0,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
