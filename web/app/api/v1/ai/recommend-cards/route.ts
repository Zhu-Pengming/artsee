import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";

type RecommendCard = {
  id: string;
  card_type: "school" | "event" | "opportunity" | "article" | "tool";
  title: string;
  subtitle?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  reason?: string | null;
  action_path?: string | null;
};

function fallbackCards(): RecommendCard[] {
  return [
    {
      id: "tool-school-compare",
      card_type: "tool",
      title: "院校 AI 比对",
      subtitle: "按国家、专业、预算快速筛选申请方向",
      target_type: "tool",
      target_id: "school_compare",
      reason: "节点二默认推荐",
      action_path: "/schools",
    },
    {
      id: "tool-portfolio-advice",
      card_type: "tool",
      title: "作品集诊断评分",
      subtitle: "从叙事、媒介、项目结构给出优化建议",
      target_type: "tool",
      target_id: "portfolio_advice",
      reason: "节点二默认推荐",
      action_path: "/ai",
    },
    {
      id: "tool-opportunity",
      card_type: "tool",
      title: "合作机会匹配",
      subtitle: "查找展览邀约、品牌联名与商业合作",
      target_type: "tool",
      target_id: "opportunities",
      reason: "节点二默认推荐",
      action_path: "/opportunities",
    },
  ];
}

async function safeSelect<T>(
  table: string,
  select: string,
  transform: (row: Record<string, any>) => T,
  limit = 2,
): Promise<T[]> {
  try {
    const { data, error } = await createServiceClient()
      .from(table)
      .select(select)
      .limit(limit);
    if (error || !data) return [];
    return data.map((row) => transform(row as Record<string, any>));
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const user = await getUserFromBearer(req);
  const cards: RecommendCard[] = [];

  if (user) {
    const saved = await safeSelect<RecommendCard>(
      "ai_recommend_cards",
      "id, card_type, target_id, reason, status",
      (row) => ({
        id: String(row.id),
        card_type: String(row.card_type || "tool") as RecommendCard["card_type"],
        title: String(row.reason || "为你推荐"),
        target_type: String(row.card_type || "tool"),
        target_id: row.target_id ? String(row.target_id) : null,
        reason: row.reason ? String(row.reason) : "基于你的使用记录推荐",
      }),
      4,
    );
    cards.push(...saved.filter((card) => card.reason));
  }

  const [schools, events, opportunities] = await Promise.all([
    safeSelect<RecommendCard>(
      "schools",
      "id, name_zh, name_en, country, city, rank",
      (row) => ({
        id: `school-${row.id}`,
        card_type: "school",
        title: String(row.name_zh || row.name_en || "推荐院校"),
        subtitle: [row.country, row.city, row.rank ? `排名 ${row.rank}` : null].filter(Boolean).join(" · "),
        target_type: "school",
        target_id: String(row.id),
        reason: "适合从首页快速进入院校详情",
        action_path: `/schools/${row.id}`,
      }),
    ),
    safeSelect<RecommendCard>(
      "events",
      "id, title, city, type, start_time, status",
      (row) => ({
        id: `event-${row.id}`,
        card_type: "event",
        title: String(row.title || "推荐活动"),
        subtitle: [row.city, row.type].filter(Boolean).join(" · "),
        target_type: "event",
        target_id: String(row.id),
        reason: "近期艺术活动",
        action_path: `/events/${row.id}`,
      }),
    ),
    safeSelect<RecommendCard>(
      "opportunities",
      "id, title, type, city, budget_min, budget_max, status",
      (row) => ({
        id: `opportunity-${row.id}`,
        card_type: "opportunity",
        title: String(row.title || "合作机会"),
        subtitle: [row.city, row.type].filter(Boolean).join(" · "),
        target_type: "opportunity",
        target_id: String(row.id),
        reason: "可申请的合作机会",
        action_path: `/opportunities/${row.id}`,
      }),
    ),
  ]);

  cards.push(...schools, ...events, ...opportunities);
  const data = cards.length > 0 ? cards.slice(0, 8) : fallbackCards();
  return NextResponse.json({ success: true, data });
}
