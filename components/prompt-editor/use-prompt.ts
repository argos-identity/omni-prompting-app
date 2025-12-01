'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PromptType, PromptContent } from '@/types/prompts';

export interface UsePromptReturn {
  content: string;
  error: string | null;
  lastModified: string | null;
  isLoading: boolean;
  setContent: (content: string) => void;
  reload: () => Promise<void>;
}

export function usePrompt(type: PromptType): UsePromptReturn {
  const [content, setContentState] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch prompt content
  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/prompts?type=${type}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load prompt');
      }

      const promptContent = data as PromptContent;
      setContentState(promptContent.content);
      setLastModified(promptContent.lastModified);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompt');
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  // Initial load
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Update content (local state only, no persistence)
  const setContent = useCallback((newContent: string) => {
    setContentState(newContent);
    setError(null);
  }, []);

  // Reload content from server
  const reload = useCallback(async () => {
    await fetchContent();
  }, [fetchContent]);

  return {
    content,
    error,
    lastModified,
    isLoading,
    setContent,
    reload,
  };
}
