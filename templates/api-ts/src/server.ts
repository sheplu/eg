import { createServer } from 'node:http';
import { loadEnv } from './config/env.js';
import { logger } from './config/logger.js';
import { createApp } from './app.js';

const env = loadEnv();
const app = createApp();
const server = createServer(app);

server.listen(env.port, env.host, () => {
  logger.info({ host: env.host, port: env.port }, 'HTTP server listening');
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info({ signal }, 'Shutting down HTTP server');
  server.close((error) => {
    if (error) {
      logger.error({ error }, 'Error while shutting down HTTP server');
      process.exitCode = 1;
    }

    process.exit();
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
