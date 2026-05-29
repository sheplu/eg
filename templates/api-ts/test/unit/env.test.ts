import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadEnv } from '../../src/config/env.js';

describe('loadEnv', () => {
  it('returns development defaults when env is empty', () => {
    const env = loadEnv({});

    assert.equal(env.environment, 'development');
    assert.equal(env.host, '0.0.0.0');
    assert.equal(env.port, 3000);
    assert.equal(env.logLevel, 'info');
    assert.equal(env.corsOrigin, true);
  });

  it('falls back to silent log level under NODE_ENV=test', () => {
    const env = loadEnv({ NODE_ENV: 'test' });

    assert.equal(env.environment, 'test');
    assert.equal(env.logLevel, 'silent');
  });

  it('honors explicit production values', () => {
    const env = loadEnv({
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: '8080',
      LOG_LEVEL: 'warn',
      CORS_ORIGIN: 'https://example.com',
    });

    assert.equal(env.environment, 'production');
    assert.equal(env.host, '127.0.0.1');
    assert.equal(env.port, 8080);
    assert.equal(env.logLevel, 'warn');
    assert.equal(env.corsOrigin, 'https://example.com');
  });

  it('treats CORS_ORIGIN of false, true, *, and empty as boolean toggles', () => {
    assert.equal(loadEnv({ CORS_ORIGIN: 'false' }).corsOrigin, false);
    assert.equal(loadEnv({ CORS_ORIGIN: 'true' }).corsOrigin, true);
    assert.equal(loadEnv({ CORS_ORIGIN: '*' }).corsOrigin, true);
    assert.equal(loadEnv({ CORS_ORIGIN: '' }).corsOrigin, true);
  });

  it('accepts an empty PORT and an empty NODE_ENV as defaults', () => {
    const env = loadEnv({ PORT: '', NODE_ENV: '' });

    assert.equal(env.port, 3000);
    assert.equal(env.environment, 'development');
  });

  it('rejects invalid NODE_ENV values', () => {
    assert.throws(() => loadEnv({ NODE_ENV: 'staging' }), /Invalid NODE_ENV/);
  });

  it('rejects out-of-range and non-integer PORT values', () => {
    assert.throws(() => loadEnv({ PORT: '0' }), /Invalid PORT/);
    assert.throws(() => loadEnv({ PORT: '70000' }), /Invalid PORT/);
    assert.throws(() => loadEnv({ PORT: 'abc' }), /Invalid PORT/);
    assert.throws(() => loadEnv({ PORT: '3.14' }), /Invalid PORT/);
  });
});
