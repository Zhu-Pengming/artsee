import { NextRequest, NextResponse } from "next/server";
import { createPublicReadClient } from "@/lib/api/supabase-service";

/** GET /api/v1/cases — 录取案例列表（与 App `cases` 表一致，供 Flutter 走 Next 聚合） */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const result = searchParams.get("result");

    const supabase = createPublicReadClient();
    let q = supabase
      .from("cases")
      .select("*, user_profiles(nickname)")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (result) {
      q = q.eq("result", result);
    }

    const { data, error } = await q;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      data: data ?? [],
      pagination: { limit, offset },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
