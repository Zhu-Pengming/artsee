import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    let query = createServiceClient()
      .from("artworks")
      .select("*, artwork_stats(*)", { count: "exact" })
      .eq("status", "published")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    const userId = searchParams.get("user_id");
    const category = searchParams.get("category");
    if (userId) query = query.eq("user_id", userId);
    if (category) query = query.eq("category", category);
    const { data, error, count } = await query;
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data, count, pagination: { limit, offset } });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const body = await req.json();
    if (!body.title) return NextResponse.json({ success: false, error: "缺少作品标题" }, { status: 400 });
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("artworks")
      .insert({
        user_id: user.id,
        title: body.title,
        category: body.category ?? null,
        images: body.images ?? [],
        description: body.description ?? null,
        copyright_status: body.copyright_status ?? "self_owned",
        visibility: body.visibility ?? "public",
        status: body.status ?? "published",
        metadata: body.metadata ?? {},
      })
      .select()
      .single();
    if (error) return errorResponse(error);
    await supabase.from("artwork_stats").insert({ artwork_id: data.id });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
