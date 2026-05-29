import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { NextFunction, Request, Response } from 'express';
import { validate } from '../../src/middleware/validate.js';
import { RequestValidationError } from '../../src/errors/validation-error.js';

const querySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100 },
  },
  required: ['limit'],
  additionalProperties: false,
} as const;

function runMiddleware(req: Partial<Request>, schemas: Parameters<typeof validate>[0]): unknown {
  const handler = validate(schemas);
  let captured: unknown;
  const next: NextFunction = (error?: unknown) => {
    captured = error;
  };
  handler(req as Request, {} as Response, next);
  return captured;
}

describe('validate middleware', () => {
  it('passes when no schemas are configured', () => {
    const next = runMiddleware({ params: {}, query: {}, body: {} }, {});
    assert.equal(next, undefined);
  });

  it('coerces and accepts valid query parameters', () => {
    const req: Partial<Request> = { params: {}, query: { limit: '10' }, body: {} };
    const next = runMiddleware(req, { query: querySchema });
    assert.equal(next, undefined);
    assert.equal((req.query as unknown as { limit: number }).limit, 10);
  });

  it('rejects invalid query parameters with a RequestValidationError', () => {
    const next = runMiddleware(
      { params: {}, query: { limit: 'banana' }, body: {} },
      { query: querySchema },
    );
    assert.ok(next instanceof RequestValidationError);
  });
});
