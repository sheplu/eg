import type { JSONSchemaType } from 'ajv';
import type { CreateUserInput, UserParams } from '../types/api.js';

export const userParamsSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      minLength: 1,
      pattern: '^[a-zA-Z0-9_-]+$',
    },
  },
  required: ['id'],
  additionalProperties: false,
} satisfies JSONSchemaType<UserParams>;

export const createUserSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
  },
  required: ['email', 'name'],
  additionalProperties: false,
} satisfies JSONSchemaType<CreateUserInput>;
