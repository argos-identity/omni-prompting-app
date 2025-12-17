# Data Model: Workflow Generator Web Service

**Feature**: 001-workflow-generator-web
**Date**: 2025-11-27
**Updated**: 2025-12-17
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

**Storage**: File system at `./prompt/policy-prompt/system-prompt.md` and `./prompt/policy-prompt/meta-prompt.md`

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

### 3. InputSource

Represents the source type for policy input.

```typescript
type InputSource = 'file' | 'url';
```

**Usage**: Determines whether the input is a file upload or URL fetch.

---

### 4. ExtractedPolicyData

Represents the intermediate data extracted from policy document by 1st LLM call.

```typescript
interface ExtractedPolicyData {
  /** Extracted and cleaned policy content */
  content: string;

  /** 2-3 sentence summary of the policy */
  summary: string;

  /** List of validation rules extracted from policy */
  validationRules: string[];

  /** Extraction timestamp (ISO 8601) */
  extractedAt: string;

  /** Source document filename or URL */
  sourceDocument: string;

  /** Token usage for the extraction */
  tokenUsage: TokenUsage;
}
```

**Storage**: Client-side state only (not persisted)

**Validation Rules**:
- `content` must be non-empty string
- `summary` should be 2-3 sentences
- `validationRules` array may be empty but should exist

---

### 5. WorkflowAction

Represents a single action in the generated workflow.

```typescript
interface WorkflowAction {
  /** Hierarchical ID (e.g., "0.1", "1.1", "2.1") */
  id: string;

  /** Snake_case action identifier */
  action_name: string;

  /** Category for grouping actions */
  category: string;

  /** Description of the action (Korean preferred) */
  description: string;

  /** Whether external engine is required */
  engine_required: boolean;

  /** Engine type if required (null if not required) */
  engine_type: string | null;

  /** Policy reference notes */
  reference_notes: string[];
}
```

**ID Convention**:
- 0.x: Foundational Checks
- 1.x: Application Intake
- 2.x: Document Verification
- 3.x: Identity Verification
- 4.x: Compliance Screening
- 5.x: Risk Assessment
- 6.x: Final Review

**Engine Types**: `"OCR"`, `"LLM"`, `"WEB_SEARCH"`, `"DB_QUERY"`, `"API_CALL"`, etc.

---

### 6. GeneratedWorkflow

Represents the output workflow.md content.

```typescript
interface GeneratedWorkflow {
  /** Array of workflow actions */
  actions: WorkflowAction[];

  /** Full raw LLM response content */
  rawContent: string;

  /** Extracted workflow.md markdown section */
  workflowMd: string;

  /** Generation timestamp (ISO 8601) */
  generatedAt: string;

  /** Source document filename or URL */
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
- `actions` array must contain valid WorkflowAction objects
- `rawContent` must be non-empty string
- `workflowMd` should contain expected XML sections (core_identity, enterprise_context, etc.)

---

### 7. GenerationRequest

Request payload for workflow generation.

```typescript
interface GenerationRequest {
  /** System prompt content (optional, uses default if not provided) */
  systemPrompt?: string;

  /** Meta prompt content (optional, uses default if not provided) */
  metaPrompt?: string;

  /** Uploaded policy document file (mutually exclusive with documentUrl) */
  policyDocument?: File;

  /** URL to fetch policy content (mutually exclusive with policyDocument) */
  documentUrl?: string;
}
```

**Validation Rules**:
- Either `policyDocument` or `documentUrl` must be provided (not both, not neither)
- `systemPrompt` if provided, must be non-empty
- `metaPrompt` if provided, must be non-empty
- `policyDocument` must pass PolicyDocument validation
- `documentUrl` must be valid HTTP/HTTPS URL

---

### 8. GenerationResponse

Response payload from workflow generation.

```typescript
interface GenerationResponse {
  /** Success indicator */
  success: boolean;

  /** Generated workflow (if successful) */
  workflow?: GeneratedWorkflow;

