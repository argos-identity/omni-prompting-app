'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  default: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'default', label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center gap-2', className)}
        role="status"
        aria-label={label || 'Loading'}
        {...props}
      >
        <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
        {label && <span className="text-sm text-gray-600">{label}</span>}
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner };
