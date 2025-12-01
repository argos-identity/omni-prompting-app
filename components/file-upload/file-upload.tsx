'use client';

import * as React from 'react';
import { Upload, FileText, X, AlertCircle, Link2, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils/cn';
import { formatFileSize } from '@/lib/utils/file-validators';
import { FILE_CONSTRAINTS } from '@/types/api';
import type { InputSource } from '@/types/api';
import type { WorkflowGenerationState } from '@/types/workflow';

export interface FileUploadProps {
  state: WorkflowGenerationState;
  error: string | null;
  inputMode: InputSource;
  selectedFile: File | null;
  selectedUrl: string | null;
  canGenerate: boolean;
  onInputModeChange: (mode: InputSource) => void;
  onFileSelect: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  onGenerate: () => void;
  onReset: () => void;
}

export function FileUpload({
  state,
  error,
  inputMode,
  selectedFile,
  selectedUrl,
  canGenerate,
  onInputModeChange,
  onFileSelect,
  onUrlChange,
  onGenerate,
  onReset,
}: FileUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0] || null;
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearUrl = () => {
    onUrlChange('');
  };

  const isProcessing = state === 'uploading' || state === 'generating' || state === 'extracting';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Policy Document</h2>
        {((inputMode === 'file' && selectedFile) || (inputMode === 'url' && selectedUrl)) &&
          !isProcessing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={inputMode === 'file' ? handleRemoveFile : handleClearUrl}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
              inputMode === 'file'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => onInputModeChange('file')}
            disabled={isProcessing}
          >
            <FileUp className="h-4 w-4" />
            파일 업로드
          </button>
          <button
            type="button"
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
              inputMode === 'url'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => onInputModeChange('url')}
            disabled={isProcessing}
          >
            <Link2 className="h-4 w-4" />
            URL 입력
          </button>
        </div>

        {/* File Upload Zone */}
        {inputMode === 'file' && (
          <div
            className={cn(
              'flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors cursor-pointer min-h-[200px]',
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : selectedFile
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400',
              isProcessing && 'pointer-events-none opacity-60'
            )}
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.join(',')}
              onChange={handleFileChange}
              className="hidden"
              disabled={isProcessing}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <FileText className="h-10 w-10 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload className="h-10 w-10 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    파일을 드래그하거나 클릭하세요
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    지원 형식: {FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.join(', ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    최대 크기: {FILE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)}MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* URL Input Zone */}
        {inputMode === 'url' && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Link2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                placeholder="https://example.com/policy.pdf"
                value={selectedUrl || ''}
                onChange={(e) => onUrlChange(e.target.value)}
                disabled={isProcessing}
                className={cn(
                  'w-full pl-10 pr-4 py-3 border rounded-lg text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'disabled:bg-gray-100 disabled:cursor-not-allowed',
                  selectedUrl && !error
                    ? 'border-green-300 bg-green-50'
                    : error
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                )}
              />
            </div>
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 min-h-[150px]">
              <div className="text-center">
                <Link2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  PDF, HTML 페이지 URL을 입력하세요
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Claude가 URL에서 정책 내용을 추출합니다
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Status Display */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <LoadingSpinner size="sm" />
            <p className="text-sm text-blue-700">
              {state === 'uploading'
                ? '업로드 중...'
                : state === 'extracting'
                ? '정책 데이터 추출 중...'
                : '워크플로우 생성 중...'}
            </p>
          </div>
        )}

        {/* Generate Button */}
        <Button onClick={onGenerate} disabled={!canGenerate || isProcessing} className="w-full">
          {isProcessing ? '처리 중...' : '워크플로우 생성'}
        </Button>

        {/* Reset Button */}
        {(state === 'complete' || state === 'error') && (
          <Button variant="outline" onClick={onReset} className="w-full">
            처음부터 다시
          </Button>
        )}
      </div>
    </div>
  );
}
