/**
 * Record - 对话反哺画像的主流程
 * 
 * 流程:
 * 1. 硬规则护栏检查
 * 2. 轻模型抽取
 * 3. upsert user_profiles + 写审计表
 * 
 * 永远异步,fire-and-forget,失败写日志不重试
 */

import { checkRecordGuards } from './guards';
import { extractProfileFromMessage } from './extract';
import { upsertProfileExtractions } from './upsert';
import { saveMemoryChunk } from './semantic';

export interface RecordInput {
  userId: string;
  userMessage: string;
  assistantMessage?: string;
  sourceRoute: string;
  conversationId?: string;
  messageId?: string;
}

export interface RecordResult {
  success: boolean;
  guardPassed: boolean;
  extractedCount: number;
  appliedCount: number;
  skippedCount: number;
  errors: string[];
}

/**
 * 从一轮对话中记录画像信息
 * 
 * 此函数应该被 fire-and-forget 调用,不要 await 它的结果
 * 
 * @param input - 对话信息
 * @returns 记录结果
 */
export async function recordFromTurn(input: RecordInput): Promise<RecordResult> {
  try {
    // Step 1: 硬规则护栏检查
    const guardResult = checkRecordGuards(input.userMessage, input.sourceRoute);
    
    if (!guardResult.passed) {
      console.log(
        `[recordFromTurn] Guard blocked: ${guardResult.reason} (rule: ${guardResult.ruleTriggered})`
      );
      return {
        success: true, // 护栏拦截不算失败
        guardPassed: false,
        extractedCount: 0,
        appliedCount: 0,
        skippedCount: 0,
        errors: [],
      };
    }

    // Step 2: 轻模型抽取
    const extractResult = await extractProfileFromMessage(
      input.userMessage,
      input.assistantMessage
    );

    if (extractResult.items.length === 0) {
      console.log('[recordFromTurn] No items extracted');
      return {
        success: true,
        guardPassed: true,
        extractedCount: 0,
        appliedCount: 0,
        skippedCount: 0,
        errors: [],
      };
    }

    console.log(
      `[recordFromTurn] Extracted ${extractResult.items.length} items:`,
      extractResult.items.map((i) => `${i.field}=${JSON.stringify(i.value)}`)
    );

    // Step 3: upsert user_profiles + 写审计
    const upsertResult = await upsertProfileExtractions(input.userId, extractResult.items, {
      sourceRoute: input.sourceRoute,
      rawUserMessage: input.userMessage,
      conversationId: input.conversationId,
      messageId: input.messageId,
      guardPassed: true,
    });

    console.log(
      `[recordFromTurn] Applied ${upsertResult.appliedCount}/${extractResult.items.length} items`
    );

    // 阶段 4:如果抽取到高置信度的重要信息,写入语义记忆
    const highConfidenceItems = extractResult.items.filter((item) => item.confidence >= 0.8);
    if (highConfidenceItems.length > 0 && input.assistantMessage) {
      // 将用户消息 + AI 回复作为一个完整的对话片段保存
      const memoryContent = `用户:${input.userMessage}\nAI:${input.assistantMessage.slice(0, 500)}`; // 限制长度
      
      // 异步写入语义记忆(fire-and-forget)
      saveMemoryChunk({
        userId: input.userId,
        content: memoryContent,
        importance: 0.7, // 自动判定的记忆,importance 设为 0.7
        source: 'auto',
        conversationId: input.conversationId,
      }).catch((error) => {
        console.error('[recordFromTurn] Failed to save semantic memory:', error);
      });
    }

    return {
      success: upsertResult.success,
      guardPassed: true,
      extractedCount: extractResult.items.length,
      appliedCount: upsertResult.appliedCount,
      skippedCount: upsertResult.skippedCount,
      errors: upsertResult.errors,
    };
  } catch (error: any) {
    console.error('[recordFromTurn] Error:', error);
    return {
      success: false,
      guardPassed: true,
      extractedCount: 0,
      appliedCount: 0,
      skippedCount: 0,
      errors: [error.message],
    };
  }
}

/**
 * Fire-and-forget 包装器,用于在路由里调用
 * 
 * 用法:
 * ```ts
 * fireRecordFromTurn({ userId, userMessage, assistantMessage, sourceRoute });
 * ```
 */
export function fireRecordFromTurn(input: RecordInput): void {
  recordFromTurn(input).catch((error) => {
    console.error('[fireRecordFromTurn] Unhandled error:', error);
  });
}
