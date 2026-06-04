import { NextRequest, NextResponse } from 'next/server';
import { getUserFromBearer } from '@/lib/api/auth-user';
import { createServiceClient } from '@/lib/api/supabase-service';
import { analyzeImageWithAI } from '@/lib/ai/image-analyzer';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * POST /api/v1/ai/image-analyze
 * 上传图片并获取 AI 分析
 * Body: multipart/form-data
 *   - image: 图片文件（必填，≤10MB）
 *   - conversationId: 对话 ID（可选）
 * 返回: { answer: string, imageUrl: string, analysis: object }
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const user = await getUserFromBearer(req);
    if (!user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const form = await req.formData();
    const file = form.get('image') as File | null;
    const conversationId = form.get('conversationId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: '缺少图片文件' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的图片格式，请上传 JPG、PNG、WebP 或 GIF' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: '图片大小超过 10MB 限制' },
        { status: 400 }
      );
    }

    // 上传图片到 Supabase Storage
    const bytes = new Uint8Array(await file.arrayBuffer());
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/ai-chat/${timestamp}.${extension}`;

    const supabase = createServiceClient();
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, bytes, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      return NextResponse.json(
        { error: `图片上传失败: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    const imageUrl = publicUrlData.publicUrl;

    // 记录上传文件
    await supabase.from('upload_files').insert({
      user_id: user.id,
      file_url: imageUrl,
      file_type: file.type,
      scene: 'ai-chat',
      size: file.size,
    });

    // 使用 AI 分析图片
    const analysis = await analyzeImageWithAI({
      imageUrl,
      userId: user.id,
      conversationId: conversationId || undefined,
    });

    const latencyMs = Date.now() - startTime;

    console.log(`[image-analyze] User: ${user.id}, latency: ${latencyMs}ms`);

    return NextResponse.json({
      answer: analysis.answer,
      imageUrl,
      analysis: {
        description: analysis.description,
        tags: analysis.tags,
        suggestions: analysis.suggestions,
      },
      latencyMs,
    });
  } catch (error: any) {
    console.error('Image analyze API error:', error);
    return NextResponse.json(
      { error: error.message || '图片分析失败' },
      { status: 500 }
    );
  }
}
