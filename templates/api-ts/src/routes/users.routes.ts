import { Router } from 'express';
import { UsersController } from '../controllers/users.controller.js';
import { createUserSchema, userParamsSchema } from '../schemas/users.schema.js';
import { validate } from '../middleware/validate.js';

export function createUsersRouter(controller = new UsersController()): Router {
  const router = Router();

  router.get('/users', controller.listUsers);
  router.get('/users/:id', validate({ params: userParamsSchema }), controller.getUser);
  router.post('/users', validate({ body: createUserSchema }), controller.createUser);

  return router;
}
