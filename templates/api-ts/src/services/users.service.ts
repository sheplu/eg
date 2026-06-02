import { NotFoundError } from '../errors/not-found-error.js';
import type { CreateUserInput, User } from '../types/api.js';

const initialUsers: User[] = [
  {
    id: 'usr_ada',
    email: 'ada@example.com',
    name: 'Ada Lovelace',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_grace',
    email: 'grace@example.com',
    name: 'Grace Hopper',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

export class UsersService {
  readonly #users = new Map<string, User>();

  constructor(seedUsers: readonly User[] = initialUsers) {
    for (const user of seedUsers) {
      this.#users.set(user.id, user);
    }
  }

  list(): User[] {
    return [...this.#users.values()];
  }

  getById(id: string): User {
    const user = this.#users.get(id);
    if (user === undefined) {
      throw new NotFoundError(`User not found: ${id}`);
    }

    return user;
  }

  create(input: CreateUserInput, now = new Date()): User {
    const user: User = {
      id: createUserId(input.email),
      email: input.email,
      name: input.name,
      createdAt: now.toISOString(),
    };

    this.#users.set(user.id, user);
    return user;
  }
}

function createUserId(email: string): string {
  const localPart = email.split('@')[0] ?? 'user';
  const slug = localPart.toLowerCase().replaceAll(/[^a-z0-9]+/g, '_').replaceAll(/^_+|_+$/g, '');
  return `usr_${slug || 'user'}`;
}
