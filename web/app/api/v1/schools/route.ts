import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/v1/schools - 获取学校列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from("schools")
      .select("*")
      .eq("status", "active")
      .order("qs_art_rank", { ascending: true })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (country) {
      query = query.eq("country", country);
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

// POST /api/v1/schools - 创建学校（管理员）
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("schools")
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
