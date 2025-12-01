/**
 * DOCX document parser using mammoth
 */

import mammoth from 'mammoth';

export interface ParseResult {
  text: string;
  messages?: string[];
}

/**
 * Parse DOCX file buffer and extract text content
 */
export async function parseDocx(buffer: Buffer): Promise<ParseResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    return {
      text: result.value.trim(),
      messages: result.messages.map((m) => m.message),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown DOCX parsing error';
    throw new Error(`Failed to parse DOCX: ${message}`);
  }
}
