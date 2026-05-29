import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, notFoundResponse } from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const { data, error } = await createServiceClient()
      .from("artist_profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return errorResponse(error);
    if (!data) return notFoundResponse();
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
