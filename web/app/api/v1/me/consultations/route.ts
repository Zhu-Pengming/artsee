import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const supabase = createServiceClient();
    const { data, error, count } = await supabase
      .from("consultations")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data: data ?? [], count, pagination: { limit, offset } });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const body = (await req.json().catch(() => ({}))) as {
      target_type?: string;
      target_id?: string;
      target_name?: string;
      message?: string;
    };
    const targetType = body.target_type?.trim() || "school";
    const targetName = body.target_name?.trim();
    if (!targetName) {
      return NextResponse.json({ success: false, error: "target_name 必填" }, { status: 400 });
    }
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("consultations")
      .insert({
        user_id: user.id,
        target_type: targetType,
        target_id: body.target_id?.trim() || null,
        target_name: targetName,
        last_message: body.message?.trim() || null,
        status: "pending",
      })
      .select("*")
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
