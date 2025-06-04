import { BaseError } from './BaseError';
import { ErrorMetadata } from '../types/ErrorTypes';

export class NotFoundError extends BaseError {
  constructor(message: string, metadata: ErrorMetadata = {}) {
    super({
      message,
      statusCode: 404,
      metadata: { ...metadata, code: 'NOT_FOUND' }
    });
  }
} 