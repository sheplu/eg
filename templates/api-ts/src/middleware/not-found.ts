import type { Request, Response } from 'express';
import type { ApiErrorResponse } from '../types/api.js';

export function notFound(req: Request, res: Response<ApiErrorResponse>): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      requestId: req.requestId,
    },
  });
}
