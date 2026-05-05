# GRX Product Store Backend

Production-ready NestJS boilerplate for the Loyalty Product Store backend.

## Tech Stack

- NestJS (TypeScript)
- PostgreSQL with TypeORM
- Swagger for API docs
- Winston-based centralized logging
- ESLint + Prettier
- Husky + lint-staged + commitlint

## Project Structure

```text
src/
  main.ts
  app.module.ts
  common/
    decorators/
    filters/
    guards/
    interceptors/
    logger/
    pipes/
    utils/
  config/
    configuration.ts
    env.validation.ts
  database/
    database.module.ts
  features/
    auth/
      auth.module.ts
      auth.controller.ts
      auth.service.ts
      dto/
      strategies/
    user/
      user.module.ts
      user.controller.ts
      user.service.ts
      dto/
      entities/
      interfaces/
  shared/
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Environment Setup

1. Copy env template:

```bash
cp .env.example .env
```

2. Update database credentials in `.env`:

```env
NODE_ENV=development
PORT=3000
APP_NAME=GRX Product Store Backend
APP_VERSION=1.0.0
APP_DESCRIPTION=Feature-based NestJS boilerplate

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=grx_productstore
DB_SSL=false
DB_SYNCHRONIZE=false
DB_LOGGING=false
```

## Installation

```bash
npm install
```

## Run the Application

```bash
# development
npm run start:dev

# production build
npm run build
npm run start:prod
```

Application base URL: `http://localhost:3000`

## API Documentation

Swagger is available at:

- `http://localhost:3000/api/docs`

## Code Quality

```bash
# lint
npm run lint

# lint with auto-fix
npm run lint:fix

# format code
npm run format

# check formatting
npm run format:check
```

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

## Git Hooks and Commit Convention

This project is configured with:

- Husky hooks
  - pre-commit: `lint-staged`
  - pre-push: `npm run build`
  - commit-msg: commitlint validation
- Commitlint conventional commit types:
  - `feat:`
  - `fix:`
  - `chore:`
  - `refactor:`
  - `docs:`

If hooks are not active yet, run:

```bash
npm run prepare
```

## API Behavior

- Global validation pipe enabled (`class-validator` + `class-transformer`)
- Global exception filter for standardized error responses
- Global response interceptor for consistent success payload format
- Request logging interceptor with centralized Winston logger

## Notes

- `DB_SYNCHRONIZE=true` is useful for local development only.
- Keep `DB_SYNCHRONIZE=false` in production and use migrations.
