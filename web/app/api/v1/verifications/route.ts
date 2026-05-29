import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const body = await req.json();
    const type = String(body.type || "");
    if (!["student", "artist", "collector", "business"].includes(type)) {
      return NextResponse.json({ success: false, error: "无效认证类型" }, { status: 400 });
    }
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("verifications")
      .insert({
        user_id: user.id,
        type,
        materials: body.materials ?? {},
        status: "pending",
      })
      .select()
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
