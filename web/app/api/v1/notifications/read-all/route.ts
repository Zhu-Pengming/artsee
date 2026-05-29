import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const { data, error } = await createServiceClient()
      .from("notifications")
      .update({ read_status: "read", read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("read_status", "unread")
      .select();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}

export const POST = PUT;
