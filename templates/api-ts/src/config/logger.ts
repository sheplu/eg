import pino from 'pino';
import { loadEnv } from './env.js';

const env = loadEnv();

export const logger = pino({
  level: env.logLevel,
});
