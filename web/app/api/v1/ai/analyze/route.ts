/**
 * POST /api/v1/ai/analyze
 * 院校分析接口 - 替代前端客户端 analyzeInstitutions
 * 
 * 用途:
 * 前端旧的 analyzeInstitutions 是直接调客户端 Gemini 的。
 * 阶段 3 新增此后端接口,支持画像注入,前端需切流量过来。
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServiceClient } from '@/lib/api/supabase-service';
import { getUserFromBearer } from '@/lib/api/auth-user';
import { loadUserProfile, formatFullProfile, fireRecordFromTurn } from '@/lib/memory';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromBearer(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { institutionIds } = body;

    if (!institutionIds || !Array.isArray(institutionIds) || institutionIds.length === 0) {
      return NextResponse.json(
        { error: 'institutionIds is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    // 加载用户画像
    const userProfile = await loadUserProfile(user.id);

    // 拉取院校数据
    const supabase = createServiceClient();
    const { data: schools, error } = await supabase
      .from('schools')
      .select('*')
      .in('id', institutionIds);

    if (error || !schools || schools.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch schools data' },
        { status: 500 }
      );
    }

    // 构建 system prompt,注入用户画像
    let systemPrompt = `你是 Artiqore 艺衡的 AI 艺术留学顾问。根据用户的背景和以下院校数据,生成个性化的院校分析报告。

要求:
1. 分析每所院校与用户背景的匹配度
2. 指出优势和劣势
3. 给出申请建议
4. 输出严格为 JSON 格式

输出格式:
{
  "analyses": [
    {
      "schoolId": 123,
      "schoolName": "学校名",
      "matchScore": 85,
      "strengths": ["优势1", "优势2"],
      "weaknesses": ["劣势1"],
      "recommendations": ["建议1", "建议2"]
    }
  ]
}`;

    if (userProfile) {
      const profileText = formatFullProfile(userProfile, {
        identity: true,
        constraints: true,
        preferences: 'full',
      });
      if (profileText) {
        systemPrompt += `\n\n${profileText}`;
      }
    }

    const userMsg = `请分析以下院校:\n${JSON.stringify(schools, null, 2)}`;

    // 调用 LLM
    const apiKey = process.env.OPENAI_API_KEY || process.env.MOONSHOT_API_KEY;
    const baseURL = process.env.OPENAI_API_KEY
      ? 'https://api.openai.com/v1'
      : 'https://api.moonshot.cn/v1';
    const model = process.env.OPENAI_API_KEY ? 'gpt-4o-mini' : 'moonshot-v1-8k';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'LLM API key not configured' },
        { status: 503 }
      );
    }

    const client = new OpenAI({ apiKey, baseURL });
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMsg },
      ],
      response_format: { type: 'json_object' },
    });

    const text = completion.choices[0]?.message?.content ?? '{}';
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { error: 'parse_failed', raw: text };
    }

    // 异步触发 record(从用户选择的院校 IDs 推断偏好)
    // 注:这里简化处理,实际可以从用户选择行为推断 favorite_schools
    // 但按 PLAN.md 的约束,不应该从 AI 输出反哺,所以这里只记录用户行为
    fireRecordFromTurn({
      userId: user.id,
      userMessage: `用户请求分析院校 ID: ${institutionIds.join(', ')}`,
      sourceRoute: 'analyze',
    });

    return NextResponse.json({
      success: true,
      result: parsed,
    });
  } catch (error: any) {
    console.error('[POST /api/v1/ai/analyze] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
