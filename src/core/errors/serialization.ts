import { BaseError } from './BaseError';
import { ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError } from './CommonErrors';

type ErrorConstructor = new (...args: any[]) => BaseError;

const errorTypes: Record<string, ErrorConstructor> = {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  BaseError
};

export function serializeError(error: Error): Record<string, unknown> {
  if (error instanceof BaseError) {
    return error.toJSON();
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
    isOperational: false
  };
}

export function deserializeError(data: Record<string, unknown>): Error {
  const ErrorClass = errorTypes[data.name as string] || BaseError;
  
  if (ErrorClass === BaseError) {
    return new BaseError({
      message: data.message as string,
      statusCode: data.statusCode as number,
      metadata: {
        code: data.code as string,
        details: data.details as Record<string, unknown>,
        isOperational: data.isOperational as boolean
      }
    });
  }

  return new ErrorClass(data.message as string, {
    code: data.code as string,
    details: data.details as Record<string, unknown>,
    isOperational: data.isOperational as boolean
  });
}

export function reconstructErrorChain(serializedErrors: Record<string, unknown>[]): Error {
  if (!serializedErrors.length) {
    return new Error('Empty error chain');
  }

  const errors = serializedErrors.map(data => deserializeError(data));
  
  for (let i = 0; i < errors.length - 1; i++) {
    (errors[i] as BaseError).cause = errors[i + 1];
  }

  return errors[0];
} 