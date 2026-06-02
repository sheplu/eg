import cors, { type CorsOptions } from 'cors';
import express, { type Express, type Request } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { loadEnv } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { requestId } from './middleware/request-id.js';
import { createApiRouter } from './routes/index.js';

export function createApp(): Express {
  const env = loadEnv();
  const app = express();

  app.disable('x-powered-by');
  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({ requestId: (req as Request).requestId }),
    }),
  );
  app.use(helmet());
  app.use(cors(createCorsOptions(env.corsOrigin)));
  app.use(express.json({ limit: '1mb' }));

  app.use(createApiRouter());

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

function createCorsOptions(origin: string | boolean): CorsOptions {
  if (origin === false) {
    return { origin: false };
  }

  return { origin };
}
