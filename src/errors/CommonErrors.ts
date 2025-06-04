import { BaseError, ErrorMetadata } from './BaseError';

export class ValidationError extends BaseError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super(message, 400, { ...metadata, code: 'VALIDATION_ERROR' });
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super(message, 404, { ...metadata, code: 'NOT_FOUND' });
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super(message, 401, { ...metadata, code: 'UNAUTHORIZED' });
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super(message, 403, { ...metadata, code: 'FORBIDDEN' });
  }
}

export class InternalServerError extends BaseError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super(message, 500, { 
      ...metadata, 
      code: 'INTERNAL_SERVER_ERROR',
      isOperational: false 
    });
  }
} 