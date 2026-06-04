import { NextRequest, NextResponse } from 'next/server';
import { getUserFromBearer } from '@/lib/api/auth-user';
import { createServiceClient } from '@/lib/api/supabase-service';
import { transcribeAudioWithAI } from '@/lib/ai/audio-transcriber';

const MAX_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = [
  'audio/m4a',
  'audio/mp4',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
];

/**
 * POST /api/v1/ai/transcribe
 * 上传音频并转换为文字
 * Body: multipart/form-data
 *   - audio: 音频文件（必填，≤25MB）
 *   - conversationId: 对话 ID（可选）
 * 返回: { text: string, audioUrl: string, language: string, duration: number }
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
    const file = form.get('audio') as File | null;
    const conversationId = form.get('conversationId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: '缺少音频文件' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的音频格式，请上传 M4A、MP3、WAV 或 WebM' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: '音频大小超过 25MB 限制' },
        { status: 400 }
      );
    }

    // 上传音频到 Supabase Storage
    const bytes = new Uint8Array(await file.arrayBuffer());
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'm4a';
    const path = `${user.id}/ai-voice/${timestamp}.${extension}`;

    const supabase = createServiceClient();
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, bytes, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Audio upload error:', uploadError);
      return NextResponse.json(
        { error: `音频上传失败: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    const audioUrl = publicUrlData.publicUrl;

    // 记录上传文件
    await supabase.from('upload_files').insert({
      user_id: user.id,
      file_url: audioUrl,
      file_type: file.type,
      scene: 'ai-voice',
      size: file.size,
    });

    // 使用 AI 转录音频
    const transcription = await transcribeAudioWithAI({
      audioBuffer: bytes,
      userId: user.id,
      conversationId: conversationId || undefined,
    });

    const latencyMs = Date.now() - startTime;

    console.log(
      `[transcribe] User: ${user.id}, text length: ${transcription.text.length}, latency: ${latencyMs}ms`
    );

    return NextResponse.json({
      text: transcription.text,
      audioUrl,
      language: transcription.language,
      duration: transcription.duration,
      latencyMs,
    });
  } catch (error: any) {
    console.error('Transcribe API error:', error);
    return NextResponse.json(
      { error: error.message || '语音识别失败' },
      { status: 500 }
    );
  }
}
