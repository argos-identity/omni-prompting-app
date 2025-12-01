/**
 * PDF document parser using pdf-parse
 */

import pdfParse from 'pdf-parse';

export interface ParseResult {
  text: string;
  metadata?: {
    pageCount?: number;
    info?: Record<string, unknown>;
  };
}

/**
 * Parse PDF file buffer and extract text content
 */
export async function parsePdf(buffer: Buffer): Promise<ParseResult> {
  try {
    const data = await pdfParse(buffer);

    return {
      text: data.text.trim(),
      metadata: {
        pageCount: data.numpages,
        info: data.info,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown PDF parsing error';
    throw new Error(`Failed to parse PDF: ${message}`);
  }
}
