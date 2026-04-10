import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/api/supabase-service";

/**
 * POST /api/v1/ai/schools/search
 * body: { query: string, limitPrograms?: number }
 * 从数据库拉取院校/项目摘要，结合大模型生成结构化推荐（表格字段在 JSON 内）
 */
export async function POST(req: NextRequest) {
  try {
    const { query, limitPrograms = 40 } = (await req.json()) as {
      query?: string;
      limitPrograms?: number;
    };
    const q = (query ?? "").trim();
    if (!q) {
      return NextResponse.json({ success: false, error: "query 不能为空" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: programs, error: pe } = await supabase
      .from("programs")
      .select(
        `
        id, program_name, degree_type, program_overview,
        schools:school_id (name_zh, country, qs_art_rank)
      `
      )
      .eq("status", "active")
      .limit(Math.min(limitPrograms, 80));

    if (pe) {
      return NextResponse.json({ success: false, error: pe.message }, { status: 500 });
    }

    const compact = (programs ?? []).map((p: Record<string, unknown>) => ({
      id: p.id,
      program: p.program_name,
      degree: p.degree_type,
      school: (p.schools as { name_zh?: string } | null)?.name_zh,
      country: (p.schools as { country?: string } | null)?.country,
      qs: (p.schools as { qs_art_rank?: number } | null)?.qs_art_rank,
      overview: (p.program_overview as string)?.slice(0, 200) ?? "",
    }));

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

    const client = new OpenAI({ apiKey, baseURL });

    const system = `你是 ArtLink 艺衡的选校顾问。根据用户问题和下列院校项目数据，输出 JSON（不要 markdown），格式严格为：
{"summary":"一句中文总结","rows":[{"school":"学校中文名","program":"专业名","match":"高/中/低","reason":"不超过80字理由"}],"tips":["可选建议1","建议2"]}
只从提供的数据中选最多 8 条，match 表示与用户问题的匹配程度。`;

    const userMsg = `用户问题：${q}\n\n数据：${JSON.stringify(compact).slice(0, 12000)}`;

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.3,
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

    return NextResponse.json({
      success: true,
      query: q,
      model,
      result: parsed,
      source_count: compact.length,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
