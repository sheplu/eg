import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../../src/app.js';
import { startTestServer, type TestServer } from '../helpers/test-server.js';

describe('api e2e', () => {
  let testServer: TestServer;

  before(async () => {
    testServer = await startTestServer(createApp());
  });

  after(async () => {
    await testServer.close();
  });

  it('serves health and status endpoints', async () => {
    const healthResponse = await fetch(`${testServer.baseUrl}/health`);
    const healthBody = (await healthResponse.json()) as { status: string; uptime: number };

    assert.equal(healthResponse.status, 200);
    assert.equal(healthBody.status, 'ok');
    assert.equal(typeof healthBody.uptime, 'number');

    const statusResponse = await fetch(`${testServer.baseUrl}/api/v1/status`);
    const statusBody = (await statusResponse.json()) as { environment: string; name: string; version: string };

    assert.equal(statusResponse.status, 200);
    assert.equal(statusBody.name, '__PROJECT_NAME_TS__');
    assert.equal(statusBody.version, '0.1.0');
  });

  it('returns request IDs for missing routes', async () => {
    const response = await fetch(`${testServer.baseUrl}/missing`, {
      headers: { 'x-request-id': 'test-request-id' },
    });
    const body = (await response.json()) as { error: { code: string; requestId: string } };

    assert.equal(response.status, 404);
    assert.equal(response.headers.get('x-request-id'), 'test-request-id');
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.equal(body.error.requestId, 'test-request-id');
  });
});
