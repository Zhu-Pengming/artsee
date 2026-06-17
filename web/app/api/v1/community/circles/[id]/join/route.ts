import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, invalidIdResponse, notFoundResponse } from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ id: string }> };

function circleJoinType(circle: Record<string, unknown>) {
  const raw = typeof circle.join_type === "string" ? circle.join_type : null;
  if (raw === "open" || raw === "approval" || raw === "private") return raw;
  const metadata = circle.metadata;
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const metaRaw = (metadata as Record<string, unknown>).join_type;
    if (metaRaw === "open" || metaRaw === "approval" || metaRaw === "private") {
      return metaRaw;
    }
  }
  return "open";
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });

    const { id } = await ctx.params;
    if (!id) return invalidIdResponse();

    const supabase = createServiceClient();
    const { data: circle, error: circleError } = await supabase
      .from("community_circles")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
    if (circleError) return errorResponse(circleError);
    if (!circle) return notFoundResponse();

    const joinType = circleJoinType(circle as Record<string, unknown>);
    if (joinType === "private") {
      return NextResponse.json({ success: false, error: "这个圈子暂时不可加入" }, { status: 403 });
    }

    const nextStatus = joinType === "approval" ? "pending" : "joined";
    const { data: existing } = await supabase
      .from("community_circle_members")
      .select("status")
      .eq("circle_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: membership, error: membershipError } = await supabase
      .from("community_circle_members")
      .upsert(
        {
          circle_id: id,
          user_id: user.id,
          status: existing?.status === "joined" ? "joined" : nextStatus,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "circle_id,user_id" }
      )
      .select()
      .single();
    if (membershipError) return errorResponse(membershipError);

    const becameJoined = existing?.status !== "joined" && membership.status === "joined";
    let memberCount = Number(circle.member_count ?? 0);
    if (becameJoined) {
      const { data: updatedCircle } = await supabase
        .from("community_circles")
        .update({
          member_count: memberCount + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("member_count")
        .single();
      memberCount = Number(updatedCircle?.member_count ?? memberCount + 1);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...(circle as Record<string, unknown>),
        member_count: memberCount,
        join_status: membership.status,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
