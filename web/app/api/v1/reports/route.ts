import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createNotification } from "@/lib/api/notifications";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Row = Record<string, unknown>;

const TARGET_TYPES = new Set([
  "user",
  "event",
  "opportunity",
  "artwork",
  "artist",
  "post",
  "comment",
  "message",
  "consultation",
  "other",
]);

const REASONS = new Set([
  "spam",
  "scam",
  "harassment",
  "copyright",
  "false_info",
  "inappropriate",
  "privacy",
  "other",
]);

const REASON_WEIGHTS: Record<string, number> = {
  scam: 50,
  harassment: 50,
  privacy: 50,
  copyright: 35,
  false_info: 30,
  inappropriate: 25,
  spam: 20,
  other: 10,
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectValue(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

function reportPriority(riskScore: number, targetReportCount: number) {
  if (riskScore >= 90 || targetReportCount >= 5) return "critical";
  if (riskScore >= 50 || targetReportCount >= 2) return "high";
  return "normal";
}

export async function GET(req: NextRequest) {
  const user = await getUserFromBearer(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const supabase = createServiceClient();
    const { data, error, count } = await supabase
      .from("content_reports")
      .select("*", { count: "exact" })
      .eq("reporter_user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return errorResponse(error);
    return NextResponse.json({
      success: true,
      data: data ?? [],
      count: count ?? data?.length ?? 0,
      pagination: { limit, offset },
    });
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
    const body = (await req.json().catch(() => ({}))) as Row;
    const targetType = cleanText(body.target_type ?? body.targetType);
    const targetId = cleanText(body.target_id ?? body.targetId);
    const reason = cleanText(body.reason);
    const detail = cleanText(body.detail);

    if (!TARGET_TYPES.has(targetType)) {
      return NextResponse.json({ success: false, error: "无效举报对象类型" }, { status: 400 });
    }
    if (!targetId) {
      return NextResponse.json({ success: false, error: "target_id 不能为空" }, { status: 400 });
    }
    if (!REASONS.has(reason)) {
      return NextResponse.json({ success: false, error: "无效举报原因" }, { status: 400 });
    }
    if (detail.length > 2000) {
      return NextResponse.json({ success: false, error: "举报说明不能超过 2000 字" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: duplicate, error: duplicateError } = await supabase
      .from("content_reports")
      .select("id,status")
      .eq("reporter_user_id", user.id)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .in("status", ["pending", "reviewing"])
      .maybeSingle();
    if (duplicateError) return errorResponse(duplicateError);
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: "你已举报过该内容，平台正在处理中", data: duplicate },
        { status: 409 }
      );
    }

    const { data: sameTargetReports, error: targetReportsError } = await supabase
      .from("content_reports")
      .select("id,status,priority")
      .eq("target_type", targetType)
      .eq("target_id", targetId);
    if (targetReportsError) return errorResponse(targetReportsError);

    const targetReportCount = (sameTargetReports?.length ?? 0) + 1;
    const riskScore = targetReportCount * 15 + (REASON_WEIGHTS[reason] ?? 10);
    const priority = reportPriority(riskScore, targetReportCount);
    const metadata = {
      ...objectValue(body.metadata),
      risk: {
        risk_score: riskScore,
        priority,
        target_report_count: targetReportCount,
      },
    };

    const { data, error } = await supabase
      .from("content_reports")
      .insert({
        reporter_user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        reason,
        detail: detail || null,
        status: "pending",
        priority,
        risk_score: riskScore,
        target_report_count: targetReportCount,
        metadata,
      })
      .select("*")
      .single();
    if (error) return errorResponse(error);

    await createNotification(supabase, user.id, {
      title: "举报已提交",
      content: "平台运营团队会尽快处理。",
      type: "content_report",
      metadata: {
        report_id: data.id,
        target_type: targetType,
        target_id: targetId,
        priority,
        risk_score: riskScore,
      },
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
