import { createNotification } from "./notifications";
import { createServiceClient } from "./supabase-service";

type ServiceClient = ReturnType<typeof createServiceClient>;

type CreatorLevel = "none" | "creator" | "active_creator" | "opinion_leader";

type CreatorProfile = {
  creator_level?: CreatorLevel | string | null;
  content_count?: number | null;
  creator_score?: number | null;
};

const LEVEL_LABELS: Record<CreatorLevel, string> = {
  none: "普通用户",
  creator: "内容创作者",
  active_creator: "活跃创作者",
  opinion_leader: "意见领袖",
};

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function nextLevel(contentCount: number, creatorScore: number): CreatorLevel {
  if (creatorScore >= 1000 || contentCount >= 30) return "opinion_leader";
  if (contentCount >= 10) return "active_creator";
  if (contentCount >= 3) return "creator";
  return "none";
}

function levelRank(level: string | null | undefined) {
  return ["none", "creator", "active_creator", "opinion_leader"].indexOf(level || "none");
}

export async function recordCreatorContent(
  supabase: ServiceClient,
  userId: string | null | undefined,
  options: { score?: number; sourceType?: string; sourceId?: string } = {}
) {
  if (!userId) return null;

  const { data: profile, error: readError } = await supabase
    .from("user_profiles")
    .select("creator_level,content_count,creator_score")
    .eq("id", userId)
    .maybeSingle();
  if (readError) throw new Error(readError.message ?? JSON.stringify(readError));

  const current = (profile ?? {}) as CreatorProfile;
  const previousLevel = (current.creator_level || "none") as CreatorLevel;
  const contentCount = numberValue(current.content_count) + 1;
  const creatorScore = numberValue(current.creator_score) + (options.score ?? 10);
  const creatorLevel = nextLevel(contentCount, creatorScore);
  const upgraded = levelRank(creatorLevel) > levelRank(previousLevel);

  const patch = {
    content_count: contentCount,
    creator_score: creatorScore,
    creator_level: creatorLevel,
    ...(upgraded ? { creator_upgraded_at: new Date().toISOString() } : {}),
  };

  const { data, error } = await supabase
    .from("user_profiles")
    .update(patch)
    .eq("id", userId)
    .select("creator_level,content_count,creator_score,creator_upgraded_at")
    .single();
  if (error) throw new Error(error.message ?? JSON.stringify(error));

  if (upgraded) {
    await createNotification(supabase, userId, {
      title: `你已升级为${LEVEL_LABELS[creatorLevel]}`,
      content: `已发布 ${contentCount} 条有效内容，继续保持创作节奏。`,
      type: "creator_level",
      metadata: {
        creator_level: creatorLevel,
        previous_level: previousLevel,
        content_count: contentCount,
        creator_score: creatorScore,
        source_type: options.sourceType ?? null,
        source_id: options.sourceId ?? null,
      },
    });
  }

  return data;
}
