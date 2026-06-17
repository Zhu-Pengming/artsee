import { NextRequest, NextResponse } from "next/server";
import {
  isAdminProfile,
  requireUser,
} from "@/lib/api/authz";
import { recordCreatorContent } from "@/lib/api/creator-level";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

const ARTIST_PROFILE_STATUSES = new Set([
  "draft",
  "reviewing",
  "published",
  "hidden",
  "rejected",
  "archived",
]);

function artistProfileStatusForWrite(raw: unknown, admin: boolean) {
  const status = typeof raw === "string" ? raw.trim() : "";
  if (admin) return ARTIST_PROFILE_STATUSES.has(status) ? status : "published";
  return status === "draft" ? "draft" : "reviewing";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    let query = createServiceClient()
      .from("artist_profiles")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    const keyword = searchParams.get("keyword")?.trim();
    if (keyword) query = query.ilike("display_name", `%${keyword}%`);
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
    const supabase = createServiceClient();
    const status = artistProfileStatusForWrite(
      body.status,
      isAdminProfile(auth.profile)
    );
    const { data: existing, error: existingError } = await supabase
      .from("artist_profiles")
      .select("id")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (existingError) return errorResponse(existingError);
    const { data, error } = await supabase
      .from("artist_profiles")
      .upsert(
        {
          ...body,
          user_id: auth.user.id,
          status,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();
    if (error) return errorResponse(error);
    if (!existing && status !== "draft") {
      await recordCreatorContent(supabase, auth.user.id, {
        sourceType: "artist_profile",
        sourceId: String(data.id),
      }).catch((recordError) => {
        console.warn("[creator-level] failed to record artist profile", recordError);
      });
    }
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
