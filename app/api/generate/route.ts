/**
 * POST /api/generate - Generate workflow from policy document
 *
 * 플로우:
 * 1. 입력 소스 확인 (파일 또는 URL)
 * 2. 정책 문서 파싱/추출
 * 3. 1차 LLM: 정책 데이터 추출
 * 4. 2차 LLM: 추출된 데이터로 workflow.md 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseDocument } from '@/lib/parsers';
import { extractPolicyData } from '@/lib/llm/policy-extractor';
import { generateWorkflow } from '@/lib/llm/workflow-generator';
import { fetchUrlContent, validateUrl } from '@/lib/llm/url-content-fetcher';
import { readPrompt } from '@/lib/api/prompts';
import { isApiKeyConfigured } from '@/lib/llm/claude-client';
import { getMimeTypeFromExtension, validateFile } from '@/lib/utils/file-validators';
import type { GenerationResponse, SupportedMimeType, InputSource } from '@/types/api';

export const maxDuration = 300; // 5 minutes timeout for long documents

export async function POST(request: NextRequest): Promise<NextResponse<GenerationResponse>> {
  try {
    // Check API key configuration
    if (!isApiKeyConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'ANTHROPIC_API_KEY is not configured',
          },
        },
        { status: 500 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('policyDocument') as File | null;
    const documentUrl = formData.get('documentUrl') as string | null;

    // Determine input source and extract content
    let parsedContent: string;
    let sourceIdentifier: string;
    let inputSource: InputSource;

    if (file) {
      // === FILE INPUT ===
      inputSource = 'file';
      sourceIdentifier = file.name;

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        const errorCode = validation.error?.includes('size')
          ? 'FILE_TOO_LARGE'
          : 'INVALID_FILE_TYPE';
        return NextResponse.json(
          {
            success: false,
            error: {
              code: errorCode,
              message: validation.error || 'Invalid file',
            },
          },
          { status: 400 }
        );
      }

      // Get MIME type
      const mimeType = (file.type || getMimeTypeFromExtension(file.name)) as SupportedMimeType;

      // Read file buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Parse document
      try {
        const parseResult = await parseDocument(buffer, mimeType);
        parsedContent = parseResult.text;

        if (!parsedContent.trim()) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'PARSE_ERROR',
                message: 'Document appears to be empty or could not extract text',
              },
            },
            { status: 422 }
          );
        }
      } catch (parseError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PARSE_ERROR',
              message:
                parseError instanceof Error
                  ? parseError.message
                  : 'Failed to parse document',
            },
          },
          { status: 422 }
        );
      }
    } else if (documentUrl) {
      // === URL INPUT ===
      inputSource = 'url';
      sourceIdentifier = documentUrl;

      // Validate URL
      const urlValidation = validateUrl(documentUrl);
      if (!urlValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_URL',
              message: urlValidation.error || 'Invalid URL',
            },
          },
          { status: 400 }
        );
      }

      // Fetch content from URL using Claude
      try {
        const urlResult = await fetchUrlContent(documentUrl);
        parsedContent = urlResult.content;

        if (!parsedContent.trim()) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'URL_FETCH_FAILED',
                message: 'URL에서 콘텐츠를 추출할 수 없습니다',
              },
            },
            { status: 422 }
          );
        }
      } catch (urlError) {
        const message = urlError instanceof Error ? urlError.message : 'URL fetch failed';

        // Determine specific error code
        let code: 'URL_FETCH_FAILED' | 'URL_TIMEOUT' = 'URL_FETCH_FAILED';
        if (message.includes('timeout') || message.includes('시간 초과')) {
          code = 'URL_TIMEOUT';
        }

        return NextResponse.json(
          {
            success: false,
            error: { code, message },
          },
          { status: 422 }
        );
      }
    } else {
      // === NO INPUT ===
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_INPUT',
            message: '파일 또는 URL을 입력해주세요',
          },
        },
        { status: 400 }
      );
    }

    console.log(`[Generate] Input source: ${inputSource}, identifier: ${sourceIdentifier}`);

    // Load prompts (use provided overrides or read from file)
    const systemPromptOverride = formData.get('systemPrompt') as string | null;
    const metaPromptOverride = formData.get('metaPrompt') as string | null;

    const [systemPromptContent, metaPromptContent] = await Promise.all([
      systemPromptOverride || readPrompt('system').then((p) => p.content),
      metaPromptOverride || readPrompt('meta').then((p) => p.content),
    ]);

    // Step 1: Extract policy data (1차 LLM 호출)
    let extractedData;
    try {
      extractedData = await extractPolicyData({
        policyDocument: parsedContent,
        sourceDocumentName: sourceIdentifier,
      });
    } catch (extractError) {
      const message =
        extractError instanceof Error ? extractError.message : 'Policy extraction failed';

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LLM_ERROR',
            message: `정책 데이터 추출 실패: ${message}`,
          },
        },
        { status: 500 }
      );
    }

    // Step 2: Generate workflow (2차 LLM 호출)
    try {
      const workflow = await generateWorkflow({
        systemPrompt: systemPromptContent,
        metaPrompt: metaPromptContent,
        extractedData,
        sourceDocumentName: sourceIdentifier,
      });

      return NextResponse.json({
        success: true,
        workflow,
        extractedData,
      });
    } catch (llmError) {
      const message =
        llmError instanceof Error ? llmError.message : 'LLM generation failed';

      // Determine error code based on message
      let code: 'LLM_ERROR' | 'RATE_LIMITED' | 'TIMEOUT' = 'LLM_ERROR';
      let status = 500;

      if (message.includes('Rate limited')) {
        code = 'RATE_LIMITED';
        status = 429;
      } else if (message.includes('timeout') || message.includes('timed out')) {
        code = 'TIMEOUT';
        status = 504;
      }

      return NextResponse.json(
        {
          success: false,
          error: { code, message },
        },
        { status }
      );
    }
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
