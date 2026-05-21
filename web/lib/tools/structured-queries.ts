/**
 * Structured Queries - SQL Router for Hard Data
 * 
 * Phase 4.1: 规则优先 + LLM 兜底
 * 
 * 提供固定函数直接查询 SQL，避免向量检索的延迟和不确定性
 */

import OpenAI from 'openai';
import { getSupabaseAdmin } from '@/lib/knowledge/supabase-admin';

// School name mappings (extended from consult-pipeline)
const SCHOOL_MAPPINGS: Record<string, string> = {
  '皇艺': 'royal-college-art',
  'rca': 'royal-college-art',
  '皇家艺术学院': 'royal-college-art',
  'royal college of art': 'royal-college-art',
  
  'csm': 'central-saint-martins',
  '中央圣马丁': 'central-saint-martins',
  'central saint martins': 'central-saint-martins',
  
  'ual': 'university-arts-london',
  '伦艺': 'university-arts-london',
  '伦敦艺术大学': 'university-arts-london',
  'university of the arts london': 'university-arts-london',
  
  'parsons': 'parsons-school-design',
  '帕森斯': 'parsons-school-design',
  'parsons school of design': 'parsons-school-design',
  
  'pratt': 'pratt-institute',
  'pratt institute': 'pratt-institute',
  
  'risd': 'risd',
  'rhode island school of design': 'risd',
  
  'scad': 'scad',
  'savannah college of art and design': 'scad',
  
  'sva': 'school-visual-arts',
  'school of visual arts': 'school-visual-arts',
  
  'goldsmiths': 'goldsmiths-university-london',
  '金匠': 'goldsmiths-university-london',
  
  'edinburgh': 'edinburgh-college-art',
  '爱丁堡': 'edinburgh-college-art',
  'edinburgh college of art': 'edinburgh-college-art',
};

// Field keywords
const FIELD_KEYWORDS = {
  tuition: ['学费', '费用', '多少钱', '价格', 'tuition', 'cost', 'fee', '要多少'],
  deadline: ['截止', 'deadline', '申请时间', 'ddl', '截止日期', '什么时候'],
  ranking: ['排名', 'ranking', 'qs', '第几', 'rank'],
  website: ['官网', 'website', '网站', '链接', 'url'],
  contact: ['联系方式', 'contact', '邮箱', 'email', '电话'],
};

export type FieldType = 'tuition' | 'deadline' | 'ranking' | 'website' | 'contact';

export interface ExtractedSlots {
  schoolSlug: string | null;
  field: FieldType | null;
  confidence: number;
}

// LRU Cache
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as K;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
}

const extractionCache = new LRUCache<string, ExtractedSlots>(200);

// DeepSeek client (lazy init)
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
 * Stage 1: Rule-based extraction
 */
export function extractSlotsWithRules(question: string): ExtractedSlots {
  const q = question.toLowerCase();
  
  // Extract school (longest match)
  let schoolSlug: string | null = null;
  let maxLength = 0;
  
  for (const [keyword, slug] of Object.entries(SCHOOL_MAPPINGS)) {
    if (q.includes(keyword.toLowerCase()) && keyword.length > maxLength) {
      schoolSlug = slug;
      maxLength = keyword.length;
    }
  }
  
  // Extract field
  let field: FieldType | null = null;
  for (const [fieldName, keywords] of Object.entries(FIELD_KEYWORDS)) {
    if (keywords.some(kw => q.includes(kw))) {
      field = fieldName as FieldType;
      break;
    }
  }
  
  // Confidence: both slots = 1.0, one slot = 0.5, no slots = 0.0
  const confidence = (schoolSlug ? 0.5 : 0) + (field ? 0.5 : 0);
  
  return { schoolSlug, field, confidence };
}

/**
 * Stage 2: LLM fallback extraction
 */
