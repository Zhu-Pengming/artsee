import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

const VERIFICATION_TYPES = new Set(["student", "artist", "collector", "business"]);
const VERIFICATION_STATUSES = new Set(["pending", "approved", "rejected"]);

type Row = Record<string, unknown>;

function cleanText(value: string | null) {
  return value?.trim() ?? "";
}

function mapById(rows: Row[] | null | undefined) {
  const map = new Map<string, Row>();
  for (const row of rows ?? []) {
    const id = String(row.id || "");
    if (id) map.set(id, row);
  }
  return map;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("response" in admin) return admin.response;

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const type = cleanText(searchParams.get("type"));
    const status = cleanText(searchParams.get("status")) || "pending";
    const userId = cleanText(searchParams.get("user_id"));

    if (type && type !== "all" && !VERIFICATION_TYPES.has(type)) {
      return NextResponse.json({ success: false, error: "无效认证类型" }, { status: 400 });
    }
    if (status && status !== "all" && !VERIFICATION_STATUSES.has(status)) {
      return NextResponse.json({ success: false, error: "无效认证状态" }, { status: 400 });
    }

    const supabase = createServiceClient();
    let query = supabase
      .from("verifications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (type && type !== "all") query = query.eq("type", type);
    if (status && status !== "all") query = query.eq("status", status);
    if (userId) query = query.eq("user_id", userId);

    const { data, error, count } = await query;
    if (error) return errorResponse(error);

    const rows = (data ?? []) as Row[];
    const userIds = Array.from(
      new Set(
        rows
          .map((row) => String(row.user_id || ""))
          .filter(Boolean)
      )
    );

    let usersById = new Map<string, Row>();
    if (userIds.length > 0) {
      const { data: users, error: userError } = await supabase
        .from("user_profiles")
        .select("id,nickname,avatar_url,role,user_type,user_role,is_verified,status")
        .in("id", userIds);
      if (userError) return errorResponse(userError);
      usersById = mapById((users ?? []) as Row[]);
    }

    return NextResponse.json({
      success: true,
      data: rows.map((row) => ({
        ...row,
        user: usersById.get(String(row.user_id || "")) ?? null,
      })),
      count,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
