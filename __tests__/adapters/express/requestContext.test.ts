import { Request, Response } from 'express';
import { createExpressErrorHandler } from '../../../src/adapters/express';
import { BaseError } from '../../../src/core/errors';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    role: string;
  };
}

describe('Express Error Handler - Request Context', () => {
  let mockRequest: Partial<RequestWithUser>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });
    
    mockRequest = {
      path: '/api/test',
      method: 'POST',
      query: { param1: 'value1' },
      params: { id: '123' },
      headers: {
        'x-request-id': 'test-request-id',
        'content-type': 'application/json'
      }
    };

    mockResponse = {
      status: responseStatus,
      json: responseJson
    };
  });

  it('should include request context in error response', () => {
    const errorHandler = createExpressErrorHandler();
    const error = new Error('Test error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, () => {});

    expect(responseStatus).toHaveBeenCalledWith(500);
    expect(responseJson).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        message: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR'
      }),
      requestContext: expect.objectContaining({
        path: '/api/test',
        method: 'POST',
        requestId: 'test-request-id'
      })
    }));
  });

  it('should include request context in BaseError', () => {
    const errorHandler = createExpressErrorHandler();
    const error = new BaseError({
      message: 'Custom error',
      statusCode: 400,
      metadata: {
        code: 'CUSTOM_ERROR'
      }
    });

    errorHandler(error, mockRequest as Request, mockResponse as Response, () => {});

    expect(responseStatus).toHaveBeenCalledWith(400);
    expect(responseJson).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        message: 'Custom error',
        code: 'CUSTOM_ERROR'
      }),
      requestContext: expect.objectContaining({
        path: '/api/test',
        method: 'POST',
        requestId: 'test-request-id'
      })
    }));
  });

  it('should include user context when available', () => {
    const errorHandler = createExpressErrorHandler();
    const error = new Error('Test error');
    
    mockRequest = {
      ...mockRequest,
      user: {
        id: 'user-123',
        role: 'admin'
      }
    };

    errorHandler(error, mockRequest as RequestWithUser, mockResponse as Response, () => {});

    expect(responseJson).toHaveBeenCalledWith(expect.objectContaining({
      requestContext: expect.objectContaining({
        userId: 'user-123',
        userRole: 'admin'
      })
    }));
  });
}); 