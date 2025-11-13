# RefRef Refer Server

Public-facing Fastify server for handling referral redirects and serving scripts.

## Overview

The refer server provides public endpoints for:
- **Referral Link Redirects** (`/r/:id`) - Redirects referral links to target URLs with attribution
- **Script Serving** (`/scripts/*`) - Serves attribution and widget scripts **for development only**

## Important: Script Serving for Production

⚠️ **The `/scripts/` endpoints in this server are for local development only.**

For production deployments:
- Scripts should be served from the dedicated **`apps/assets`** service
- Deploy assets to Cloudflare Workers/Pages for CDN delivery
- Use `https://assets.refref.ai` (or your custom domain) for production
- See [apps/assets/README.md](../assets/README.md) for deployment instructions

### Why Separate Script Serving?

**Development (Refer Server):**
- Dynamic script serving with hot-reloading
- No build step needed during development
- Convenient for local testing

**Production (Assets Service):**
- Static CDN delivery at edge locations
- Maximum performance with immutable caching
- Lower bandwidth costs
- Version management and cache control
- No server overhead for static files

## Development

### Prerequisites

```bash
# Build required packages first
pnpm -F @refref/attribution-script build
pnpm -F @refref/widget build
```

### Run Development Server

```bash
# Start refer server (port 3002)
pnpm -F @refref/refer dev

# Run tests
pnpm -F @refref/refer test

# Run tests in watch mode
pnpm -F @refref/refer test:watch
```

### Environment Variables

Create `.env` in the refer app directory:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/refref"

# Server Configuration
PORT=3002
HOST="0.0.0.0"
LOG_LEVEL="info"
NODE_ENV="development"
```

## API Endpoints

### Referral Link Redirect

```
GET /r/:slug
```

Redirects to the target URL associated with the referral link slug.

**Performance:**
- Optimized with database index on `referral_link.slug`
- Single JOIN query for fast lookups
- Minimal latency for redirect operations

**Response:**
- `302 Found` - Redirects to target URL
- `404 Not Found` - Invalid or expired referral link

### Script Endpoints (Development Only)

```
GET /scripts/attribution.js
GET /scripts/widget.js
```

Serves RefRef scripts for local development.

**Development Mode:**
- Reads latest bundle from disk for hot-reloading
- No cache headers for immediate updates
- File paths: `packages/*/dist/*.es.js`

**Test/Production Mode:**
- Serves statically imported bundles
- Long-lived cache headers (1 year immutable)

**⚠️ Production Warning:**
These endpoints should NOT be used in production. Deploy scripts via `apps/assets` instead for:
- CDN delivery at edge locations
- Immutable caching for better performance
- Lower bandwidth costs
- Version management

See [apps/assets/README.md](../assets/README.md) for production deployment instructions.

### Health Check

```
GET /health
```

Returns server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Architecture

### Key Features

- **Fastify Framework** - High-performance web framework
- **CORS Enabled** - Allows cross-origin requests
- **Rate Limiting** - Prevents abuse (20 requests/minute for scripts)
- **Graceful Shutdown** - Handles SIGINT/SIGTERM signals
- **Structured Logging** - JSON-formatted logs via Pino

### Directory Structure

```
apps/refer/
├── src/
│   ├── index.ts           # Server entry point
│   ├── routes/
│   │   ├── health.ts      # Health check endpoint
│   │   ├── redirect.ts    # Referral link redirects
│   │   └── scripts.ts     # Script serving (dev only)
│   └── plugins/           # Fastify plugins
├── tests/                 # Vitest tests
├── package.json
├── tsconfig.json
└── README.md
```

## Production Deployment

### Script Serving

**Do NOT deploy this server's script endpoints to production.**

Instead:
1. Use `apps/assets` for production script serving
2. Deploy assets to Cloudflare Workers/Pages
3. Update `NEXT_PUBLIC_ASSETS_URL` in webapp to assets CDN URL

See [apps/assets/README.md](../assets/README.md) for details.

### Referral Redirect Deployment

The `/r/:id` redirect endpoint can be deployed as:
- **Cloudflare Workers** - Global edge deployment
- **Vercel/Netlify** - Serverless functions
- **Traditional Server** - Docker container or VPS

Ensure database connection is configured properly for production.

## Testing

```bash
# Run all tests
pnpm -F @refref/refer test

# Watch mode
pnpm -F @refref/refer test:watch

# With UI
pnpm -F @refref/refer test:ui
```

Tests use:
- **Vitest** - Fast test runner
- **Playwright** - HTTP request testing
- In-memory database or mocks

## Performance Optimization

### Referral Redirect Optimization

The `/r/:slug` endpoint is highly optimized:

1. **Database Index** - `referral_link.slug` has an index for fast lookups
2. **Single Query** - Uses JOIN to fetch all data in one query
3. **Connection Pooling** - Efficient database connection management
4. **Minimal Processing** - Direct redirect without complex logic

### Script Serving Optimization (Development)

- Development: Reads from disk for latest changes
- Cache headers prevent browser caching during development

## Troubleshooting

### Scripts Not Loading in Development

1. Build the packages:
   ```bash
   pnpm -F @refref/attribution-script build
   pnpm -F @refref/widget build
   ```

2. Check file paths in `routes/scripts.ts`

3. Verify server is running on port 3002

### Referral Redirects Not Working

1. Check database connection
2. Verify referral link exists in database
3. Check server logs for errors
4. Ensure database index exists on `referral_link.slug`

### Port Already in Use

Change port in `.env`:
```bash
PORT=3003
```

## Related Documentation

- [apps/assets](../assets/README.md) - Production script serving
- [apps/api](../api/README.md) - Authenticated API endpoints
- [apps/webapp](../webapp/README.md) - Web application
- [packages/coredb](../../packages/coredb/README.md) - Database schema