  /** Extracted policy data (if successful) */
  extractedData?: ExtractedPolicyData;

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
  | 'NO_INPUT'           // Neither file nor URL provided
  | 'INVALID_FILE_TYPE'  // Unsupported file extension/MIME type
  | 'FILE_TOO_LARGE'     // File exceeds 10MB limit
  | 'INVALID_URL'        // Malformed URL or non-HTTP(S) protocol
  | 'URL_FETCH_FAILED'   // Failed to fetch URL content
  | 'URL_TIMEOUT'        // URL fetch timed out
  | 'PARSE_ERROR'        // Document parsing failed
  | 'LLM_ERROR'          // LLM API call failed
  | 'RATE_LIMITED'       // API rate limit exceeded
  | 'TIMEOUT'            // Request timeout (300s)
  | 'INTERNAL_ERROR';    // Unexpected server error
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
IDLE -> UPLOADING -> EXTRACTING -> GENERATING -> COMPLETE
           |            |              |
           v            v              v
         ERROR        ERROR          ERROR
```

| State | Description | Triggers |
|-------|-------------|----------|
| IDLE | Ready for upload | Initial, reset |
| UPLOADING | File being uploaded or URL being fetched | File selected or URL submitted |
| EXTRACTING | 1st LLM call: Extracting policy data | Upload/fetch complete |
| GENERATING | 2nd LLM call: Generating workflow | Extraction complete |
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

export const inputSourceSchema = z.enum(['file', 'url']);

export const tokenUsageSchema = z.object({
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
});

export const workflowActionSchema = z.object({
  id: z.string(),
  action_name: z.string(),
  category: z.string(),
  description: z.string(),
  engine_required: z.boolean(),
  engine_type: z.string().nullable(),
  reference_notes: z.array(z.string()),
});

export const extractedPolicyDataSchema = z.object({
  content: z.string().min(1),
  summary: z.string(),
  validationRules: z.array(z.string()),
  extractedAt: z.string().datetime(),
  sourceDocument: z.string(),
  tokenUsage: tokenUsageSchema,
});

export const generatedWorkflowSchema = z.object({
  actions: z.array(workflowActionSchema),
  rawContent: z.string().min(1),
  workflowMd: z.string(),
  generatedAt: z.string().datetime(),
  sourceDocument: z.string(),
  tokenUsage: tokenUsageSchema,
});

export const errorCodeSchema = z.enum([
  'NO_INPUT',
  'INVALID_FILE_TYPE',
  'FILE_TOO_LARGE',
  'INVALID_URL',
  'URL_FETCH_FAILED',
  'URL_TIMEOUT',
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
  extractedData: extractedPolicyDataSchema.optional(),
  error: generationErrorSchema.optional(),
});

// File validation constants
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['.txt', '.md', '.pdf', '.docx'] as const,
  ALLOWED_MIME_TYPES: [
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const,
};

// URL validation constants
export const URL_CONSTRAINTS = {
  MAX_LENGTH: 2048,
  TIMEOUT_MS: 60000, // 60 seconds
};
```

---

## Entity Relationships

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  PromptContent  │     │  PolicyDocument  │     │   PolicyUrl     │
│  (system)       │     │  (temporary)     │     │  (temporary)    │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                        │
         │                       └──────────┬─────────────┘
         │                                  │
         │         ┌────────────────────────┤
         │         │                        │
         v         v                        v
    ┌─────────────────────────────────────────────────┐
    │           GenerationRequest                     │
    │  (combines prompts + document/url)              │
    └─────────────────────┬───────────────────────────┘
                          │
                          │ 1st LLM Call (Policy Extractor)
                          v
    ┌─────────────────────────────────────────────────┐
    │           ExtractedPolicyData                   │
    │  (summary, validationRules, content)            │
    └─────────────────────┬───────────────────────────┘
                          │
                          │ 2nd LLM Call (Workflow Generator)
                          v
    ┌─────────────────────────────────────────────────┐
    │           GeneratedWorkflow                     │
    │  (actions[], rawContent, workflowMd)            │
    └─────────────────────────────────────────────────┘
```

---

## API Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    POST /api/generate                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Input Validation                                             │
│     ├─ Check: policyDocument XOR documentUrl                     │
│     ├─ File: validateFile(size, extension, mimeType)             │
│     └─ URL: validateUrl(format, protocol)                        │
│                                                                  │
│  2. Content Extraction                                           │
│     ├─ File: parseDocument(PDF/DOCX/TXT/MD)                      │
│     └─ URL: fetchUrlContent() → Claude extraction                │
│                                                                  │
│  3. Load Prompts                                                 │
│     ├─ systemPrompt from request OR ./prompt/policy-prompt/      │
│     └─ metaPrompt from request OR ./prompt/policy-prompt/        │
│                                                                  │
│  4. 1st LLM Call: Policy Extraction                              │
│     ├─ Input: policyDocument text                                │
│     ├─ Output: { summary, validationRules, structuredContent }   │
│     └─ TokenUsage logged                                         │
│                                                                  │
│  5. 2nd LLM Call: Workflow Generation                            │
│     ├─ Input: extractedData injected into metaPrompt             │
│     ├─ Output: workflow.md with action_workflow JSON             │
│     └─ TokenUsage logged                                         │
│                                                                  │
│  6. Response                                                     │
│     └─ { success, workflow, extractedData }                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```
