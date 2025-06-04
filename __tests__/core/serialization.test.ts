import { ValidationError, NotFoundError, InternalServerError } from '../../src/core/errors';
import { serializeError, deserializeError, reconstructErrorChain } from '../../src/core/errors/serialization';

describe('Error Serialization', () => {
  describe('serializeError', () => {
    it('should serialize BaseError instances', () => {
      const error = new ValidationError('Invalid data', {
        details: { field: 'email' }
      });

      const serialized = serializeError(error);
      expect(serialized).toEqual(expect.objectContaining({
        name: 'ValidationError',
        message: 'Invalid data',
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        details: { field: 'email' }
      }));
    });

    it('should serialize standard Error instances', () => {
      const error = new Error('Standard error');
      const serialized = serializeError(error);

      expect(serialized).toEqual(expect.objectContaining({
        name: 'Error',
        message: 'Standard error',
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        isOperational: false
      }));
    });
  });

  describe('deserializeError', () => {
    it('should deserialize into correct error instance', () => {
      const data = {
        name: 'ValidationError',
        message: 'Invalid input',
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        details: { field: 'email' }
      };

      const error = deserializeError(data);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid input');
    });

    it('should fallback to BaseError for unknown error types', () => {
      const data = {
        name: 'CustomError',
        message: 'Unknown error type',
        statusCode: 422,
        code: 'CUSTOM_ERROR'
      };

      const error = deserializeError(data);
      expect(error.message).toBe('Unknown error type');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('reconstructErrorChain', () => {
    it('should reconstruct error chain from serialized data', () => {
      const originalChain = [
        new ValidationError('Invalid input'),
        new NotFoundError('User not found'),
        new InternalServerError('Database error')
      ];

      const serializedChain = originalChain.map(error => serializeError(error));
      const reconstructed = reconstructErrorChain(serializedChain);

      expect(reconstructed).toBeInstanceOf(ValidationError);
      expect(reconstructed.message).toBe('Invalid input');
      expect((reconstructed as any).cause).toBeInstanceOf(NotFoundError);
      expect((reconstructed as any).cause.cause).toBeInstanceOf(InternalServerError);
    });

    it('should handle empty chain', () => {
      const error = reconstructErrorChain([]);
      expect(error.message).toBe('Empty error chain');
    });

    it('should preserve error properties in chain', () => {
      const originalError = new ValidationError('Invalid data', {
        details: { field: 'email' },
        isOperational: true
      });

      const serialized = serializeError(originalError);
      const reconstructed = reconstructErrorChain([serialized]);

      expect(reconstructed).toBeInstanceOf(ValidationError);
      expect((reconstructed as ValidationError).details).toEqual({ field: 'email' });
      expect((reconstructed as ValidationError).isOperational).toBe(true);
    });
  });
}); 