import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const category = searchParams.get("category")?.trim();
    const keyword = searchParams.get("keyword")?.trim();
    const featured = searchParams.get("featured");
    const includeInactive = searchParams.get("include_inactive") === "true";

    if (includeInactive) {
      const admin = await requireAdmin(req);
      if ("response" in admin) return admin.response;
    }

    const supabase = createServiceClient();
    let query = supabase
      .from("articles")
      .select("*", { count: "exact" })
      .order("is_featured", { ascending: false })
      .order("display_order", { ascending: true })
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (!includeInactive) query = query.eq("publish_status", "published");
    if (category) query = query.eq("category", category);
    if (featured === "true") query = query.eq("is_featured", true);
    if (featured === "false") query = query.eq("is_featured", false);
    if (keyword) {
      query = query.or(
        `title.ilike.%${keyword}%,subtitle.ilike.%${keyword}%,summary.ilike.%${keyword}%`
      );
    }

    const { data, error, count } = await query;
    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      data,
      count,
      pagination: { limit, offset },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("response" in admin) return admin.response;

  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "title 必填" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("articles")
      .insert(body)
      .select()
      .single();

    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
