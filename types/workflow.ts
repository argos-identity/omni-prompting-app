/**
 * Workflow-related type definitions
 */

// ═══════════════════════════════════════════════════════════════════════════
// Preprocessor Output Types (Deterministic Extraction)
// ═══════════════════════════════════════════════════════════════════════════

/** Matched pattern from preprocessor */
export interface MatchedPattern {
  pattern_id: string;
  category: string;
  priority: number;
  criticality: string;
  tool_id: string;
  matched_keyword: string;
  match_position: number;
  source_type: string;
  is_prerequisite: boolean;
}

/** Unmatched pattern info */
export interface UnmatchedPattern {
  pattern_id: string;
  category: string;
}

/** Role selection result */
export interface SelectedRole {
  role: string;
  matched_via: string;
  priority: number;
}

/** Risk level selection result */
export interface SelectedRiskLevel {
  level: string;
  matched_via: string;
}

/** Checklist item */
export interface ChecklistItem {
  data_point: string;
  source: string;
  tool: string;
}

/** Preprocessor metadata */
export interface PreprocessorMetadata {
  registry_version: string;
  timestamp: string;
  policy_hash: string;
}

/** Complete preprocessor output structure */
export interface PreprocessorOutput {
  metadata: PreprocessorMetadata;
  matched_patterns: MatchedPattern[];
  unmatched_patterns: UnmatchedPattern[];
  selected_role: SelectedRole;
  selected_risk_level: SelectedRiskLevel;
  extracted_principles: string[];
  description: string;
  checklist: ChecklistItem[];
  logic_flow: string[];
  critical_failures: string[];
  review_triggers: string[];
}

/** Extraction method indicator */
export type ExtractionMethod = 'preprocessor' | 'llm' | 'fallback';

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
  /** Generated workflow content in markdown format */
  content: string;

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

  /** Token usage for the extraction (0 if preprocessor used) */
  tokenUsage: TokenUsage;

  /** Full preprocessor output (only present when extractionMethod is 'preprocessor') */
  preprocessorOutput?: PreprocessorOutput;

  /** How the data was extracted */
  extractionMethod: ExtractionMethod;
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
