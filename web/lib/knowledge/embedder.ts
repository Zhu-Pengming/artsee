const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 1;

type EmbeddingProvider = 'glm' | 'openai' | 'xinference' | 'ollama';

interface EmbeddingConfig {
  provider: EmbeddingProvider;
  model: string;
  dimensions: number;
  batchSize: number;
  baseUrl?: string;
  apiKey?: string;
}

function getEmbeddingConfig(): EmbeddingConfig {
  const provider = (process.env.EMBEDDING_PROVIDER || 'glm') as EmbeddingProvider;
  const model = process.env.EMBEDDING_MODEL || 'embedding-2';
  const dimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || '1024', 10);
  const batchSize = parseInt(process.env.EMBEDDING_BATCH_SIZE || '50', 10);

  switch (provider) {
    case 'glm':
      return {
        provider,
        model,
        dimensions,
        batchSize,
        baseUrl: process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
        apiKey: process.env.GLM_API_KEY,
      };
    case 'openai':
      return {
        provider,
        model,
        dimensions,
        batchSize,
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY,
      };
    case 'xinference':
      return {
        provider,
        model,
        dimensions,
        batchSize,
        baseUrl: process.env.XINFERENCE_BASE_URL || 'http://localhost:9997/v1',
        apiKey: process.env.XINFERENCE_API_KEY || 'dummy',
      };
    case 'ollama':
      return {
        provider,
        model,
        dimensions,
        batchSize,
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
        apiKey: process.env.OLLAMA_API_KEY || 'dummy',
      };
    default:
      throw new Error(`Unknown embedding provider: ${provider}`);
  }
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const config = getEmbeddingConfig();
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += config.batchSize) {
    const batch = texts.slice(i, i + config.batchSize);
    const batchEmbeddings = await generateBatchEmbeddings(batch, config);
    allEmbeddings.push(...batchEmbeddings);
  }

  return allEmbeddings;
}

async function generateBatchEmbeddings(
  texts: string[],
  config: EmbeddingConfig
): Promise<number[][]> {
  if (!config.apiKey) {
    throw new Error(`Missing API key for ${config.provider} provider`);
  }

  if (!config.baseUrl) {
    throw new Error(`Missing base URL for ${config.provider} provider`);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${config.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          input: texts,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `${config.provider.toUpperCase()} API error (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error(`Invalid response format from ${config.provider} API`);
      }

      const embeddings = data.data
        .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
        .map((item: { embedding: number[] }) => item.embedding);

      if (embeddings.length > 0 && embeddings[0].length !== config.dimensions) {
        console.warn(
          `⚠️  Expected ${config.dimensions} dimensions, got ${embeddings[0].length}. ` +
          `Check EMBEDDING_DIMENSIONS in .env.local`
        );
      }

      return embeddings;
    } catch (error) {
      lastError = error as Error;
      if (attempt < MAX_RETRIES) {
        console.warn(
          `Embedding batch failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${RETRY_DELAY_MS}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  throw new Error(
    `Failed to generate embeddings after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`
  );
}
