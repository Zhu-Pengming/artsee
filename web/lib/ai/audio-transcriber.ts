import OpenAI from 'openai';

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

function audioClientConfig() {
  const explicitKey = process.env.OPENAI_AUDIO_API_KEY?.trim();
  const explicitBaseURL = process.env.OPENAI_AUDIO_BASE_URL?.trim();
  if (explicitKey) {
    return {
      apiKey: explicitKey,
      baseURL: explicitBaseURL || 'https://api.openai.com/v1',
      model: process.env.OPENAI_AUDIO_MODEL?.trim() || 'whisper-1',
    };
  }

  const fallbackBaseURL = process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1';
  const canUseOpenAiFallback =
    !process.env.OPENAI_BASE_URL || fallbackBaseURL.includes('openai.com');
  const fallbackKey = canUseOpenAiFallback
    ? process.env.OPENAI_API_KEY?.trim()
    : '';

  return {
    apiKey: fallbackKey,
    baseURL: fallbackBaseURL,
    model: process.env.OPENAI_AUDIO_MODEL?.trim() || 'whisper-1',
  };
}

export function assertAudioTranscriptionConfigured() {
  const config = audioClientConfig();
  if (!config.apiKey) {
    throw new Error('未配置语音识别服务，请配置 OPENAI_AUDIO_API_KEY');
  }
  return config;
}

/**
 * 使用 OpenAI Whisper API 转录音频为文字
 */
export async function transcribeAudioWithAI(
  options: TranscribeAudioOptions
): Promise<TranscriptionResult> {
  const { audioBuffer } = options;

  try {
    const config = assertAudioTranscriptionConfigured();
    const openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });

    // 将 Uint8Array 转换为 Buffer
    const buffer = Buffer.from(audioBuffer);
    
    // 创建一个类似 File 的对象
    const audioFile = new File([buffer], 'audio.m4a', {
      type: 'audio/m4a',
    }) as any;

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: config.model,
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
