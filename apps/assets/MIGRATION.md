# Migration to Cloudflare Workers Static Assets

## What Changed

Cloudflare has unified Workers and Pages into a single **Workers Static Assets** platform. Our implementation has been updated to use this new architecture.

## Old vs New Architecture

### Before (Incorrect)
```
❌ Used wrangler.jsonc (wrong format)
❌ Had main = "." (invalid)
❌ Used _headers and _redirects files (Pages-only features)
❌ No Worker script
❌ Relied on Pages behavior for routing
```

### After (Correct)
```
✅ Uses wrangler.toml (correct format)
✅ Has main = "src/index.ts" (Worker script)
✅ Worker handles all routing and headers
✅ Uses env.ASSETS binding to fetch static files
✅ Follows Workers Static Assets best practices
```

## Key Changes

### 1. Added Worker Script (`src/index.ts`)

The Worker script handles:
- **Route mappings**: `/scripts/widget.js` → `/widget.v1.js`
- **Aliases**: `/attribution.latest.js` → `/attribution.v1.js`
- **Cache headers**: Immutable for versioned, short cache for aliases
- **CORS**: Automatic CORS headers for all scripts

### 2. Updated Configuration (`wrangler.toml`)

```toml
# Before
main = "."                    # ❌ Invalid

# After
main = "src/index.ts"         # ✅ Points to Worker script

[assets]
directory = "./public"
binding = "ASSETS"            # ✅ Required for env.ASSETS.fetch()
```

### 3. Removed Obsolete Files

- ❌ Deleted `_headers` (now handled in Worker)
- ❌ Deleted `_redirects` (now handled in Worker)
- ❌ Removed `wrangler.jsonc` (renamed to `.toml`)

### 4. Added TypeScript Support

```json
{
  "types": ["@cloudflare/workers-types"]
}
```

## How It Works Now

### Request Flow

1. Request arrives: `https://assets.refref.ai/scripts/attribution.js`
2. Worker checks route map: Maps to `/attribution.v1.js`
3. Worker fetches from storage: `env.ASSETS.fetch(request)`
4. Worker adds headers:
   - `Cache-Control: public, max-age=3600`
   - `Access-Control-Allow-Origin: *`
5. Response sent to client

### Supported URLs

All these work automatically:

```
✅ /attribution.v1.js          (direct, immutable)
✅ /widget.v1.js                (direct, immutable)
✅ /attribution.latest.js       (alias to v1)
✅ /widget.latest.js            (alias to v1)
✅ /attribution.js              (alias to v1)
✅ /widget.js                   (alias to v1)
✅ /scripts/attribution.js      (backward compatibility)
✅ /scripts/widget.js           (backward compatibility)
```

## Benefits of New Architecture

1. **Unified Platform**: No more confusion between Workers and Pages
2. **Code-based Routing**: Explicit, testable routing logic
3. **Dynamic Control**: Can add logic, A/B testing, feature flags, etc.
4. **Better Performance**: Cloudflare's asset storage + Worker caching
5. **Type Safety**: Full TypeScript support with Workers types

## Deployment

No changes to deployment commands:

```bash
# Production
pnpm -F @refref/assets deploy:cloudflare

# Dev/Preview
pnpm -F @refref/assets deploy:cloudflare:dev
```

The Worker + assets are deployed together as a single unit.

## Testing Locally

```bash
# Start local dev server
pnpm -F @refref/assets preview

# Test routes
curl http://localhost:8787/attribution.v1.js
curl http://localhost:8787/scripts/widget.js
```

## Migration Checklist

- [x] Created Worker script (`src/index.ts`)
- [x] Updated `wrangler.toml` configuration
- [x] Removed `_headers` and `_redirects` files
- [x] Added `@cloudflare/workers-types` dependency
- [x] Updated TypeScript configuration
- [x] Updated README documentation
- [x] Tested build process
- [x] Ready for deployment

## References

- [Cloudflare Workers Static Assets Docs](https://developers.cloudflare.com/workers/static-assets/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Assets Binding](https://developers.cloudflare.com/workers/static-assets/binding/)
