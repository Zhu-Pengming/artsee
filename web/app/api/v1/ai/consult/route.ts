import { NextRequest, NextResponse } from 'next/server';
import { getUserFromBearer } from '@/lib/api/auth-user';
import { getIntentDescription } from '@/lib/ai/intent';
import {
  buildEffectiveUserProfile,
  buildGeneralContextPrompt,
  normalizeAiMode,
  normalizeAiPersona,
  resolveAiConversation,
} from '@/lib/ai/general-context';
import { fireRecordFromTurn } from '@/lib/memory';
import { logChatInteraction } from '@/lib/logging/chat-logger';
import { runConsultStages, generate } from '@/lib/pipelines/consult-pipeline';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { 
      schoolId, 
      userProfile: providedProfile,
      context,
      intent,
    } = body;
    const mode = normalizeAiMode(body.mode, 'short');
    const persona = normalizeAiPersona(body.persona ?? body.aiProfileKey ?? providedProfile?.aiProfileKey);
    const conversation = resolveAiConversation(body);
    const query = conversation.query;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get user from Bearer token
    const user = await getUserFromBearer(request);
    const effectiveProfile = buildEffectiveUserProfile({
      providedProfile,
      context,
      persona,
    });

    // Run unified consult pipeline
    const stages = await runConsultStages({
      query,
      userId: user?.id,
      schoolId,
      mode,
      history: conversation.history,
      userProfile: effectiveProfile,
    });

    const generalContextPrompt = buildGeneralContextPrompt({
      persona,
      requestedIntent: intent,
      context,
    });
    if (generalContextPrompt) {
      stages.systemPrompt = `${generalContextPrompt}\n\n${stages.systemPrompt}`;
    }

    console.log(`[consult] Intent: ${getIntentDescription(stages.intent)}, chunks: ${stages.sources.length}, lowConfidence: ${stages.lowConfidence}`);

    // Generate answer (non-streaming)
    const { answer } = await generate(stages, {
      maxTokens: mode === 'report' ? 4000 : 3000,
    });

    const latencyMs = Date.now() - startTime;

    // Fire-and-forget: Record to memory system
    if (user) {
      fireRecordFromTurn({
        userId: user.id,
        userMessage: query,
        assistantMessage: answer,
        sourceRoute: 'consult',
      });
    }

    // Fire-and-forget: Log to chat_logs
    logChatInteraction({
      userId: user?.id,
      route: 'consult',
      query,
      rewrittenQuery: stages.rewrittenQuery,
      intent: stages.intent,
      retrievedChunkIds: stages.retrievedChunkIds,
      answer,
      lowConfidence: stages.lowConfidence,
      latencyMs,
    });

    const payload = {
      query,
      answer,
      sources: stages.sources.map((s) => ({
        schoolName: s.schoolName,
        heading: s.heading,
        similarity: s.similarity,
      })),
      schoolData: stages.schoolData,
      mode,
      persona: persona || 'general',
      requestedIntent: typeof intent === 'string' ? intent : undefined,
      detectedIntent: stages.intent,
      lowConfidence: stages.lowConfidence,
      ...(stages.rewrittenQuery && {
        rewrittenQuery: stages.rewrittenQuery,
      }),
    };

    return NextResponse.json({
      success: true,
      data: payload,
      ...payload,
    });
  } catch (error: any) {
    console.error('Consult API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
