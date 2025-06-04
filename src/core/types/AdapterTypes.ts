import { BaseError } from '../errors';
import { ErrorResponse } from './ErrorTypes';

export interface ErrorHandlerOptions {
  includeStackTrace?: boolean;
  logError?: (error: Error) => void;
  transformError?: (error: Error) => Partial<BaseError>;
}

export interface ErrorHandler<TRequest, TResponse> {
  (error: Error, req: TRequest, res: TResponse): void | Promise<void>;
}

export interface ErrorResponseFormatter {
  (error: Error, includeStack: boolean): ErrorResponse;
} 