import { Router } from 'express';
import { getHealth, getStatus } from '../controllers/status.controller.js';

export function createStatusRouter(): Router {
  const router = Router();

  router.get('/health', getHealth);
  router.get('/api/v1/status', getStatus);

  return router;
}
