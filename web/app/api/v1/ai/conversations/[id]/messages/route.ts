import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getUserFromBearer } from '@/lib/api/auth-user';
import { createServiceClient } from '@/lib/api/supabase-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createServiceClient();

    const { id: conversationId } = await params;
    const body = await req.json();
    const { role, content, metadata } = body;

    if (!role || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: role, content' },
        { status: 400 }
      );
    }

    const { data: conversation } = await supabase
      .from('ai_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const { data: message, error } = await supabase
      .from('ai_messages')
      .insert({
        id: randomUUID(),
        conversation_id: conversationId,
        user_id: user.id,
        role,
        content,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('[AI Messages] Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message });
  } catch (err: any) {
    console.error('[AI Messages] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
