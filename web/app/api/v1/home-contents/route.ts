import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { createPublicReadClient, createServiceClient } from "@/lib/api/supabase-service";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// GET /api/v1/home-contents - 获取首页内容列表（公开读）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionType = searchParams.get("section_type")?.trim();
    const isActive = searchParams.get("is_active");
    const includeInactive = searchParams.get("include_inactive") === "true";

    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );
    const offset = Math.max(Number.parseInt(searchParams.get("offset") || "0", 10) || 0, 0);

    const supabase = createPublicReadClient();
    let query = supabase
      .from("home_contents")
      .select("*", { count: "exact" })
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (sectionType) {
      query = query.eq("section_type", sectionType);
    }

    if (!includeInactive && isActive !== "false") {
      query = query.eq("is_active", true);
    } else if (isActive === "false") {
      query = query.eq("is_active", false);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      count,
      pagination: { limit, offset },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST /api/v1/home-contents - 创建首页内容（管理员权限）
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("response" in auth) return auth.response;

  try {
    const body = await req.json();

    // 基本校验
    if (!body.section_type) {
      return NextResponse.json({ success: false, error: "section_type 必填" }, { status: 400 });
    }
    const validTypes = ["hero_banner", "hot_hall", "recent_exhibition"];
    if (!validTypes.includes(body.section_type)) {
      return NextResponse.json(
        { success: false, error: `section_type 必须是 ${validTypes.join(", ")} 之一` },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase.from("home_contents").insert(body).select().single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
