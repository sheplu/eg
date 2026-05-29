import { HttpError } from './http-error.js';

export class RequestValidationError extends HttpError {
  constructor(details: unknown) {
    super(400, 'Request validation failed', 'VALIDATION_ERROR', details);
    this.name = 'RequestValidationError';
  }
}
