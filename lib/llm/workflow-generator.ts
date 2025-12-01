/**
 * Workflow generation logic using Claude API
 * 2차 LLM 호출: 추출된 정책 데이터로 workflow.md 생성
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { generateContent, type GenerateResult } from './claude-client';
import type { GeneratedWorkflow, ExtractedPolicyData } from '@/types/workflow';

/** Template placeholders in meta-prompt */
const POLICY_PLACEHOLDER = '{{심사 기준 또는 정책 문서}}';
const PATTERN_REG_PLACEHOLDER = '{{pattern_registry.json 내용}}';
const PREPROCESSED_DATA_PLACEHOLDER = '[PREPROCESSED_DATA]:';


export interface GenerateWorkflowOptions {
  systemPrompt: string;
  metaPrompt: string;
  extractedData: ExtractedPolicyData;
  sourceDocumentName: string;
}

/**
 * Inject pattern registry JSON into meta-prompt (legacy support)
 * 새 meta-prompt v3.0에서는 사용하지 않음 (preprocessor가 처리)
 */
async function injectPatternRegistry(metaPrompt: string): Promise<string> {
  // 새 meta-prompt에는 pattern_registry 플레이스홀더가 없음
  // 플레이스홀더가 있는 경우에만 주입 시도
  if (!metaPrompt.includes(PATTERN_REG_PLACEHOLDER)) {
    console.log('[WorkflowGenerator] Pattern Registry 플레이스홀더 없음 (v3.0 meta-prompt) - 스킵');
    return metaPrompt;
  }

  const registryPath = path.join(process.cwd(), 'prompt', 'pattern-registry-kr.json');
  const registryContent = await readFile(registryPath, 'utf-8');

  console.log('\n' + '='.repeat(80));
  console.log('[WorkflowGenerator] Pattern Registry 주입 (legacy)');
  console.log('='.repeat(80));
  console.log('파일 경로:', registryPath);
  console.log('파일 크기:', registryContent.length, 'chars');
  console.log('→ 치환 완료');
  console.log('='.repeat(80) + '\n');

  return metaPrompt.replace(PATTERN_REG_PLACEHOLDER, registryContent);
}

/**
 * Replace template placeholder in meta-prompt with extracted policy data
 * v3.0: preprocessor 출력을 JSON으로 주입
 * legacy: 정책 데이터를 텍스트로 주입
 */
function injectPolicyData(metaPrompt: string, extractedData: ExtractedPolicyData): string {
  console.log('\n' + '='.repeat(80));
  console.log('[WorkflowGenerator] Meta-Prompt 템플릿 치환 시작');
  console.log('='.repeat(80));
  console.log('추출 방식:', extractedData.extractionMethod);

  // v3.0 meta-prompt: preprocessor JSON 주입
  if (metaPrompt.includes(PREPROCESSED_DATA_PLACEHOLDER) && extractedData.preprocessorOutput) {
    const preprocessorJson = JSON.stringify(extractedData.preprocessorOutput, null, 2);

    console.log('[v3.0] Preprocessor JSON 주입');
    console.log('JSON 크기:', preprocessorJson.length, 'chars');
    console.log('='.repeat(80) + '\n');

    return metaPrompt.replace(
      PREPROCESSED_DATA_PLACEHOLDER,
      `${PREPROCESSED_DATA_PLACEHOLDER}\n${preprocessorJson}`
    );
  }

  // Legacy meta-prompt: 정책 텍스트 주입
  const formattedData = `
## 정책 요약
${extractedData.summary}

## 검증 규칙
${extractedData.validationRules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}

## 상세 정책 내용
${extractedData.content}
`.trim();

  console.log('[Legacy] 정책 텍스트 주입');
  console.log('요약:', extractedData.summary);
  console.log('검증 규칙 수:', extractedData.validationRules.length);

  // Replace the placeholder with the extracted data
  if (metaPrompt.includes(POLICY_PLACEHOLDER)) {
    console.log('플레이스홀더 발견:', POLICY_PLACEHOLDER);
    console.log('='.repeat(80) + '\n');
    return metaPrompt.replace(POLICY_PLACEHOLDER, formattedData);
  }

  // If no placeholder found, append to the Input Data section
  console.log('플레이스홀더 미발견, Input Data 섹션에 추가');
  console.log('='.repeat(80) + '\n');
  return metaPrompt.replace(
    /1\. \[Policy\/Guideline Document\]:\s*"""\s*"""/,
    `1. [Policy/Guideline Document]:\n"""\n${formattedData}\n"""`
  );
}

/**
 * Generate workflow from extracted policy data
 */
export async function generateWorkflow(
  options: GenerateWorkflowOptions
): Promise<GeneratedWorkflow> {
  const { systemPrompt, metaPrompt, extractedData, sourceDocumentName } = options;

  // 1. Inject pattern registry into meta-prompt template
  const withPatternRegistry = await injectPatternRegistry(metaPrompt);

  // 2. Inject extracted policy data into meta-prompt template
  const populatedMetaPrompt = injectPolicyData(withPatternRegistry, extractedData);

  // 3. Generate content using Claude
  const result: GenerateResult = await generateContent({
    systemPrompt,
    userContent: populatedMetaPrompt,
    maxTokens: 16384, // Allow longer output for detailed workflows
    sourceDocument: sourceDocumentName,
  });

  return {
    content: result.content,
    generatedAt: new Date().toISOString(),
    sourceDocument: sourceDocumentName,
    tokenUsage: result.tokenUsage,
  };
}