export async function extractSlotsWithLLM(question: string): Promise<ExtractedSlots> {
  try {
    const deepseek = getDeepSeekClient();
    
    const prompt = `从用户问题中提取学校名称和查询字段。

用户问题："${question}"

请返回 JSON 格式：
{
  "school": "<学校英文slug，如 royal-college-art, parsons-school-design>",
  "field": "<tuition|deadline|ranking|website|contact 之一>",
  "confidence": <0-1之间的置信度>
}

如果无法确定，返回 null。`;

    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from DeepSeek');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      schoolSlug: parsed.school || null,
      field: parsed.field || null,
      confidence: Math.min(Math.max(parsed.confidence || 0, 0), 1),
    };
  } catch (error) {
    console.error('[structured-queries] LLM extraction failed:', error);
    return { schoolSlug: null, field: null, confidence: 0 };
  }
}

/**
 * Unified extraction: Rule + LLM fallback
 */
export async function extractSlots(question: string): Promise<ExtractedSlots> {
  // Check cache
  const cached = extractionCache.get(question);
  if (cached) {
    console.log('[structured-queries] Cache hit');
    return cached;
  }
  
  // Stage 1: Rule-based
  const ruleResult = extractSlotsWithRules(question);
  
  // If both slots extracted, return immediately
  if (ruleResult.confidence === 1.0) {
    extractionCache.set(question, ruleResult);
    return ruleResult;
  }
  
  // Stage 2: LLM fallback
  console.log(`[structured-queries] Low confidence (${ruleResult.confidence}), using LLM fallback`);
  const llmResult = await extractSlotsWithLLM(question);
  
  // Merge: prefer LLM if it has higher confidence
  const result = llmResult.confidence > ruleResult.confidence ? llmResult : ruleResult;
  
  extractionCache.set(question, result);
  return result;
}

/**
 * Get tuition for a school
 */
export async function getTuition(schoolSlug: string): Promise<string | null> {
  const supabase = getSupabaseAdmin() as any;
  
  // Get school ID
  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('id, name_zh, name_en')
    .eq('slug', schoolSlug)
    .single();
  
  if (schoolError || !school) {
    console.error('[structured-queries] School not found:', schoolSlug);
    return null;
  }
  
  // Get programs with fees
  const { data: programs, error: programError } = await supabase
    .from('programs')
    .select('id, program_name')
    .eq('school_id', school.id)
    .eq('status', 'active')
    .limit(5);
  
  if (programError || !programs || programs.length === 0) {
    console.log('[structured-queries] No programs found for school:', schoolSlug);
    console.log('[structured-queries] Falling back to vector retrieval');
    return null;
  }
  
  // Get fees for these programs
  const programIds = programs.map((p: any) => p.id);
  const { data: fees, error: feesError } = await supabase
    .from('program_fees')
    .select('program_id, international_tuition_fee, domestic_tuition_fee, currency_code, additional_fees_note')
    .in('program_id', programIds);
  
  if (feesError || !fees || fees.length === 0) {
    console.log('[structured-queries] No fee data found');
    console.log('[structured-queries] Falling back to vector retrieval');
    return null;
  }
  
  // Map fees to programs
  const feeMap = new Map(fees.map((f: any) => [f.program_id, f]));
  
  // Format response
  const schoolName = school.name_zh || school.name_en;
  const feeInfo = programs
    .filter((p: any) => feeMap.has(p.id))
    .map((p: any) => {
      const fee = feeMap.get(p.id) as any;
      const amount = fee.international_tuition_fee || fee.domestic_tuition_fee;
      const currency = fee.currency_code || 'USD';
      return `${p.program_name}: ${currency} ${amount?.toLocaleString() || 'N/A'}`;
    })
    .join('\n');
  
  if (!feeInfo) {
    return `${schoolName} 的学费信息暂未收录。`;
  }
  
  return `${schoolName} 学费参考：\n${feeInfo}`;
}

/**
 * Get deadline for a school
 */
