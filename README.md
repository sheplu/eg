# eg

Express 5 API generator.

`eg` creates a TypeScript-first Express 5 API with AJV validation, native Node.js tests, oxlint, strict TypeScript, structured logging, security middleware, and sample endpoints.

## Usage

```sh
npx eg my-api --skip-install
cd my-api
npm install
npm run dev
```

Options:

```txt
--force         Overwrite a non-empty target directory
--skip-install  Create files without running npm install
-h, --help      Show help
-v, --version   Show version
```

## Generated project

The generated API includes:

- Express 5, ESM, Node.js 20+
- TypeScript strict mode
- AJV + JSON Schema request validation
- Native Node.js test runner setup
- Unit, integration, and e2e example tests
- `oxlint` linter
- `helmet`, configurable CORS, request IDs
- `pino`/`pino-http` logging
- Centralized error handling and 404 responses
- GitHub Actions CI

Default endpoints:

```txt
GET  /health
GET  /api/v1/status
GET  /api/v1/users
GET  /api/v1/users/:id
POST /api/v1/users
```

## Development

```sh
npm install
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm run build
```

The MVP implementation scope is tracked in [plan.md](./plan.md).
