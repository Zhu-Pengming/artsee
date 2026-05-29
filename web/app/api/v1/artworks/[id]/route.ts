import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, notFoundResponse } from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ id: string }> };

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
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const { id } = await ctx.params;
    const body = await req.json();
    const { data, error } = await createServiceClient()
      .from("artworks")
      .update(body)
      .eq("id", id)
      .eq("user_id", user.id)
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
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const { id } = await ctx.params;
    const { data, error } = await createServiceClient()
      .from("artworks")
      .update({ status: "archived" })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
