import type { Request, Response } from 'express';
import { UsersService } from '../services/users.service.js';
import type { CreateUserInput, User, UserParams } from '../types/api.js';

export class UsersController {
  constructor(private readonly usersService = new UsersService()) {}

  listUsers = (_req: Request, res: Response<User[]>): void => {
    res.json(this.usersService.list());
  };

  getUser = (req: Request<UserParams>, res: Response<User>): void => {
    res.json(this.usersService.getById(req.params.id));
  };

  createUser = (req: Request<unknown, User, CreateUserInput>, res: Response<User>): void => {
    const user = this.usersService.create(req.body);
    res.status(201).json(user);
  };
}
