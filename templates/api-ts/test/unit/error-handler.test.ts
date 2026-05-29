import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Request, Response } from 'express';
import { errorHandler } from '../../src/middleware/error-handler.js';
import { HttpError } from '../../src/errors/http-error.js';

type CapturedResponse = {
  status: number;
  body: unknown;
};

function fakeResponse(): { res: Response; captured: CapturedResponse } {
  const captured: CapturedResponse = { status: 0, body: undefined };
  const res = {
    status(code: number) {
      captured.status = code;
      return this;
    },
    json(body: unknown) {
      captured.body = body;
      return this;
    },
  } as unknown as Response;
  return { res, captured };
}

function fakeRequest(): Request {
  return { requestId: 'test-request-id' } as Request;
}

describe('errorHandler', () => {
  it('renders HttpError with its status, code, and details', () => {
    const { res, captured } = fakeResponse();
    const error = new HttpError(418, 'short and stout', 'TEAPOT', { hint: 'kettle' });

    errorHandler(error, fakeRequest(), res, () => undefined);

    assert.equal(captured.status, 418);
    assert.deepEqual(captured.body, {
      error: {
        code: 'TEAPOT',
        message: 'short and stout',
        details: { hint: 'kettle' },
        requestId: 'test-request-id',
      },
    });
  });

  it('omits details when an HttpError has none', () => {
    const { res, captured } = fakeResponse();
    const error = new HttpError(409, 'conflict', 'CONFLICT');

    errorHandler(error, fakeRequest(), res, () => undefined);

    assert.equal(captured.status, 409);
    assert.deepEqual(captured.body, {
      error: {
        code: 'CONFLICT',
        message: 'conflict',
        requestId: 'test-request-id',
      },
    });
  });

  it('renders a generic 500 for non-HttpError values', () => {
    const { res, captured } = fakeResponse();

    errorHandler(new Error('boom'), fakeRequest(), res, () => undefined);

    assert.equal(captured.status, 500);
    assert.deepEqual(captured.body, {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        requestId: 'test-request-id',
      },
    });
  });
});
