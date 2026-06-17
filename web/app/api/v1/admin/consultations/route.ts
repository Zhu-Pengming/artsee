import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

const STATUSES = new Set(["new", "pending", "active", "closed", "converted"]);

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("response" in admin) return admin.response;

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status")?.trim();
    const targetType = searchParams.get("target_type")?.trim();
    const targetId = searchParams.get("target_id")?.trim();
    const supabase = createServiceClient();

    let query = supabase
      .from("consultations")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && STATUSES.has(status)) query = query.eq("status", status);
    if (targetType) query = query.eq("target_type", targetType);
    if (targetId) query = query.eq("target_id", targetId);

    const { data, error, count } = await query;
    if (error) return errorResponse(error);
    return NextResponse.json({
      success: true,
      data: data ?? [],
      count,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
