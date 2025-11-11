# RefRef API

Fastify API server for RefRef platform.

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode with hot reload
pnpm dev

# Run tests
pnpm test              # Run tests once
pnpm test:watch        # Run tests in watch mode
pnpm test:ui           # Run tests with UI

# Type checking
pnpm typecheck

# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

```bash
PORT=3001           # Server port (default: 3001)
HOST=0.0.0.0       # Server host (default: 0.0.0.0)
LOG_LEVEL=info     # Logging level (default: info)
NODE_ENV=development
```

## Testing

The API uses Vitest and Playwright for integration testing. Tests start a real server instance and make HTTP requests to validate responses.

Test structure:

- `test/utils/testServer.ts` - Test server utilities for starting/stopping the server
- `test/health.test.ts` - Health endpoint tests

Each test suite:

1. Starts a test server on a random port
2. Creates a Playwright API request context
3. Runs tests against real endpoints
4. Cleans up resources after tests complete

## Endpoints

- `GET /` - Root health check endpoint
  - Returns: `{ok: true, service: "refref-api"}`
- `GET /health` - Health check endpoint
  - Returns: `{ok: true, service: "refref-api"}`
