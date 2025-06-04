import { BaseError } from '../../core/errors';
import { ErrorResponse } from '../../core/types/ErrorTypes';

export function formatError(error: BaseError, includeStack: boolean): ErrorResponse {
  return {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      ...(error.details && { details: error.details }),
      ...(includeStack && { stack: error.stack })
    }
  };
} 