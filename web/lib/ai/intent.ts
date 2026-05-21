/**
 * 意图分类器 - 识别用户问题意图并决定画像注入策略
 */

import OpenAI from 'openai';

export type IntentType = 
  | 'hard_data'           // 硬数据查询（学费、截止日期、排名）
  | 'open_info'           // 开放性信息查询（氛围、特色、城市）
  | 'recommendation'      // 推荐/匹配/对比
  | 'application_advice'  // 申请建议/作品集建议/时间规划
  | 'school_fit_analysis' // 适配度分析（我能申上吗）
  | 'meta';               // 元问题（你能做什么）

export interface ProfileSlots {
  identity: boolean;
  constraints: boolean;
  preferences: 'full' | 'partial_portfolio' | 'none';
}

export interface IntentClassification {
  intent: IntentType;
  slots: ProfileSlots;
  confidence: number;
}

/**
 * 规则版意图分类器（Stage 1）
 * Phase 3.4: 增强关键词，添加 school_fit_analysis 意图
 */
export function classifyIntent(question: string): IntentClassification {
  const q = question.toLowerCase();
  
  // 意图 A: 硬数据查询
  const hardDataKeywords = [
    '学费', '费用', '多少钱', '价格', 'tuition', 'cost', '要多少',
    '截止', 'deadline', '申请时间', 'ddl', '截止日期',
    '排名', 'ranking', 'qs', '第几',
    '官网', 'website', '网站', '链接',
    '地址', 'address', '位置', '在哪',
    '联系方式', 'contact', '邮箱', 'email',
  ];
  
  if (hardDataKeywords.some(kw => q.includes(kw))) {
    return {
      intent: 'hard_data',
      slots: {
        identity: true,
        constraints: false,
        preferences: 'none',
      },
      confidence: 0.9,
    };
  }
  
  // 意图 B: 适配度分析（我能申上吗）
  const fitAnalysisKeywords = [
    '能申', '能不能申', '申得上', '有希望', '有可能',
    '我这', '我的背景', '我的条件',
    '够不够', '达标', '符合',
    '录取', '概率', '机会',
  ];
  
  if (fitAnalysisKeywords.some(kw => q.includes(kw))) {
    return {
      intent: 'school_fit_analysis',
      slots: {
        identity: true,
        constraints: true,
        preferences: 'full',
      },
      confidence: 0.85,
    };
  }
  
  // 意图 C: 推荐/匹配/对比
  const recommendationKeywords = [
    '推荐', '匹配', '选择', 'recommend',
    '对比', '比较', 'vs', 'compare', '还是',
    '哪个更好', '哪所', '哪些', '哪个',
    '我该', '应该', '友好', '认可度',
  ];
  
  if (recommendationKeywords.some(kw => q.includes(kw))) {
    return {
      intent: 'recommendation',
      slots: {
        identity: true,
        constraints: true,
        preferences: 'full',
      },
      confidence: 0.85,
    };
  }
  
  // 意图 D: 申请建议/作品集建议
  const adviceKeywords = [
    '作品集', 'portfolio', '作品',
    '申请', 'application', 'apply',
    '准备', 'prepare', '需要准备',
    '建议', 'advice', 'suggestion', '指导',
    '规划', 'plan', '时间线',
    '时间', 'timeline', 'schedule',
    '要求', 'requirement', '需要',
    '怎么申', 'how to apply', '如何申',
  ];
  
  if (adviceKeywords.some(kw => q.includes(kw))) {
    return {
      intent: 'application_advice',
      slots: {
        identity: true,
        constraints: true,
        preferences: 'partial_portfolio',
      },
      confidence: 0.8,
    };
  }
  
  // 意图 E: 元问题
  const metaKeywords = [
    '你是', '你能', '你会', '你可以',
    '什么是', 'what is',
    '帮我', 'help me',
  ];
  
  if (metaKeywords.some(kw => q.includes(kw))) {
    return {
      intent: 'meta',
      slots: {
        identity: false,
        constraints: false,
        preferences: 'none',
      },
      confidence: 0.7,
    };
  }
  
  // 默认: 意图 B - 开放性信息查询
  // Phase 3.4: 特殊处理"怎么样"，避免被 adviceKeywords 中的"怎么"误匹配
  if (q.includes('怎么样')) {
    return {
      intent: 'open_info',
      slots: {
        identity: true,
        constraints: false,
        preferences: 'full',
      },
      confidence: 0.85,
    };
  }
  
  return {
    intent: 'open_info',
    slots: {
      identity: true,
      constraints: false,
      preferences: 'full',
    },
    confidence: 0.6,
  };
}

