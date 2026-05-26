// @ts-nocheck
'use client';

import { MOCK_POSTS } from '../data';
import { INSTITUTIONS_DATA, Institution } from '../data/institutions';
import { Post } from '../types';

type ApiResult<T> = {
  success?: boolean;
  data?: T;
  result?: unknown;
  error?: string;
};

const FALLBACK_INSTITUTIONS = Object.values(INSTITUTIONS_DATA).flat();

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() && !looksMojibake(value)) return value.trim();
  }
  return '';
}

function looksMojibake(value: string) {
  return /[ÃÂ�]|[åèæç][\u0080-\u00ff]?/.test(value);
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function formatRelativeTime(raw?: string) {
  if (!raw) return '刚刚';
  const date = new Date(raw);
  const diff = Date.now() - date.getTime();
  if (!Number.isFinite(diff) || diff < 0) return '刚刚';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.success === false) {
    throw new Error(body?.error || body?.message || `API ${response.status}`);
  }
  return body;
}

export function mapSchoolToInstitution(row: any): Institution {
  const id = String(row?.id ?? row?.slug ?? crypto.randomUUID());
  const city = firstString(row?.city);
  const country = firstString(row?.country, row?.raw_country, row?.region_tag);
  const location = [city, country].filter(Boolean).join(', ') || '全球艺术院校';
  const rank = row?.qs_art_design_rank ?? row?.qs_art_rank;
  const strengths = [
    ...toStringArray(row?.advantage_subjects),
    ...toStringArray(row?.major_strengths),
    ...toStringArray(row?.tags),
    firstString(row?.school_type),
  ].filter(Boolean);

  return {
    id,
    name: firstString(row?.name_zh, row?.name, row?.name_en, '艺术院校'),
    originalName: firstString(row?.name_en, row?.slug),
    location,
    description: firstString(
      row?.description_zh,
      row?.description,
      row?.overview,
      row?.intro,
      '真实院校数据已接入，详细介绍将随数据库内容持续补全。'
    ),
    image: firstString(row?.cover_image_url, row?.image_url, row?.logo_url) || `https://picsum.photos/seed/school-${id}/800/600`,
    rank: rank ? `QS #${rank}` : undefined,
    admissionDifficulty: firstString(row?.admission_difficulty, row?.acceptance_rate),
    portfolioReq: firstString(row?.portfolio_requirement, row?.portfolio_requirements),
    annualCost: firstString(row?.annual_cost, row?.tuition, row?.tuition_text),
    employmentRate: firstString(row?.employment_rate),
    majorStrengths: strengths.length ? [...new Set(strengths)].slice(0, 5) : ['Portfolio', 'Research', 'Creative Practice'],
    alumniNetwork: firstString(row?.alumni_network),
    radarData: {
      academic: rank ? Math.max(65, 100 - Number(rank)) : 82,
      employment: 82,
      facility: 80,
      cost: 68,
      reputation: rank ? Math.max(70, 100 - Number(rank)) : 80,
      innovation: 86,
    },
  };
}

export function mapPostToUi(row: any): Post {
  const profile = row?.user_profiles ?? {};
  const id = String(row?.id ?? crypto.randomUUID());
  const authorId = String(row?.author_id ?? profile?.id ?? `author-${id}`);
  const body = firstString(row?.body, row?.content, row?.title);
  const title = firstString(row?.title);
  const images = toStringArray(row?.image_urls);

  return {
    id,
    author: {
      id: authorId,
      name: firstString(profile?.nickname, profile?.display_name, row?.author_name, '艺见心用户'),
      avatar: firstString(profile?.avatar_url, row?.author_avatar_url) || `https://i.pravatar.cc/150?u=${encodeURIComponent(authorId)}`,
      type: firstString(profile?.role, row?.author_type, '创作者'),
    },
    content: body || title || '分享了一条艺术留学动态',
    images,
    likes: Number(row?.like_count ?? row?.likes_count ?? 0),
    commentsCount: Number(row?.comment_count ?? row?.comments_count ?? 0),
    comments: [],
    type: row?.type === 'news' || row?.type === 'exhibition' || row?.type === 'opportunity' ? row.type : 'work',
    timestamp: formatRelativeTime(row?.created_at),
  };
}

export async function fetchSchoolsForUi(params: { limit?: number; offset?: number; keyword?: string } = {}) {
  const query = new URLSearchParams({
    limit: String(params.limit ?? 80),
    offset: String(params.offset ?? 0),
  });
  if (params.keyword?.trim()) query.set('keyword', params.keyword.trim());

  try {
    const body = await requestJson<any[]>(`/api/v1/schools?${query}`);
    const rows = Array.isArray(body.data) ? body.data : [];
    return rows.map(mapSchoolToInstitution);
  } catch (error) {
    console.warn('[artiqore-ui] schools API fallback:', error);
    return FALLBACK_INSTITUTIONS;
  }
}

export async function fetchCommunityPostsForUi(params: { limit?: number; offset?: number } = {}) {
  const query = new URLSearchParams({
    limit: String(params.limit ?? 40),
    offset: String(params.offset ?? 0),
  });

  try {
    const body = await requestJson<any[]>(`/api/v1/community/posts?${query}`);
    const rows = Array.isArray(body.data) ? body.data : [];
    return rows.length ? rows.map(mapPostToUi) : MOCK_POSTS;
  } catch (error) {
    console.warn('[artiqore-ui] community API fallback:', error);
    return MOCK_POSTS;
  }
}

export async function askConsultant(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return '';

  const body = await requestJson<any>('/api/v1/ai/consult', {
    method: 'POST',
    body: JSON.stringify({ query: trimmed, mode: 'chat' }),
  });
  return firstString(body?.data?.answer, body?.answer, body?.result?.answer);
}

export async function analyzeInstitutionsWithBackend(institutions: Institution[]) {
  const institutionIds = institutions.map((item) => item.id).filter(Boolean);
  if (!institutionIds.length) return null;

  const body = await requestJson<any>('/api/v1/ai/analyze', {
    method: 'POST',
    body: JSON.stringify({ institutionIds }),
  });
  return body?.result ?? body?.data ?? null;
}
