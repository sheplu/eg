{
  "name": "__PACKAGE_NAME__",
  "version": "0.1.0",
  "private": true,
  "description": "Express 5 TypeScript API",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/server.js",
    "test": "node --import tsx --test test/**/*.test.ts",
    "test:unit": "node --import tsx --test test/unit/**/*.test.ts",
    "test:integration": "node --import tsx --test test/integration/**/*.test.ts",
    "test:e2e": "node --import tsx --test test/e2e/**/*.test.ts",
    "test:coverage": "node --experimental-test-coverage --test-coverage-include=src/**/*.ts --test-coverage-exclude=src/server.ts --test-coverage-lines=95 --test-coverage-functions=95 --test-coverage-branches=95 --import tsx --test test/**/*.test.ts",
    "typecheck": "tsc --noEmit",
    "lint": "oxlint ."
  },
  "engines": {
    "node": ">=20.11.0"
  },
  "dependencies": {
    "ajv": "^8.20.0",
    "ajv-formats": "^3.0.1",
    "cors": "^2.8.6",
    "express": "^5.2.1",
    "helmet": "^8.2.0",
    "pino": "^10.3.1",
    "pino-http": "^11.0.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/express-serve-static-core": "^5.1.1",
    "@types/node": "^25.9.1",
    "oxlint": "^1.67.0",
    "tsx": "^4.22.3",
    "typescript": "^6.0.3"
  }
}
