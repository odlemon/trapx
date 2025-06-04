import { Request, Response } from 'express';
import { createErrorHandler } from '../middleware/errorHandler';
import { BaseError } from '../errors/BaseError';
import { ValidationError } from '../errors/CommonErrors';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should handle BaseError instances correctly', () => {
    const error = new ValidationError('Invalid input');
    const errorHandler = createErrorHandler({ includeStackTrace: false });

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Invalid input',
        code: 'VALIDATION_ERROR',
        details: {}
      },
    });
  });

  it('should handle unknown errors as internal server errors', () => {
    const error = new Error('Unknown error');
    const errorHandler = createErrorHandler({ includeStackTrace: false });

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  });

  it('should include stack trace in development mode', () => {
    const error = new Error('Test error');
    const errorHandler = createErrorHandler({ includeStackTrace: true });

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(response.error.stack).toBeDefined();
  });
}); 