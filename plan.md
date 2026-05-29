# Express Generator MVP Plan

## Goal

Rebuild `eg` from scratch as an Express 5-only API generator. The MVP generates a modern TypeScript API project with full typing, native Node.js test runner setup, AJV validation, and a small default API demonstrating real application patterns.

## MVP scope

### Generator

- Provide a CLI command for creating a new API project.
- Default to TypeScript only; no JavaScript template in the MVP.
- Target Express 5 only.
- Generate ESM projects targeting Node.js 20+.
- Refuse to overwrite non-empty directories unless `--force` is provided.
- Support `--skip-install` so users can opt out of dependency installation.
- Print clear next steps after generation.
- Keep template choices intentionally small for the first version.

### Generated API project

- Express 5 app factory separated from server startup.
- Strict TypeScript configuration.
- Native Node.js test runner for all tests.
- AJV request validation.
- JSON request parsing.
- Centralized routes, controllers, services, middleware, and errors.
- Consistent API error response shape.
- 404 middleware.
- Express 5 async error behavior.
- Request ID middleware.
- Structured logging with pino/pino-http.
- Security middleware with helmet.
- Configurable CORS middleware.
- Environment parsing and validation.
- Graceful shutdown in the server entrypoint.
- README with scripts, structure, endpoints, curl examples, validation guidance, and testing guidance.
- GitHub Actions CI running install, typecheck, lint, tests, and build.

### Default generated endpoints

- `GET /health` for basic health and uptime.
- `GET /api/v1/status` for API metadata.
- `GET /api/v1/users` for a sample collection resource.
- `GET /api/v1/users/:id` for route parameter validation.
- `POST /api/v1/users` for body validation and resource creation.

These endpoints should demonstrate controller/service separation, AJV validation for params and body, typed domain models, integration testing, and e2e testing.

### Tests

The generator repository should include tests using the native Node.js test runner:

- Unit tests for generator helpers/options.
- Integration tests that generate a project into a temporary directory and assert expected files/content.
- Smoke tests for the generated project when practical.

The generated project should include tests using the native Node.js test runner:

- Unit tests for services/helpers.
- Integration tests against the Express app without manually starting the production server.
- E2E tests against a real HTTP server.

### Tooling

- Use `oxlint` for linting.
- Use `tsc --noEmit` for typechecking.
- Use `tsx` for local TypeScript execution and test execution.
- Provide scripts for `dev`, `build`, `start`, `test`, `test:unit`, `test:integration`, `test:e2e`, `typecheck`, and `lint` where applicable.

## Suggested repository structure

```txt
.
├── package.json
├── plan.md
├── tsconfig.json
├── src/
│   ├── cli.ts
│   ├── index.ts
│   └── generator/
│       ├── generate.ts
│       ├── options.ts
│       └── template.ts
├── templates/
│   └── api-ts/
│       ├── README.md
│       ├── package.json.tpl
│       ├── tsconfig.json
│       ├── src/
│       └── test/
└── test/
    ├── unit/
    └── integration/
```

## Implementation phases

1. Bootstrap the generator package with TypeScript, `tsx`, native tests, `oxlint`, build scripts, and CLI metadata.
2. Implement CLI parsing, generator options, template copying, template variable replacement, overwrite protection, optional install, and next-step output.
3. Build the Express 5 TypeScript API template with routes, services, controllers, validation, middleware, errors, env config, logging, security, README, CI, and tests.
4. Add generator tests covering options, project creation, overwrite behavior, and generated content.
5. Verify with typecheck, lint, tests, build, and a generated-project smoke check.
6. Commit, push a focused task branch, and open a draft PR.

## Deferred post-MVP ideas

- OpenAPI generation/docs.
- Authentication template.
- Database adapters.
- Dockerfile and compose files.
- Package manager selection beyond npm.
- Interactive prompts.
- Additional route styles such as feature-folder templates.
