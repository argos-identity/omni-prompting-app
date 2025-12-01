'use client';

import * as React from 'react';
import { FileUpload, useFileUpload } from '@/components/file-upload';
import { WorkflowOutput } from '@/components/workflow-output';
import { PromptEditor } from '@/components/prompt-editor';
import { ExtractedData } from '@/components/extracted-data';
import type { PromptType } from '@/types/prompts';

export default function Home() {
  const {
    state,
    error,
    inputMode,
    selectedFile,
    selectedUrl,
    workflow,
    extractedData,
    canGenerate,
    setInputMode,
    selectFile,
    selectUrl,
    uploadAndGenerate,
    reset,
  } = useFileUpload();

  // Track which prompt is expanded (null = both visible in split view)
  const [expandedPrompt, setExpandedPrompt] = React.useState<PromptType | null>(null);

  const handleExpandPrompt = (type: PromptType) => {
    setExpandedPrompt(type);
  };

  const handleCollapsePrompt = () => {
    setExpandedPrompt(null);
  };

  return (
    <main className="min-h-screen flex flex-col" role="main">
      {/* Header */}
      <header
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-white gap-2"
        role="banner"
      >
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Workflow Generator</h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Generate AI verification workflows from policy documents
        </p>
      </header>

      {/* Main Content - Responsive 3 Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-auto lg:overflow-hidden">
        {/* Left Column - Prompts */}
        <section
          className="w-full lg:w-1/3 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50"
          aria-label="Prompt Editors"
        >
          {/* System Prompt Panel */}
          <div
            className={`
              ${expandedPrompt === 'system' ? 'flex-1' : expandedPrompt === 'meta' ? 'flex-shrink-0' : 'flex-1'}
              ${expandedPrompt !== 'meta' ? 'border-b border-gray-200' : ''}
              p-2 sm:p-3
              ${expandedPrompt === null ? 'min-h-[250px] lg:min-h-0' : ''}
              transition-all duration-200
            `}
          >
            <PromptEditor
              type="system"
              title="System Prompt"
              isExpanded={expandedPrompt === 'system'}
              isCollapsed={expandedPrompt === 'meta'}
              onExpand={() => handleExpandPrompt('system')}
              onCollapse={handleCollapsePrompt}
            />
          </div>

          {/* Meta Prompt Panel */}
          <div
            className={`
              ${expandedPrompt === 'meta' ? 'flex-1' : expandedPrompt === 'system' ? 'flex-shrink-0' : 'flex-1'}
              p-2 sm:p-3
              ${expandedPrompt === null ? 'min-h-[250px] lg:min-h-0' : ''}
              transition-all duration-200
            `}
          >
            <PromptEditor
              type="meta"
              title="Meta Prompt"
              isExpanded={expandedPrompt === 'meta'}
              isCollapsed={expandedPrompt === 'system'}
              onExpand={() => handleExpandPrompt('meta')}
              onCollapse={handleCollapsePrompt}
            />
          </div>
        </section>

        {/* Center Column - File Upload & Extracted Data */}
        <section
          className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 p-3 sm:p-4 flex flex-col gap-3"
          aria-label="Document Upload and Extracted Data"
        >
          {/* File Upload Area */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex-shrink-0">
            <FileUpload
              state={state}
              error={error}
              inputMode={inputMode}
              selectedFile={selectedFile}
              selectedUrl={selectedUrl}
              canGenerate={canGenerate}
              onInputModeChange={setInputMode}
              onFileSelect={selectFile}
              onUrlChange={selectUrl}
              onGenerate={uploadAndGenerate}
              onReset={reset}
            />
          </div>

          {/* Extracted Data Display */}
          <div className="flex-1 min-h-[200px] lg:min-h-0">
            <ExtractedData
              data={extractedData}
              isLoading={state === 'extracting'}
            />
          </div>
        </section>

        {/* Right Column - Workflow Output */}
        <section
          className="w-full lg:w-1/3 bg-gray-50 p-3 sm:p-4"
          aria-label="Generated Workflow"
        >
          <div className="min-h-[400px] lg:min-h-full">
            <WorkflowOutput state={state} workflow={workflow} error={error} />
          </div>
        </section>
      </div>
    </main>
  );
}
