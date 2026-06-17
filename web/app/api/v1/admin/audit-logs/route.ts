import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function intParam(value: string | null, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, max);
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const { searchParams } = new URL(req.url);
    const action = cleanText(searchParams.get("action"));
    const targetType = cleanText(searchParams.get("target_type") ?? searchParams.get("targetType"));
    const actorUserId = cleanText(searchParams.get("actor_user_id") ?? searchParams.get("actorUserId"));
    const limit = intParam(searchParams.get("limit"), 60, 120);
    const offset = intParam(searchParams.get("offset"), 0, 5000);

    const supabase = createServiceClient();
    let query = supabase
      .from("admin_audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (action) query = query.eq("action", action);
    if (targetType) query = query.eq("target_type", targetType);
    if (actorUserId) query = query.eq("actor_user_id", actorUserId);

    const { data, error, count } = await query;
    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      data: data ?? [],
      count: count ?? data?.length ?? 0,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
