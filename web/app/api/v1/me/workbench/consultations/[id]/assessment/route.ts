import { NextRequest, NextResponse } from "next/server";
import {
  cleanNullableText,
  cleanText,
  getConsultation,
  getLatestAssessment,
  isMissingInsightTable,
  MATCH_LEVELS,
  RISK_LEVELS,
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

    const { data, error } = await getLatestAssessment(loaded.supabase, id);
    if (error) {
      if (isMissingInsightTable(error, "consultation_assessments")) {
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
      background_summary?: unknown;
      match_level?: unknown;
      risk_level?: unknown;
      notes?: unknown;
    };

    const matchLevel = cleanText(body.match_level);
    const riskLevel = cleanText(body.risk_level);
    if (matchLevel && !MATCH_LEVELS.has(matchLevel)) {
      return NextResponse.json({ success: false, error: "无效匹配度" }, { status: 400 });
    }
    if (riskLevel && !RISK_LEVELS.has(riskLevel)) {
      return NextResponse.json({ success: false, error: "无效风险等级" }, { status: 400 });
    }

    const { data, error } = await loaded.supabase
      .from("consultation_assessments")
      .insert({
        consultation_id: id,
        advisor_user_id: loaded.auth.user.id,
        background_summary: cleanNullableText(body.background_summary),
        match_level: matchLevel || null,
        risk_level: riskLevel || null,
        notes: cleanNullableText(body.notes),
      })
      .select("*")
      .single();

    if (error) {
      if (isMissingInsightTable(error, "consultation_assessments")) {
        return notFoundResponse();
      }
      return errorResponse(error);
    }

    await createNotification(
      loaded.supabase,
      loaded.consultation.user_id?.toString(),
      {
        title: `${loaded.consultation.target_name ?? "咨询"}诊断已更新`,
        content: cleanNullableText(body.notes) ?? cleanNullableText(body.background_summary),
        type: "consultation_assessment",
        metadata: {
          consultation_id: id,
          target_type: loaded.consultation.target_type ?? null,
          target_name: loaded.consultation.target_name ?? null,
          assessment_id: data.id,
        },
      }
    );

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return errorResponse(e);
  }
}
