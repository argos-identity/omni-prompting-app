/**
 * Document parser factory - routes to appropriate parser based on MIME type
 */

import { parsePdf } from './pdf-parser';
import { parseDocx } from './docx-parser';
import { parseText } from './text-parser';
import type { SupportedMimeType } from '@/types/api';

export interface ParseResult {
  text: string;
  metadata?: Record<string, unknown>;
}

/**
 * Parse document buffer based on MIME type
 */
export async function parseDocument(
  buffer: Buffer,
  mimeType: SupportedMimeType
): Promise<ParseResult> {
  switch (mimeType) {
    case 'application/pdf':
      return parsePdf(buffer);

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return parseDocx(buffer);

    case 'text/plain':
    case 'text/markdown':
      return parseText(buffer);

    default:
      throw new Error(`Unsupported MIME type: ${mimeType}`);
  }
}

/**
 * Get parser name for MIME type (for logging/debugging)
 */
export function getParserName(mimeType: SupportedMimeType): string {
  switch (mimeType) {
    case 'application/pdf':
      return 'PDF Parser (pdf-parse)';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'DOCX Parser (mammoth)';
    case 'text/plain':
    case 'text/markdown':
      return 'Text Parser';
    default:
      return 'Unknown';
  }
}

export { parsePdf } from './pdf-parser';
export { parseDocx } from './docx-parser';
export { parseText } from './text-parser';
