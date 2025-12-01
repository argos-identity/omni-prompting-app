/**
 * Token usage logging utility (Constitution IV compliance)
 */

import type { TokenUsage } from '@/types/workflow';

export interface LogEntry {
  timestamp: string;
  operation: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  sourceDocument?: string;
}

/**
 * Log token usage for an LLM operation
 */
export function logTokenUsage(
  operation: string,
  usage: TokenUsage,
  model: string,
  sourceDocument?: string
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    operation,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    model,
    sourceDocument,
  };

  // Console log for development
  console.log(
    `[Token Usage] ${operation}: ${usage.inputTokens} in / ${usage.outputTokens} out = ${usage.totalTokens} total (${model})`
  );

  return entry;
}

/**
 * Format token usage for display
 */
export function formatTokenUsage(usage: TokenUsage): string {
  return `Input: ${usage.inputTokens.toLocaleString()} | Output: ${usage.outputTokens.toLocaleString()} | Total: ${usage.totalTokens.toLocaleString()}`;
}

/**
 * Calculate estimated cost (rough estimate based on typical Claude pricing)
 */
export function estimateCost(usage: TokenUsage): number {
  // Claude Opus approximate pricing: $15/M input, $75/M output
  const inputCost = (usage.inputTokens / 1_000_000) * 15;
  const outputCost = (usage.outputTokens / 1_000_000) * 75;
  return inputCost + outputCost;
}
