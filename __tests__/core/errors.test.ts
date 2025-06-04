import { 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError, 
  ForbiddenError, 
  InternalServerError,
  BaseError
} from '../../src/core/errors';

describe('Core Errors', () => {
  describe('BaseError', () => {
    it('should create a base error with default values', () => {
      const error = new BaseError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBeDefined();
      expect(error.isOperational).toBe(true);
    });

    it('should create a base error with custom metadata', () => {
      const error = new BaseError('Test error', 400, {
        code: 'CUSTOM_ERROR',
        isOperational: false,
        details: { field: 'test' }
      });
      expect(error.code).toBe('CUSTOM_ERROR');
      expect(error.isOperational).toBe(false);
      expect(error.details).toEqual({ field: 'test' });
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error with correct defaults', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.isOperational).toBe(true);
    });

    it('should create a validation error with custom metadata', () => {
      const error = new ValidationError('Invalid input', {
        details: { field: 'email', message: 'Invalid email format' }
      });
      expect(error.details).toEqual({ field: 'email', message: 'Invalid email format' });
    });
  });

  describe('NotFoundError', () => {
    it('should create a not found error with correct defaults', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create an unauthorized error with correct defaults', () => {
      const error = new UnauthorizedError('Invalid credentials');
      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('ForbiddenError', () => {
    it('should create a forbidden error with correct defaults', () => {
      const error = new ForbiddenError('Access denied');
      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });
  });

  describe('InternalServerError', () => {
    it('should create an internal server error with correct defaults', () => {
      const error = new InternalServerError('Server error');
      expect(error.message).toBe('Server error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.isOperational).toBe(false);
    });
  });

  describe('Error inheritance', () => {
    it('should properly inherit from Error class', () => {
      const error = new ValidationError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should maintain stack trace', () => {
      const error = new ValidationError('Test error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('Error Chaining', () => {
    it('should properly chain errors with cause', () => {
      const rootError = new Error('Database connection failed');
      const dbError = new InternalServerError('Database error', {
        cause: rootError
      });
      const validationError = new ValidationError('Invalid user data', {
        cause: dbError
      });

      expect(validationError.cause).toBe(dbError);
      expect(dbError.cause).toBe(rootError);
    });

    it('should get root cause of error chain', () => {
      const rootError = new Error('Original error');
      const midError = new InternalServerError('System error', {
        cause: rootError
      });
      const topError = new ValidationError('Invalid input', {
        cause: midError
      });

      const rootCause = topError.getRootCause();
      expect(rootCause).toBe(rootError);
      expect(rootCause.message).toBe('Original error');
    });

    it('should get complete error chain', () => {
      const rootError = new Error('Root error');
      const midError = new InternalServerError('Mid error', {
        cause: rootError
      });
      const topError = new ValidationError('Top error', {
        cause: midError
      });

      const chain = topError.getErrorChain();
      expect(chain).toHaveLength(3);
      expect(chain[0]).toBe(topError);
      expect(chain[1]).toBe(midError);
      expect(chain[2]).toBe(rootError);
    });

    it('should handle circular error references', () => {
      const error1 = new ValidationError('Error 1');
      const error2 = new InternalServerError('Error 2', { cause: error1 });
      // Create circular reference
      (error1 as any).cause = error2;

      const chain = error2.getErrorChain();
      expect(chain.length).toBeLessThanOrEqual(10); // Should not exceed max depth
    });
  });

  describe('Stack Trace Handling', () => {
    it('should include cause in stack trace', () => {
      const rootError = new Error('Root cause');
      const topError = new ValidationError('Validation failed', {
        cause: rootError
      });

      expect(topError.stack).toContain('Root cause');
      expect(topError.stack).toContain('Caused by:');
    });

    it('should provide clean stack trace without node_modules', () => {
      const error = new ValidationError('Test error');
      const cleanStack = error.getCleanStack();

      expect(cleanStack).not.toContain('node_modules');
      expect(cleanStack).toContain('ValidationError');
    });

    it('should preserve original stack trace', () => {
      const error = new ValidationError('Test error');
      const originalStack = error.stack;
      error.cause = new Error('Cause');

      expect(error.stack).toContain(originalStack!.split('\n')[0]);
    });

    it('should handle missing stack traces gracefully', () => {
      const rootError = new Error('Root error');
      delete rootError.stack;

      const topError = new ValidationError('Top error', {
        cause: rootError
      });

      expect(() => topError.getCleanStack()).not.toThrow();
      expect(topError.stack).toContain('Root error');
    });
  });
}); 