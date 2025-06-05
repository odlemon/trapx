import { BaseError } from './BaseError';
import { BaseErrorParams, ErrorMetadata } from '../types/ErrorTypes';

export class ValidationError extends BaseError {
  constructor(params: BaseErrorParams | string, metadata: ErrorMetadata = {}) {
    if (typeof params === 'string') {
      super({
        message: params,
        statusCode: 400,
        metadata: {
          ...metadata,
          code: metadata.code !== undefined ? metadata.code : 'VALIDATION_ERROR'
        }
      });
    } else {
      super({
        ...params,
        statusCode: params.statusCode || 400,
        metadata: {
          ...params.metadata,
          code: params.metadata?.code !== undefined ? params.metadata.code : 'VALIDATION_ERROR'
        }
      });
    }
  }

  static fromJSON(data: Record<string, unknown>): ValidationError {
    const error = Reflect.construct(this, [{
      message: String(data.message || ''),
      statusCode: Number(data.statusCode || 400),
      metadata: {
        code: data.code !== undefined ? String(data.code) : 'VALIDATION_ERROR',
        details: (data.details || {}) as Record<string, unknown>,
        isOperational: data.isOperational !== undefined ? Boolean(data.isOperational) : true
      }
    }], this) as ValidationError;
    Object.setPrototypeOf(error, this.prototype);
    return error;
  }

  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }
}

export class NotFoundError extends BaseError {
  constructor(params: BaseErrorParams | string, metadata: ErrorMetadata = {}) {
    if (typeof params === 'string') {
      super({
        message: params,
        statusCode: 404,
        metadata: {
          ...metadata,
          code: metadata.code || 'NOT_FOUND'
        }
      });
    } else {
      super({
        ...params,
        statusCode: params.statusCode || 404,
        metadata: {
          ...params.metadata,
          code: params.metadata?.code || 'NOT_FOUND'
        }
      });
    }
  }

  static fromJSON(data: Record<string, unknown>): NotFoundError {
    const error = Reflect.construct(this, [{
      message: String(data.message || ''),
      statusCode: Number(data.statusCode || 404),
      metadata: {
        code: data.code !== undefined ? String(data.code) : 'NOT_FOUND',
        details: (data.details || {}) as Record<string, unknown>,
        isOperational: data.isOperational !== undefined ? Boolean(data.isOperational) : true
      }
    }], this) as NotFoundError;
    Object.setPrototypeOf(error, this.prototype);
    return error;
  }

  static isNotFoundError(error: unknown): error is NotFoundError {
    return error instanceof NotFoundError;
  }
}

export class UnauthorizedError extends BaseError {
  constructor(params: BaseErrorParams | string, metadata: ErrorMetadata = {}) {
    if (typeof params === 'string') {
      super({
        message: params,
        statusCode: 401,
        metadata: {
          ...metadata,
          code: metadata.code || 'UNAUTHORIZED'
        }
      });
    } else {
      super({
        ...params,
        statusCode: params.statusCode || 401,
        metadata: {
          ...params.metadata,
          code: params.metadata?.code || 'UNAUTHORIZED'
        }
      });
    }
  }

  static fromJSON(data: Record<string, unknown>): UnauthorizedError {
    const error = Reflect.construct(this, [{
      message: String(data.message || ''),
      statusCode: Number(data.statusCode || 401),
      metadata: {
        code: data.code !== undefined ? String(data.code) : 'UNAUTHORIZED',
        details: (data.details || {}) as Record<string, unknown>,
        isOperational: data.isOperational !== undefined ? Boolean(data.isOperational) : true
      }
    }], this) as UnauthorizedError;
    Object.setPrototypeOf(error, this.prototype);
    return error;
  }

  static isUnauthorizedError(error: unknown): error is UnauthorizedError {
    return error instanceof UnauthorizedError;
  }
}

export class ForbiddenError extends BaseError {
  constructor(params: BaseErrorParams | string, metadata: ErrorMetadata = {}) {
    if (typeof params === 'string') {
      super({
        message: params,
        statusCode: 403,
        metadata: {
          ...metadata,
          code: metadata.code || 'FORBIDDEN'
        }
      });
    } else {
      super({
        ...params,
        statusCode: params.statusCode || 403,
        metadata: {
          ...params.metadata,
          code: params.metadata?.code || 'FORBIDDEN'
        }
      });
    }
  }

  static fromJSON(data: Record<string, unknown>): ForbiddenError {
    const error = Reflect.construct(this, [{
      message: String(data.message || ''),
      statusCode: Number(data.statusCode || 403),
      metadata: {
        code: data.code !== undefined ? String(data.code) : 'FORBIDDEN',
        details: (data.details || {}) as Record<string, unknown>,
        isOperational: data.isOperational !== undefined ? Boolean(data.isOperational) : true
      }
    }], this) as ForbiddenError;
    Object.setPrototypeOf(error, this.prototype);
    return error;
  }

  static isForbiddenError(error: unknown): error is ForbiddenError {
    return error instanceof ForbiddenError;
  }
}

export class InternalServerError extends BaseError {
  constructor(params: BaseErrorParams | string, metadata: ErrorMetadata = {}) {
    if (typeof params === 'string') {
      super({
        message: params,
        statusCode: 500,
        metadata: {
          ...metadata,
          code: metadata.code || 'INTERNAL_SERVER_ERROR',
          isOperational: metadata.isOperational ?? false
        }
      });
    } else {
      super({
        ...params,
        statusCode: params.statusCode || 500,
        metadata: {
          ...params.metadata,
          code: params.metadata?.code || 'INTERNAL_SERVER_ERROR',
          isOperational: params.metadata?.isOperational ?? false
        }
      });
    }
  }

  static fromJSON(data: Record<string, unknown>): InternalServerError {
    const error = Reflect.construct(this, [{
      message: String(data.message || ''),
      statusCode: Number(data.statusCode || 500),
      metadata: {
        code: data.code !== undefined ? String(data.code) : 'INTERNAL_SERVER_ERROR',
        details: (data.details || {}) as Record<string, unknown>,
        isOperational: data.isOperational !== undefined ? Boolean(data.isOperational) : false
      }
    }], this) as InternalServerError;
    Object.setPrototypeOf(error, this.prototype);
    return error;
  }

  static isInternalServerError(error: unknown): error is InternalServerError {
    return error instanceof InternalServerError;
  }
} 