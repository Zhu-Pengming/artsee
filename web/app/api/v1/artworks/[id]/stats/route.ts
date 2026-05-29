import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { data, error } = await createServiceClient()
      .from("artwork_stats")
      .select("*")
      .eq("artwork_id", id)
      .maybeSingle();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data: data ?? { artwork_id: id, views: 0, likes: 0, favorites: 0, inquiries: 0 } });
  } catch (e) {
    return errorResponse(e);
  }
}
