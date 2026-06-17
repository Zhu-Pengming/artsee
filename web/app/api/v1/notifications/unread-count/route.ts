import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });

    const { count, error } = await createServiceClient()
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read_status", "unread");

    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data: { count: count ?? 0 } });
  } catch (e) {
    return errorResponse(e);
  }
}
