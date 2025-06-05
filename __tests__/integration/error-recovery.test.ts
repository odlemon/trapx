import { ValidationError, BaseError } from '../../src/core/errors';
import { deserializeError } from '../../src/core/errors/serialization';

describe('Error Recovery Integration', () => {
  it('should recover from malformed error data', () => {
    const malformed = {
      __type: 'ValidationError',
      name: 'ValidationError',
      message: null,
      statusCode: 'invalid',
      details: null
    };

    const error = deserializeError(malformed);
    expect(error.constructor.name).toBe('ValidationError');
    expect(error.message).toBe('');
  });

  it('should handle recursive error structures', () => {
    const recursive: any = {
      __type: 'ValidationError',
      name: 'ValidationError',
      message: 'Recursive error',
      details: {}
    };
    recursive.details.self = recursive;

    const error = deserializeError(recursive);
    expect(error.constructor.name).toBe('ValidationError');
    expect(() => JSON.stringify(error)).not.toThrow();
  });
}); 