import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { createPublicReadClient, createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string }> };

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseIntParam(raw: string | null, defaultValue: number, min: number, max: number) {
  if (raw === null) return { value: defaultValue };
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value) || value < min || value > max) {
    return { error: `参数必须是 ${min}-${max} 之间的整数` };
  }
  return { value };
}

async function attachProfiles(
  supabase: ReturnType<typeof createServiceClient>,
  rows: Array<Record<string, unknown>>
) {
  const authorIds = [...new Set(rows.map((row) => String(row.author_id)).filter(Boolean))];
  if (authorIds.length === 0) return rows.map((row) => ({ ...row, user_profiles: null }));

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, nickname, avatar_url")
    .in("id", authorIds);
  const profileMap = Object.fromEntries(
    (profiles ?? []).map((profile) => [
      profile.id,
      { nickname: profile.nickname, avatar_url: profile.avatar_url },
    ])
  );

  return rows.map((row) => ({
    ...row,
    user_profiles: profileMap[String(row.author_id)] ?? null,
  }));
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!isUuid(id)) {
      return NextResponse.json({ success: false, error: "无效的帖子 ID" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const limitCheck = parseIntParam(searchParams.get("limit"), 30, 1, 100);
    if (limitCheck.error) {
      return NextResponse.json({ success: false, error: `limit ${limitCheck.error}` }, { status: 400 });
    }
    const offsetCheck = parseIntParam(searchParams.get("offset"), 0, 0, 1_000_000);
    if (offsetCheck.error) {
      return NextResponse.json({ success: false, error: `offset ${offsetCheck.error}` }, { status: 400 });
    }

    const limit = limitCheck.value!;
    const offset = offsetCheck.value!;
    const supabase = createPublicReadClient();
    const { data, error, count } = await supabase
      .from("community_post_comments")
      .select("*", { count: "exact" })
      .eq("post_id", id)
      .eq("status", "published")
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: await attachProfiles(supabase, (data ?? []) as Array<Record<string, unknown>>),
      count,
      pagination: { limit, offset },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const limited = checkRateLimit(req, {
      keyPrefix: "community-comment",
      windowMs: 60_000,
      max: 20,
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

    const body = await req.json();
    const text = String(body.body ?? body.content ?? "").trim();
    if (text.length === 0) {
      return NextResponse.json({ success: false, error: "评论内容不能为空" }, { status: 400 });
    }
    if (text.length > 1000) {
      return NextResponse.json({ success: false, error: "评论内容不能超过 1000 字" }, { status: 400 });
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

    const { data, error } = await supabase
      .from("community_post_comments")
      .insert({
        post_id: id,
        author_id: user.id,
        body: text,
        status: "published",
      })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: error?.message ?? "评论失败" }, { status: 500 });
    }

    await supabase.rpc("increment_community_post_comment", { p_post_id: id });

    const [comment] = await attachProfiles(supabase, [data as Record<string, unknown>]);
    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
