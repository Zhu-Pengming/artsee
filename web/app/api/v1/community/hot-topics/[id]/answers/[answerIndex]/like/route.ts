import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";

type Ctx = { params: Promise<{ id: string; answerIndex: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseAnswerIndex(value: string) {
  const index = Number.parseInt(value, 10);
  return Number.isInteger(index) && index >= 0 ? index : -1;
}

async function ensureTopicAnswer(
  supabase: ReturnType<typeof createServiceClient>,
  topicId: string,
  answerIndex: number
) {
  const { data, error } = await supabase
    .from("community_hot_topics")
    .select("id, answers")
    .eq("id", topicId)
    .eq("status", "published")
    .maybeSingle();
  if (error) return { error: error.message };
  const answers = Array.isArray(data?.answers) ? data.answers : [];
  if (!data || answerIndex < 0 || answerIndex >= answers.length) {
    return { notFound: true };
  }
  return { data };
}

async function readLikeCount(
  supabase: ReturnType<typeof createServiceClient>,
  topicId: string,
  answerIndex: number
) {
  const { count, error } = await supabase
    .from("community_hot_topic_answer_likes")
    .select("id", { count: "exact", head: true })
    .eq("topic_id", topicId)
    .eq("answer_index", answerIndex);
  if (error) throw error;
  return count ?? 0;
}

export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(_req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { id, answerIndex: rawAnswerIndex } = await ctx.params;
    const answerIndex = parseAnswerIndex(rawAnswerIndex);
    if (!UUID_RE.test(id) || answerIndex < 0) {
      return NextResponse.json({ success: false, error: "无效的热议回答 ID" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const topic = await ensureTopicAnswer(supabase, id, answerIndex);
    if (topic.error) {
      return NextResponse.json({ success: false, error: topic.error }, { status: 500 });
    }
    if (topic.notFound) {
      return NextResponse.json({ success: false, error: "未找到" }, { status: 404 });
    }

    const { error } = await supabase
      .from("community_hot_topic_answer_likes")
      .upsert(
        { topic_id: id, answer_index: answerIndex, user_id: user.id },
        { onConflict: "topic_id,answer_index,user_id", ignoreDuplicates: true }
      );
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const likeCount = await readLikeCount(supabase, id, answerIndex);
    return NextResponse.json({
      success: true,
      data: { liked: true, like_count: likeCount },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await getUserFromBearer(_req);
    if (!user) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { id, answerIndex: rawAnswerIndex } = await ctx.params;
    const answerIndex = parseAnswerIndex(rawAnswerIndex);
    if (!UUID_RE.test(id) || answerIndex < 0) {
      return NextResponse.json({ success: false, error: "无效的热议回答 ID" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const topic = await ensureTopicAnswer(supabase, id, answerIndex);
    if (topic.error) {
      return NextResponse.json({ success: false, error: topic.error }, { status: 500 });
    }
    if (topic.notFound) {
      return NextResponse.json({ success: false, error: "未找到" }, { status: 404 });
    }

    const { error } = await supabase
      .from("community_hot_topic_answer_likes")
      .delete()
      .eq("topic_id", id)
      .eq("answer_index", answerIndex)
      .eq("user_id", user.id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const likeCount = await readLikeCount(supabase, id, answerIndex);
    return NextResponse.json({
      success: true,
      data: { liked: false, like_count: likeCount },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
