/**
 * Prompt 构建器 - 根据意图组装完整的 system prompt
 */

import fs from 'fs';
import path from 'path';
import { formatFullProfile, UserProfile } from './profile-formatter';
import { ProfileSlots, IntentType } from '../ai/intent';

// 缓存 prompt 模板
let systemBaseTemplate: string | null = null;
let answerRequirementsTemplate: string | null = null;
const skillTemplateCache: Map<IntentType, string> = new Map();

function loadTemplate(filename: string): string {
  const templatePath = path.join(process.cwd(), 'lib', 'knowledge', 'prompts', filename);
  return fs.readFileSync(templatePath, 'utf-8');
}

function getSystemBase(): string {
  if (!systemBaseTemplate) {
    systemBaseTemplate = loadTemplate('system-base.v1.md');
  }
  return systemBaseTemplate;
}

function getAnswerRequirements(): string {
  if (!answerRequirementsTemplate) {
    answerRequirementsTemplate = loadTemplate('answer-requirements.v1.md');
  }
  return answerRequirementsTemplate;
}

function getSkillPrompt(intent: IntentType): string {
  if (!skillTemplateCache.has(intent)) {
    const filename = `skill.${intent.replace(/_/g, '-')}.v1.md`;
    try {
      const template = loadTemplate(filename);
      skillTemplateCache.set(intent, template);
    } catch (error) {
      console.warn(`[prompt-builder] Skill template not found: ${filename}`);
      return '';
    }
  }
  return skillTemplateCache.get(intent) || '';
}

export interface SchoolData {
  id: string;
  slug: string;
  name_en: string;
  name_zh?: string;
  country?: string;
  city?: string;
  website?: string;
  [key: string]: any;
}

export interface KnowledgeChunk {
  chunk_text: string;
  heading_path?: string;
  similarity?: number;
}

export interface PromptBuildOptions {
  userProfile?: UserProfile;
  profileSlots: ProfileSlots;
  schoolData?: SchoolData;
  knowledgeChunks?: KnowledgeChunk[];
  mode: 'short' | 'report';
  intent?: IntentType;
}

/**
 * 构建完整的 system prompt
 */
export function buildSystemPrompt(options: PromptBuildOptions): string {
  const sections: string[] = [];
  
  // 1. 基础角色和约束
  sections.push(getSystemBase());
  
  // 2. 用户画像（根据 slots 动态注入）
  if (options.userProfile) {
    const profileSection = formatFullProfile(options.userProfile, options.profileSlots);
    if (profileSection) {
      sections.push(profileSection);
    }
  }
  
  // 3. 官方数据（如果有学校信息）
  if (options.schoolData) {
    const schoolSection = formatSchoolData(options.schoolData);
    sections.push(schoolSection);
  }
  
  // 4. 参考资料（知识库检索结果）
  if (options.knowledgeChunks && options.knowledgeChunks.length > 0) {
    const knowledgeSection = formatKnowledgeChunks(options.knowledgeChunks);
    sections.push(knowledgeSection);
  }
  
  // 5. 意图特定的技能指导
  if (options.intent) {
    const skillSection = getSkillPrompt(options.intent);
    if (skillSection) {
      sections.push(skillSection);
    }
  }
  
  // 6. 回答要求
  sections.push(getAnswerRequirements());
  
  return sections.join('\n\n');
}

/**
 * 格式化学校官方数据
 */
function formatSchoolData(school: SchoolData): string {
  const lines: string[] = ['## 官方数据', ''];
  
  if (school.name_en) {
    lines.push(`**学校名称**：${school.name_en}${school.name_zh ? ` (${school.name_zh})` : ''}`);
  }
  
  if (school.country) {
    lines.push(`**国家/地区**：${school.country}`);
  }
  
  if (school.city) {
    lines.push(`**城市**：${school.city}`);
  }
  
  if (school.website) {
    lines.push(`**官方网站**：${school.website}`);
  }
  
  // 其他可能的字段
  const additionalFields = [
    'school_type',
    'founded_year',
    'qs_overall_rank',
    'qs_art_design_rank',
    'annual_tuition',
    'application_deadline',
  ];
  
  additionalFields.forEach(field => {
    if (school[field]) {
      const label = formatFieldLabel(field);
      lines.push(`**${label}**：${school[field]}`);
    }
  });
  
  return lines.join('\n');
}

/**
 * 格式化知识库检索结果
 */
function formatKnowledgeChunks(chunks: KnowledgeChunk[]): string {
  const lines: string[] = ['## 参考资料', ''];
  
  chunks.forEach((chunk, index) => {
    const number = index + 1;
    let chunkText = chunk.chunk_text.trim();
    
    // 如果有标题路径，添加上下文
    if (chunk.heading_path) {
      lines.push(`[${number}] **${chunk.heading_path}**`);
      lines.push('');
      lines.push(chunkText);
    } else {
      lines.push(`[${number}] ${chunkText}`);
    }
    
    lines.push('');
  });
  
  return lines.join('\n');
}

/**
 * 字段名转中文标签
 */
function formatFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    school_type: '学校类型',
    founded_year: '建校年份',
    qs_overall_rank: 'QS 综合排名',
    qs_art_design_rank: 'QS 艺术设计排名',
    annual_tuition: '年度学费',
    application_deadline: '申请截止日期',
  };
  return labels[field] || field;
}

/**
 * 构建用户消息（包含问题）
 */
export function buildUserMessage(query: string): string {
  return query;
}
