import { BaseError } from './BaseError';
import { ErrorMetadata } from '../types/ErrorTypes';

export class ForbiddenError extends BaseError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super({
      message,
      statusCode: 403,
      metadata: { ...metadata, code: 'FORBIDDEN' }
    });
  }
} 