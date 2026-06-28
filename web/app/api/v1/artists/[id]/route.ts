import { NextRequest, NextResponse } from "next/server";
import { isAdminRole } from "@/lib/api/admin-roles";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, notFoundResponse } from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("artist_profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return errorResponse(error);
    if (!data) return notFoundResponse();
    if (data.status !== "published") {
      const user = await getUserFromBearer(req);
      if (!user || data.user_id !== user.id) {
        const { data: profile } = user
          ? await supabase
              .from("user_profiles")
              .select("role")
              .eq("id", user.id)
              .maybeSingle()
          : { data: null };
        if (!isAdminRole(profile?.role)) return notFoundResponse();
      }
    }
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
