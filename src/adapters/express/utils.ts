import { BaseError } from '../../core/errors';
import { ErrorResponse } from '../../core/types/ErrorTypes';

export function formatError(error: BaseError, includeStackTrace: boolean): ErrorResponse & { requestContext?: Record<string, unknown> } {
  const response: ErrorResponse & { requestContext?: Record<string, unknown> } = {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      details: error.details || {},
      ...(includeStackTrace && { stack: error.getCleanStack() })
    }
  };

  if (error.requestContext) {
    response.requestContext = {
      path: error.requestContext.path,
      method: error.requestContext.method,
      timestamp: error.requestContext.timestamp,
      requestId: error.requestContext.requestId
    };
  }

  return response;
} 