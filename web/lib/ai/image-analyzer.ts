import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

interface AnalyzeImageOptions {
  imageUrl: string;
  userId: string;
  conversationId?: string;
}

interface ImageAnalysisResult {
  answer: string;
  description: string;
  tags: string[];
  suggestions: string[];
}

/**
 * 使用 OpenAI Vision API 分析图片
 * 针对艺术留学场景，分析作品集、院校图片等
 */
export async function analyzeImageWithAI(
  options: AnalyzeImageOptions
): Promise<ImageAnalysisResult> {
  const { imageUrl } = options;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // 或 'gpt-4-vision-preview'
      messages: [
        {
          role: 'system',
          content: `你是艺见心 AI 助手，专注于艺术留学咨询。
当用户上传图片时，你需要：
1. 识别图片内容（作品集、院校照片、申请材料等）
2. 提供专业的艺术留学相关建议
3. 如果是作品集，分析其风格、技法、优缺点
4. 如果是院校图片，识别院校并提供相关信息
5. 如果是申请材料，提供改进建议

回复要专业、友好、有建设性。`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请分析这张图片，并提供艺术留学相关的建议。',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';

    // 提取关键信息
    const description = extractDescription(content);
    const tags = extractTags(content);
    const suggestions = extractSuggestions(content);

    return {
      answer: content,
      description,
      tags,
      suggestions,
    };
  } catch (error: any) {
    console.error('OpenAI Vision API error:', error);
    
    // 如果 API 调用失败，返回友好的错误信息
    if (error.code === 'insufficient_quota') {
      throw new Error('AI 服务配额不足，请稍后再试');
    }
    
    throw new Error(`图片分析失败: ${error.message}`);
  }
}

/**
 * 从 AI 回复中提取描述
 */
function extractDescription(content: string): string {
  // 简单提取前100个字符作为描述
  const lines = content.split('\n').filter(line => line.trim());
  return lines[0]?.substring(0, 100) || '图片分析';
}

/**
 * 从 AI 回复中提取标签
 */
function extractTags(content: string): string[] {
  const tags: string[] = [];
  const lowerContent = content.toLowerCase();

  // 检测常见关键词
  const keywords = [
    '作品集', 'portfolio', '绘画', 'painting', '设计', 'design',
    '摄影', 'photography', '雕塑', 'sculpture', '建筑', 'architecture',
    '时尚', 'fashion', '插画', 'illustration', '动画', 'animation',
    '平面设计', 'graphic design', '工业设计', 'industrial design',
  ];

  for (const keyword of keywords) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      tags.push(keyword);
    }
  }

  return tags.slice(0, 5); // 最多返回5个标签
}

/**
 * 从 AI 回复中提取建议
 */
function extractSuggestions(content: string): string[] {
  const suggestions: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // 查找以数字、bullet point 或"建议"开头的行
    if (
      /^[\d\-\*•]/.test(trimmed) ||
      trimmed.includes('建议') ||
      trimmed.includes('推荐')
    ) {
      const cleaned = trimmed.replace(/^[\d\-\*•.\s]+/, '');
      if (cleaned.length > 10) {
        suggestions.push(cleaned);
      }
    }
  }

  return suggestions.slice(0, 3); // 最多返回3条建议
}

/**
 * 批量分析多张图片
 */
export async function analyzeMultipleImages(
  imageUrls: string[],
  userId: string,
  conversationId?: string
): Promise<ImageAnalysisResult[]> {
  const results = await Promise.all(
    imageUrls.map(url =>
      analyzeImageWithAI({ imageUrl: url, userId, conversationId })
    )
  );
  return results;
}
