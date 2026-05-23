import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledgeWithSchoolInfo } from '@/lib/knowledge/retriever';
import { loadUserProfile, rerankChunksWithProfile } from '@/lib/memory';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, schoolId, matchThreshold, matchCount, userId } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    let chunks = await searchKnowledgeWithSchoolInfo(query, {
      schoolId,
      matchThreshold: matchThreshold ?? 0.5,
      matchCount: matchCount || 5,
    });

    // 如果提供了 userId,基于用户画像 rerank
    let reranked = false;
    if (userId && typeof userId === 'string') {
      const userProfile = await loadUserProfile(userId);
      if (userProfile) {
        const rerankResult = rerankChunksWithProfile(chunks, userProfile);
        chunks = rerankResult.items;
        reranked = rerankResult.reranked;
      }
    }

    return NextResponse.json({
      query,
      results: chunks,
      count: chunks.length,
      reranked,
    });
  } catch (error: any) {
    console.error('Knowledge search error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
