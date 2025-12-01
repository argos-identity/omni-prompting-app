/**
 * API-related type definitions
 */

import type { GeneratedWorkflow, ExtractedPolicyData } from './workflow';

/** Supported MIME types for policy documents */
export type SupportedMimeType =
  | 'text/plain'
  | 'text/markdown'
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** Input source type */
export type InputSource = 'file' | 'url';

/** Error codes for programmatic handling */
export type ErrorCode =
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'PARSE_ERROR'
  | 'LLM_ERROR'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'INTERNAL_ERROR'
  | 'NO_INPUT'
  | 'INVALID_URL'
  | 'URL_FETCH_FAILED'
  | 'URL_TIMEOUT';

/** Generation error structure */
export interface GenerationError {
  /** Error code for programmatic handling */
  code: ErrorCode;

  /** Human-readable error message */
  message: string;
}

/** Successful generation response */
export interface GenerationSuccessResponse {
  success: true;
  workflow: GeneratedWorkflow;
  extractedData: ExtractedPolicyData;
}

/** Failed generation response */
export interface GenerationErrorResponse {
  success: false;
  error: GenerationError;
}

/** Generation API response (discriminated union) */
export type GenerationResponse = GenerationSuccessResponse | GenerationErrorResponse;

/** File validation constraints */
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['.txt', '.md', '.pdf', '.docx'] as const,
  ALLOWED_MIME_TYPES: [
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const,
} as const;

/** URL validation constraints */
export const URL_CONSTRAINTS = {
  MAX_LENGTH: 2048,
  TIMEOUT_MS: 60000, // 60 seconds for URL fetch
} as const;
