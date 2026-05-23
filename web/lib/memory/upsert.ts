/**
 * Upsert - 将抽取结果应用到 user_profiles 并写入审计表
 */

import { createClient } from '@/lib/supabase/server';
import type { ExtractedItem } from './extract';

export interface UpsertResult {
  success: boolean;
  appliedCount: number;
  skippedCount: number;
  errors: string[];
}

/**
 * 应用抽取结果到 user_profiles 并写入 memory_extractions 审计
 * 
 * @param userId - 用户 ID
 * @param items - 抽取结果
 * @param context - 上下文信息
 * @returns upsert 结果
 */
export async function upsertProfileExtractions(
  userId: string,
  items: ExtractedItem[],
  context: {
    sourceRoute: string;
    rawUserMessage: string;
    conversationId?: string;
    messageId?: string;
    guardPassed: boolean;
  }
): Promise<UpsertResult> {
  if (items.length === 0) {
    return {
      success: true,
      appliedCount: 0,
      skippedCount: 0,
      errors: [],
    };
  }

  const supabase = await createClient();
  let appliedCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  // 先读取当前画像
  const { data: currentProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  for (const item of items) {
    try {
      const oldValue = currentProfile?.[item.field as keyof typeof currentProfile] ?? null;
      let newValue = item.value;
      let shouldApply = context.guardPassed && item.confidence >= 0.7;

      // 处理不同的 action
      if (item.action === 'delete') {
        // 删除:数组字段移除元素,其他字段设为 null
        if (Array.isArray(oldValue) && typeof item.value === 'string') {
          newValue = (oldValue as string[]).filter((v) => v !== item.value);
        } else {
          newValue = null;
        }
      } else if (item.action === 'append') {
        // 追加:只对数组字段有效
        if (Array.isArray(oldValue)) {
          const toAppend = Array.isArray(item.value) ? item.value : [item.value];
          newValue = [...new Set([...oldValue, ...toAppend])]; // 去重
        } else {
          newValue = Array.isArray(item.value) ? item.value : [item.value];
        }
      }

      // 写入审计表
      const { error: auditError } = await supabase.from('memory_extractions').insert({
        user_id: userId,
        conversation_id: context.conversationId,
        message_id: context.messageId,
        source_route: context.sourceRoute,
        raw_user_message: context.rawUserMessage,
        extracted_field: item.field,
        old_value: oldValue,
        new_value: newValue,
        action: item.action,
        confidence: item.confidence,
        guard_passed: context.guardPassed,
        applied_to_profile: shouldApply,
      });

      if (auditError) {
        errors.push(`Failed to write audit for field ${item.field}: ${auditError.message}`);
        continue;
      }

      // 如果应该应用,更新 user_profiles
      if (shouldApply) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            [item.field]: newValue,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          errors.push(`Failed to update profile field ${item.field}: ${updateError.message}`);
          skippedCount++;
        } else {
          appliedCount++;
        }
      } else {
        skippedCount++;
      }
    } catch (error: any) {
      errors.push(`Error processing field ${item.field}: ${error.message}`);
      skippedCount++;
    }
  }

  return {
    success: errors.length === 0,
    appliedCount,
    skippedCount,
    errors,
  };
}
