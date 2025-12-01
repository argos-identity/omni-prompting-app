/**
 * Policy data extraction with deterministic preprocessor + LLM fallback
 * 1차 추출: preprocessor.js (결정론적) → 실패 시 LLM fallback
 */

import { generateContent } from './claude-client';
import type {
  ExtractedPolicyData,
  PreprocessorOutput,
  ExtractionMethod,
} from '@/types/workflow';

// ═══════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════

/** Minimum matched patterns required to use preprocessor result */
const MIN_MATCHED_PATTERNS = 2;

/** System prompt for LLM fallback extraction */
const EXTRACTION_SYSTEM_PROMPT = `You are a Policy Analysis Expert. Your task is to extract and structure key information from policy documents.

Extract the following from the provided document:
1. A concise summary (2-3 sentences)
2. All specific validation rules (e.g., "Document must be issued within 30 days")
3. The complete policy content in a clean, structured format

Output your response in the following JSON format:
{
  "summary": "Brief summary of the policy",
  "validationRules": ["Rule 1", "Rule 2", ...],
  "structuredContent": "The complete policy content, cleaned and formatted"
}

Important:
- Extract rules VERBATIM from the document
- Do not invent or assume rules not present in the document
- Preserve the original meaning and specificity of each rule
- Output ONLY valid JSON, no additional text`;

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface ExtractPolicyOptions {
  policyDocument: string;
  sourceDocumentName: string;
}

