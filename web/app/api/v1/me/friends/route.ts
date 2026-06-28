import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";
import {
  buildTencentImIdentifier,
  ensureTencentImFriendship,
  TencentImConfigError,
} from "@/lib/api/tencent-im";

type ProfileRow = {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
  user_type?: string | null;
  user_role?: string | null;
  status?: string | null;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function profilePayload(profile: ProfileRow | null) {
  if (!profile) return null;
  return {
    id: profile.id,
    nickname: profile.nickname,
    avatar_url: profile.avatar_url,
    user_type: profile.user_type ?? null,
    user_role: profile.user_role ?? null,
    im_identifier: buildTencentImIdentifier(profile.id),
  };
}

async function getDirectConversation(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  friendId: string
) {
  const { data: mine, error: mineError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);
  if (mineError) throw mineError;

  const ids = (mine ?? []).map((item: { conversation_id: string }) => item.conversation_id);
  if (ids.length === 0) return null;

  const { data: theirs, error: theirsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", friendId)
    .in("conversation_id", ids);
  if (theirsError) throw theirsError;

  const sharedIds = (theirs ?? []).map((item: { conversation_id: string }) => item.conversation_id);
  if (sharedIds.length === 0) return null;

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("*")
    .eq("type", "direct")
    .in("id", sharedIds)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (conversationError) throw conversationError;
  return conversation;
}

async function ensureDirectConversation(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  friendId: string
) {
  const existing = await getDirectConversation(supabase, userId, friendId);
  if (existing) return existing;

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      type: "direct",
      created_by: userId,
      metadata: {
        source: "friendship",
        friend_user_id: friendId,
      },
    })
    .select()
    .single();
  if (error) throw error;

  const { error: participantError } = await supabase
    .from("conversation_participants")
    .insert([
      {
        conversation_id: conversation.id,
        user_id: userId,
        role: "owner",
      },
      {
        conversation_id: conversation.id,
        user_id: friendId,
        role: "member",
      },
    ]);
  if (participantError) throw participantError;

  return conversation;
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
    const { data: rows, error } = await supabase
      .from("user_friends")
      .select("friend_id,status,source,created_at,updated_at,metadata")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return errorResponse(error);

    const friendIds = (rows ?? []).map((row: { friend_id: string }) => row.friend_id);
    let profileMap: Record<string, ProfileRow> = {};
    if (friendIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from("user_profiles")
        .select("id,nickname,avatar_url,user_type,user_role,status")
        .in("id", friendIds);
      if (profileError) return errorResponse(profileError);
      profileMap = Object.fromEntries(
        (profiles ?? []).map((profile: ProfileRow) => [profile.id, profile])
      );
    }

    const data = (rows ?? []).map(
      (row: {
        friend_id: string;
        status: string;
        source: string | null;
        created_at: string;
        updated_at: string;
        metadata: Record<string, unknown> | null;
      }) => ({
        friend_id: row.friend_id,
        status: row.status,
        source: row.source,
        created_at: row.created_at,
        updated_at: row.updated_at,
        metadata: row.metadata ?? {},
        im_identifier: buildTencentImIdentifier(row.friend_id),
        profile: profilePayload(profileMap[row.friend_id] ?? null),
      })
    );

    return NextResponse.json({ success: true, data, pagination: { limit, offset } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromBearer(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const targetUserId = cleanText(body.target_user_id ?? body.friend_id);
    if (!targetUserId) {
      return NextResponse.json({ success: false, error: "请选择要添加的用户" }, { status: 400 });
    }
    if (targetUserId === user.id) {
      return NextResponse.json({ success: false, error: "不能添加自己为好友" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: profiles, error: profileError } = await supabase
      .from("user_profiles")
      .select("id,nickname,avatar_url,user_type,user_role,status")
      .in("id", [user.id, targetUserId]);
    if (profileError) return errorResponse(profileError);

    const profileMap = Object.fromEntries(
      (profiles ?? []).map((profile: ProfileRow) => [profile.id, profile])
    ) as Record<string, ProfileRow | undefined>;
    const currentProfile = profileMap[user.id] ?? null;
    const friendProfile = profileMap[targetUserId] ?? null;
    if (!friendProfile || ["banned", "disabled"].includes(friendProfile.status ?? "")) {
      return NextResponse.json({ success: false, error: "用户不存在或不可添加" }, { status: 404 });
    }

    const imSync = await ensureTencentImFriendship({
      fromUserId: user.id,
      toUserId: targetUserId,
      fromNickname: currentProfile?.nickname,
      fromAvatarUrl: currentProfile?.avatar_url,
      toNickname: friendProfile.nickname,
      toAvatarUrl: friendProfile.avatar_url,
      addWording: cleanText(body.message) || null,
    });

    const now = new Date().toISOString();
    const metadata = {
      provider: "tencent_im",
      im_sync: imSync.status,
      friend_im_identifier: buildTencentImIdentifier(targetUserId),
      updated_by: user.id,
    };
    const { error: upsertError } = await supabase.from("user_friends").upsert(
      [
        {
          user_id: user.id,
          friend_id: targetUserId,
          status: "active",
          source: "manual",
          metadata,
          updated_at: now,
        },
        {
          user_id: targetUserId,
          friend_id: user.id,
          status: "active",
          source: "manual",
          metadata: {
            provider: "tencent_im",
            im_sync: imSync.status,
            friend_im_identifier: buildTencentImIdentifier(user.id),
            updated_by: user.id,
          },
          updated_at: now,
        },
      ],
      { onConflict: "user_id,friend_id" }
    );
    if (upsertError) return errorResponse(upsertError);

    const conversation = await ensureDirectConversation(
      supabase,
      user.id,
      targetUserId
    );

    return NextResponse.json({
      success: true,
      data: {
        friend_id: targetUserId,
        status: "active",
        im_sync: imSync.status,
        im_identifier: buildTencentImIdentifier(targetUserId),
        profile: profilePayload(friendProfile),
        conversation: {
          ...conversation,
          peer_user_id: targetUserId,
          peer_profile: profilePayload(friendProfile),
          peer_im_identifier: buildTencentImIdentifier(targetUserId),
          current_user_im_identifier: buildTencentImIdentifier(user.id),
          participant_im_identifiers: {
            [user.id]: buildTencentImIdentifier(user.id),
            [targetUserId]: buildTencentImIdentifier(targetUserId),
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof TencentImConfigError) {
      return NextResponse.json(
        { success: false, error: error.message, missing: error.missing },
        { status: 503 }
      );
    }
    return errorResponse(error);
  }
}
