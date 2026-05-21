/**
 * POST /api/v1/ai/record
 * 显式 record 接口 - 对应前端"📌 记住这个"按钮和"沉淀结论"卡片
 * 
 * 用途:
 * 1. 用户主动 pin 某条消息
 * 2. 前端"沉淀结论"卡片让用户确认后写入
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromBearer } from '@/lib/api/auth-user';
import { recordFromTurn, saveMemoryChunk } from '@/lib/memory';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromBearer(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, kind, conversationId, messageId } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'content is required and must be a string' },
        { status: 400 }
      );
    }

    if (kind && !['pin', 'sediment'].includes(kind)) {
      return NextResponse.json(
        { error: 'kind must be "pin" or "sediment"' },
        { status: 400 }
      );
    }

    // 调用 recordFromTurn(同步等待结果,因为这是用户主动触发)
    const result = await recordFromTurn({
      userId: user.id,
      userMessage: content,
      sourceRoute: 'record_api',
      conversationId,
      messageId,
    });

    // 阶段 4:如果是 pin 或 sediment,额外写入语义记忆
    if (kind === 'pin' || kind === 'sediment') {
      await saveMemoryChunk({
        userId: user.id,
        content,
        importance: kind === 'pin' ? 0.9 : 0.8, // pin 的 importance 更高
        source: kind,
        conversationId,
      });
    }

    return NextResponse.json({
      success: result.success,
      guardPassed: result.guardPassed,
      extractedCount: result.extractedCount,
      appliedCount: result.appliedCount,
      skippedCount: result.skippedCount,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error('[POST /api/v1/ai/record] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
