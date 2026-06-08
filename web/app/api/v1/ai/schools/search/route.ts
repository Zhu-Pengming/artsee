import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";
import { getUserFromBearer } from "@/lib/api/auth-user";
import { loadUserProfile, formatFullProfile, rerankSchoolsWithProfile, fireRecordFromTurn } from "@/lib/memory";
import { resolveSchoolAliasSlugs } from "@/lib/school-aliases";

function mergeSchools(
  primary: Array<Record<string, unknown>> = [],
  secondary: Array<Record<string, unknown>> = []
) {
  const seen = new Set<string>();
  const merged: Array<Record<string, unknown>> = [];
  for (const school of [...primary, ...secondary]) {
    const key = String(school.id ?? school.slug ?? "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(school);
  }
  return merged;
}

/**
 * POST /api/v1/ai/schools/search
 * body: { query: string, limitSchools?: number }
 * 从数据库拉取院校完整信息，结合大模型生成艺术留学咨询回答
 */
export async function POST(req: NextRequest) {
  try {
    const { query, limitSchools = 20 } = (await req.json()) as {
      query?: string;
      limitSchools?: number;
    };
    const q = (query ?? "").trim();
    if (!q) {
      return NextResponse.json({ success: false, error: "query 不能为空" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.MOONSHOT_API_KEY;
    const baseURL =
      process.env.OPENAI_BASE_URL ||
      process.env.AI_BASE_URL ||
      "https://api.openai.com/v1";
    const model = process.env.AI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "未配置 OPENAI_API_KEY 或 MOONSHOT_API_KEY",
        },
        { status: 503 }
      );
    }

    // 加载用户画像
    const user = await getUserFromBearer(req);
    const userProfile = user ? await loadUserProfile(user.id) : null;

    const aliasSlugs = resolveSchoolAliasSlugs(q);
    const supabase = createServiceClient();
    let exactSchools: Array<Record<string, unknown>> = [];
    if (aliasSlugs.length > 0) {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("status", "active")
        .in("slug", aliasSlugs);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      exactSchools = (data ?? []) as Array<Record<string, unknown>>;
    }

    const { data: schools, error: se } = await supabase
      .from("schools")
      .select("*")
      .eq("status", "active")
      .order("qs_art_design_rank", { ascending: true })
      .limit(Math.min(limitSchools, 80));

    if (se) {
      return NextResponse.json({ success: false, error: se.message }, { status: 500 });
    }

    // 基于用户画像 rerank 学校列表
    const rerankResult = rerankSchoolsWithProfile(schools ?? [], userProfile);
    const schoolsForPrompt = mergeSchools(exactSchools, rerankResult.items);

    const compact = schoolsForPrompt.map((s: Record<string, unknown>) => ({
      id: s.id,
      slug: s.slug,
      name_zh: s.name_zh,
      name_en: s.name_en,
      country: s.country,
      city: s.city,
      qs_art_design_rank: s.qs_art_design_rank,
      qs_overall_rank: s.qs_overall_rank,
      school_tier: s.school_tier,
      school_type: s.school_type,
      founded_year: s.founded_year,
      description: (s.description as string)?.slice(0, 300) ?? "",
      feature_tags: s.feature_tags,
      strength_disciplines: s.strength_disciplines,
      entry_score_requirements: s.entry_score_requirements,
      application_deadline: s.application_deadline,
      annual_intake: s.annual_intake,
      notable_alumni: (s.notable_alumni as string)?.slice(0, 200) ?? "",
    }));

    const client = new OpenAI({ apiKey, baseURL });

    // 构建 system prompt,注入用户画像
    let system = `你是 Artiqore 艺衡的 AI 艺术留学顾问。根据用户咨询问题和下列院校数据，给出专业、友好的中文回答。

要求：
1. 只基于提供的院校数据作答，不要编造不存在的信息。
2. 如果涉及具体院校推荐，优先从数据中挑选最匹配的 3-6 所，并简要说明推荐理由（结合 QS 排名、优势学科、地理位置、申请要求等）。
3. 回答结构清晰，可分段落，可包含小标题。
4. 如果用户问题无法从数据中直接回答，给出合理的通用建议，并诚实说明哪些信息需要进一步确认。
5. 如果用户使用 UAL/RCA/RISD/SVA/CSM/LCF/LCC 等缩写或中文俗称，必须按“确定性别名命中”理解，不要把 UAL 误当作 Visual 里的字母片段。

输出严格为 JSON（不要 markdown），格式：
{"summary":"对用户问题的直接回答（可分段）","recommendations":[{"school":"学校中文名","reason":"推荐理由（80字内）","tags":["标签1","标签2"]}],"tips":["建议1","建议2"]}`;

    // 注入用户画像
    if (userProfile) {
      const profileText = formatFullProfile(userProfile, {
        identity: true,
        constraints: true,
        preferences: 'full',
      });
      if (profileText) {
        system += `\n\n${profileText}`;
        
        // 显式排除用户不考虑的国家(如果有)
        // 注:这里简化处理,实际应该从画像推断"不考虑的国家"
        // 例如用户只选了"英国",则排除其他国家
        if (userProfile.target_countries && userProfile.target_countries.length > 0) {
          system += `\n\n**重要约束**:用户主要考虑 ${userProfile.target_countries.join('、')} 的院校,其他国家的院校优先级较低。`;
        }
      }
    }

    const exactMatchText = exactSchools.length
      ? `\n\n确定性别名命中（必须优先理解为用户明确提到的院校）：${JSON.stringify(
          exactSchools.map((school) => ({
            slug: school.slug,
            name_zh: school.name_zh,
            name_en: school.name_en,
          }))
        )}`
      : "";
    const userMsg = `用户问题：${q}${exactMatchText}\n\n院校数据（共 ${compact.length} 条）：${JSON.stringify(compact).slice(0, 12000)}`;

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text, error: "parse_failed" };
    }

    // 阶段 3:异步触发 record(fire-and-forget)
    // 重要:只从 user query 触发,AI 输出的 JSON 推荐禁止喂给 record
    if (user) {
      fireRecordFromTurn({
        userId: user.id,
        userMessage: q,
        // 不传 assistantMessage,避免 AI 推荐结果被反哺到画像
        sourceRoute: 'schools_search',
      });
    }

    return NextResponse.json({
      success: true,
      query: q,
      model,
      result: parsed,
      source_count: compact.length,
      exact_match_slugs: aliasSlugs,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
