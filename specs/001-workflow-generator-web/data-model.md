# Data Model: Workflow Generator Web Service

**Feature**: 001-workflow-generator-web
**Date**: 2025-11-27
**Status**: Complete

## Entity Definitions

### 1. PromptContent

Represents the content of a prompt file (system or meta).

```typescript
interface PromptContent {
  /** Prompt type identifier */
  type: 'system' | 'meta';

  /** Raw markdown content of the prompt */
  content: string;

  /** Last modified timestamp (ISO 8601) */
  lastModified: string;

  /** File path relative to project root */
  filePath: string;
}
```

**Storage**: File system at `./prompt/system-prompt.md` and `./prompt/meta-prompt.md`

**Validation Rules**:
- `type` must be exactly 'system' or 'meta'
- `content` must be non-empty string
- `content` maximum length: 100,000 characters (reasonable limit for prompts)

---

### 2. PolicyDocument

Represents an uploaded policy document for processing.

```typescript
interface PolicyDocument {
  /** Original filename */
  filename: string;

  /** MIME type of the uploaded file */
  mimeType: SupportedMimeType;

  /** File size in bytes */
  size: number;

  /** Extracted text content from document */
  extractedText: string;
}

type SupportedMimeType =
  | 'text/plain'           // .txt
  | 'text/markdown'        // .md
  | 'application/pdf'      // .pdf
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // .docx
```

**Storage**: Temporary (memory only during request processing)

**Validation Rules**:
- `filename` must have supported extension (.txt, .md, .pdf, .docx)
- `size` must be <= 10MB (10,485,760 bytes)
- `mimeType` must match file extension
- `extractedText` must be non-empty after parsing

---

### 3. GeneratedWorkflow

Represents the output workflow.md content.

```typescript
interface GeneratedWorkflow {
  /** Generated workflow content in markdown format */
  content: string;

  /** Generation timestamp (ISO 8601) */
  generatedAt: string;

  /** Source document filename */
  sourceDocument: string;

  /** Token usage for the generation */
  tokenUsage: TokenUsage;
}

interface TokenUsage {
  /** Input tokens sent to LLM */
  inputTokens: number;

  /** Output tokens received from LLM */
  outputTokens: number;

  /** Total tokens (input + output) */
  totalTokens: number;
}
```

**Storage**: Client-side state only (not persisted)

**Validation Rules**:
- `content` must be non-empty string
- `content` should contain expected XML sections (core_identity, enterprise_context, etc.)

---

### 4. GenerationRequest

Request payload for workflow generation.

```typescript
interface GenerationRequest {
  /** System prompt content */
  systemPrompt: string;

  /** Meta prompt content */
  metaPrompt: string;

  /** Uploaded policy document file */
  policyDocument: File;
}
```

**Validation Rules**:
- `systemPrompt` must be non-empty
- `metaPrompt` must be non-empty
- `policyDocument` must pass PolicyDocument validation

---

### 5. GenerationResponse

Response payload from workflow generation.

```typescript
interface GenerationResponse {
  /** Success indicator */
  success: boolean;

  /** Generated workflow (if successful) */
  workflow?: GeneratedWorkflow;

  /** Error information (if failed) */
  error?: GenerationError;
}

interface GenerationError {
  /** Error code for programmatic handling */
  code: ErrorCode;

  /** Human-readable error message */
  message: string;
}

type ErrorCode =
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'PARSE_ERROR'
  | 'LLM_ERROR'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'INTERNAL_ERROR';
```

---

## State Transitions

### Prompt Editor State

```
CLEAN -> DIRTY -> SAVING -> CLEAN
           |         |
           v         v
        DIRTY <-- ERROR
```

| State | Description | Triggers |
|-------|-------------|----------|
| CLEAN | Content matches saved file | Initial load, successful save |
| DIRTY | Content has unsaved changes | Any content modification |
| SAVING | Save in progress | Save button clicked |
| ERROR | Save failed | API error response |

---

### Workflow Generation State

```
IDLE -> UPLOADING -> PARSING -> GENERATING -> COMPLETE
           |            |            |
           v            v            v
         ERROR        ERROR        ERROR
```

| State | Description | Triggers |
|-------|-------------|----------|
| IDLE | Ready for upload | Initial, reset |
| UPLOADING | File being uploaded | File selected |
| PARSING | Extracting text from document | Upload complete |
| GENERATING | LLM processing | Parse complete |
| COMPLETE | Workflow generated | LLM response received |
| ERROR | Operation failed | Any stage failure |

---

## Zod Schemas

```typescript
// types/schemas.ts
import { z } from 'zod';

export const promptTypeSchema = z.enum(['system', 'meta']);

export const promptContentSchema = z.object({
  type: promptTypeSchema,
  content: z.string().min(1).max(100000),
  lastModified: z.string().datetime(),
  filePath: z.string(),
});

export const supportedMimeTypeSchema = z.enum([
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const tokenUsageSchema = z.object({
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
});

export const generatedWorkflowSchema = z.object({
  content: z.string().min(1),
  generatedAt: z.string().datetime(),
  sourceDocument: z.string(),
  tokenUsage: tokenUsageSchema,
});

export const errorCodeSchema = z.enum([
  'INVALID_FILE_TYPE',
  'FILE_TOO_LARGE',
  'PARSE_ERROR',
  'LLM_ERROR',
  'RATE_LIMITED',
  'TIMEOUT',
  'INTERNAL_ERROR',
]);

export const generationErrorSchema = z.object({
  code: errorCodeSchema,
  message: z.string(),
});

export const generationResponseSchema = z.object({
  success: z.boolean(),
  workflow: generatedWorkflowSchema.optional(),
  error: generationErrorSchema.optional(),
});

// File validation constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_EXTENSIONS = ['.txt', '.md', '.pdf', '.docx'] as const;
```

---

## Entity Relationships

```
┌─────────────────┐     ┌──────────────────┐
│  PromptContent  │     │  PolicyDocument  │
│  (system)       │     │  (temporary)     │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         │    ┌──────────────────┤
         │    │                  │
         v    v                  v
    ┌─────────────────────────────────┐
    │      GenerationRequest          │
    │  (combines prompts + document)  │
    └─────────────────┬───────────────┘
                      │
                      │ Claude API
                      v
    ┌─────────────────────────────────┐
    │      GeneratedWorkflow          │
    │  (output for display/copy)      │
    └─────────────────────────────────┘
```
