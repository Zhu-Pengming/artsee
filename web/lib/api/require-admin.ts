import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getUserFromBearer } from "./auth-user";
import { createServiceClient } from "./supabase-service";

export async function requireAdmin(
  req: NextRequest
): Promise<{ user: User } | { response: NextResponse }> {
  const user = await getUserFromBearer(req);
  if (!user) {
    return { response: NextResponse.json({ success: false, error: "未授权" }, { status: 401 }) };
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    return {
      response: NextResponse.json({ success: false, error: error.message }, { status: 500 }),
    };
  }
  if (data?.role !== "admin") {
    return { response: NextResponse.json({ success: false, error: "需要管理员权限" }, { status: 403 }) };
  }
  return { user };
}
