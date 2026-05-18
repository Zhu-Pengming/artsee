import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { createPublicReadClient, createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
const PROGRAM_SELECT = `
  id,
  school_id,
  program_name,
  degree_type:normalized_degree_type,
  normalized_degree_type,
  raw_degree_type,
  degree_full_name,
  program_category,
  duration_text,
  duration_months,
  study_mode,
  intake_months,
  requires_portfolio,
  requires_interview,
  requires_personal_statement,
  minimum_education,
  program_overview,
  program_highlights,
  core_courses,
  career_paths,
  admission_summary,
  cover_image_url,
  status,
  is_recommended,
  created_at,
  updated_at,
  schools (
    id,
    name_zh,
    name_en,
    country:raw_country,
    raw_country,
    country_code,
    region_tag,
    city,
    logo_url,
    qs_art_rank:qs_art_design_rank,
    qs_art_design_rank,
    official_website
  ),
  program_admissions ( * ),
  program_fees ( * ),
  program_evaluations ( * )
`;

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!isUuid(id)) {
      return NextResponse.json({ success: false, error: "无效 id" }, { status: 400 });
    }
    const supabase = createPublicReadClient();
    const { data, error } = await supabase
      .from("programs")
      .select(PROGRAM_SELECT)
      .eq("id", id)
      .maybeSingle();
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
    if (!isUuid(id)) {
      return NextResponse.json({ success: false, error: "无效 id" }, { status: 400 });
    }
    const body = await req.json();
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("programs").update(body).eq("id", id).select().single();
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
    if (!isUuid(id)) {
      return NextResponse.json({ success: false, error: "无效 id" }, { status: 400 });
    }
    const supabase = createServiceClient();
    const { error } = await supabase.from("programs").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
