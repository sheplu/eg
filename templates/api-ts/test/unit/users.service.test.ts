import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { NotFoundError } from '../../src/errors/not-found-error.js';
import { UsersService } from '../../src/services/users.service.js';

describe('UsersService', () => {
  it('lists seeded users', () => {
    const service = new UsersService();

    assert.equal(service.list().length, 2);
    assert.equal(service.getById('usr_ada').email, 'ada@example.com');
  });

  it('throws a typed not found error for missing users', () => {
    const service = new UsersService([]);

    assert.throws(() => service.getById('missing'), NotFoundError);
  });

  it('creates users from typed input', () => {
    const service = new UsersService([]);
    const user = service.create(
      {
        email: 'new.user@example.com',
        name: 'New User',
      },
      new Date('2024-05-01T00:00:00.000Z'),
    );

    assert.deepEqual(user, {
      id: 'usr_new_user',
      email: 'new.user@example.com',
      name: 'New User',
      createdAt: '2024-05-01T00:00:00.000Z',
    });
  });
});
