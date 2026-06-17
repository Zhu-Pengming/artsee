import { NextRequest, NextResponse } from "next/server";
import { errorResponse, invalidIdResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const supabase = createServiceClient();
    const { data, error, count } = await supabase
      .from("mentor_availability_slots")
      .select("*", { count: "exact" })
      .eq("mentor_id", id)
      .eq("status", "open")
      .order("starts_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) return errorResponse(error);
    return NextResponse.json({
      success: true,
      data: data ?? [],
      count,
      pagination: { limit, offset },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
