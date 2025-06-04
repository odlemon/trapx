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
}); 