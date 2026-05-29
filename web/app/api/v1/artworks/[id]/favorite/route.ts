import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const { id } = await ctx.params;
    const supabase = createServiceClient();
    const { error } = await supabase.from("favorites").upsert(
      { user_id: user.id, target_type: "artwork", target_id: id },
      { onConflict: "user_id,target_type,target_id" }
    );
    if (error) return errorResponse(error);
    await supabase.rpc("refresh_artwork_engagement_stats", { p_artwork_id: id }).then(() => undefined);
    return NextResponse.json({ success: true, data: { favorited: true } });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const { id } = await ctx.params;
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("target_type", "artwork")
      .eq("target_id", id);
    if (error) return errorResponse(error);
    await supabase.rpc("refresh_artwork_engagement_stats", { p_artwork_id: id }).then(() => undefined);
    return NextResponse.json({ success: true, data: { favorited: false } });
  } catch (e) {
    return errorResponse(e);
  }
}
