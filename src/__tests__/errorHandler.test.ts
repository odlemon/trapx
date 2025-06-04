import { Request, Response } from 'express';
import { createErrorHandler } from '../middleware/errorHandler';
import { BaseError } from '../errors/BaseError';
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError
} from '../errors/CommonErrors';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  let mockLogger: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    mockLogger = jest.fn(); 
  });

  describe('Common Error Types', () => {
    it('should handle ValidationError (400) correctly', () => {
      const error = new ValidationError('Invalid input', { details: { field: 'email', reason: 'invalid format' } });
      const errorHandler = createErrorHandler({ includeStackTrace: false, logError: mockLogger });

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger).toHaveBeenCalledWith(error);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Invalid input',
          code: 'VALIDATION_ERROR',
          details: { field: 'email', reason: 'invalid format' }
        },
      });
    });

    it('should handle UnauthorizedError (401) correctly', () => {
      const error = new UnauthorizedError('Invalid token');
      const errorHandler = createErrorHandler({ includeStackTrace: false, logError: mockLogger });

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger).toHaveBeenCalledWith(error);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Invalid token',
          code: 'UNAUTHORIZED',
          details: {}
        },
      });
    });

    it('should handle ForbiddenError (403) correctly', () => {
      const error = new ForbiddenError('Insufficient permissions');
      const errorHandler = createErrorHandler({ includeStackTrace: false, logError: mockLogger });

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger).toHaveBeenCalledWith(error);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Insufficient permissions',
          code: 'FORBIDDEN',
          details: {}
        },
      });
    });

    it('should handle NotFoundError (404) correctly', () => {
      const error = new NotFoundError('Resource not found');
      const errorHandler = createErrorHandler({ includeStackTrace: false, logError: mockLogger });

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger).toHaveBeenCalledWith(error);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Resource not found',
          code: 'NOT_FOUND',
          details: {}
        },
      });
    });

    it('should handle InternalServerError (500) correctly', () => {
      const error = new InternalServerError('Database connection failed');
      const errorHandler = createErrorHandler({ includeStackTrace: false, logError: mockLogger });

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger).toHaveBeenCalledWith(error);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Database connection failed',
          code: 'INTERNAL_SERVER_ERROR',
          details: {}
        },
      });
    });
  });

  describe('Error Handler Options', () => {
    it('should handle unknown errors as internal server errors', () => {
      const error = new Error('Unknown error');
      const errorHandler = createErrorHandler({ includeStackTrace: false, logError: mockLogger });

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger).toHaveBeenCalledWith(error);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Internal Server Error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      });
    });

    it('should include stack trace when includeStackTrace is true', () => {
      const error = new Error('Test error');
      const errorHandler = createErrorHandler({ includeStackTrace: true, logError: mockLogger });

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger).toHaveBeenCalledWith(error);
      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.error.stack).toBeDefined();
    });

    it('should use custom error logger when provided', () => {
      const customLogger = jest.fn();
      const error = new Error('Test error');
      const errorHandler = createErrorHandler({ 
        includeStackTrace: false,
        logError: customLogger
      });

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(customLogger).toHaveBeenCalledWith(error);
    });

    it('should use custom error transformer when provided', () => {
      const customTransformer = (err: Error) => ({
        message: 'Custom error message',
        statusCode: 418,
        code: 'CUSTOM_ERROR',
        details: { original: err.message }
      });

      const error = new Error('Original error');
      const errorHandler = createErrorHandler({ 
        includeStackTrace: false,
        logError: mockLogger,
        transformError: customTransformer
      });

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger).toHaveBeenCalledWith(error);
      expect(mockResponse.status).toHaveBeenCalledWith(418);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Custom error message',
          code: 'CUSTOM_ERROR',
          details: { original: 'Original error' }
        },
      });
    });
  });

  describe('Custom Error Handling', () => {
    class CustomError extends BaseError {
      constructor(message: string) {
        super(message, 422, {
          code: 'CUSTOM_ERROR',
          details: { type: 'custom' },
          isOperational: true
        });
      }
    }

    it('should handle custom error types correctly', () => {
      const error = new CustomError('Custom error occurred');
      const errorHandler = createErrorHandler({ includeStackTrace: false, logError: mockLogger });

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockLogger).toHaveBeenCalledWith(error);
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Custom error occurred',
          code: 'CUSTOM_ERROR',
          details: { type: 'custom' }
        },
      });
    });
  });
}); 