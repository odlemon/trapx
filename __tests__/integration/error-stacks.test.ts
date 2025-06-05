import { 
  ValidationError, 
  NotFoundError, 
  BaseError
} from '../../src/core/errors';
import { serializeError, deserializeError } from '../../src/core/errors/serialization';

describe('Error Stack Integration', () => {
  it('should preserve stack traces through serialization', () => {
    const originalError = new ValidationError('Test error');
    const serialized = serializeError(originalError);
    const deserialized = deserializeError(serialized);

    expect(deserialized.stack).toBeDefined();
    expect(deserialized.stack).toContain('ValidationError: Test error');
  });

  it('should maintain clean stack traces in error chains', () => {
    const rootError = new Error('Root error');
    const midError = new NotFoundError('Not found', { cause: rootError });
    const topError = new ValidationError('Invalid input', { cause: midError });

    const serialized = serializeError(topError);
    const deserialized = deserializeError(serialized) as BaseError;

    const cleanStack = deserialized.getCleanStack();
    expect(cleanStack).not.toContain('node_modules');
    expect(cleanStack).toContain('ValidationError: Invalid input');
  });

  it('should handle missing stack traces gracefully', () => {
    const error = new ValidationError('Test error');
    delete error.stack;

    const serialized = serializeError(error);
    const deserialized = deserializeError(serialized);
    expect(deserialized.stack).toBeDefined();
  });

  it('should handle malformed stack traces', () => {
    const error = new ValidationError('Test error');
    error.stack = 'Invalid\nStack\nTrace';

    const serialized = serializeError(error);
    const deserialized = deserializeError(serialized);
    expect(deserialized.stack).toBeDefined();
    expect(deserialized.stack).toContain('Invalid');
  });
}); 