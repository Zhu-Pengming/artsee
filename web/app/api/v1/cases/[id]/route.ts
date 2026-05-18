import { NextResponse } from "next/server";
import { createPublicReadClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/v1/cases/[id] — 录取案例详情 */
export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const supabase = createPublicReadClient();
    const { data, error } = await supabase
      .from("cases")
      .select("*, user_profiles(nickname)")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
    if (!data) {
      return NextResponse.json(
        { success: false, error: "未找到" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
