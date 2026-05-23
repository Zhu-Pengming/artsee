/**
 * GET /api/v1/auth/profile/field-history?field=target_countries
 * 查询某个画像字段的历史变更链
 * 
 * 用途:
 * 1. 用户查看某个字段的变更历史
 * 2. 前端展示"你曾经说过..."时间线
 * 3. Debug 画像更新问题
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromBearer } from '@/lib/api/auth-user';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromBearer(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const field = searchParams.get('field');

    if (!field) {
      return NextResponse.json(
        { error: 'field parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 从 memory_extractions 拉取该字段的历史变更
    const { data: history, error } = await supabase
      .from('memory_extractions')
      .select('*')
      .eq('user_id', user.id)
      .eq('extracted_field', field)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch field history' },
        { status: 500 }
      );
    }

    // 格式化历史记录
    const formattedHistory = (history || []).map((record) => ({
      id: record.id,
      timestamp: record.created_at,
      sourceRoute: record.source_route,
      rawUserMessage: record.raw_user_message,
      oldValue: record.old_value,
      newValue: record.new_value,
      action: record.action,
      confidence: record.confidence,
      appliedToProfile: record.applied_to_profile,
    }));

    return NextResponse.json({
      success: true,
      field,
      history: formattedHistory,
      count: formattedHistory.length,
    });
  } catch (error: any) {
    console.error('[GET /api/v1/auth/profile/field-history] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
