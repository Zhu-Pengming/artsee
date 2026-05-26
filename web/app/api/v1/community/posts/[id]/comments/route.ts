import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function attachProfiles(
  supabase: ReturnType<typeof createServiceClient>,
  comments: Record<string, unknown>[]
) {
  const authorIds = [...new Set(comments.map((item) => String(item.author_id)).filter(Boolean))];
  if (authorIds.length === 0) return comments;

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, nickname, avatar_url")
    .in("id", authorIds);
  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p: { id: string; nickname: string | null; avatar_url: string | null }) => [
      p.id,
      { nickname: p.nickname, avatar_url: p.avatar_url },
    ])
  );

  return comments.map((comment) => ({
    ...comment,
    user_profiles: profileMap[String(comment.author_id)] ?? null,
  }));
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ success: false, error: "无效的帖子 ID" }, { status: 400 });
    }
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "30", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const supabase = createServiceClient();

    const { data: comments, error } = await supabase
      .from("community_post_comments")
      .select("*")
      .eq("post_id", id)
      .eq("status", "published")
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const data = await attachProfiles(supabase, comments ?? []);
    return NextResponse.json({ success: true, data, pagination: { limit, offset } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ success: false, error: "无效的帖子 ID" }, { status: 400 });
    }
    const body = await req.json();
    const text = String(body.body ?? body.content ?? "").trim();
    if (!text) {
      return NextResponse.json({ success: false, error: "评论内容不能为空" }, { status: 400 });
    }
    if (text.length > 1000) {
      return NextResponse.json({ success: false, error: "评论不能超过 1000 字" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: post } = await supabase
      .from("community_posts")
      .select("id")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
    if (!post) {
      return NextResponse.json({ success: false, error: "未找到" }, { status: 404 });
    }

    const { data: comment, error } = await supabase
      .from("community_post_comments")
      .insert({ post_id: id, author_id: user.id, body: text, status: "published" })
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await supabase.rpc("increment_community_post_comment", { p_post_id: id });
    const [withProfile] = await attachProfiles(supabase, [comment]);
    return NextResponse.json({ success: true, data: withProfile }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
