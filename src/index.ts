export { createErrorHandler } from './middleware/errorHandler';
export { BaseError } from './errors/BaseError';
export {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
} from './errors/CommonErrors';

export type { ErrorMetadata } from './errors/BaseError';
export type { ErrorHandlerOptions } from './middleware/errorHandler'; 