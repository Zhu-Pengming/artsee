import { NextRequest, NextResponse } from "next/server";
import {
  isAdminProfile,
  requireUser,
} from "@/lib/api/authz";
import { recordCreatorContent } from "@/lib/api/creator-level";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

const ARTWORK_STATUSES = new Set(["draft", "published", "reviewing", "rejected", "archived"]);

function artworkStatusForCreate(raw: unknown, admin: boolean) {
  const status = typeof raw === "string" ? raw.trim() : "";
  if (admin) return ARTWORK_STATUSES.has(status) ? status : "published";
  return status === "draft" ? "draft" : "reviewing";
}

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
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;
    const body = await req.json();
    if (!body.title) return NextResponse.json({ success: false, error: "缺少作品标题" }, { status: 400 });
    const supabase = createServiceClient();
    const status = artworkStatusForCreate(body.status, isAdminProfile(auth.profile));
    const { data, error } = await supabase
      .from("artworks")
      .insert({
        user_id: auth.user.id,
        title: body.title,
        category: body.category ?? null,
        images: body.images ?? [],
        description: body.description ?? null,
        copyright_status: body.copyright_status ?? "self_owned",
        visibility: body.visibility ?? "public",
        status,
        metadata: body.metadata ?? {},
      })
      .select()
      .single();
    if (error) return errorResponse(error);
    await supabase.from("artwork_stats").insert({ artwork_id: data.id });
    if (status !== "draft") {
      await recordCreatorContent(supabase, auth.user.id, {
        sourceType: "artwork",
        sourceId: String(data.id),
      }).catch((recordError) => {
        console.warn("[creator-level] failed to record artwork", recordError);
      });
    }
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
