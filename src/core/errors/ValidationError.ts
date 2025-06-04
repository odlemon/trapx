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