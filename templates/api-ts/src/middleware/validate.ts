import { Ajv, type AnySchema, type ErrorObject } from 'ajv';
import addFormatsModule, { type FormatsPlugin } from 'ajv-formats';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { RequestValidationError } from '../errors/validation-error.js';

const addFormats = addFormatsModule as unknown as FormatsPlugin;

const ajv = addFormats(
  new Ajv({
    allErrors: true,
    coerceTypes: true,
    removeAdditional: 'failing',
  }),
);

export type ValidationSchemas = {
  body?: AnySchema;
  params?: AnySchema;
  query?: AnySchema;
};

export function validate(schemas: ValidationSchemas): RequestHandler {
  const validators = {
    body: schemas.body ? ajv.compile(schemas.body) : undefined,
    params: schemas.params ? ajv.compile(schemas.params) : undefined,
    query: schemas.query ? ajv.compile(schemas.query) : undefined,
  };

  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: ErrorObject[] = [];

    if (validators.params !== undefined && !validators.params(req.params)) {
      errors.push(...(validators.params.errors ?? []));
    }

    if (validators.query !== undefined && !validators.query(req.query)) {
      errors.push(...(validators.query.errors ?? []));
    }

    if (validators.body !== undefined && !validators.body(req.body)) {
      errors.push(...(validators.body.errors ?? []));
    }

    if (errors.length > 0) {
      next(new RequestValidationError(formatValidationErrors(errors)));
      return;
    }

    next();
  };
}

type FormattedValidationError = {
  instancePath: string;
  keyword: string;
  message?: string;
  params: Record<string, unknown>;
};

function formatValidationErrors(errors: readonly ErrorObject[]): FormattedValidationError[] {
  return errors.map((error) => {
    const formatted: FormattedValidationError = {
      instancePath: error.instancePath,
      keyword: error.keyword,
      params: error.params,
    };

    if (error.message !== undefined) {
      formatted.message = error.message;
    }

    return formatted;
  });
}
