/**
 * Claude API client wrapper using @anthropic-ai/sdk
 */

import Anthropic from '@anthropic-ai/sdk';
import type { TokenUsage } from '@/types/workflow';
import { logTokenUsage } from './token-logger';

/** Claude model identifier */
const MODEL_ID = 'claude-opus-4-5-20251101';

/** Default max tokens for generation */
const DEFAULT_MAX_TOKENS = 8192;

/** Generation request options */
export interface GenerateOptions {
  systemPrompt: string;
  userContent: string;
  maxTokens?: number;
  sourceDocument?: string;
}

/** Generation result */
export interface GenerateResult {
  content: string;
  tokenUsage: TokenUsage;
}

/**
 * Create Claude client instance
 */
function createClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not configured');
  }

  return new Anthropic({ apiKey });
}

/**
 * Generate content using Claude API
 */
export async function generateContent(options: GenerateOptions): Promise<GenerateResult> {
  const { systemPrompt, userContent, maxTokens = DEFAULT_MAX_TOKENS, sourceDocument } = options;

  const client = createClient();

  try {
    const response = await client.messages.create({
      model: MODEL_ID,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userContent,
        },
      ],
    });

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    // Build token usage
    const tokenUsage: TokenUsage = {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    };

    // Log token usage (Constitution IV compliance)
    logTokenUsage('workflow-generation', tokenUsage, MODEL_ID, sourceDocument);

    return {
      content: textContent.text,
      tokenUsage,
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      // Handle specific API errors
      if (error.status === 429) {
        throw new Error('Rate limited by Claude API. Please wait and try again.');
      }
      if (error.status === 408 || error.message.includes('timeout')) {
        throw new Error('Request to Claude API timed out. Try with a smaller document.');
      }
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Check if API key is configured
 */
export function isApiKeyConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