export async function getDeadline(schoolSlug: string): Promise<string | null> {
  const supabase = getSupabaseAdmin() as any;
  
  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('id, name_zh, name_en')
    .eq('slug', schoolSlug)
    .single();
  
  if (schoolError || !school) {
    return null;
  }
  
  const { data: programs, error: programError } = await supabase
    .from('programs')
    .select('id, program_name')
    .eq('school_id', school.id)
    .eq('status', 'active')
    .limit(5);
  
  if (programError || !programs || programs.length === 0) {
    console.log('[structured-queries] Falling back to vector retrieval');
    return null;
  }
  
  // Get admissions for these programs
  const programIds = programs.map((p: any) => p.id);
  const { data: admissions, error: admissionsError } = await supabase
    .from('program_admissions')
    .select('program_id, regular_deadline, priority_deadline, deadline_notes')
    .in('program_id', programIds);
  
  if (admissionsError || !admissions || admissions.length === 0) {
    console.log('[structured-queries] Falling back to vector retrieval');
    return null;
  }
  
  // Map admissions to programs
  const admissionMap = new Map(admissions.map((a: any) => [a.program_id, a]));
  
  const schoolName = school.name_zh || school.name_en;
  const deadlineInfo = programs
    .filter((p: any) => admissionMap.has(p.id))
    .map((p: any) => {
      const adm = admissionMap.get(p.id) as any;
      const regular = adm.regular_deadline || 'N/A';
      const priority = adm.priority_deadline ? ` (优先: ${adm.priority_deadline})` : '';
      return `${p.program_name}: ${regular}${priority}`;
    })
    .join('\n');
  
  if (!deadlineInfo) {
    return `${schoolName} 的申请截止日期暂未收录。`;
  }
  
  return `${schoolName} 申请截止日期：\n${deadlineInfo}`;
}

/**
 * Get ranking for a school
 */
export async function getRanking(schoolSlug: string): Promise<string | null> {
  const supabase = getSupabaseAdmin() as any;
  
  const { data: school, error } = await supabase
    .from('schools')
    .select('name_zh, name_en, qs_art_rank, qs_art_design_rank')
    .eq('slug', schoolSlug)
    .single();
  
  if (error || !school) {
    return null;
  }
  
  const schoolName = school.name_zh || school.name_en;
  const artRank = school.qs_art_rank ? `QS 艺术排名: ${school.qs_art_rank}` : '';
  const designRank = school.qs_art_design_rank ? `QS 艺术设计排名: ${school.qs_art_design_rank}` : '';
  
  if (!artRank && !designRank) {
    return `${schoolName} 的排名信息暂未收录。`;
  }
  
  return `${schoolName} 排名：\n${[artRank, designRank].filter(Boolean).join('\n')}`;
}

/**
 * Get website for a school
 */
export async function getWebsite(schoolSlug: string): Promise<string | null> {
  const supabase = getSupabaseAdmin() as any;
  
  const { data: school, error } = await supabase
    .from('schools')
    .select('name_zh, name_en, official_website, website')
    .eq('slug', schoolSlug)
    .single();
  
  if (error || !school) {
    return null;
  }
  
  const schoolName = school.name_zh || school.name_en;
  const website = school.official_website || school.website;
  
  if (!website) {
    return `${schoolName} 的官网信息暂未收录。`;
  }
  
  return `${schoolName} 官网：${website}`;
}

/**
 * Execute structured query
 */
export async function executeStructuredQuery(
  question: string
): Promise<{ answer: string | null; usedSQL: boolean }> {
  // Extract slots
  const slots = await extractSlots(question);
  
  console.log('[structured-queries] Extracted slots:', slots);
  
  // If both slots extracted, execute SQL query
  if (slots.schoolSlug && slots.field && slots.confidence >= 0.5) {
    let answer: string | null = null;
    
    switch (slots.field) {
      case 'tuition':
        answer = await getTuition(slots.schoolSlug);
        break;
      case 'deadline':
        answer = await getDeadline(slots.schoolSlug);
        break;
      case 'ranking':
        answer = await getRanking(slots.schoolSlug);
        break;
      case 'website':
        answer = await getWebsite(slots.schoolSlug);
        break;
      default:
        console.warn('[structured-queries] Unknown field:', slots.field);
    }
    
    if (answer) {
      console.log('[structured-queries] SQL query succeeded');
      return { answer, usedSQL: true };
    }
  }
  
  // Fallback to vector retrieval
  console.log('[structured-queries] Falling back to vector retrieval');
  return { answer: null, usedSQL: false };
}
