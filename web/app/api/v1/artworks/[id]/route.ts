import { NextRequest, NextResponse } from "next/server";
import {
  isAdminProfile,
  requireUser,
} from "@/lib/api/authz";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, notFoundResponse } from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ id: string }> };
const OWNER_EDITABLE_STATUSES = new Set(["draft", "reviewing", "archived"]);

function artworkPatchForUser(body: Record<string, unknown>, admin: boolean) {
  const patch = { ...body };
  delete patch.id;
  delete patch.user_id;
  delete patch.created_at;
  delete patch.updated_at;

  const status = typeof patch.status === "string" ? patch.status.trim() : "";
  if (!admin && status && !OWNER_EDITABLE_STATUSES.has(status)) {
    patch.status = "reviewing";
  }
  return patch;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("artworks")
      .select("*, artwork_stats(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) return errorResponse(error);
    if (!data) return notFoundResponse();
    await supabase.rpc("increment_artwork_views", { p_artwork_id: id }).then(() => undefined);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;
    const { id } = await ctx.params;
    const body = await req.json();
    const patch = artworkPatchForUser(body, isAdminProfile(auth.profile));
    const { data, error } = await createServiceClient()
      .from("artworks")
      .update(patch)
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select()
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;
    const { id } = await ctx.params;
    const { data, error } = await createServiceClient()
      .from("artworks")
      .update({ status: "archived" })
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select()
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
