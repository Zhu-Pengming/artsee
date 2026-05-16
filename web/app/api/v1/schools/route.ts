import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { createPublicReadClient, createServiceClient } from "@/lib/api/supabase-service";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const SCHOOL_PUBLIC_SELECT = `
  id,
  name_zh,
  name_en,
  country:raw_country,
  raw_country,
  country_code,
  region_tag,
  city,
  school_type,
  qs_art_rank:qs_art_design_rank,
  qs_art_design_rank,
  qs_overall_rank,
  official_website,
  logo_url,
  status,
  description,
  feature_tags,
  strength_disciplines,
  notable_alumni,
  campus_image_urls,
  created_at,
  updated_at
`;

function parseIntParam(raw: string | null, defaultValue: number, min: number, max: number) {
  if (raw === null) return { value: defaultValue };
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < min || parsed > max) {
    return { error: `参数必须是 ${min}-${max} 之间的整数` };
  }
  return { value: parsed };
}

// GET /api/v1/schools - 获取学校列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const city = searchParams.get("city");
    const schoolType = searchParams.get("school_type");
    const keyword = searchParams.get("keyword")?.trim();
    const status = searchParams.get("status");
    const includeInactive = searchParams.get("include_inactive") === "true";

    const limitCheck = parseIntParam(searchParams.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);
    if (limitCheck.error) {
      return NextResponse.json(
        { success: false, error: `limit ${limitCheck.error}` },
        { status: 400 }
      );
    }
    const offsetCheck = parseIntParam(searchParams.get("offset"), 0, 0, 1000000);
    if (offsetCheck.error) {
      return NextResponse.json(
        { success: false, error: `offset ${offsetCheck.error}` },
        { status: 400 }
      );
    }
    const minRankCheck = parseIntParam(searchParams.get("min_rank"), 0, 0, 99999);
    if (minRankCheck.error) {
      return NextResponse.json(
        { success: false, error: `min_rank ${minRankCheck.error}` },
        { status: 400 }
      );
    }
    const maxRankCheck = parseIntParam(searchParams.get("max_rank"), 99999, 0, 99999);
    if (maxRankCheck.error) {
      return NextResponse.json(
        { success: false, error: `max_rank ${maxRankCheck.error}` },
        { status: 400 }
      );
    }

    if (minRankCheck.value! > maxRankCheck.value!) {
      return NextResponse.json(
        { success: false, error: "min_rank 不能大于 max_rank" },
        { status: 400 }
      );
    }

    if (includeInactive || status) {
      const auth = await requireAdmin(req);
      if ("response" in auth) return auth.response;
    }

    const limit = limitCheck.value!;
    const offset = offsetCheck.value!;
    const minRank = minRankCheck.value!;
    const maxRank = maxRankCheck.value!;

    const supabase = includeInactive || status ? createServiceClient() : createPublicReadClient();
    let query = supabase
      .from("schools")
      .select(SCHOOL_PUBLIC_SELECT, { count: "exact" })
      .order("qs_art_design_rank", { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    } else if (!includeInactive) {
      query = query.eq("status", "active");
    }

    if (country) {
      query = /^[A-Z]{2}$/.test(country)
        ? query.eq("country_code", country)
        : query.eq("raw_country", country);
    }
    if (city) {
      query = query.eq("city", city);
    }
    if (schoolType) {
      query = query.eq("school_type", schoolType);
    }
    if (keyword) {
      query = query.or(`name_zh.ilike.%${keyword}%,name_en.ilike.%${keyword}%`);
    }
    if (minRank > 0) {
      query = query.gte("qs_art_design_rank", minRank);
    }
    if (maxRank < 99999) {
      query = query.lte("qs_art_design_rank", maxRank);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

// POST /api/v1/schools - 创建学校（管理员 Bearer + role=admin）
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("response" in auth) return auth.response;
  try {
    const body = await req.json();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("schools")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
