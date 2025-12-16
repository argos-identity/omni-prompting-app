/**
 * Policy data extraction using LLM (Claude)
 * 1차 LLM 호출: 정책 문서에서 구조화된 데이터 추출
 */

import { generateContent } from './claude-client';
import type { ExtractedPolicyData } from '@/types/workflow';

// ═══════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════

/** System prompt for policy extraction */
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
 * Extract structured data from policy document using LLM
 */
export async function extractPolicyData(
  options: ExtractPolicyOptions
): Promise<ExtractedPolicyData> {
  const { policyDocument, sourceDocumentName } = options;

  console.log('\n' + '='.repeat(80));
  console.log('[PolicyExtractor] 정책 데이터 추출 시작 (LLM 기반)');
  console.log('='.repeat(80));
  console.log('문서명:', sourceDocumentName);
  console.log('문서 크기:', policyDocument.length, 'chars');

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
  };
}
