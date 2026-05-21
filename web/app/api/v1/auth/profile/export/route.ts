/**
 * GET /api/v1/auth/profile/export
 * 导出用户完整画像数据(JSON)
 * 
 * 用途:
 * 1. 用户查看自己的完整画像
 * 2. 数据导出/备份
 * 3. GDPR 合规(用户数据可携带权)
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

    const supabase = await createClient();

    // 拉取用户画像
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // 拉取记忆抽取历史(最近 100 条)
    const { data: extractions } = await supabase
      .from('memory_extractions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    // 拉取语义记忆(最近 50 条)
    const { data: memories } = await supabase
      .from('user_memory_chunks')
      .select('id, content, importance, source, tags, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // 组装导出数据
    const exportData = {
      profile,
      extractions: extractions || [],
      memories: memories || [],
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    return NextResponse.json({
      success: true,
      data: exportData,
    });
  } catch (error: any) {
    console.error('[GET /api/v1/auth/profile/export] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
