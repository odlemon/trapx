import { BaseError } from './BaseError';
import { ErrorMetadata } from '../types/ErrorTypes';

export class ValidationError extends BaseError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super({
      message,
      statusCode: 400,
      metadata: { ...metadata, code: 'VALIDATION_ERROR' }
    });
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super({
      message,
      statusCode: 404,
      metadata: { ...metadata, code: 'NOT_FOUND' }
    });
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super({
      message,
      statusCode: 401,
      metadata: { ...metadata, code: 'UNAUTHORIZED' }
    });
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super({
      message,
      statusCode: 403,
      metadata: { ...metadata, code: 'FORBIDDEN' }
    });
  }
}

export class InternalServerError extends BaseError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super({
      message,
      statusCode: 500,
      metadata: { 
        ...metadata, 
        code: 'INTERNAL_SERVER_ERROR',
        isOperational: false 
      }
    });
  }
} 