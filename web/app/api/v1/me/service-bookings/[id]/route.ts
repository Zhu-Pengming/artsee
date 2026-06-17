import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import {
  errorResponse,
  invalidIdResponse,
  notFoundResponse,
} from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ id: string }> };
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isMissingServiceBookingsTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    Boolean(err.message?.includes("service_bookings"))
  );
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "未授权" },
        { status: 401 }
      );
    }

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("service_bookings")
      .select("*, consultation:consultations(*)")
      .eq("id", id)
      .eq("student_user_id", user.id)
      .maybeSingle();

    if (error) {
      if (isMissingServiceBookingsTable(error)) return notFoundResponse();
      return errorResponse(error);
    }
    if (!data) return notFoundResponse();

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
