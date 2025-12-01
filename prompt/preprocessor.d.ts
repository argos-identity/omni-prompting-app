/**
 * TypeScript declarations for preprocessor.js
 * Deterministic policy document preprocessing
 */

import type { PreprocessorOutput } from '@/types/workflow';

/**
 * Preprocess a policy document using deterministic pattern matching
 * @param policyText - Raw text content of the policy document
 * @returns Structured preprocessor output with matched patterns, roles, risk levels, etc.
 */
export function preprocessPolicy(policyText: string): PreprocessorOutput;
