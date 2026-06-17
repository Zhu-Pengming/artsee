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

// 6 维雷达图评分函数（优化版）
function calculateRadarScores(
  schools: Record<string, unknown>[],
  userProfile?: { target_majors?: string[]; budget_range?: string }
) {
  const dimensions = ['学术声誉', '专业匹配', '作品集难度', '申请竞争', '就业资源', '成本友好'];
  
  const scores = schools.map((school) => {
    // 1. 学术声誉 (0-100): 基于 QS 排名，非线性映射
    const rank = Number(rankValue(school));
    const academicScore = rank > 0 
      ? Math.max(0, Math.min(100, 100 - Math.log(rank) * 15))
      : 70;
    
    // 2. 专业匹配 (0-100): 基于专业数量 + 用户画像匹配
    const programCount = Number(school.program_count ?? 0);
    const majorTags = Array.isArray(school.major_tags) ? school.major_tags : [];
    const userMajors = userProfile?.target_majors ?? [];
    
    // 基础分：专业数量
    let matchScore = Math.min(80, 50 + programCount * 1.5);
    
    // 加分：用户目标专业匹配
    if (userMajors.length > 0 && majorTags.length > 0) {
      const matchCount = userMajors.filter((major: string) =>
        majorTags.some((tag: string) => 
          String(tag).toLowerCase().includes(major.toLowerCase()) ||
          major.toLowerCase().includes(String(tag).toLowerCase())
        )
      ).length;
      matchScore += matchCount * 10;
    }
    
    matchScore = Math.min(100, matchScore);
    
    // 3. 作品集难度 (0-100): 使用数据库实际评级
    const portfolioDifficulty = Number(school.portfolio_difficulty ?? 0);
    const portfolioScore = portfolioDifficulty > 0 
      ? portfolioDifficulty * 20  // 1-5 映射到 20-100
      : (rank > 0 && rank <= 10 ? 90 : rank <= 50 ? 75 : 60);
    
    // 4. 申请竞争 (0-100): 基于录取率（越低越难）
    const acceptanceRate = Number(school.acceptance_rate ?? 0);
    let competitionScore: number;
    if (acceptanceRate > 0) {
      // 录取率越低，竞争越激烈，分数越高
      competitionScore = Math.max(0, Math.min(100, 100 - acceptanceRate * 1.5));
    } else {
      // 无数据时基于排名推断
      competitionScore = rank > 0 && rank <= 10 ? 95 : rank <= 50 ? 80 : 65;
    }
    
    // 5. 就业资源 (0-100): 使用数据库评级
    const careerRating = Number(school.career_resources_rating ?? 0);
    const careerScore = careerRating > 0 
      ? careerRating * 20  // 1-5 映射到 20-100
      : 70;
    
    // 6. 成本友好 (0-100): 学费 + 城市生活费综合
    const tuitionUsd = Number(school.tuition_usd_per_year ?? 0);
    const cityCostIndex = Number(school.city_cost_index ?? 3);
    
    // 学费评分（假设 $50,000/年为中等）
    const tuitionScore = tuitionUsd > 0 
      ? Math.max(0, 100 - (tuitionUsd / 500))
      : 50;
    
    // 生活费评分（1-5 映射到 100-20）
    const livingCostScore = 120 - cityCostIndex * 20;
    
    // 综合成本友好度（学费占 60%，生活费占 40%）
    const costScore = tuitionScore * 0.6 + livingCostScore * 0.4;
    
    return {
      school_id: String(school.id),
      values: [
        Math.round(academicScore),
        Math.round(matchScore),
        Math.round(portfolioScore),
        Math.round(competitionScore),
        Math.round(careerScore),
        Math.round(costScore),
      ],
    };
  });
  
  const dimensionExplanations = [
    {
      label: '学术声誉',
      summary: '基于 QS 艺术设计排名，采用非线性映射。排名前 10 的院校在学术声誉上有显著优势，适合追求顶尖学术环境的申请者。',
    },
    {
      label: '专业匹配',
      summary: userProfile?.target_majors && userProfile.target_majors.length > 0
        ? `综合专业数量和您的目标方向（${userProfile.target_majors.join('、')}）匹配度评估。专业覆盖面广且与您方向契合的院校得分更高。`
        : '基于学校开设的艺术设计专业数量和覆盖面评估。专业池越广，选择空间越大，匹配度越高。',
    },
    {
      label: '作品集难度',
      summary: '基于院校实际作品集要求评级（1-5 级）。高难度院校更看重概念深度、实验性和批判性思维，需要更充分的准备时间。',
    },
    {
      label: '申请竞争',
      summary: '基于录取率数据评估。录取率越低，竞争越激烈。顶尖院校录取率通常在 5-15%，需要更强的综合实力和差异化优势。',
    },
    {
      label: '就业资源',
      summary: '综合城市艺术产业资源、学校行业连接和校友网络评估。伦敦、纽约、巴黎等艺术中心城市的院校在实习和就业机会上更具优势。',
    },
    {
      label: '成本友好',
      summary: '综合年学费（60%）和城市生活费（40%）评估。伦敦、纽约等城市生活成本较高，需要更充足的预算准备。',
    },
  ];
  
  return { dimensions, scores, dimensionExplanations };
}

function makeSnapshot(
  schools: Record<string, unknown>[],
  userProfile?: { target_majors?: string[]; budget_range?: string }
) {
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

  // 生成雷达图数据（传递用户画像）
  const radarData = calculateRadarScores(schools, userProfile);

  return {
    schools: schools.map((school) => ({
      id: school.id,
      name: displayName(school),
      name_zh: school.name_zh,
      name_en: school.name_en,
      city: school.city,
      country: school.country ?? school.raw_country,
      rank: rankValue(school),
      type: school.school_type,
      logo_url: school.logo_url,
    })),
    rows,
    // 雷达图数据
    dimensions: radarData.dimensions,
    scores: radarData.scores,
    dimension_explanations: radarData.dimensionExplanations,
    insight:
      schools.length < 2
        ? "请选择至少两所院校生成对比。"
        : schools.length === 2
        ? `${displayName(schools[0])} 和 ${displayName(schools[1])} 各有特色。建议综合考虑学术声誉、专业匹配、作品集要求、申请竞争、就业资源和成本压力，选择最适合你的院校。`
        : `已对比 ${schools.length} 所院校。建议优先关注专业匹配度和就业资源，同时平衡作品集难度和申请竞争。研究型项目看重概念深度，综合型院校看重行业网络。`,
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

    const user = await getUserFromBearer(req);
    
    // 获取用户画像（如果有）
    let userProfile: { target_majors?: string[]; budget_range?: string } | undefined;
    if (user?.id) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("target_majors, budget_range")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        userProfile = {
          target_majors: Array.isArray(profile.target_majors) ? profile.target_majors : [],
          budget_range: profile.budget_range ?? undefined,
        };
      }
    }

    const snapshot = makeSnapshot(ordered, userProfile);
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
