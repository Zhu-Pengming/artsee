import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };
type DbError = { code?: string; message?: string };

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function readLikeCount(supabase: ReturnType<typeof createServiceClient>, postId: string) {
  const { data } = await supabase
    .from("community_posts")
    .select("like_count")
    .eq("id", postId)
    .maybeSingle();
  return Number(data?.like_count ?? 0);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const limited = checkRateLimit(req, {
      keyPrefix: "community-like",
      windowMs: 60_000,
      max: 60,
    });
    if (!limited.ok) {
      return NextResponse.json({ success: false, error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!isUuid(id)) {
      return NextResponse.json({ success: false, error: "无效的帖子 ID" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: post } = await supabase
      .from("community_posts")
      .select("id")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
    if (!post) {
      return NextResponse.json({ success: false, error: "内容不存在或已下架" }, { status: 404 });
    }

    const { error } = await supabase
      .from("community_post_likes")
      .insert({ post_id: id, user_id: user.id });

    if (error) {
      const dbError = error as DbError;
      if (dbError.code !== "23505") {
        return NextResponse.json({ success: false, error: dbError.message ?? "点赞失败" }, { status: 500 });
      }
    } else {
      await supabase.rpc("increment_community_post_like", { p_post_id: id });
    }

    return NextResponse.json({
      success: true,
      data: { liked: true, like_count: await readLikeCount(supabase, id) },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!isUuid(id)) {
      return NextResponse.json({ success: false, error: "无效的帖子 ID" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("community_post_likes")
      .delete()
      .eq("post_id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (data) {
      await supabase.rpc("decrement_community_post_like", { p_post_id: id });
    }

    return NextResponse.json({
      success: true,
      data: { liked: false, like_count: await readLikeCount(supabase, id) },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
