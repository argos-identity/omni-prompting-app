/**
 * Clipboard utilities with fallback support
 */

/** Copy result */
export interface CopyResult {
  success: boolean;
  error?: string;
}

/**
 * Copy text to clipboard using modern Clipboard API with fallback
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  // Try modern Clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (err) {
      // Fall through to fallback
      console.warn('Clipboard API failed, trying fallback:', err);
    }
  }

  // Fallback for older browsers or non-secure contexts
  try {
    const result = fallbackCopyToClipboard(text);
    return result;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to copy to clipboard',
    };
  }
}

/**
 * Fallback copy using execCommand (deprecated but widely supported)
 */
function fallbackCopyToClipboard(text: string): CopyResult {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.cssText = 'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;boxShadow:none;background:transparent';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      return { success: true };
    }
    return { success: false, error: 'execCommand copy failed' };
  } catch (err) {
    document.body.removeChild(textArea);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Fallback copy failed',
    };
  }
}
