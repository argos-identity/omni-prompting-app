/**
 * GET /api/prompts - Prompt content read operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { readPrompt } from '@/lib/api/prompts';
import { promptTypeSchema } from '@/lib/schemas';
import type { PromptContent } from '@/types/prompts';

interface ErrorResponse {
  error: string;
  message: string;
}

/**
 * GET /api/prompts?type=system|meta
 * Retrieves prompt content
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<PromptContent | ErrorResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const typeParam = searchParams.get('type');

    // Validate type parameter
    const typeResult = promptTypeSchema.safeParse(typeParam);
    if (!typeResult.success) {
      return NextResponse.json(
        {
          error: 'INVALID_TYPE',
          message: 'Invalid prompt type. Must be "system" or "meta".',
        },
        { status: 400 }
      );
    }

    const type = typeResult.data;

    // Read prompt content
    const content = await readPrompt(type);
    return NextResponse.json(content);
  } catch (error) {
    console.error('GET /api/prompts error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    const isNotFound = message.includes('not found');

    return NextResponse.json(
      {
        error: isNotFound ? 'NOT_FOUND' : 'INTERNAL_ERROR',
        message,
      },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
