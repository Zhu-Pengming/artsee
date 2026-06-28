import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/v1/cases/:id — 录取案例详情 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const caseId = id.trim();
    if (!caseId) {
      return NextResponse.json(
        { success: false, error: "无效 id" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("cases")
      .select("*, user_profiles(nickname)")
      .eq("id", caseId)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    if (!data) {
      return NextResponse.json(
        { success: false, error: "未找到" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: msg || "服务器错误" },
      { status: 500 }
    );
  }
}
