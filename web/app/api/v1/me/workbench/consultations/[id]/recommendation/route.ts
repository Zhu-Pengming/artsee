import { NextRequest, NextResponse } from "next/server";
import {
  cleanNullableText,
  getConsultation,
  getLatestRecommendation,
  isMissingInsightTable,
  jsonArray,
  UUID_RE,
} from "@/lib/api/consultation-insights";
import { errorResponse, invalidIdResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";
import { createNotification } from "@/lib/api/notifications";
import {
  canAccessWorkbenchConsultation,
  requireWorkbenchUser,
} from "@/lib/api/workbench-access";

type Ctx = { params: Promise<{ id: string }> };

async function loadAuthorizedConsultation(req: NextRequest, id: string) {
  const auth = await requireWorkbenchUser(req);
  if ("response" in auth) return auth;

  const supabase = createServiceClient();
  const { data, error } = await getConsultation(supabase, id);
  if (error) return { response: errorResponse(error) };
  if (!data) return { response: notFoundResponse() };
  if (
    !canAccessWorkbenchConsultation(
      data,
      auth.user.id,
      auth.canAccessPlatformPool,
      auth.organizationIds,
      auth.memberships
    )
  ) {
    return { response: notFoundResponse() };
  }

  return { auth, supabase, consultation: data };
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const loaded = await loadAuthorizedConsultation(req, id);
    if ("response" in loaded) return loaded.response;

    const { data, error } = await getLatestRecommendation(loaded.supabase, id);
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

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) return invalidIdResponse();

    const loaded = await loadAuthorizedConsultation(req, id);
    if ("response" in loaded) return loaded.response;

    const body = (await req.json().catch(() => ({}))) as {
      school_list?: unknown;
      timeline?: unknown;
      portfolio_strategy?: unknown;
      recommended_services?: unknown;
    };

    const { data, error } = await loaded.supabase
      .from("consultation_recommendations")
      .insert({
        consultation_id: id,
        advisor_user_id: loaded.auth.user.id,
        school_list: jsonArray(body.school_list),
        timeline: cleanNullableText(body.timeline),
        portfolio_strategy: cleanNullableText(body.portfolio_strategy),
        recommended_services: jsonArray(body.recommended_services),
      })
      .select("*")
      .single();

    if (error) {
      if (isMissingInsightTable(error, "consultation_recommendations")) {
        return notFoundResponse();
      }
      return errorResponse(error);
    }

    await createNotification(
      loaded.supabase,
      loaded.consultation.user_id?.toString(),
      {
        title: `${loaded.consultation.target_name ?? "咨询"}申请方案已更新`,
        content: cleanNullableText(body.timeline) ?? cleanNullableText(body.portfolio_strategy),
        type: "consultation_recommendation",
        metadata: {
          consultation_id: id,
          target_type: loaded.consultation.target_type ?? null,
          target_name: loaded.consultation.target_name ?? null,
          recommendation_id: data.id,
        },
      }
    );

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
