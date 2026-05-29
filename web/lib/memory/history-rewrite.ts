/**
 * History Rewriting for Multi-turn Conversations
 * 
 * Phase 1.5: Rewrite current query with conversation history context
 * 
 * Goal: Make retrieval work for multi-turn conversations where current query
 * lacks context (e.g., "那作品集呢？" after discussing RCA tuition)
 * 
 * Strategy:
 * - Keep recent 3 turns (6 messages) as-is
 * - Compress older turns into summary
 * - Rewrite current query to be self-contained
 * - Output ONLY used for retrieval, NOT shown to LLM (LLM sees original query)
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface HistoryRewriteResult {
  rewrittenQuery: string;
  rewritten: boolean;
  historySummary?: string;
}

const LLM_API_KEY = 
  process.env.DEEPSEEK_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.MOONSHOT_API_KEY ||
  process.env.LLM_API_KEY;

const LLM_BASE_URL = 
  process.env.DEEPSEEK_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  process.env.MOONSHOT_BASE_URL ||
  process.env.LLM_BASE_URL ||
  'https://open.bigmodel.cn/api/paas/v4';

const REWRITE_MODEL = 
  process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' :
  process.env.OPENAI_API_KEY ? 'gpt-4o-mini' :
  process.env.MOONSHOT_API_KEY ? 'moonshot-v1-8k' :
  'glm-4-flash';

/**
 * Rewrite query with conversation history
 * 
 * @param currentQuery - Current user query
 * @param history - Conversation history (excluding current query)
 * @returns Rewritten query for retrieval
 */
export async function rewriteQueryWithHistory(
  currentQuery: string,
  history: Message[] = []
): Promise<HistoryRewriteResult> {
  // No history or very short query → no rewrite needed
  if (history.length === 0 || currentQuery.length < 3) {
    return {
      rewrittenQuery: currentQuery,
      rewritten: false,
    };
  }

  // Check if query needs context (contains pronouns, demonstratives, etc.)
  const needsContext = checkIfNeedsContext(currentQuery);
  if (!needsContext) {
    return {
      rewrittenQuery: currentQuery,
      rewritten: false,
    };
  }

  try {
    // Build history context (recent 3 turns)
    const recentHistory = history.slice(-6); // Last 3 turns (user + assistant)
    const historyText = recentHistory
      .map((msg) => `${msg.role === 'user' ? '用户' : '助手'}: ${msg.content}`)
      .join('\n');

    // Call LLM to rewrite query
    const prompt = buildRewritePrompt(currentQuery, historyText);
    const rewrittenQuery = await callRewriteLLM(prompt);

    // If LLM failed, try rule-based fallback
    if (!rewrittenQuery) {
      const fallbackRewritten = ruleBasedRewrite(currentQuery, history || []);
      if (fallbackRewritten !== currentQuery) {
        console.log(`[history-rewrite] Using fallback rule-based rewrite`);
        return {
          rewrittenQuery: fallbackRewritten,
          rewritten: true,
        };
      }
    }

    return {
      rewrittenQuery: rewrittenQuery || currentQuery,
      rewritten: !!rewrittenQuery,
    };
  } catch (error) {
    console.error('[history-rewrite] Error:', error);
    
    // Fallback: Use rule-based rewriting
    const fallbackRewritten = ruleBasedRewrite(currentQuery, history || []);
    if (fallbackRewritten !== currentQuery) {
      console.log(`[history-rewrite] Using fallback rule-based rewrite`);
      return {
        rewrittenQuery: fallbackRewritten,
        rewritten: true,
      };
    }
    
    // Last resort: return original query
    return {
      rewrittenQuery: currentQuery,
      rewritten: false,
    };
  }
}

/**
 * Rule-based rewriting fallback (when LLM API fails)
 * 
 * Simple heuristics:
 * - "那XX呢？" → extract entity from last user message + "XX"
 * - "这个学校" → replace with school name from history
 * - "它" → replace with last mentioned entity
 */
