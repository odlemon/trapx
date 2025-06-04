import { BaseError } from './BaseError';
import { ErrorMetadata } from '../types/ErrorTypes';

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