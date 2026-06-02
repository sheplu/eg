export type AppEnv = {
  corsOrigin: string | boolean;
  environment: 'development' | 'test' | 'production';
  host: string;
  logLevel: string;
  port: number;
};

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return {
    corsOrigin: parseCorsOrigin(source.CORS_ORIGIN),
    environment: parseEnvironment(source.NODE_ENV),
    host: source.HOST ?? '0.0.0.0',
    logLevel: source.LOG_LEVEL ?? (source.NODE_ENV === 'test' ? 'silent' : 'info'),
    port: parsePort(source.PORT),
  };
}

function parseEnvironment(value: string | undefined): AppEnv['environment'] {
  if (value === undefined || value === '') {
    return 'development';
  }

  if (value === 'development' || value === 'test' || value === 'production') {
    return value;
  }

  throw new Error(`Invalid NODE_ENV: ${value}`);
}

function parsePort(value: string | undefined): number {
  if (value === undefined || value === '') {
    return 3000;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid PORT: ${value}`);
  }

  return port;
}

function parseCorsOrigin(value: string | undefined): string | boolean {
  if (value === undefined || value === '') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (value === '*') {
    return true;
  }

  if (value === 'true') {
    return true;
  }

  return value;
}
