import { BaseErrorParams } from '../types/ErrorTypes';

export class BaseError extends Error {
  readonly statusCode!: number;
  readonly code!: string;
  readonly details!: Record<string, unknown>;
  readonly isOperational!: boolean;
  cause?: Error;
  private readonly originalStack?: string;

  constructor(params: BaseErrorParams) {
    super(params.message || '');
    
    Object.setPrototypeOf(this, new.target.prototype);
    
    this.name = this.constructor.name;
    
    Object.defineProperties(this, {
      statusCode: {
        value: params.statusCode,
        writable: false,
        enumerable: true,
        configurable: false
      },
      code: {
        value: params.metadata?.code || this.constructor.name.toUpperCase(),
        writable: false,
        enumerable: true,
        configurable: false
      },
      details: {
        value: params.metadata?.details || {},
        writable: false,
        enumerable: true,
        configurable: false
      },
      isOperational: {
        value: params.metadata?.isOperational ?? true,
        writable: false,
        enumerable: true,
        configurable: false
      }
    });

    if (params.metadata?.cause) {
      Object.defineProperty(this, 'cause', {
        value: params.metadata.cause,
        writable: false,
        enumerable: true,
        configurable: false
      });
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.originalStack = this.stack;

    if (this.cause instanceof Error) {
      this.updateStackTrace();
    }
  }

  private updateStackTrace() {
    if (!this.cause) return;

    const causeStack = this.cause.stack || this.cause.message;
    if (!causeStack) return;

    this.stack = this.stack ? 
      `${this.stack}\nCaused by: ${causeStack}` :
      `${this.name}: ${this.message}\nCaused by: ${causeStack}`;
  }

  getRootCause(): Error {
    let current: Error = this;
    while ((current as any).cause instanceof Error) {
      current = (current as any).cause;
    }
    return current;
  }

  getErrorChain(): Error[] {
    const chain: Error[] = [this];
    let current: Error = this;
    
    const maxDepth = 10;
    while ((current as any).cause instanceof Error && chain.length < maxDepth) {
      current = (current as any).cause;
      chain.push(current);
    }
    
    return chain;
  }

  getCleanStack(): string {
    if (!this.stack) {
      return `${this.name}: ${this.message}`;
    }
    return this.stack
      .split('\n')
      .filter(line => !line.includes('node_modules'))
      .join('\n');
  }

  toJSON(): Record<string, unknown> {
    return {
      __type: this.constructor.name,
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
      isOperational: this.isOperational,
      stack: this.getCleanStack(),
      cause: this.cause instanceof Error ? {
        __type: this.cause.constructor.name,
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack
      } : undefined
    };
  }

  static isBaseError(error: unknown): error is BaseError {
    return error instanceof Error &&
           error instanceof BaseError &&
           'statusCode' in error &&
           'code' in error &&
           'details' in error &&
           'isOperational' in error;
  }

  static fromJSON(data: Record<string, unknown>): BaseError {
    const params: BaseErrorParams = {
      message: String(data.message || ''),
      statusCode: Number(data.statusCode || 500),
      metadata: {
        code: String(data.code || ''),
        details: (data.details || {}) as Record<string, unknown>,
        isOperational: data.isOperational !== undefined ? Boolean(data.isOperational) : true
      }
    };

    const error = Reflect.construct(this, [params], this) as BaseError;

    if (data.stack) {
      error.stack = String(data.stack);
    }

    return error;
  }
} 