import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

const STATUSES = new Set(["requested", "confirmed", "scheduled", "completed", "canceled"]);

function isMissingServiceBookingsTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    Boolean(err.message?.includes("service_bookings"))
  );
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status")?.trim();
    const supabase = createServiceClient();

    let query = supabase
      .from("service_bookings")
      .select("*, consultation:consultations(*)", { count: "exact" })
      .eq("student_user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && STATUSES.has(status)) query = query.eq("status", status);

    const { data, error, count } = await query;
    if (error) {
      if (isMissingServiceBookingsTable(error)) {
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          pagination: { limit, offset },
          schema_ready: false,
        });
      }
      return errorResponse(error);
    }

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
