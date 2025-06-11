import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { BaseError } from '../../core/errors';
import { ErrorHandlerOptions } from '../../core/types/AdapterTypes';
import { RequestContext } from '../../core/types/ErrorTypes';
import { formatError } from './utils';

function extractRequestContext(req: Request): RequestContext {
  const user = (req as any).user || {};
  return {
    path: req.path,
    method: req.method,
    query: req.query,
    params: req.params,
    headers: req.headers as Record<string, string>,
    userId: user.id,
    userRole: user.role,
    requestId: req.headers['x-request-id'] as string,
    timestamp: Date.now()
  };
}

export function createExpressErrorHandler(options: ErrorHandlerOptions = {}): ErrorRequestHandler {
  const {
    includeStackTrace = process.env.NODE_ENV === 'development',
    logError = console.error,
  } = options;

  return (error: Error, req: Request, res: Response, _next: NextFunction): void => {
    logError(error);

    let processedError: BaseError;
    if (error instanceof BaseError) {
      processedError = error;
    } else if (options.transformError) {
      processedError = options.transformError(error) as BaseError;
    } else {
      processedError = new BaseError({
        message: 'Internal Server Error',
        statusCode: 500,
        metadata: {
          code: 'INTERNAL_SERVER_ERROR',
          isOperational: false,
          requestContext: extractRequestContext(req)
        }
      });
    }

    if (!('requestContext' in processedError) || processedError.requestContext === undefined) {
      try {
        Object.defineProperty(processedError, 'requestContext', {
          value: extractRequestContext(req),
          writable: false,
          enumerable: true,
          configurable: false
        });
      } catch {}
    }

    const response = formatError(processedError, includeStackTrace);
    res.status(processedError.statusCode).json(response);
  };
} 