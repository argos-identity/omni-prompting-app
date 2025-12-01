'use client';

import * as React from 'react';
import { FileSearch, CheckCircle2, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ExtractedPolicyData } from '@/types/workflow';

export interface ExtractedDataProps {
  data: ExtractedPolicyData | null;
  isLoading?: boolean;
}

export function ExtractedData({ data, isLoading }: ExtractedDataProps) {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-white rounded-lg border border-gray-200 p-4">
        <FileSearch className="h-8 w-8 animate-pulse mb-2" />
        <p className="text-sm font-medium">정책 데이터 추출 중...</p>
        <p className="text-xs text-gray-400 mt-1">문서를 분석하고 있습니다</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300 p-4">
        <FileSearch className="h-8 w-8 mb-2" />
        <p className="text-sm">추출된 데이터가 없습니다</p>
        <p className="text-xs mt-1">정책 문서를 업로드하면 데이터가 추출됩니다</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <h3 className="text-sm font-semibold text-gray-700">추출된 정책 데이터</h3>
        <span className="ml-auto text-xs text-gray-500">
          {data.sourceDocument}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-3 flex flex-col min-h-0">
        {/* Summary */}
        <section>
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            요약
          </h4>
          <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">
            {data.summary}
          </p>
        </section>

        {/* Validation Rules */}
        {data.validationRules.length > 0 && (
          <section>
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              검증 규칙 ({data.validationRules.length}개)
            </h4>
            <ul className="space-y-1">
              {data.validationRules.map((rule, index) => (
                <li
                  key={index}
                  className="text-xs text-gray-700 bg-blue-50 rounded px-2 py-1.5 flex items-start gap-2"
                >
                  <span className="text-blue-600 font-mono flex-shrink-0">
                    {index + 1}.
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Structured Content - flex-1로 남은 공간 모두 사용 */}
        <section className="flex-1 flex flex-col min-h-0">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 flex-shrink-0">
            상세 내용
          </h4>
          <pre className="flex-1 text-xs text-gray-600 bg-gray-50 rounded p-2 overflow-auto whitespace-pre-wrap font-mono">
            {data.content}
          </pre>
        </section>
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>추출: {new Date(data.extractedAt).toLocaleString()}</span>
        <span className="ml-auto">
          토큰: {data.tokenUsage.totalTokens.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
