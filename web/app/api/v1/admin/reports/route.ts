import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

const STATUSES = new Set(["pending", "reviewing", "resolved", "dismissed", "all"]);
const PRIORITIES = new Set(["normal", "high", "critical", "all"]);
const TARGET_TYPES = new Set([
  "user",
  "event",
  "opportunity",
  "artwork",
  "artist",
  "post",
  "comment",
  "message",
  "consultation",
  "other",
  "all",
]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const status = cleanText(searchParams.get("status")) || "pending";
    const priority = cleanText(searchParams.get("priority")) || "all";
    const targetType = cleanText(searchParams.get("target_type") ?? searchParams.get("targetType")) || "all";
    const reporterUserId = cleanText(searchParams.get("reporter_user_id") ?? searchParams.get("reporterUserId"));

    if (!STATUSES.has(status)) {
      return NextResponse.json({ success: false, error: "无效举报状态" }, { status: 400 });
    }
    if (!PRIORITIES.has(priority)) {
      return NextResponse.json({ success: false, error: "无效举报优先级" }, { status: 400 });
    }
    if (!TARGET_TYPES.has(targetType)) {
      return NextResponse.json({ success: false, error: "无效举报对象类型" }, { status: 400 });
    }

    const supabase = createServiceClient();
    let query = supabase
      .from("content_reports")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== "all") query = query.eq("status", status);
    if (priority !== "all") query = query.eq("priority", priority);
    if (targetType !== "all") query = query.eq("target_type", targetType);
    if (reporterUserId) query = query.eq("reporter_user_id", reporterUserId);

    const { data, error, count } = await query;
    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      data: data ?? [],
      count: count ?? data?.length ?? 0,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
