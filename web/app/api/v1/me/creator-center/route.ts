import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api/authz";
import { errorResponse } from "@/lib/api/route-helpers";
import { createServiceClient } from "@/lib/api/supabase-service";

type CreatorLevel = "none" | "creator" | "active_creator" | "opinion_leader";

const LEVELS: Array<{
  level: CreatorLevel;
  label: string;
  minContentCount: number;
  minScore: number;
}> = [
  { level: "none", label: "普通用户", minContentCount: 0, minScore: 0 },
  { level: "creator", label: "内容创作者", minContentCount: 3, minScore: 30 },
  { level: "active_creator", label: "活跃创作者", minContentCount: 10, minScore: 100 },
  { level: "opinion_leader", label: "意见领袖", minContentCount: 30, minScore: 1000 },
];

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function levelIndex(level: unknown) {
  const text = typeof level === "string" ? level : "none";
  return Math.max(
    0,
    LEVELS.findIndex((item) => item.level === text)
  );
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ("response" in auth) return auth.response;

    const { data, error } = await createServiceClient()
      .from("user_profiles")
      .select("creator_level,content_count,creator_score,creator_upgraded_at")
      .eq("id", auth.user.id)
      .maybeSingle();
    if (error) return errorResponse(error);

    const contentCount = numberValue(data?.content_count);
    const creatorScore = numberValue(data?.creator_score);
    const currentIndex = levelIndex(data?.creator_level);
    const current = LEVELS[currentIndex] ?? LEVELS[0];
    const next = LEVELS[currentIndex + 1] ?? null;

    return NextResponse.json({
      success: true,
      data: {
        creator_level: current.level,
        creator_label: current.label,
        content_count: contentCount,
        creator_score: creatorScore,
        creator_upgraded_at: data?.creator_upgraded_at ?? null,
        next_level: next
          ? {
              creator_level: next.level,
              creator_label: next.label,
              min_content_count: next.minContentCount,
              min_creator_score: next.minScore,
              remaining_content_count: Math.max(0, next.minContentCount - contentCount),
              remaining_creator_score: Math.max(0, next.minScore - creatorScore),
            }
          : null,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
