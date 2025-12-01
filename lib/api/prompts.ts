/**
 * Prompt file operations utility
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { PromptType, PromptContent } from '@/types/prompts';

/** Prompt file paths relative to project root */
const PROMPT_PATHS: Record<PromptType, string> = {
  system: 'prompt/system-prompt.md',
  meta: 'prompt/meta-prompt.md',
};

/**
 * Get absolute path for prompt file
 */
function getPromptPath(type: PromptType): string {
  return path.join(process.cwd(), PROMPT_PATHS[type]);
}

/**
 * Read prompt content from file system
 */
export async function readPrompt(type: PromptType): Promise<PromptContent> {
  const filePath = getPromptPath(type);

  try {
    const [content, stats] = await Promise.all([
      fs.readFile(filePath, 'utf-8'),
      fs.stat(filePath),
    ]);

    return {
      type,
      content,
      lastModified: stats.mtime.toISOString(),
      filePath: PROMPT_PATHS[type],
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`Prompt file not found: ${PROMPT_PATHS[type]}`);
    }
    throw error;
  }
}

/**
 * Check if prompt file exists
 */
export async function promptExists(type: PromptType): Promise<boolean> {
  try {
    await fs.access(getPromptPath(type));
    return true;
  } catch {
    return false;
  }
}