// LRU Cache for LLM intent classification
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value as K;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
}

const intentCache = new LRUCache<string, IntentClassification>(100);

// Initialize DeepSeek client (lazy)
let deepseekClient: OpenAI | null = null;

function getDeepSeekClient(): OpenAI {
  if (!deepseekClient) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }
    deepseekClient = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
    });
  }
  return deepseekClient;
}

/**
 * LLM 兜底分类器（Stage 2）
 * Phase 3.4: 当规则分类置信度 < 0.7 时调用
 * 
 * 使用 DeepSeek（低成本）
 * 缓存 (query hash → intent) LRU 100条
 */
export async function classifyIntentWithLLM(
  question: string
): Promise<IntentClassification> {
  // Check cache first
  const cached = intentCache.get(question);
  if (cached) {
    console.log('[intent] Cache hit for LLM classification');
    return cached;
  }

  try {
    const deepseek = getDeepSeekClient();
    
    const prompt = `你是一个意图分类器。请分析用户的问题，判断属于以下哪种意图：

1. hard_data - 硬数据查询（学费、截止日期、排名、官网等具体数字或链接）
2. open_info - 开放性信息查询（学校氛围、项目特色、教学风格等）
3. recommendation - 推荐/匹配/对比（哪个学校更好、选择建议、学校对比）
4. application_advice - 申请建议（作品集准备、申请流程、时间规划）
5. school_fit_analysis - 适配度分析（我能申上吗、我的条件够吗）
6. meta - 元问题（你能做什么、你是谁）

用户问题："${question}"

请只返回 JSON 格式：
{
  "intent": "<意图类型>",
  "confidence": <0-1之间的置信度>,
  "reasoning": "<简短解释>"
}`;

    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from DeepSeek');
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from DeepSeek');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const intent = parsed.intent as IntentType;
    const confidence = Math.min(Math.max(parsed.confidence || 0.7, 0), 1);

    // Map intent to slots
    const result: IntentClassification = {
      intent,
      confidence,
      slots: getDefaultSlotsForIntent(intent),
    };

    // Cache the result
    intentCache.set(question, result);
    
    console.log(`[intent] LLM classified as ${intent} (confidence: ${confidence.toFixed(2)})`);
    console.log(`[intent] Reasoning: ${parsed.reasoning}`);

    return result;
  } catch (error) {
    console.error('[intent] LLM classification failed:', error);
    // Fallback to rule-based
    return classifyIntent(question);
  }
}

/**
 * Get default profile slots for an intent
 */
function getDefaultSlotsForIntent(intent: IntentType): ProfileSlots {
  const slotsMap: Record<IntentType, ProfileSlots> = {
    hard_data: {
      identity: true,
      constraints: false,
      preferences: 'none',
    },
    open_info: {
      identity: true,
      constraints: false,
      preferences: 'full',
    },
    recommendation: {
      identity: true,
      constraints: true,
      preferences: 'full',
    },
    application_advice: {
      identity: true,
      constraints: true,
      preferences: 'partial_portfolio',
    },
    school_fit_analysis: {
      identity: true,
      constraints: true,
      preferences: 'full',
    },
    meta: {
      identity: false,
      constraints: false,
      preferences: 'none',
    },
  };
  return slotsMap[intent];
}

/**
 * 统一入口：规则 + LLM 兜底
 * Phase 3.4: 两阶段分类
 */
export async function classifyIntentEnhanced(
  question: string
): Promise<IntentClassification> {
  // Stage 1: Rule-based classification
  const ruleResult = classifyIntent(question);
  
  // If confidence is high enough, return immediately
  if (ruleResult.confidence >= 0.7) {
    return ruleResult;
  }
  
  // Stage 2: LLM fallback (for low confidence cases)
  console.log(`[intent] Low confidence (${ruleResult.confidence.toFixed(2)}), using LLM fallback`);
  const llmResult = await classifyIntentWithLLM(question);
  return llmResult;
}

/**
 * 获取意图的描述（用于日志和调试）
 */
export function getIntentDescription(intent: IntentType): string {
  const descriptions: Record<IntentType, string> = {
    hard_data: '硬数据查询',
    open_info: '开放性信息查询',
    recommendation: '推荐/匹配/对比',
    application_advice: '申请建议',
    school_fit_analysis: '适配度分析',
    meta: '元问题',
  };
  return descriptions[intent];
}
