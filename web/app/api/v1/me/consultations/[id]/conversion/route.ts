import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import {
  getStudentConsultation,
  UUID_RE,
} from "@/lib/api/consultation-insights";
import {
  errorResponse,
  invalidIdResponse,
  notFoundResponse,
} from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };

function isMissingTable(error: unknown, tableName: string) {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    Boolean(err.message?.includes(tableName))
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
    const { data: consultation, error: consultationError } =
      await getStudentConsultation(supabase, id, user.id);
    if (consultationError) return errorResponse(consultationError);
    if (!consultation) return notFoundResponse();

    const bookingResult = await supabase
      .from("service_bookings")
      .select("*")
      .eq("consultation_id", id)
      .eq("student_user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (
      bookingResult.error &&
      !isMissingTable(bookingResult.error, "service_bookings")
    ) {
      return errorResponse(bookingResult.error);
    }

    const orderResult = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .eq("item_type", "consultation")
      .eq("item_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderResult.error && !isMissingTable(orderResult.error, "orders")) {
      return errorResponse(orderResult.error);
    }

    return NextResponse.json({
      success: true,
      data: {
        service_booking: bookingResult.error
          ? null
          : bookingResult.data ?? null,
        order: orderResult.error ? null : orderResult.data ?? null,
      },
      schema_ready: {
        service_bookings: !bookingResult.error,
        orders: !orderResult.error,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
