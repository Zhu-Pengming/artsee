import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/require-admin";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const includeInactive = searchParams.get("include_inactive") === "true";
    if (includeInactive) {
      const auth = await requireAdmin(req);
      if ("response" in auth) return auth.response;
    }
    const supabase = createServiceClient();
    let query = supabase
      .from("events")
      .select("*", { count: "exact" })
      .order("start_time", { ascending: false })
      .range(offset, offset + limit - 1);
    if (!includeInactive) query = query.eq("status", "published");
    const city = searchParams.get("city");
    const type = searchParams.get("type");
    if (city) query = query.eq("city", city);
    if (type) query = query.eq("type", type);
    const { data, error, count } = await query;
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data, count, pagination: { limit, offset } });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromBearer(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("events")
      .insert({ ...body, status: body.status ?? "published", created_by: user.id })
      .select()
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
