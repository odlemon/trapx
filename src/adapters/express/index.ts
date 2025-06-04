import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { BaseError } from '../../core/errors';
import { ErrorHandlerOptions } from '../../core/types/AdapterTypes';
import { formatError } from './utils';

export function createExpressErrorHandler(options: ErrorHandlerOptions = {}): ErrorRequestHandler {
  const {
    includeStackTrace = process.env.NODE_ENV === 'development',
    logError = console.error,
    transformError,
  } = options;

  return (error: Error, _req: Request, res: Response, _next: NextFunction): void => {
    logError(error);

    const processedError = error instanceof BaseError 
      ? error 
      : transformError?.(error) || new BaseError({
          message: 'Internal Server Error',
          statusCode: 500,
          metadata: {
            code: 'INTERNAL_SERVER_ERROR',
            isOperational: false
          }
        });

    const response = formatError(processedError, includeStackTrace);
    res.status(processedError.statusCode || 500).json(response);
  };
} 