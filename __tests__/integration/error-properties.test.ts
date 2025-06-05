import { ValidationError, BaseError } from '../../src/core/errors';
import { serializeError, deserializeError } from '../../src/core/errors/serialization';

type TestErrorDetails = {
  [key: string]: unknown;
  nullValue: null;
  undefinedValue: undefined;
  emptyString: string;
  zero: number;
  negativeNumber: number;
  maxNumber: number;
  minNumber: number;
  nan: number;
  infinity: number;
  negativeInfinity: number;
  arrayWithEmpty: (null | undefined | string | number)[];
  nestedObject: {
    a: {
      b: {
        c: null;
      };
    };
  };
  dateValue: Date;
  regexp: RegExp;
  fn: () => void;
  symbol: symbol;
}

describe('Error Properties Integration', () => {
  it('should maintain all custom properties through serialization cycle', () => {
    const originalError = new ValidationError('Invalid data', {
      code: 'CUSTOM_VALIDATION_ERROR',
      details: {
        field: 'email',
        constraints: ['required', 'email'],
        value: 'invalid@',
        metadata: {
          requestId: '123',
          timestamp: new Date().toISOString()
        }
      },
      isOperational: true
    });

    const serialized = serializeError(originalError);
    const deserialized = deserializeError(serialized) as ValidationError;

    expect(deserialized.code).toBe('CUSTOM_VALIDATION_ERROR');
    expect(deserialized.details).toEqual(originalError.details);
    expect(deserialized.isOperational).toBe(true);
    expect(deserialized.statusCode).toBe(400);
    expect(deserialized.constructor.name).toBe('ValidationError');
  });

  it('should handle edge case values in properties', () => {
    const originalError = new ValidationError('Test error', {
      details: {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zero: 0,
        negativeNumber: -1,
        maxNumber: Number.MAX_SAFE_INTEGER,
        minNumber: Number.MIN_SAFE_INTEGER,
        nan: NaN,
        infinity: Infinity,
        negativeInfinity: -Infinity,
        arrayWithEmpty: [null, undefined, '', 0],
        nestedObject: { a: { b: { c: null } } },
        dateValue: new Date(),
        regexp: /test/gi,
        fn: () => {},
        symbol: Symbol('test')
      } as unknown as TestErrorDetails
    });

    const serialized = serializeError(originalError);
    const deserialized = deserializeError(serialized) as ValidationError;
    const details = deserialized.details as unknown as TestErrorDetails;

    expect(details.nullValue).toBeNull();
    expect(details.undefinedValue).toBeUndefined();
    expect(details.emptyString).toBe('');
    expect(details.zero).toBe(0);
    expect(details.negativeNumber).toBe(-1);
    expect(details.maxNumber).toBe(Number.MAX_SAFE_INTEGER);
    expect(details.minNumber).toBe(Number.MIN_SAFE_INTEGER);
    expect(isNaN(details.nan)).toBe(true);
    expect(details.infinity).toBe(Infinity);
    expect(details.negativeInfinity).toBe(-Infinity);
    expect(Array.isArray(details.arrayWithEmpty)).toBe(true);
    expect(details.nestedObject.a.b.c).toBeNull();
    expect(deserialized.constructor.name).toBe('ValidationError');
  });

  it('should handle errors with binary data', () => {
    const buffer = Buffer.from('test data');
    const error = new ValidationError('Binary error', {
      details: { 
        buffer: buffer,
        view: new DataView(new ArrayBuffer(16)),
        typed: new Uint8Array([1, 2, 3])
      }
    });

    const serialized = serializeError(error);
    const deserialized = deserializeError(serialized);
    expect(deserialized.constructor.name).toBe('ValidationError');
  });
}); 