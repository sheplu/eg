import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../../src/app.js';
import { startTestServer, type TestServer } from '../helpers/test-server.js';

describe('users routes', () => {
  let testServer: TestServer;

  before(async () => {
    testServer = await startTestServer(createApp());
  });

  after(async () => {
    await testServer.close();
  });

  it('lists users', async () => {
    const response = await fetch(`${testServer.baseUrl}/api/v1/users`);
    const body = (await response.json()) as unknown;

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(body));
    assert.equal(body.length, 2);
  });

  it('returns a user by id', async () => {
    const response = await fetch(`${testServer.baseUrl}/api/v1/users/usr_ada`);
    const body = (await response.json()) as { email: string; id: string };

    assert.equal(response.status, 200);
    assert.equal(body.id, 'usr_ada');
    assert.equal(body.email, 'ada@example.com');
  });

  it('rejects invalid user id params with AJV', async () => {
    const response = await fetch(`${testServer.baseUrl}/api/v1/users/!!!invalid!!!`);
    const body = (await response.json()) as { error: { code: string; details: unknown } };

    assert.equal(response.status, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(body.error.details));
  });

  it('returns 404 for unknown user ids', async () => {
    const response = await fetch(`${testServer.baseUrl}/api/v1/users/usr_missing`);
    const body = (await response.json()) as { error: { code: string; message: string } };

    assert.equal(response.status, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.match(body.error.message, /usr_missing/);
  });

  it('validates create user input with AJV', async () => {
    const response = await fetch(`${testServer.baseUrl}/api/v1/users`, {
      body: JSON.stringify({ email: 'not-an-email', name: '' }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });
    const body = (await response.json()) as { error: { code: string; details: unknown } };

    assert.equal(response.status, 400);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(body.error.details));
  });

  it('creates a user with valid input', async () => {
    const response = await fetch(`${testServer.baseUrl}/api/v1/users`, {
      body: JSON.stringify({ email: 'linus@example.com', name: 'Linus Torvalds' }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });
    const body = (await response.json()) as { email: string; id: string; name: string };

    assert.equal(response.status, 201);
    assert.equal(body.id, 'usr_linus');
    assert.equal(body.email, 'linus@example.com');
    assert.equal(body.name, 'Linus Torvalds');
  });
});
