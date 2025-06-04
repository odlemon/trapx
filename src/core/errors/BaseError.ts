import { BaseErrorParams } from '../types/ErrorTypes';

export class BaseError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: Record<string, unknown>;
  readonly isOperational: boolean;
  readonly cause?: Error;
  private readonly originalStack?: string;

  constructor(params: BaseErrorParams) {
    super(params.message);
    
    this.name = this.constructor.name;
    this.statusCode = params.statusCode;
    
    const metadata = params.metadata || {};
    this.code = metadata.code || 'INTERNAL_SERVER_ERROR';
    this.details = metadata.details || {};
    this.isOperational = metadata.isOperational ?? true;
    this.cause = metadata.cause;

    Error.captureStackTrace(this, this.constructor);
    this.originalStack = this.stack;

    if (this.cause instanceof Error) {
      this.stack = this.buildStackTrace();
    }
  }

  private buildStackTrace(): string {
    const stackParts: string[] = [this.originalStack || ''];
    let currentCause = this.cause;
    let depth = 0;
    const maxDepth = 10; // Prevent infinite loops with circular references

    while (currentCause instanceof Error && depth < maxDepth) {
      stackParts.push(`\nCaused by: ${currentCause.stack || currentCause.message}`);
      currentCause = (currentCause as BaseError).cause;
      depth++;
    }

    if (depth === maxDepth) {
      stackParts.push('\nWarning: Maximum error chain depth reached');
    }

    return stackParts.join('');
  }

  /**
   * Get the root cause of the error chain
   */
  getRootCause(): Error {
    let current: Error = this;
    let depth = 0;
    const maxDepth = 10;

    while ((current as BaseError).cause instanceof Error && depth < maxDepth) {
      current = (current as BaseError).cause!;
      depth++;
    }

    return current;
  }

  getErrorChain(): Error[] {
    const chain: Error[] = [this];
    let current: Error = this;
    let depth = 0;
    const maxDepth = 10;
    
    while ((current as BaseError).cause instanceof Error && depth < maxDepth) {
      current = (current as BaseError).cause!;
      chain.push(current);
      depth++;
    }
    
    return chain;
  }

  /**
   * Get a cleaned stack trace without internal frames
   */
  getCleanStack(): string {
    const stack = this.stack || '';
    return stack
      .split('\n')
      .filter(line => !line.includes('node_modules'))
      .join('\n');
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
      isOperational: this.isOperational,
      stack: this.getCleanStack(),
      cause: this.cause instanceof Error ? {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack
      } : undefined
    };
  }
} 