import { NextRequest, NextResponse } from "next/server";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { createServiceClient } from "@/lib/api/supabase-service";
import { errorResponse } from "@/lib/api/route-helpers";

const DIMENSIONS = ["rank", "location", "portfolio", "programs", "cost", "career"];

function rankValue(school: Record<string, unknown>) {
  return school.qs_art_design_rank ?? school.qs_art_rank ?? school.rank ?? null;
}

function displayName(school: Record<string, unknown>) {
  return school.name_zh ?? school.name_en ?? school.name ?? "未命名院校";
}

function makeSnapshot(schools: Record<string, unknown>[]) {
  const ranks = schools
    .map((school) => Number(rankValue(school)))
    .filter((value) => Number.isFinite(value) && value > 0);
  const bestRank = ranks.length > 0 ? Math.min(...ranks) : null;

  const rows = [
    {
      key: "rank",
      label: "排名",
      values: schools.map((school) => {
        const rank = rankValue(school);
        return rank ? `#${rank}` : "暂无";
      }),
      winner:
        bestRank == null
          ? "看专业"
          : String(displayName(schools.find((school) => Number(rankValue(school)) === bestRank) ?? schools[0])),
    },
    {
      key: "location",
      label: "城市资源",
      values: schools.map((school) =>
        [school.city, school.country ?? school.raw_country].filter(Boolean).join(", ") || "待补充"
      ),
      winner: "看城市",
    },
    {
      key: "portfolio",
      label: "作品集方向",
      values: schools.map((school) =>
        String(
          school.portfolio_direction ??
            school.advantage_subjects ??
            school.school_type ??
            "按目标专业判断"
        )
      ),
      winner: "看方向",
    },
    {
      key: "programs",
      label: "专业矩阵",
      values: schools.map((school) =>
        String(school.program_summary ?? school.school_type ?? "需结合专业列表")
      ),
      winner: "看专业",
    },
    {
      key: "cost",
      label: "费用压力",
      values: schools.map((school) =>
        String(school.tuition_summary ?? school.tuition ?? school.estimated_cost ?? "待补充")
      ),
      winner: "看预算",
    },
    {
      key: "career",
      label: "就业路径",
      values: schools.map((school) =>
        String(school.career_direction ?? school.employment_summary ?? school.description ?? "待补充")
      ),
      winner: "看履历",
    },
  ];

  return {
    schools: schools.map((school) => ({
      id: school.id,
      name: displayName(school),
      name_en: school.name_en,
      city: school.city,
      country: school.country ?? school.raw_country,
      rank: rankValue(school),
      type: school.school_type,
      logo_url: school.logo_url,
    })),
    rows,
    insight:
      schools.length < 2
        ? "请选择至少两所院校生成对比。"
        : "建议把排名作为参考，把作品集方向、城市资源、预算压力和就业路径作为最终决策维度。研究型项目优先看导师与项目叙事，综合型院校优先看专业矩阵和行业网络。",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const schoolIds = Array.isArray(body.school_ids)
      ? body.school_ids.map(String).filter(Boolean).slice(0, 5)
      : [];
    if (schoolIds.length < 2) {
      return NextResponse.json(
        { success: false, error: "请至少选择两所院校" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: schools, error } = await supabase
      .from("schools")
      .select("*")
      .in("id", schoolIds);
    if (error) return errorResponse(error);

    const ordered = schoolIds
      .map((id: string) => (schools ?? []).find((school: { id: string }) => school.id === id))
      .filter(Boolean) as Record<string, unknown>[];
    if (ordered.length < 2) {
      return NextResponse.json(
        { success: false, error: "未找到足够的院校数据" },
        { status: 404 }
      );
    }

    const snapshot = makeSnapshot(ordered);
    const user = await getUserFromBearer(req);
    const dimensions = Array.isArray(body.dimensions)
      ? body.dimensions.map(String)
      : DIMENSIONS;

    let comparisonId: string | null = null;
    const { data: saved } = await supabase
      .from("school_comparisons")
      .insert({
        user_id: user?.id ?? null,
        school_ids: ordered.map((school) => String(school.id)),
        dimensions,
        result_snapshot: snapshot,
      })
      .select("id")
      .single();
    comparisonId = saved?.id ?? null;

    return NextResponse.json({
      success: true,
      data: {
        id: comparisonId,
        ...snapshot,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
