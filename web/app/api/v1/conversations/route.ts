import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse, parsePagination } from "@/lib/api/route-helpers";

export async function GET(req: NextRequest) {
  const user = await getUserFromBearer(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const supabase = createServiceClient();

    const { data: participants, error: participantError } = await supabase
      .from("conversation_participants")
      .select("conversation_id,last_read_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (participantError) return errorResponse(participantError);

    const ids = (participants ?? []).map((item: { conversation_id: string }) => item.conversation_id);
    if (ids.length === 0) {
      return NextResponse.json({ success: true, data: [], pagination: { limit, offset } });
    }

    const { data: conversations, error: conversationError } = await supabase
      .from("conversations")
      .select("*")
      .in("id", ids);
    if (conversationError) return errorResponse(conversationError);

    const { data: messages, error: messageError } = await supabase
      .from("messages")
      .select("*")
      .in("conversation_id", ids)
      .order("created_at", { ascending: false });
    if (messageError) return errorResponse(messageError);

    const { data: allParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id,user_id")
      .in("conversation_id", ids);
    const otherUserIds = [
      ...new Set(
        (allParticipants ?? [])
          .map((item: { user_id: string }) => item.user_id)
          .filter((id: string) => id !== user.id)
      ),
    ];
    let profileMap: Record<string, { nickname: string | null; avatar_url: string | null; user_type: string | null }> = {};
    if (otherUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id,nickname,avatar_url,user_type")
        .in("id", otherUserIds);
      profileMap = Object.fromEntries(
        (profiles ?? []).map((profile: { id: string; nickname: string | null; avatar_url: string | null; user_type: string | null }) => [
          profile.id,
          {
            nickname: profile.nickname,
            avatar_url: profile.avatar_url,
            user_type: profile.user_type,
          },
        ])
      );
    }

    const data = ids
      .map((id: string) => {
        const conversation = (conversations ?? []).find((item: { id: string }) => item.id === id);
        const participant = (participants ?? []).find((item: { conversation_id: string }) => item.conversation_id === id);
        const latest = (messages ?? []).find((item: { conversation_id: string }) => item.conversation_id === id);
        const unread = (messages ?? []).filter((item: { conversation_id: string; sender_id: string | null; created_at: string }) => {
          if (item.conversation_id !== id || item.sender_id === user.id) return false;
          if (!participant?.last_read_at) return true;
          return new Date(item.created_at).getTime() > new Date(participant.last_read_at).getTime();
        }).length;
        const otherParticipant = (allParticipants ?? []).find(
          (item: { conversation_id: string; user_id: string }) =>
            item.conversation_id === id && item.user_id !== user.id
        );
        const otherProfile = otherParticipant ? profileMap[otherParticipant.user_id] : null;
        return {
          ...conversation,
          latest_message: latest ?? null,
          unread_count: unread,
          peer_profile: otherProfile,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, data, pagination: { limit, offset } });
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
    const body = await req.json();
    const participantIds = Array.isArray(body.participant_ids)
      ? body.participant_ids.map(String).filter(Boolean)
      : [];
    const uniqueIds = [...new Set([user.id, ...participantIds])];
    if (uniqueIds.length < 2) {
      return NextResponse.json({ success: false, error: "请至少选择一个对话对象" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert({
        type: body.type ?? "direct",
        title: body.title ?? null,
        created_by: user.id,
        metadata: body.metadata ?? {},
      })
      .select()
      .single();
    if (error) return errorResponse(error);

    const { error: participantError } = await supabase
      .from("conversation_participants")
      .insert(
        uniqueIds.map((id) => ({
          conversation_id: conversation.id,
          user_id: id,
          role: id === user.id ? "owner" : "member",
        }))
      );
    if (participantError) return errorResponse(participantError);

    return NextResponse.json({ success: true, data: conversation }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
