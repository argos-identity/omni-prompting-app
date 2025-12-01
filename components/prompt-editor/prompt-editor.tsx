'use client';

import * as React from 'react';
import { RotateCcw, AlertCircle, Check, FileText, Maximize2, Minimize2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { usePrompt } from './use-prompt';
import { cn } from '@/lib/utils/cn';
import type { PromptType } from '@/types/prompts';

export interface PromptEditorProps {
  type: PromptType;
  title: string;
  isExpanded?: boolean;
  isCollapsed?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
}

export function PromptEditor({
  type,
  title,
  isExpanded = false,
  isCollapsed = false,
  onExpand,
  onCollapse,
}: PromptEditorProps) {
  const {
    content,
    error,
    lastModified,
    isLoading,
    setContent,
    reload,
  } = usePrompt(type);

  const handleToggleExpand = () => {
    if (isExpanded) {
      onCollapse?.();
    } else {
      onExpand?.();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleReload = async () => {
    await reload();
  };

  // If collapsed, render minimal header only
  if (isCollapsed) {
    return (
      <div
        className="flex items-center justify-between px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleToggleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleToggleExpand()}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        </div>
        <div className="flex items-center gap-1">
          {(onExpand || onCollapse) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpand}
              title={isExpanded ? 'Restore' : 'Maximize'}
              className="h-7 w-7 p-0"
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReload}
            disabled={isLoading}
            title="Reload"
            className="h-7 w-7 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content - 전체 영역을 textarea로 채움 */}
      <div className="flex-1 relative min-h-0">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner label="Loading prompt..." />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={handleChange}
            className={cn(
              'absolute inset-0 w-full h-full p-3 resize-none',
              'font-mono text-xs leading-relaxed',
              'border-0 focus:outline-none focus:ring-0',
              'bg-transparent overflow-auto'
            )}
            placeholder={`Enter your ${type} prompt here...`}
            spellCheck={false}
          />
        )}
      </div>

      {/* Footer - Compact */}
      <div className="px-3 py-1.5 border-t border-gray-200 bg-gray-50 text-xs flex items-center justify-between">
        {error ? (
          <div className="flex items-center gap-1 text-red-600">
            <AlertCircle className="h-3 w-3" />
            <span className="truncate">{error}</span>
          </div>
        ) : (
          <>
            <span className="text-gray-400 truncate">
              {lastModified ? new Date(lastModified).toLocaleString() : ''}
            </span>
            {lastModified && (
              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
