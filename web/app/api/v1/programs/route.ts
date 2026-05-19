import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { createPublicReadClient, createServiceClient } from "@/lib/api/supabase-service";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
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
    campus_image_urls,
    qs_art_rank:qs_art_design_rank,
    qs_art_design_rank,
    official_website
  ),
  program_admissions ( * ),
  program_fees ( * ),
  program_art_categories ( category_id )
`;

function parseIntParam(raw: string | null, defaultValue: number, min: number, max: number) {
  if (raw === null) return { value: defaultValue };
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < min || parsed > max) {
    return { error: `参数必须是 ${min}-${max} 之间的整数` };
  }
  return { value: parsed };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeDegreeFilter(value: string) {
  const v = value.trim();
  if (/^master$/i.test(v)) return "M";
  if (/^bachelor$/i.test(v)) return "B";
  if (/^(phd|doctor|doctorate)$/i.test(v)) return "D";
  return v;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

function enrichProgramAssets<T extends Record<string, unknown>>(program: T) {
  const school = program.schools as Record<string, unknown> | null | undefined;
  const campusImages = asStringArray(school?.campus_image_urls);
  const coverImage = typeof program.cover_image_url === "string" ? program.cover_image_url : null;
  const coverImages = [
    ...(coverImage ? [coverImage] : []),
    ...campusImages.filter((url) => url !== coverImage),
  ];
  return {
    ...program,
    cover_image_url: coverImage ?? coverImages[0] ?? null,
    cover_image_urls: coverImages,
  };
}

// GET /api/v1/programs - 获取项目列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("school_id");
    const categoryId = searchParams.get("category_id");
    const degreeType = searchParams.get("degree_type");
    const requiresPortfolio = searchParams.get("requires_portfolio");
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

    if (schoolId && !isUuid(schoolId)) {
      return NextResponse.json({ success: false, error: "school_id 必须是有效 UUID" }, { status: 400 });
    }
    const categoryIdCheck = parseIntParam(categoryId, 0, 1, 1000000000);
    if (categoryId && categoryIdCheck.error) {
      return NextResponse.json(
        { success: false, error: `category_id ${categoryIdCheck.error}` },
        { status: 400 }
      );
    }
    if (requiresPortfolio && !["true", "false"].includes(requiresPortfolio)) {
      return NextResponse.json(
        { success: false, error: "requires_portfolio 必须为 true 或 false" },
        { status: 400 }
      );
    }

    if (includeInactive || status) {
      const auth = await requireAdmin(req);
      if ("response" in auth) return auth.response;
    }

    const limit = limitCheck.value!;
    const offset = offsetCheck.value!;
    const supabase = includeInactive || status ? createServiceClient() : createPublicReadClient();
    let query = supabase
      .from("programs")
      .select(PROGRAM_SELECT, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    } else if (!includeInactive) {
      query = query.eq("status", "active");
    }

    if (schoolId) {
      query = query.eq("school_id", schoolId);
    }

    if (degreeType) {
      const degree = normalizeDegreeFilter(degreeType);
      query = query.or(
        `normalized_degree_type.ilike.${degree}%,raw_degree_type.ilike.${degree}%`
      );
    }

    if (keyword) {
      query = query.ilike("program_name", `%${keyword}%`);
    }

    if (requiresPortfolio) {
      query = query.eq("requires_portfolio", requiresPortfolio === "true");
    }

    if (categoryId) {
      query = query.eq("program_art_categories.category_id", categoryIdCheck.value!);
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
      data: data?.map((item) => enrichProgramAssets(item as Record<string, unknown>)),
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

// POST /api/v1/programs - 创建项目（管理员 Bearer + role=admin）
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("response" in auth) return auth.response;
  try {
    const body = await req.json();
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("programs")
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
