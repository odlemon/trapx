import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { BaseError } from '../errors/BaseError';

export interface ErrorHandlerOptions {
  includeStackTrace?: boolean;
  logError?: (error: Error) => void;
  transformError?: (error: Error) => Partial<BaseError>;
}

export function createErrorHandler(options: ErrorHandlerOptions = {}): ErrorRequestHandler {
  const {
    includeStackTrace = process.env.NODE_ENV === 'development',
    logError = console.error,
    transformError,
  } = options;

  return (error: Error, req: Request, res: Response, _next: NextFunction): void => {
    logError(error);

    let processedError: Partial<BaseError>;
    if (error instanceof BaseError) {
      processedError = error;
    } else {
      processedError = transformError?.(error) || {
        message: 'Internal Server Error',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        isOperational: false,
      };
    }

    const response = {
      success: false,
      error: {
        message: processedError.message || 'Internal Server Error',
        code: processedError.code || 'INTERNAL_SERVER_ERROR',
        ...(processedError.details && { details: processedError.details }),
        ...(includeStackTrace && { stack: error.stack }),
      },
    };

    res.status(processedError.statusCode || 500).json(response);
  };
} 