function ruleBasedRewrite(query: string, history: Message[]): string {
  if (history.length === 0) {
    return query;
  }

  const lastUserMsg = history.filter(m => m.role === 'user').pop()?.content || '';
  
  // Pattern: "那XX呢？"
  const pattern1 = /那(.{1,4})呢/;
  const match1 = query.match(pattern1);
  if (match1) {
    const topic = match1[1];
    // Extract school name from last user message
    const schoolMatch = lastUserMsg.match(/(皇艺|rca|csm|ual|parsons|pratt|risd|scad|爱丁堡|金匠)/i);
    if (schoolMatch) {
      return `${schoolMatch[0]}${topic}`;
    }
  }

  // Pattern: "这个学校"
  if (query.includes('这个学校') || query.includes('那个学校')) {
    const schoolMatch = lastUserMsg.match(/(皇艺|rca|csm|ual|parsons|pratt|risd|scad|爱丁堡|金匠|中央圣马丁)/i);
    if (schoolMatch) {
      return query.replace(/这个学校|那个学校/g, schoolMatch[0]);
    }
  }

  // Pattern: very short queries like "呢？"
  if (query.length <= 2 && query.includes('呢')) {
    // Try to extract topic from last assistant message
    const lastAssistantMsg = history.filter(m => m.role === 'assistant').pop()?.content || '';
    if (lastAssistantMsg.includes('作品集')) {
      return lastUserMsg + '作品集要求';
    }
  }

  return query;
}

/**
 * Check if query needs context from history
 * 
 * Heuristics:
 * - Contains pronouns: 它、他、她、这、那、哪
 * - Contains demonstratives: 这个、那个、这些、那些
 * - Starts with conjunctions: 还、也、另外、此外
 * - Very short: < 5 characters
 */
function checkIfNeedsContext(query: string): boolean {
  const q = query.trim();

  // Very short queries likely need context
  if (q.length < 5) {
    return true;
  }

  // Pronouns and demonstratives
  const contextKeywords = [
    '它', '他', '她', '这', '那', '哪',
    '这个', '那个', '这些', '那些', '这里', '那里',
    '还', '也', '另外', '此外', '而且', '并且',
    '呢', '吗', '啊', // Question particles often follow up
  ];

  return contextKeywords.some((kw) => q.includes(kw));
}

/**
 * Build prompt for query rewriting
 */
function buildRewritePrompt(currentQuery: string, historyText: string): string {
  return `你是一个对话上下文理解助手。你的任务是将用户的当前问题改写为一个自包含的、完整的问题，以便进行知识检索。

**对话历史**：
${historyText}

**当前问题**：
${currentQuery}

**改写要求**：
1. 将当前问题中的代词（它、这、那）替换为具体的实体名称
2. 补充历史对话中提到的关键信息（学校名、专业名、申请要求等）
3. 保持问题的核心意图不变
4. 输出一个完整的、可以独立理解的问题
5. 如果当前问题已经很完整，直接返回原问题

**只输出改写后的问题，不要有任何解释或额外内容。**

改写后的问题：`;
}

/**
 * Call LLM to rewrite query
 */
async function callRewriteLLM(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: REWRITE_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3, // Lower temperature for more deterministic rewriting
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error('[history-rewrite] LLM API error:', response.statusText);
      return null;
    }

    const data = await response.json();
    const rewritten = data.choices?.[0]?.message?.content?.trim();

    return rewritten || null;
  } catch (error) {
    console.error('[history-rewrite] LLM call failed:', error);
    return null;
  }
}

/**
 * Format history for display in system prompt
 * 
 * This is separate from rewriting - used to show LLM the conversation context
 */
export function formatHistoryForPrompt(history: Message[]): string {
  if (history.length === 0) {
    return '';
  }

  const recentHistory = history.slice(-6); // Last 3 turns
  const formatted = recentHistory
    .map((msg) => {
      const role = msg.role === 'user' ? '用户' : '助手';
      return `${role}: ${msg.content}`;
    })
    .join('\n');

  return `## 当前对话历史\n\n${formatted}\n`;
}
