'use client';

import * as React from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Whether to wrap textarea in ScrollArea for consistent scrollbar styling */
  scrollable?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, scrollable = false, ...props }, ref) => {
    const textareaElement = (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2',
          'text-sm placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (!scrollable) {
      return textareaElement;
    }

    return (
      <ScrollArea.Root className="h-full w-full overflow-hidden">
        <ScrollArea.Viewport className="h-full w-full">
          {textareaElement}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors duration-150 ease-out hover:bg-gray-200 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="flex-1 bg-gray-400 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
      </ScrollArea.Root>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
