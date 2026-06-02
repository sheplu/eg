import { Router } from 'express';
import { createStatusRouter } from './status.routes.js';
import { createUsersRouter } from './users.routes.js';

export function createApiRouter(): Router {
  const router = Router();

  router.use(createStatusRouter());
  router.use('/api/v1', createUsersRouter());

  return router;
}
