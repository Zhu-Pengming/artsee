import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const supabase = createServiceClient();

    let query = supabase
      .from("community_hot_topics")
      .select(
        "id, slug, tag, title, category, participant_count, sort_order, is_pinned, answers, metadata, created_at",
        { count: "exact" }
      )
      .eq("status", "published")
      .order("is_pinned", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("participant_count", { ascending: false })
      .range(offset, offset + limit - 1);

    const category = searchParams.get("category")?.trim();
    const theme = searchParams.get("theme")?.trim();
    const pinned = searchParams.get("pinned")?.trim();

    if (category) query = query.eq("category", category);
    if (theme) query = query.eq("metadata->>theme", theme);
    if (pinned === "true") query = query.eq("is_pinned", true);
    if (pinned === "false") query = query.eq("is_pinned", false);

    const { data, error, count } = await query;
    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      data,
      count,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
