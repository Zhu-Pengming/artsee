import type { Message } from '@/lib/pipelines/consult-pipeline';

const PERSONA_KEYS = new Set(['student', 'artist', 'collector', 'parent', 'business', 'general']);
const SENSITIVE_KEY_PATTERN = /(token|secret|password|authorization|api[_-]?key|service[_-]?role)/i;

export type AiMode = 'short' | 'report' | 'chat';

export interface ResolvedAiConversation {
  query: string;
  history: Message[];
  messages: Message[];
}

export function normalizeAiMode(value: unknown, fallback: AiMode = 'short'): AiMode {
  return value === 'report' || value === 'chat' || value === 'short' ? value : fallback;
}

export function normalizeAiPersona(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().toLowerCase();
  return PERSONA_KEYS.has(trimmed) ? trimmed : undefined;
}

export function normalizeAiMessages(value: unknown): Message[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const rawRole = typeof item?.role === 'string' ? item.role : 'user';
      const role = rawRole === 'model' ? 'assistant' : rawRole;
      const content = firstNonEmptyString(item?.content, item?.text, item?.message);
      if (!content) return null;
      if (role !== 'user' && role !== 'assistant' && role !== 'system') return null;
      return { role, content };
    })
    .filter((item): item is Message => Boolean(item));
}

export function resolveAiConversation(body: any): ResolvedAiConversation {
  const messages = normalizeAiMessages(body?.messages);
  const explicitQuery = firstNonEmptyString(body?.query, body?.question, body?.prompt);
  const lastUserIndex = findLastUserIndex(messages);
  const lastUserMessage = lastUserIndex >= 0 ? messages[lastUserIndex].content : '';
  const query = explicitQuery || lastUserMessage;

  let history = messages;
  if (messages.length > 0 && lastUserIndex >= 0) {
    if (!explicitQuery || messages[lastUserIndex].content.trim() === explicitQuery.trim()) {
      history = messages.slice(0, lastUserIndex);
    }
  }

  return {
    query,
    history,
    messages,
  };
}

export function buildEffectiveUserProfile({
  loadedProfile,
  providedProfile,
  context,
  persona,
}: {
  loadedProfile?: any;
  providedProfile?: any;
  context?: any;
  persona?: string;
}) {
  const contextProfile = context && typeof context === 'object' ? context.userProfile : undefined;
  const profile = {
    ...(isPlainObject(loadedProfile) ? loadedProfile : {}),
    ...(isPlainObject(contextProfile) ? contextProfile : {}),
    ...(isPlainObject(providedProfile) ? providedProfile : {}),
  };

  if (persona && persona !== 'general') {
    profile.aiProfileKey = persona;
    profile.ai_profile_key = persona;
    if (persona === 'business') {
      profile.userType = profile.userType || 'business';
      profile.user_type = profile.user_type || 'business';
    } else {
      profile.userRole = profile.userRole || persona;
      profile.user_role = profile.user_role || persona;
    }
  }

  return Object.keys(profile).length > 0 ? profile : undefined;
}

export function buildGeneralContextPrompt({
  persona,
  requestedIntent,
  context,
}: {
  persona?: string;
  requestedIntent?: unknown;
  context?: any;
}) {
  const lines: string[] = [];

  if (persona) {
    lines.push(`【本轮用户身份】${persona}`);
  }

  if (typeof requestedIntent === 'string' && requestedIntent.trim()) {
    lines.push(`【本轮场景】${requestedIntent.trim()}`);
  }

  const contextText = summarizeContext(context);
  if (contextText) {
    lines.push(`【本轮界面上下文】\n${contextText}`);
  }

  if (lines.length === 0) return '';

  return [
    '【通用 AI 使用约束】',
    '你服务的是艺见心的综合艺术生态，不要把所有问题都默认解释成艺术留学申请。优先根据本轮身份、场景和界面上下文判断用户真实目标；如果上下文不足，先问关键问题，再给下一步。',
    ...lines,
  ].join('\n');
}

function firstNonEmptyString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function findLastUserIndex(messages: Message[]) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === 'user') return i;
  }
  return -1;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function summarizeContext(context: any) {
  if (!isPlainObject(context)) return '';
  const compact = compactValue(context);
  const text = JSON.stringify(compact, null, 2);
  return text.length > 4000 ? `${text.slice(0, 4000)}\n...` : text;
}

function compactValue(value: any, depth = 0): any {
  if (value == null || typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.length > 800 ? `${value.slice(0, 800)}...` : value;
  }
  if (depth >= 4) return '[omitted]';
  if (Array.isArray(value)) return value.slice(0, 12).map((item) => compactValue(item, depth + 1));
  if (!isPlainObject(value)) return String(value);

  const result: Record<string, any> = {};
  for (const [key, child] of Object.entries(value).slice(0, 24)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) continue;
    if (key === 'userProfile') continue;
    result[key] = compactValue(child, depth + 1);
  }
  return result;
}
