/**
 * Workflow generation logic using Claude API
 * 2차 LLM 호출: 추출된 정책 데이터로 JSON 배열 워크플로우 생성
 */

import { generateContent, type GenerateResult } from './claude-client';
import type { GeneratedWorkflow, ExtractedPolicyData, WorkflowAction } from '@/types/workflow';

/** Template placeholder in meta-prompt */
const POLICY_PLACEHOLDER = '{{심사 기준 또는 정책 문서}}';

export interface GenerateWorkflowOptions {
  systemPrompt: string;
  metaPrompt: string;
  extractedData: ExtractedPolicyData;
  sourceDocumentName: string;
}

/**
 * Inject extracted policy data into meta-prompt template
 */
function injectPolicyData(metaPrompt: string, extractedData: ExtractedPolicyData): string {
  console.log('\n' + '='.repeat(80));
  console.log('[WorkflowGenerator] Meta-Prompt 템플릿 치환 시작');
  console.log('='.repeat(80));

  // Format extracted data for injection
  const formattedData = `
## 정책 요약
${extractedData.summary}

## 검증 규칙
${extractedData.validationRules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}

## 상세 정책 내용
${extractedData.content}
`.trim();

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
 * Extract workflow.md markdown content from LLM response
 * Looks for ```markdown code block
 */
function extractWorkflowMd(content: string): string {
  // Match ```markdown ... ``` code block
  const markdownBlockRegex = /```markdown\s*([\s\S]*?)```/;
  const match = content.match(markdownBlockRegex);

  if (match && match[1]) {
    console.log('[WorkflowGenerator] workflow.md 마크다운 블록 추출 성공');
    return match[1].trim();
  }

  // Fallback: try to find content starting with YAML frontmatter
  const yamlFrontmatterRegex = /^---\s*\n[\s\S]*?\n---/m;
  if (yamlFrontmatterRegex.test(content)) {
    console.log('[WorkflowGenerator] YAML frontmatter 형식 감지, 전체 콘텐츠 반환');
    return content.trim();
  }

  console.log('[WorkflowGenerator] workflow.md 마크다운 블록 미발견');
  return '';
}

/**
 * Parse JSON array from LLM response
 * Handles markdown code blocks and validates structure
 */
function parseWorkflowActions(content: string): WorkflowAction[] {
  let jsonContent = content.trim();

  // Remove markdown code blocks if present
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.slice(7);
  } else if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.slice(3);
  }
  if (jsonContent.endsWith('```')) {
    jsonContent = jsonContent.slice(0, -3);
  }

  jsonContent = jsonContent.trim();

  // Parse JSON
  const parsed = JSON.parse(jsonContent);

  // Validate it's an array
  if (!Array.isArray(parsed)) {
    throw new Error('Expected JSON array but got ' + typeof parsed);
  }

  // Validate each action has required fields
  const actions: WorkflowAction[] = parsed.map((item, index) => {
    if (typeof item.id !== 'string') {
      throw new Error(`Action at index ${index} missing 'id' field`);
    }
    if (typeof item.action_name !== 'string') {
      throw new Error(`Action at index ${index} missing 'action_name' field`);
    }
    if (typeof item.category !== 'string') {
      throw new Error(`Action at index ${index} missing 'category' field`);
    }
    if (typeof item.description !== 'string') {
      throw new Error(`Action at index ${index} missing 'description' field`);
    }
    if (typeof item.engine_required !== 'boolean') {
      throw new Error(`Action at index ${index} missing 'engine_required' field`);
    }
    if (!Array.isArray(item.reference_notes)) {
      throw new Error(`Action at index ${index} missing 'reference_notes' array`);
    }

    return {
      id: item.id,
      action_name: item.action_name,
      category: item.category,
      description: item.description,
      engine_required: item.engine_required,
      engine_type: item.engine_type ?? null,
      reference_notes: item.reference_notes,
    };
  });

  return actions;
}

/**
 * Generate workflow from extracted policy data
 */
export async function generateWorkflow(
  options: GenerateWorkflowOptions
): Promise<GeneratedWorkflow> {
  const { systemPrompt, metaPrompt, extractedData, sourceDocumentName } = options;

  // Inject extracted policy data into meta-prompt template
  const populatedMetaPrompt = injectPolicyData(metaPrompt, extractedData);

  // Generate content using Claude
  const result: GenerateResult = await generateContent({
    systemPrompt,
    userContent: populatedMetaPrompt,
    maxTokens: 16384, // Allow longer output for detailed workflows
    sourceDocument: sourceDocumentName,
  });

  // Extract workflow.md markdown content
  const workflowMd = extractWorkflowMd(result.content);

  // Parse JSON actions from response (for backward compatibility)
  let actions: WorkflowAction[] = [];
  try {
    actions = parseWorkflowActions(result.content);
    console.log(`[WorkflowGenerator] JSON 파싱 성공: ${actions.length}개 액션`);
  } catch (parseError) {
    console.error('[WorkflowGenerator] JSON 파싱 실패:', parseError);
    // Return empty actions array on parse failure, raw content preserved
  }

  return {
    actions,
    rawContent: result.content,
    workflowMd,
    generatedAt: new Date().toISOString(),
    sourceDocument: sourceDocumentName,
    tokenUsage: result.tokenUsage,
  };
}
