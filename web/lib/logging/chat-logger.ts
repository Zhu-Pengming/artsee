/**
 * Chat logs - fire-and-forget logging
 * 
 * IMPORTANT: All writes are non-blocking. Failures are logged but don't affect response.
 * Privacy: Ensure compliance before enabling in production.
 */

import { getSupabaseAdmin } from '../knowledge/supabase-admin';

export interface ChatLogEntry {
  userId?: string;
  route: 'chat' | 'consult';
  query: string;
  rewrittenQuery?: string;
  intent?: string;
  retrievedChunkIds?: string[];
  answer: string;
  lowConfidence?: boolean;
  latencyMs?: number;
}

/**
 * Log a chat interaction (fire-and-forget)
 * 
 * This function returns immediately and logs errors internally.
 * It will never throw or block the response.
 */
export function logChatInteraction(entry: ChatLogEntry): void {
  // Fire-and-forget: don't await
  writeChatLog(entry).catch((error) => {
    // Log error but don't propagate
    console.error('[chat-logger] Failed to write log:', error);
  });
}

/**
 * Internal async write function
 */
async function writeChatLog(entry: ChatLogEntry): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('chat_logs').insert({
    user_id: entry.userId || null,
    route: entry.route,
    query: entry.query,
    rewritten_query: entry.rewrittenQuery || null,
    intent: entry.intent || null,
    retrieved_chunk_ids: entry.retrievedChunkIds || [],
    answer: entry.answer,
    low_confidence: entry.lowConfidence || false,
    latency_ms: entry.latencyMs || null,
  });

  if (error) {
    throw error;
  }
}

/**
 * Query chat logs for evaluation sampling
 * 
 * Example: Get recent logs for a specific intent
 */
export async function queryChatLogs(options: {
  intent?: string;
  route?: 'chat' | 'consult';
  limit?: number;
  userId?: string;
}): Promise<any[]> {
  const supabase = getSupabaseAdmin();
  
  let query = supabase
    .from('chat_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.intent) {
    query = query.eq('intent', options.intent);
  }

  if (options.route) {
    query = query.eq('route', options.route);
  }

  if (options.userId) {
    query = query.eq('user_id', options.userId);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}
