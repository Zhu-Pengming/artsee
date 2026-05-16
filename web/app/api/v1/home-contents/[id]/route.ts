import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { createPublicReadClient, createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/v1/home-contents/[id] - 获取单条首页内容（公开读）
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, error: "无效 id" }, { status: 400 });
    }
    const supabase = createPublicReadClient();
    const { data, error } = await supabase.from("home_contents").select("*").eq("id", id).maybeSingle();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ success: false, error: "未找到" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// PATCH /api/v1/home-contents/[id] - 更新首页内容（管理员权限）
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const { id } = await ctx.params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, error: "无效 id" }, { status: 400 });
    }
    const body = await req.json();

    // 如果传了 section_type，做校验
    if (body.section_type) {
      const validTypes = ["hero_banner", "hot_hall", "recent_exhibition"];
      if (!validTypes.includes(body.section_type)) {
        return NextResponse.json(
          { success: false, error: `section_type 必须是 ${validTypes.join(", ")} 之一` },
          { status: 400 }
        );
      }
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase.from("home_contents").update(body).eq("id", id).select().single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// DELETE /api/v1/home-contents/[id] - 删除首页内容（管理员权限）
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(_req);
  if ("response" in admin) return admin.response;

  try {
    const { id } = await ctx.params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, error: "无效 id" }, { status: 400 });
    }
    const supabase = createServiceClient();
    const { error } = await supabase.from("home_contents").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
