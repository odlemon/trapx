import { BaseError } from './BaseError';
import { ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, InternalServerError } from './CommonErrors';

const errorConstructors = {
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
    __type: 'Error',
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
    isOperational: false,
    details: {}
  };
}

function createErrorInstance(data: Record<string, unknown>): Error {
  const errorType = (data.__type || data.name) as string;
  const ErrorClass = errorConstructors[errorType as keyof typeof errorConstructors];

  const code = typeof data.code === 'string' ? data.code : undefined;
  const details = (data.details || {}) as Record<string, unknown>;
  const isOperational = data.isOperational !== undefined ? Boolean(data.isOperational) : true;
  const statusCode = Number(data.statusCode || 500);
  const message = String(data.message || '');

  if (ErrorClass && ErrorClass.prototype instanceof BaseError) {
    return ErrorClass.fromJSON({
      ...data,
      code,
      details,
      isOperational,
      statusCode,
      message
    });
  }

  if (code && code !== 'UNKNOWN_ERROR') {
    const params = {
      message,
      statusCode,
      metadata: { code, details, isOperational }
    };
    const error = Reflect.construct(BaseError, [params], BaseError) as BaseError;
    if (data.stack) error.stack = String(data.stack);
    return error;
  }

  const error = new Error(message);
  error.name = String(data.name || 'Error');
  if (data.stack) {
    error.stack = String(data.stack);
  }
  return error;
}

export function deserializeError(data: Record<string, unknown>): Error {
  const error = createErrorInstance(data);

  if (data.cause && typeof data.cause === 'object') {
    const cause = deserializeError(data.cause as Record<string, unknown>);
    Object.defineProperty(error, 'cause', {
      value: cause,
      writable: false,
      enumerable: true,
      configurable: false
    });

    if (error instanceof BaseError && cause.stack) {
      error.stack = `${error.stack}\nCaused by: ${cause.stack}`;
    }
  }

  return error;
}

export function reconstructErrorChain(serializedErrors: Record<string, unknown>[]): Error {
  if (!serializedErrors.length) {
    return new Error('Empty error chain');
  }

  const maxDepth = 10;
  const errors = serializedErrors
    .slice(0, maxDepth)
    .map(data => createErrorInstance(data));
  
  for (let i = 0; i < errors.length - 1; i++) {
    if (errors[i] instanceof BaseError) {
      Object.defineProperty(errors[i], 'cause', {
        value: errors[i + 1],
        writable: false,
        enumerable: true,
        configurable: false
      });

      if (errors[i].stack && errors[i + 1].stack) {
        errors[i].stack = `${errors[i].stack}\nCaused by: ${errors[i + 1].stack}`;
      }
    }
  }

  return errors[0];
}