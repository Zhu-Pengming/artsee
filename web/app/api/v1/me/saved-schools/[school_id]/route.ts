import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

type Ctx = { params: Promise<{ school_id: string }> };

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "未授权" },
        { status: 401 }
      );
    }

    const { school_id: schoolId } = await ctx.params;
    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: "school_id 必填" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("saved_schools")
      .delete()
      .eq("user_id", user.id)
      .eq("school_id", schoolId);

    if (error) return errorResponse(error);

    return NextResponse.json({
      success: true,
      data: { school_id: schoolId, saved: false },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
