import { 
  ValidationError, 
  NotFoundError, 
  InternalServerError,
  UnauthorizedError,
  BaseError
} from '../../src/core/errors';
import { serializeError, deserializeError, reconstructErrorChain } from '../../src/core/errors/serialization';

describe('Error Chain Integration', () => {
  it('should handle deep error chains with mixed error types', () => {
    const dbError = new Error('Connection timeout');
    const serverError = new InternalServerError('Database query failed', { cause: dbError });
    const notFoundError = new NotFoundError('User not found', { cause: serverError });
    const validationError = new ValidationError('Invalid request', { cause: notFoundError });

    const chain = validationError.getErrorChain();
    expect(chain).toHaveLength(4);
    expect(chain[0]).toBe(validationError);
    expect(chain[3]).toBe(dbError);

    const rootCause = validationError.getRootCause();
    expect(rootCause).toBe(dbError);
    expect(rootCause.message).toBe('Connection timeout');
  });

  it('should serialize and reconstruct complex error chains', () => {
    const originalChain = [
      new ValidationError('Invalid email', { 
        code: 'CUSTOM_VALIDATION_ERROR',
        details: { field: 'email', value: 'invalid' }
      }),
      new UnauthorizedError('Token expired', {
        details: { token: 'jwt', expiredAt: '2023-01-01' }
      }),
      new InternalServerError('Redis connection failed', {
        details: { host: 'localhost', port: 6379 }
      })
    ];

    for (let i = 0; i < originalChain.length - 1; i++) {
      (originalChain[i] as BaseError).cause = originalChain[i + 1];
    }

    const serializedChain = originalChain.map(error => serializeError(error));
    const reconstructed = reconstructErrorChain(serializedChain);

    expect(reconstructed.constructor.name).toBe('ValidationError');
    expect((reconstructed as ValidationError).details).toEqual({
      field: 'email',
      value: 'invalid'
    });
    expect((reconstructed as ValidationError).code).toBe('CUSTOM_VALIDATION_ERROR');

    const secondError = (reconstructed as BaseError).cause;
    expect(secondError.constructor.name).toBe('UnauthorizedError');
    expect((secondError as UnauthorizedError).details).toEqual({
      token: 'jwt',
      expiredAt: '2023-01-01'
    });
  });

  it('should handle extremely deep error chains', () => {
    const chain = Array.from({ length: 50 }, (_, i) => 
      new ValidationError(`Error ${i}`, { details: { index: i } })
    );

    for (let i = 0; i < chain.length - 1; i++) {
      chain[i].cause = chain[i + 1];
    }

    const serialized = serializeError(chain[0]);
    const deserialized = deserializeError(serialized) as BaseError;
    const reconstructedChain = deserialized.getErrorChain();

    expect(reconstructedChain.length).toBeLessThanOrEqual(10);
    expect(reconstructedChain[0].message).toBe('Error 0');
  });

  it('should handle mixed native and custom errors in chain', () => {
    const errors = [
      new TypeError('Invalid type'),
      new ValidationError('Validation failed'),
      new RangeError('Value out of range'),
      new NotFoundError('Resource missing'),
      new Error('Generic error')
    ];

    for (let i = 0; i < errors.length - 1; i++) {
      (errors[i] as any).cause = errors[i + 1];
    }

    const serialized = serializeError(errors[0]);
    const deserialized = deserializeError(serialized);
    expect(deserialized.constructor.name).toBe('Error');
    expect((deserialized as any).cause.constructor.name).toBe('ValidationError');
  });
}); 