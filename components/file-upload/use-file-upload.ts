'use client';

import { useState, useCallback } from 'react';
import { validateFile } from '@/lib/utils/file-validators';
import type { GenerationResponse, InputSource } from '@/types/api';
import type { GeneratedWorkflow, ExtractedPolicyData, WorkflowGenerationState } from '@/types/workflow';

export interface UseFileUploadReturn {
  state: WorkflowGenerationState;
  error: string | null;
  inputMode: InputSource;
  selectedFile: File | null;
  selectedUrl: string | null;
  workflow: GeneratedWorkflow | null;
  extractedData: ExtractedPolicyData | null;
  setInputMode: (mode: InputSource) => void;
  selectFile: (file: File | null) => void;
  selectUrl: (url: string) => void;
  uploadAndGenerate: () => Promise<void>;
  reset: () => void;
  canGenerate: boolean;
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function useFileUpload(): UseFileUploadReturn {
  const [state, setState] = useState<WorkflowGenerationState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputSource>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<GeneratedWorkflow | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedPolicyData | null>(null);

  const selectFile = useCallback((file: File | null) => {
    setError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setSelectedUrl(null); // Clear URL when file is selected
  }, []);

  const selectUrl = useCallback((url: string) => {
    setError(null);

    if (!url.trim()) {
      setSelectedUrl(null);
      return;
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      setError('올바른 URL 형식이 아닙니다 (http:// 또는 https://)');
      setSelectedUrl(url); // Keep the invalid URL for editing
      return;
    }

    setSelectedUrl(url);
    setSelectedFile(null); // Clear file when URL is selected
  }, []);

  const handleInputModeChange = useCallback((mode: InputSource) => {
    setInputMode(mode);
    setError(null);
    // Don't clear selections - user might want to switch back
  }, []);

  const uploadAndGenerate = useCallback(async () => {
    const hasFile = inputMode === 'file' && selectedFile;
    const hasUrl = inputMode === 'url' && selectedUrl && isValidUrl(selectedUrl);

    if (!hasFile && !hasUrl) {
      setError(inputMode === 'file' ? '파일을 선택해주세요' : 'URL을 입력해주세요');
      return;
    }

    try {
      setState('uploading');
      setError(null);
      setExtractedData(null);

      const formData = new FormData();

      if (inputMode === 'file' && selectedFile) {
        formData.append('policyDocument', selectedFile);
      } else if (inputMode === 'url' && selectedUrl) {
        formData.append('documentUrl', selectedUrl);
      }

      // 1차: 추출 단계
      setState('extracting');

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const result: GenerationResponse = await response.json();

      if (!result.success) {
        setState('error');
        setError(result.error.message);
        return;
      }

      // 추출된 데이터 저장
      setExtractedData(result.extractedData);

      // 2차: 생성 완료
      setState('complete');
      setWorkflow(result.workflow);
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to generate workflow');
    }
  }, [inputMode, selectedFile, selectedUrl]);

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
    setSelectedFile(null);
    setSelectedUrl(null);
    setWorkflow(null);
    setExtractedData(null);
    // Keep inputMode as user preference
  }, []);

  // Determine if generation is possible
  const canGenerate =
    (inputMode === 'file' && selectedFile !== null) ||
    (inputMode === 'url' && selectedUrl !== null && isValidUrl(selectedUrl));

  return {
    state,
    error,
    inputMode,
    selectedFile,
    selectedUrl,
    workflow,
    extractedData,
    setInputMode: handleInputModeChange,
    selectFile,
    selectUrl,
    uploadAndGenerate,
    reset,
    canGenerate,
  };
}
