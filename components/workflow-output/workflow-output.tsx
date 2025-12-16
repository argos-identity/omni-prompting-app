'use client';

import * as React from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { FileText, Clock, Coins } from 'lucide-react';
import { CopyButton } from './copy-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatTokenUsage } from '@/lib/llm/token-logger';
import { cn } from '@/lib/utils/cn';
import type { GeneratedWorkflow, WorkflowGenerationState } from '@/types/workflow';

export interface WorkflowOutputProps {
  state: WorkflowGenerationState;
  workflow: GeneratedWorkflow | null;
  error: string | null;
}

/** Workflow.md markdown view */
function WorkflowMdView({ content }: { content: string }) {
  return (
    <pre
      className={cn(
        'font-mono text-sm whitespace-pre-wrap break-words',
        'text-gray-800 leading-relaxed p-4'
      )}
    >
      {content}
    </pre>
  );
}

export function WorkflowOutput({ state, workflow, error }: WorkflowOutputProps) {
  const isLoading = state === 'uploading' || state === 'generating' || state === 'parsing' || state === 'extracting';

  // Use workflowMd for copy, fallback to rawContent if empty
  const copyContent = workflow
    ? workflow.workflowMd || workflow.rawContent
    : '';

  // Determine display content (workflowMd or fallback to rawContent)
  const displayContent = workflow
    ? workflow.workflowMd || workflow.rawContent
    : '';

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">workflow.md</h2>
        </div>
        <div className="flex items-center gap-2">
          {workflow && <CopyButton content={copyContent} />}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-500">
              {state === 'uploading' && '문서 업로드 중...'}
              {state === 'parsing' && '문서 파싱 중...'}
              {state === 'extracting' && '정책 데이터 추출 중...'}
              {state === 'generating' && 'workflow.md 생성 중...'}
            </p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        ) : workflow ? (
          <ScrollArea.Root className="h-full">
            <ScrollArea.Viewport className="h-full w-full">
              <WorkflowMdView content={displayContent} />
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors duration-150 ease-out hover:bg-gray-200 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="flex-1 bg-gray-400 rounded-full relative" />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner />
          </ScrollArea.Root>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <FileText className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              정책 문서를 업로드하여 workflow.md를 생성하세요
            </p>
          </div>
        )}
      </div>

      {/* Footer - Metadata */}
      {workflow && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{workflow.sourceDocument}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(workflow.generatedAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                <span>{formatTokenUsage(workflow.tokenUsage)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
