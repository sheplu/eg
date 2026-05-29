import type { ErrorRequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { HttpError } from '../errors/http-error.js';
import { logger } from '../config/logger.js';
import type { ApiErrorResponse } from '../types/api.js';

export const errorHandler: ErrorRequestHandler<ParamsDictionary, ApiErrorResponse> = (error, req, res, _next) => {
  if (error instanceof HttpError) {
    const response: ApiErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
        requestId: req.requestId,
      },
    };

    if (error.details !== undefined) {
      response.error.details = error.details;
    }

    res.status(error.statusCode).json(response);
    return;
  }

  logger.error({ error, requestId: req.requestId }, 'Unhandled request error');

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      requestId: req.requestId,
    },
  });
};
