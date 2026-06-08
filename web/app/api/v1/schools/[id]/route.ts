import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!id || typeof id !== "string" || !UUID_RE.test(id)) {
      return NextResponse.json({ success: false, error: "无效 id" }, { status: 400 });
    }
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("schools").select("*").eq("id", id).maybeSingle();
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

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;
  try {
    const { id } = await ctx.params;
    if (!id || typeof id !== "string" || !UUID_RE.test(id)) {
      return NextResponse.json({ success: false, error: "无效 id" }, { status: 400 });
    }
    const body = await req.json();
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("schools").update(body).eq("id", id).select().single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(_req);
  if ("response" in admin) return admin.response;
  try {
    const { id } = await ctx.params;
    if (!id || typeof id !== "string" || !UUID_RE.test(id)) {
      return NextResponse.json({ success: false, error: "无效 id" }, { status: 400 });
    }
    const supabase = createServiceClient();
    const { error } = await supabase.from("schools").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
