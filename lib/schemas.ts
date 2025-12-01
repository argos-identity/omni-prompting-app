/**
 * Zod validation schemas for runtime validation
 */

import { z } from 'zod';

/** Prompt type schema */
export const promptTypeSchema = z.enum(['system', 'meta']);

/** Prompt content schema */
export const promptContentSchema = z.object({
  type: promptTypeSchema,
  content: z.string().min(1).max(100000),
  lastModified: z.string().datetime(),
  filePath: z.string(),
});

/** Supported MIME types schema */
export const supportedMimeTypeSchema = z.enum([
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

/** Token usage schema */
export const tokenUsageSchema = z.object({
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
});

/** Generated workflow schema */
export const generatedWorkflowSchema = z.object({
  content: z.string().min(1),
  generatedAt: z.string().datetime(),
  sourceDocument: z.string(),
  tokenUsage: tokenUsageSchema,
});

/** Error code schema */
export const errorCodeSchema = z.enum([
  'INVALID_FILE_TYPE',
  'FILE_TOO_LARGE',
  'PARSE_ERROR',
  'LLM_ERROR',
  'RATE_LIMITED',
  'TIMEOUT',
  'INTERNAL_ERROR',
]);

/** Generation error schema */
export const generationErrorSchema = z.object({
  code: errorCodeSchema,
  message: z.string(),
});

/** Generation response schema */
export const generationResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    workflow: generatedWorkflowSchema,
  }),
  z.object({
    success: z.literal(false),
    error: generationErrorSchema,
  }),
]);

/** File validation constants */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_EXTENSIONS = ['.txt', '.md', '.pdf', '.docx'] as const;

/** Type exports from schemas */
export type PromptType = z.infer<typeof promptTypeSchema>;
export type PromptContent = z.infer<typeof promptContentSchema>;
export type SupportedMimeType = z.infer<typeof supportedMimeTypeSchema>;
export type TokenUsage = z.infer<typeof tokenUsageSchema>;
export type GeneratedWorkflow = z.infer<typeof generatedWorkflowSchema>;
export type ErrorCode = z.infer<typeof errorCodeSchema>;
export type GenerationError = z.infer<typeof generationErrorSchema>;
export type GenerationResponse = z.infer<typeof generationResponseSchema>;
