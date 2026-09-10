import type { DatasetErrorCode } from './types.ts';

/** Greška podatkovnog sloja s kodom koji UI može prevesti u poruku. */
export class DatasetError extends Error {
  readonly code: DatasetErrorCode;

  constructor(code: DatasetErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'DatasetError';
    this.code = code;
  }
}
