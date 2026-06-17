import { NextRequest, NextResponse } from "next/server";
import { isAuthzResponse, requireUser } from "@/lib/api/authz";
import { createNotification } from "@/lib/api/notifications";
import { errorResponse, notFoundResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ memberId: string }> };
type Row = Record<string, unknown>;

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function objectMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Row;
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireUser(req);
    if (isAuthzResponse(auth)) return auth.response;

    const { memberId } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Row;
    const action = cleanText(body.action);
    if (!["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "无效邀请响应" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: existing, error: existingError } = await supabase
      .from("organization_members")
      .select("id,organization_id,user_id,role,status,metadata,created_at,updated_at")
      .eq("id", memberId)
      .eq("user_id", auth.user.id)
      .eq("status", "invited")
      .maybeSingle();

    if (existingError) return errorResponse(existingError);
    if (!existing) return notFoundResponse();

    const now = new Date().toISOString();
    const metadata = {
      ...objectMetadata(existing.metadata),
      invitation_response: action,
      responded_at: now,
      responded_by_user_id: auth.user.id,
      ...(action === "accept" ? { accepted_at: now } : { declined_at: now }),
    };

    const nextStatus = action === "accept" ? "active" : "disabled";
    const { data: updated, error } = await supabase
      .from("organization_members")
      .update({
        status: nextStatus,
        metadata,
        updated_at: now,
      })
      .eq("id", memberId)
      .select("id,organization_id,user_id,role,status,metadata,created_at,updated_at")
      .single();

    if (error) return errorResponse(error);

    const organizationId = cleanText(existing.organization_id);
    const inviterId = cleanText(objectMetadata(existing.metadata).invited_by_user_id);
    if (inviterId && inviterId !== auth.user.id) {
      await createNotification(supabase, inviterId, {
        title: action === "accept" ? "团队邀请已接受" : "团队邀请已拒绝",
        content: action === "accept" ? "成员已加入机构团队。" : "成员拒绝了机构团队邀请。",
        type: "organization_member_invitation_responded",
        metadata: {
          organization_id: organizationId,
          member_id: memberId,
          user_id: auth.user.id,
          action,
        },
      });
    }

    const { data: organization } = organizationId
      ? await supabase
          .from("organizations")
          .select("id,name,type,status,verification_status")
          .eq("id", organizationId)
          .maybeSingle()
      : { data: null };

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        organization: organization ?? null,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
