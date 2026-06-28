import { NextRequest, NextResponse } from "next/server";
import { isAdminRole } from "@/lib/api/admin-roles";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { errorResponse, invalidIdResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
type Row = Record<string, unknown>;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("mentors")
      .select("*, services:mentor_services(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) return errorResponse(error);
    if (!data) return notFoundResponse();

    if (!(data.status === "active" && data.verification_status === "verified")) {
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

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        services: Array.isArray(data.services)
          ? (data.services as Row[]).filter((service) => service.status === "active")
          : [],
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
