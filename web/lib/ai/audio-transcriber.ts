import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

interface TranscribeAudioOptions {
  audioBuffer: Uint8Array;
  userId: string;
  conversationId?: string;
}

interface TranscriptionResult {
  text: string;
  language: string;
  duration: number;
}

/**
 * 使用 OpenAI Whisper API 转录音频为文字
 */
export async function transcribeAudioWithAI(
  options: TranscribeAudioOptions
): Promise<TranscriptionResult> {
  const { audioBuffer } = options;

  try {
    // 将 Uint8Array 转换为 Buffer
    const buffer = Buffer.from(audioBuffer);
    
    // 创建一个类似 File 的对象
    const audioFile = new File([buffer], 'audio.m4a', {
      type: 'audio/m4a',
    }) as any;

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'zh', // 中文优先，也支持英文
      response_format: 'verbose_json',
    });

    return {
      text: response.text || '',
      language: response.language || 'zh',
      duration: response.duration || 0,
    };
  } catch (error: any) {
    console.error('OpenAI Whisper API error:', error);

    // 如果 API 调用失败，返回友好的错误信息
    if (error.code === 'insufficient_quota') {
      throw new Error('AI 服务配额不足，请稍后再试');
    }

    if (error.code === 'invalid_file_format') {
      throw new Error('音频格式不支持，请使用 M4A、MP3 或 WAV 格式');
    }

    throw new Error(`语音识别失败: ${error.message}`);
  }
}

/**
 * 批量转录多个音频文件
 */
export async function transcribeMultipleAudios(
  audioBuffers: Uint8Array[],
  userId: string,
  conversationId?: string
): Promise<TranscriptionResult[]> {
  const results = await Promise.all(
    audioBuffers.map(buffer =>
      transcribeAudioWithAI({ audioBuffer: buffer, userId, conversationId })
    )
  );
  return results;
}

/**
 * 从音频 URL 转录
 */
export async function transcribeFromUrl(
  audioUrl: string,
  userId: string,
  conversationId?: string
): Promise<TranscriptionResult> {
  try {
    // 下载音频
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = new Uint8Array(arrayBuffer);

    return await transcribeAudioWithAI({
      audioBuffer,
      userId,
      conversationId,
    });
  } catch (error: any) {
    throw new Error(`从 URL 转录失败: ${error.message}`);
  }
}
