import { BaseError } from './BaseError';
import { ErrorMetadata } from '../types/ErrorTypes';

export class UnauthorizedError extends BaseError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super({
      message,
      statusCode: 401,
      metadata: { ...metadata, code: 'UNAUTHORIZED' }
    });
  }
} 