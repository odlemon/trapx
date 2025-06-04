export interface ErrorMetadata {
  code?: string;
  details?: Record<string, unknown>;
  isOperational?: boolean;
}

export class BaseError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    metadata: ErrorMetadata = {}
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = metadata.code || this.name;
    this.isOperational = metadata.isOperational ?? true;
    this.details = metadata.details || {};

    Error.captureStackTrace(this, this.constructor);
  }
} 