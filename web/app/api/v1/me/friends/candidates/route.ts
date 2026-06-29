import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import { buildTencentImIdentifier } from "@/lib/api/tencent-im";

type ProfileRow = {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  user_type?: string | null;
  user_role?: string | null;
  status?: string | null;
  is_verified?: boolean | null;
};

function profilePayload(profile: ProfileRow) {
  return {
    id: profile.id,
    nickname: profile.nickname,
    avatar_url: profile.avatar_url,
    user_type: profile.user_type ?? null,
    user_role: profile.user_role ?? null,
    status: profile.status ?? null,
    is_verified: profile.is_verified === true,
    im_identifier: buildTencentImIdentifier(profile.id),
  };
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

    const { data: friends, error: friendError } = await supabase
      .from("user_friends")
      .select("friend_id")
      .eq("user_id", user.id)
      .eq("status", "active");
    if (friendError) return errorResponse(friendError);

    const excludedIds = new Set<string>([
      user.id,
      ...((friends ?? []) as Array<{ friend_id: string }>).map((item) => item.friend_id),
    ]);

    const { data: profiles, error: profileError } = await supabase
      .from("user_profiles")
      .select("id,nickname,avatar_url,user_type,user_role,status,is_verified")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .range(0, Math.min(offset + limit + excludedIds.size + 20, 99));
    if (profileError) return errorResponse(profileError);

    const data = ((profiles ?? []) as ProfileRow[])
      .filter((profile) => !excludedIds.has(profile.id))
      .slice(offset, offset + limit)
      .map(profilePayload);

    return NextResponse.json({ success: true, data, pagination: { limit, offset } });
  } catch (error) {
    return errorResponse(error);
  }
}