interface LLMExtractionResult {
  summary: string;
  validationRules: string[];
  structuredContent: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Extraction Function
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract structured data from policy document
 * Uses deterministic preprocessor first, falls back to LLM if needed
 */
export async function extractPolicyData(
  options: ExtractPolicyOptions
): Promise<ExtractedPolicyData> {
  const { policyDocument, sourceDocumentName } = options;

  console.log('\n' + '='.repeat(80));
  console.log('[PolicyExtractor] 정책 데이터 추출 시작');
  console.log('='.repeat(80));
  console.log('문서명:', sourceDocumentName);
  console.log('문서 크기:', policyDocument.length, 'chars');

  // Step 1: Try deterministic preprocessor
  try {
    console.log('\n[Step 1] Preprocessor 실행 시도...');

    // Dynamic import for JS module
    const { preprocessPolicy } = await import('@/prompt/preprocessor.js');
    const preprocessorResult: PreprocessorOutput = preprocessPolicy(policyDocument);

    console.log('[Preprocessor] 매칭된 패턴 수:', preprocessorResult.matched_patterns.length);
    console.log('[Preprocessor] 선택된 역할:', preprocessorResult.selected_role.role);
    console.log('[Preprocessor] 위험 수준:', preprocessorResult.selected_risk_level.level);

    // Check if preprocessing was successful (enough patterns matched)
    if (preprocessorResult.matched_patterns.length >= MIN_MATCHED_PATTERNS) {
      console.log(`[Preprocessor] ✅ 충분한 패턴 매칭 (>= ${MIN_MATCHED_PATTERNS}), preprocessor 결과 사용`);
      console.log('='.repeat(80) + '\n');

      return mapPreprocessorToExtractedData(preprocessorResult, sourceDocumentName);
    }

    // Fallback to LLM if not enough patterns matched
    console.log(`[Preprocessor] ⚠️ 패턴 매칭 부족 (< ${MIN_MATCHED_PATTERNS}), LLM fallback 실행`);
    return await extractWithLLM(policyDocument, sourceDocumentName, 'fallback');

  } catch (error) {
    // Fallback to LLM on preprocessor error
    console.error('[Preprocessor] ❌ 에러 발생, LLM fallback 실행:', error);
    return await extractWithLLM(policyDocument, sourceDocumentName, 'fallback');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Preprocessor Result Mapping
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Map preprocessor output to ExtractedPolicyData format
 */
function mapPreprocessorToExtractedData(
  result: PreprocessorOutput,
  sourceDocument: string
): ExtractedPolicyData {
  // Build structured content from preprocessor output
  const structuredContent = buildStructuredContent(result);

  // Build summary from extracted principles
  const summary = result.extracted_principles.length > 0
    ? result.extracted_principles.join('. ')
    : result.description;

  // Map matched patterns to validation rules
  const validationRules = result.matched_patterns.map(p =>
    `[${formatCategory(p.category)}] ${p.matched_keyword} (${p.criticality})`
  );

  return {
    content: structuredContent,
    summary,
    validationRules,
    extractedAt: result.metadata.timestamp,
    sourceDocument,
    tokenUsage: {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    },
    preprocessorOutput: result,
    extractionMethod: 'preprocessor',
  };
}

/**
 * Build structured content string from preprocessor output
 */
function buildStructuredContent(result: PreprocessorOutput): string {
  const sections: string[] = [];

  // Description
  sections.push(`## 프로세스 설명\n${result.description}`);

  // Role and Risk Level
  sections.push(`## 분류 정보\n- 역할: ${result.selected_role.role}\n- 위험 수준: ${result.selected_risk_level.level}`);

  // Matched Patterns (sorted by priority)
  if (result.matched_patterns.length > 0) {
    const patternList = result.matched_patterns
      .map(p => `- [${formatCategory(p.category)}] ${p.matched_keyword} (우선순위: ${p.priority}, ${p.criticality})`)
      .join('\n');
    sections.push(`## 매칭된 검증 항목\n${patternList}`);
  }

  // Checklist
  if (result.checklist.length > 0) {
    const checklistItems = result.checklist
      .map(c => `- ${c.data_point}: ${c.tool} (소스: ${c.source})`)
      .join('\n');
    sections.push(`## 검증 체크리스트\n${checklistItems}`);
  }

  // Logic Flow
  if (result.logic_flow.length > 0) {
    sections.push(`## 검증 로직 흐름\n${result.logic_flow.join('\n')}`);
  }

  // Critical Failures
  if (result.critical_failures.length > 0) {
    sections.push(`## 중요 실패 조건\n${result.critical_failures.map(f => `- ${f}`).join('\n')}`);
  }

  // Review Triggers
  if (result.review_triggers.length > 0) {
    sections.push(`## 검토 트리거\n${result.review_triggers.map(t => `- ${t}`).join('\n')}`);
  }

  return sections.join('\n\n');
}

/**
 * Format category string for display
 */
function formatCategory(category: string): string {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ═══════════════════════════════════════════════════════════════════════════
// LLM Fallback Extraction
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract policy data using LLM (fallback method)
 */
async function extractWithLLM(
  policyDocument: string,
  sourceDocumentName: string,
  method: ExtractionMethod
): Promise<ExtractedPolicyData> {
  console.log('\n[Step 2] LLM 추출 실행...');

  const result = await generateContent({
    systemPrompt: EXTRACTION_SYSTEM_PROMPT,
    userContent: `Please analyze and extract key information from the following policy document:\n\n${policyDocument}`,
    maxTokens: 8192,
    sourceDocument: sourceDocumentName,
  });

  console.log('[LLM] 토큰 사용량:', result.tokenUsage);
  console.log('='.repeat(80) + '\n');

  // Parse the JSON response
  let extractionResult: LLMExtractionResult;
  try {
    let jsonContent = result.content.trim();

    // Remove markdown code block if present
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith('```')) {
      jsonContent = jsonContent.slice(0, -3);
    }

    extractionResult = JSON.parse(jsonContent.trim());
  } catch {
    // If JSON parsing fails, use the raw content
    console.warn('[LLM] JSON 파싱 실패, 원본 콘텐츠 사용');
    extractionResult = {
      summary: 'Policy document analyzed',
      validationRules: [],
      structuredContent: result.content,
    };
  }

  return {
    content: extractionResult.structuredContent,
    summary: extractionResult.summary,
    validationRules: extractionResult.validationRules,
    extractedAt: new Date().toISOString(),
    sourceDocument: sourceDocumentName,
    tokenUsage: result.tokenUsage,
    extractionMethod: method,
  };
}
