/**
 * Plain text and markdown parser
 */

export interface ParseResult {
  text: string;
}

/**
 * Parse plain text or markdown file buffer
 */
export async function parseText(buffer: Buffer): Promise<ParseResult> {
  try {
    const text = buffer.toString('utf-8').trim();

    if (!text) {
      throw new Error('File is empty');
    }

    return { text };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown text parsing error';
    throw new Error(`Failed to parse text file: ${message}`);
  }
}
