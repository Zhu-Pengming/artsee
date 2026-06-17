import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import {
  getLatestRecommendation,
  getStudentConsultation,
  isMissingInsightTable,
  UUID_RE,
} from "@/lib/api/consultation-insights";
import { errorResponse, invalidIdResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const supabase = createServiceClient();
    const { data: consultation, error: consultationError } =
      await getStudentConsultation(supabase, id, user.id);
    if (consultationError) return errorResponse(consultationError);
    if (!consultation) return notFoundResponse();

    const { data, error } = await getLatestRecommendation(supabase, id);
    if (error) {
      if (isMissingInsightTable(error, "consultation_recommendations")) {
        return NextResponse.json({ success: true, data: null, schema_ready: false });
      }
      return errorResponse(error);
    }

    return NextResponse.json({ success: true, data: data ?? null });
  } catch (e) {
    return errorResponse(e);
  }
}
