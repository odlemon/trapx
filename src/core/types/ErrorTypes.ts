export interface ErrorMetadata {
  code?: string;
  details?: Record<string, unknown>;
  isOperational?: boolean;
  cause?: Error;
  [key: string]: unknown;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
    stack?: string;
    cause?: {
      name: string;
      message: string;
      stack?: string;
    };
  };
}

export interface BaseErrorParams {
  message: string;
  statusCode: number;
  metadata?: ErrorMetadata;
}

export interface ErrorHandlerOptions {
  includeStackTrace?: boolean;
  logError?: (error: Error) => void;
  transformError?: (error: Error) => Partial<BaseErrorParams>;
} 