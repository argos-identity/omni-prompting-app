/**
 * File validation utilities
 */

import { FILE_CONSTRAINTS, type SupportedMimeType } from '@/types/api';

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Get file extension from filename */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot).toLowerCase();
}

/** Check if file extension is allowed */
export function isAllowedExtension(filename: string): boolean {
  const ext = getFileExtension(filename);
  return (FILE_CONSTRAINTS.ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

/** Check if MIME type is supported */
export function isSupportedMimeType(mimeType: string): mimeType is SupportedMimeType {
  return (FILE_CONSTRAINTS.ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

/** Check if file size is within limit */
export function isFileSizeValid(size: number): boolean {
  return size > 0 && size <= FILE_CONSTRAINTS.MAX_SIZE;
}

/** Validate file for upload */
export function validateFile(file: File): ValidationResult {
  // Check file size
  if (!isFileSizeValid(file.size)) {
    if (file.size === 0) {
      return { valid: false, error: 'File is empty' };
    }
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${FILE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file extension
  if (!isAllowedExtension(file.name)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // Check MIME type (with fallback for text files)
  const mimeType = file.type || getMimeTypeFromExtension(file.name);
  if (!isSupportedMimeType(mimeType)) {
    return {
      valid: false,
      error: `Unsupported file type: ${mimeType}`,
    };
  }

  return { valid: true };
}

/** Get MIME type from file extension (fallback) */
export function getMimeTypeFromExtension(filename: string): SupportedMimeType | string {
  const ext = getFileExtension(filename);
  const mimeMap: Record<string, SupportedMimeType> = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

/** Format file size for display */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
