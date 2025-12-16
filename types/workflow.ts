/**
 * Workflow-related type definitions
 * JSON-based workflow generation
 */

// ═══════════════════════════════════════════════════════════════════════════
// Workflow Action Types
// ═══════════════════════════════════════════════════════════════════════════

/** 워크플로우 액션 항목 */
export interface WorkflowAction {
  /** 계층적 ID (예: "0.1", "1.1", "1.2") */
  id: string;

  /** snake_case 액션 이름 */
  action_name: string;

  /** 카테고리 */
  category: string;

  /** 한국어 설명 */
  description: string;

  /** 외부 엔진 필요 여부 */
  engine_required: boolean;

  /** 엔진 타입 (null 가능) */
  engine_type: string | null;

  /** 정책 문서에서 추출된 관련 내용 */
  reference_notes: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// LLM Types
// ═══════════════════════════════════════════════════════════════════════════

/** Token usage metrics from LLM API */
export interface TokenUsage {
  /** Input tokens sent to LLM */
  inputTokens: number;

  /** Output tokens received from LLM */
  outputTokens: number;

  /** Total tokens (input + output) */
  totalTokens: number;
}

/** Generated workflow result */
export interface GeneratedWorkflow {
  /** Generated workflow actions as JSON array */
  actions: WorkflowAction[];

  /** Raw content (for backward compatibility or debugging) */
  rawContent: string;

  /** Extracted workflow.md markdown content */
  workflowMd: string;

  /** Generation timestamp (ISO 8601) */
  generatedAt: string;

  /** Source document filename */
  sourceDocument: string;

  /** Token usage for the generation */
  tokenUsage: TokenUsage;
}

/** Extracted policy data from document */
export interface ExtractedPolicyData {
  /** Extracted policy content in structured format */
  content: string;

  /** Summary of the policy document */
  summary: string;

  /** Key validation rules extracted */
  validationRules: string[];

  /** Extraction timestamp (ISO 8601) */
  extractedAt: string;

  /** Source document filename */
  sourceDocument: string;

  /** Token usage for the extraction */
  tokenUsage: TokenUsage;
}

/** Workflow generation state */
export type WorkflowGenerationState =
  | 'idle'
  | 'uploading'
  | 'parsing'
  | 'extracting'
  | 'generating'
  | 'complete'
  | 'error';
