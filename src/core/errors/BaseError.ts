import { ErrorMetadata, BaseErrorParams } from '../types/ErrorTypes';

export class BaseError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: Record<string, unknown>;
  readonly isOperational: boolean;

  constructor(params: BaseErrorParams) {
    super(params.message);
    
    this.name = this.constructor.name;
    this.statusCode = params.statusCode;
    
    const metadata = params.metadata || {};
    this.code = metadata.code || 'INTERNAL_SERVER_ERROR';
    this.details = metadata.details || {};
    this.isOperational = metadata.isOperational ?? true;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
      isOperational: this.isOperational,
      stack: this.stack
    };
  }
} 