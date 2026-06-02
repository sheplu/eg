import type { Request, Response } from 'express';
import { loadEnv } from '../config/env.js';
import type { HealthResponse, StatusResponse } from '../types/api.js';

export function getHealth(_req: Request, res: Response<HealthResponse>): void {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
  });
}

export function getStatus(_req: Request, res: Response<StatusResponse>): void {
  const env = loadEnv();

  res.json({
    name: '__PROJECT_NAME_TS__',
    version: '0.1.0',
    environment: env.environment,
  });
}
