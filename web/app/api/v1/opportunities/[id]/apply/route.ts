import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    const { id } = await ctx.params;
    const body = await req.json();
    const { data, error } = await createServiceClient()
      .from("opportunity_applications")
      .insert({
        opportunity_id: id,
        user_id: user.id,
        portfolio_ids: body.portfolio_ids ?? [],
        proposal: body.proposal ?? null,
        quote_amount: body.quote_amount ?? null,
      })
      .select()
      .single();
    if (error) return errorResponse(error);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
