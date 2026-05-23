/**
 * 记忆抽取 - 从用户消息中抽取画像信息
 * 
 * 使用轻模型(GLM glm-4-flash)做结构化抽取
 */

export interface ExtractedItem {
  field: string;           // 字段名,对应 user_profiles 的列名
  value: unknown;          // 新值
  action: 'create' | 'update' | 'delete' | 'append';
  confidence: number;      // 置信度 0-1
  reason: string;          // 抽取依据(用户原话片段)
}

export interface ExtractResult {
  items: ExtractedItem[];
  rawResponse?: string;    // 原始 LLM 响应(用于 debug)
}

const GLM_API_KEY = process.env.GLM_API_KEY;
const GLM_BASE_URL = process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
const EXTRACT_MODEL = 'glm-4-flash';

/**
 * 从用户消息中抽取画像信息
 * 
 * @param userMessage - 用户消息
 * @param assistantMessage - AI 回复(可选,用作上下文理解)
 * @returns 抽取结果
 */
export async function extractProfileFromMessage(
  userMessage: string,
  assistantMessage?: string
): Promise<ExtractResult> {
  if (!GLM_API_KEY) {
    console.warn('[extractProfileFromMessage] GLM_API_KEY not configured, skipping extraction');
    return { items: [] };
  }

  const systemPrompt = `你是一个用户画像抽取器。从用户的对话中抽取以下画像信息:

**可抽取的字段**(对应 user_profiles 表):
- target_countries: 目标国家(数组,如 ["英国", "美国"])
- target_majors: 目标专业(数组,如 ["视觉传达", "平面设计"])
- target_degree: 目标学位(字符串,枚举: foundation/bachelor/master/phd)
- portfolio_status: 作品集状态(字符串,枚举: not_started/brainstorming/in_progress/mostly_done/refining)
- english_test_type: 语言考试类型(字符串,枚举: toefl/ielts/duolingo/not_taken)
- english_test_score: 语言考试分数(字符串,如 "雅思 7.0" 或 "托福 105")
- total_budget_range: 总预算范围(字符串,枚举: under_30/30_50/50_80/80_plus)
- target_intake: 目标入学时间(字符串,枚举: 2025_fall/2026_spring/2026_fall/2027_fall/flexible)
- current_school: 当前学校(字符串)
- current_major: 当前专业(字符串)
- gpa_or_grade: GPA/成绩(字符串)
- school_type_preference: 学校类型偏好(数组,枚举: comprehensive_university/art_academy/design_school)
- ranking_sensitivity: 排名敏感度(字符串,枚举: very_important/moderately/not_important)
- city_preference: 城市偏好(字符串,枚举: big_city/small_town/doesnt_matter)
- portfolio_style_tendency: 作品集风格倾向(数组,枚举: conceptual/commercial/craft_based/experimental/narrative)
- favorite_artists_or_styles: 喜欢的艺术家/风格(字符串,自由文本)
- priority_factors: 关注优先级(数组,枚举: reputation/teaching/career/culture/cost/location/faculty/alumni)

**抽取规则**:
1. 只从用户消息中抽取,不要从 AI 回复中抽取
2. 只抽取用户明确陈述的信息,不要推测
3. 如果用户说"我改主意了"/"算了不去XX了",action 设为 'delete'
4. 如果用户说"我还想考虑XX",action 设为 'append'(追加到数组)
5. 如果用户说"我托福考到了105",action 设为 'update'
6. 置信度:明确陈述 0.9,暗示 0.6,不确定 0.3
7. 假设性发问("如果我...")不抽取
8. 第三人称("我朋友想申请...")不抽取

**输出格式**(严格 JSON):
{
  "items": [
    {
      "field": "target_countries",
      "value": ["英国"],
      "action": "update",
      "confidence": 0.9,
      "reason": "用户说'我想去英国'"
    }
  ]
}

如果没有可抽取的信息,返回 {"items": []}`;

  const userPrompt = `用户消息:\n${userMessage}${
    assistantMessage ? `\n\nAI 回复(仅供理解上下文,不要从中抽取):\n${assistantMessage}` : ''
  }`;

  try {
    const response = await fetch(`${GLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: EXTRACT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1, // 低温度,减少随机性
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('[extractProfileFromMessage] GLM API error:', response.statusText);
      return { items: [] };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.warn('[extractProfileFromMessage] Empty response from GLM');
      return { items: [] };
    }

    const parsed = JSON.parse(content);
    const items = parsed.items || [];

    // 过滤掉置信度过低的项
    const filtered = items.filter((item: ExtractedItem) => item.confidence >= 0.5);

    return {
      items: filtered,
      rawResponse: content,
    };
  } catch (error) {
    console.error('[extractProfileFromMessage] Error:', error);
    return { items: [] };
  }
}
