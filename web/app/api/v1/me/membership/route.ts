import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { getUserMembership } from "@/lib/api/membership";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const membership = await getUserMembership(supabase, user.id);
    if (membership.error) return errorResponse(membership.error);

    return NextResponse.json({
      success: true,
      data: {
        ...membership.data,
        server_time: new Date().toISOString(),
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
