import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/v1/programs - 获取项目列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("school_id");
    const categoryId = searchParams.get("category_id");
    const degreeType = searchParams.get("degree_type");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from("programs")
      .select(`
        *,
        schools:school_id (name_zh, country, logo_url),
        program_admissions (ielts_overall, regular_deadline),
        program_fees (international_tuition_fee, currency_code)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (schoolId) {
      query = query.eq("school_id", schoolId);
    }

    if (degreeType) {
      query = query.eq("degree_type", degreeType);
    }

    // 如果按分类筛选，需要联合查询
    if (categoryId) {
      // 先获取该分类的所有项目ID
      const { data: categoryLinks } = await supabase
        .from("program_art_categories")
        .select("program_id")
        .eq("category_id", categoryId);

      if (categoryLinks && categoryLinks.length > 0) {
        const programIds = categoryLinks.map((link) => link.program_id);
        query = query.in("id", programIds);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/v1/programs - 创建项目（管理员）
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("programs")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
