'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>

        <p className="text-gray-600 mb-6">
          An unexpected error occurred. Please try again or contact support if the
          problem persists.
        </p>

        {error.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <Button onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
