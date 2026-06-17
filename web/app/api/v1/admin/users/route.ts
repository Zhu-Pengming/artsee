import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

const USER_STATUSES = new Set(["active", "banned", "disabled", "pending"]);
const SYSTEM_ROLES = new Set(["user", "admin", "creator", "mentor", "institution"]);

function cleanText(value: string | null) {
  return value?.trim() ?? "";
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("response" in admin) return admin.response;

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const status = cleanText(searchParams.get("status"));
    const role = cleanText(searchParams.get("role"));
    const userRole = cleanText(searchParams.get("user_role"));
    const userType = cleanText(searchParams.get("user_type"));
    const keyword = cleanText(searchParams.get("keyword"));

    let query = createServiceClient()
      .from("user_profiles")
      .select(
        "id,nickname,avatar_url,role,status,is_verified,user_type,user_role,creator_level,content_count,creator_score,created_at,updated_at,last_login_at,banned_at,banned_by_user_id,banned_reason,admin_note",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      if (!USER_STATUSES.has(status)) {
        return NextResponse.json({ success: false, error: "无效用户状态" }, { status: 400 });
      }
      query = query.eq("status", status);
    }
    if (role && role !== "all") {
      if (!SYSTEM_ROLES.has(role)) {
        return NextResponse.json({ success: false, error: "无效系统角色" }, { status: 400 });
      }
      query = query.eq("role", role);
    }
    if (userRole) query = query.eq("user_role", userRole);
    if (userType) query = query.eq("user_type", userType);
    if (keyword) query = query.ilike("nickname", `%${keyword}%`);

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
