import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getUserFromBearer } from '@/lib/api/auth-user';
import { createServiceClient } from '@/lib/api/supabase-service';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createServiceClient();

    const { data: conversations, error } = await supabase
      .from('ai_conversations')
      .select('id, title, last_message_preview, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[AI Conversations] Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversations: conversations || [] });
  } catch (err: any) {
    console.error('[AI Conversations] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createServiceClient();

    const body = await req.json();
    const { title } = body;

    const { data: conversation, error } = await supabase
      .from('ai_conversations')
      .insert({
        id: randomUUID(),
        user_id: user.id,
        title: title || '新对话',
      })
      .select()
      .single();

    if (error) {
      console.error('[AI Conversations] Create error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversation });
  } catch (err: any) {
    console.error('[AI Conversations] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
