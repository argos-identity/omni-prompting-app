/**
 * Prompt-related type definitions
 */

/** Prompt type identifier */
export type PromptType = 'system' | 'meta';

/** Prompt content structure from file system */
export interface PromptContent {
  /** Prompt type identifier */
  type: PromptType;

  /** Raw markdown content of the prompt */
  content: string;

  /** Last modified timestamp (ISO 8601) */
  lastModified: string;

  /** File path relative to project root */
  filePath: string;
}

/** Request to update a prompt */
export interface UpdatePromptRequest {
  /** Prompt type to update */
  type: PromptType;

  /** New prompt content */
  content: string;
}

/** Prompt editor state */
export type PromptEditorState = 'clean' | 'dirty' | 'saving' | 'error';
