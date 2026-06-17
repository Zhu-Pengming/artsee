import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const supabase = createServiceClient();
    let query = supabase
      .from("community_circles")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const category = searchParams.get("category")?.trim();
    const keyword = searchParams.get("keyword")?.trim();
    if (category) query = query.eq("category", category);
    if (keyword) query = query.ilike("title", `%${keyword}%`);

    const { data, error, count } = await query;
    if (error) return errorResponse(error);
    const circles = data ?? [];
    const user = await getUserFromBearer(req);
    let membershipMap: Record<string, string> = {};
    if (user && circles.length > 0) {
      const ids = circles.map((circle: { id: string }) => circle.id);
      const { data: memberships } = await supabase
        .from("community_circle_members")
        .select("circle_id, status")
        .eq("user_id", user.id)
        .in("circle_id", ids);
      membershipMap = Object.fromEntries(
        (memberships ?? []).map((item: { circle_id: string; status: string }) => [
          item.circle_id,
          item.status,
        ])
      );
    }
    return NextResponse.json({
      success: true,
      data: circles.map((circle: Record<string, unknown>) => ({
        ...circle,
        join_status:
          membershipMap[String(circle.id)] ??
          (user && circle.creator_id === user.id ? "joined" : null),
      })),
      count,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromBearer(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ success: false, error: "请填写圈子名称" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("community_circles")
      .insert({
        creator_id: user.id,
        title,
        subtitle: body.subtitle ?? null,
        category: body.category ?? "art",
        city: body.city ?? null,
        cover_url: body.cover_url ?? null,
        status: body.status ?? "published",
        metadata:
          body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
            ? body.metadata
            : {},
      })
      .select()
      .single();

    if (error) return errorResponse(error);
    if (data?.id) {
      await supabase.from("community_circle_members").upsert(
        {
          circle_id: data.id,
          user_id: user.id,
          status: "joined",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "circle_id,user_id" }
      );
    }
    return NextResponse.json(
      { success: true, data: { ...data, join_status: "joined" } },
      { status: 201 }
    );
  } catch (e) {
    return errorResponse(e);
  }
}
