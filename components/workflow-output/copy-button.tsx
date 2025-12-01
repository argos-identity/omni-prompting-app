'use client';

import * as React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/utils/clipboard';

export interface CopyButtonProps {
  content: string;
  onCopy?: () => void;
}

export function CopyButton({ content, onCopy }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const result = await copyToClipboard(content);

    if (result.success) {
      setCopied(true);
      onCopy?.();

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-1.5"
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>Copy</span>
        </>
      )}
    </Button>
  );
}
