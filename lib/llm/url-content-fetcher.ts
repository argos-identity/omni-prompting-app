/**
 * URL content fetcher
 * Fetch URL content and extract policy information using Claude
 */

import Anthropic from '@anthropic-ai/sdk';
import type { TokenUsage } from '@/types/workflow';
import { URL_CONSTRAINTS } from '@/types/api';
import { logTokenUsage } from './token-logger';

/** Claude model identifier - using Opus 4.5 for consistency */
const MODEL_ID = 'claude-opus-4-5-20251101';

/** URL fetch result */
export interface UrlFetchResult {
  /** Extracted text content from URL */
  content: string;

  /** Source URL */
  sourceUrl: string;

  /** Token usage for the fetch operation */
  tokenUsage: TokenUsage;
}

/** URL validation result */
interface UrlValidation {
  valid: boolean;
  error?: string;
}

/**
 * Validate URL format and constraints
 */
export function validateUrl(url: string): UrlValidation {
  if (!url || url.trim().length === 0) {
    return { valid: false, error: 'URL이 비어있습니다' };
  }

  if (url.length > URL_CONSTRAINTS.MAX_LENGTH) {
    return { valid: false, error: `URL이 너무 깁니다 (최대 ${URL_CONSTRAINTS.MAX_LENGTH}자)` };
  }

  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'HTTP 또는 HTTPS URL만 지원됩니다' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: '올바른 URL 형식이 아닙니다' };
  }
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
 * Fetch raw HTML content from URL
 */
async function fetchRawContent(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), URL_CONSTRAINTS.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WorkflowGenerator/1.0)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';

    // Check for PDF - not supported with direct fetch
    if (contentType.includes('application/pdf')) {
      throw new Error('PDF URL은 지원되지 않습니다. PDF 파일을 직접 업로드해주세요.');
    }

    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extract policy content from HTML using Claude
 */
async function extractPolicyFromHtml(
  client: Anthropic,
  html: string,
  url: string
): Promise<{ content: string; tokenUsage: TokenUsage }> {
  // Truncate HTML if too long (Claude has context limits)
  const maxHtmlLength = 100000;
  const truncatedHtml = html.length > maxHtmlLength
    ? html.substring(0, maxHtmlLength) + '\n\n[내용이 너무 길어 일부만 포함되었습니다]'
    : html;

  const response = await client.messages.create({
    model: MODEL_ID,
    max_tokens: 16384,
    messages: [
      {
        role: 'user',
        content: `다음은 "${url}"에서 가져온 웹 페이지의 HTML입니다.

이 HTML에서 정책/심사 기준/가이드라인 관련 내용만 추출해주세요.

출력 형식:
1. 문서 내용을 그대로 추출 (요약하지 말 것)
2. 정책 규칙, 검증 기준, 필수 조건 등을 명확히 포함
3. 마크다운 형식으로 구조화

주의사항:
- HTML 태그는 제거하고 텍스트 내용만 추출
- 원문의 의미를 변경하지 마세요
- 숫자, 날짜, 조건 등 구체적인 정보를 정확히 유지하세요
- 네비게이션, 헤더, 푸터, 광고 등 관련 없는 내용은 제외하세요

---
HTML 내용:
${truncatedHtml}`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('Claude가 콘텐츠를 추출하지 못했습니다');
  }

  return {
    content: textContent.text,
    tokenUsage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };
}

/**
 * Fetch and extract content from URL
 * 1. Fetch raw HTML from URL
 * 2. Use Claude to extract policy content from HTML
 */
export async function fetchUrlContent(url: string): Promise<UrlFetchResult> {
  // Validate URL first
  const validation = validateUrl(url);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  console.log('\n' + '='.repeat(80));
  console.log('[UrlContentFetcher] URL 콘텐츠 추출 시작');
  console.log('='.repeat(80));
  console.log('URL:', url);

  const client = createClient();

  try {
    // Step 1: Fetch raw HTML
    console.log('[UrlContentFetcher] HTML 가져오는 중...');
    const rawHtml = await fetchRawContent(url);
    console.log('[UrlContentFetcher] HTML 가져옴:', rawHtml.length, 'chars');

    // Step 2: Extract policy content using Claude
    console.log('[UrlContentFetcher] Claude로 정책 내용 추출 중...');
    const { content, tokenUsage } = await extractPolicyFromHtml(client, rawHtml, url);

    console.log('[UrlContentFetcher] 추출 완료');
    console.log('추출된 콘텐츠 길이:', content.length, 'chars');
    console.log('토큰 사용량:', tokenUsage);
    console.log('='.repeat(80) + '\n');

    // Log token usage
    logTokenUsage('url-content-fetch', tokenUsage, MODEL_ID, url);

    return {
      content,
      sourceUrl: url,
      tokenUsage,
    };
  } catch (error) {
    console.error('[UrlContentFetcher] 에러:', error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        throw new Error('API 요청 한도 초과. 잠시 후 다시 시도해주세요.');
      }
      if (error.status === 408 || error.message.includes('timeout')) {
        throw new Error('URL 요청 시간 초과. 다른 URL을 시도해주세요.');
      }
      throw new Error(`API 에러: ${error.message}`);
    }

    // Handle fetch errors
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('URL 요청 시간 초과 (60초). 다른 URL을 시도해주세요.');
      }
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        throw new Error('URL을 찾을 수 없습니다. URL을 확인해주세요.');
      }
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('서버에 연결할 수 없습니다. URL을 확인해주세요.');
      }
    }

    throw error;
  }
}
