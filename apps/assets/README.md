# RefRef Assets Service

Static assets service for serving RefRef scripts (attribution tracking and referral widget) via CDN.

## Overview

This app bundles and prepares RefRef scripts for deployment using **Cloudflare Workers Static Assets**. It combines a minimal Worker script with static file hosting to provide custom routing, headers, and caching for optimal performance.

### Architecture

- **Worker Script** (`src/index.ts`): Handles routing, redirects, and custom headers
- **Static Assets** (`public/`): Versioned JavaScript bundles served from Cloudflare's network
- **Assets Binding**: Worker fetches files from Cloudflare's asset storage via `env.ASSETS.fetch()`

This is Cloudflare's new unified approach that replaces the separate Pages and Workers platforms.

## Development and Production

✅ **This service now works for BOTH development and production.**

### Development (Local - Port 8787)
- Run `pnpm -F @refref/assets dev` to start local development server
- Scripts served at `http://localhost:8787/*`
- Automatic watch mode - rebuilds when packages change
- Wrangler dev provides production-like Worker environment
- Same routing and caching logic as production

### Production (Cloudflare Workers/Pages)
- Deploy to Cloudflare Workers/Pages for CDN delivery
- Scripts served from edge locations worldwide
- Immutable caching for maximum performance
- Version management and cache control
- Lower bandwidth costs and server overhead

**Key Benefit:** By separating static assets from your application server, you get:
- Faster load times (CDN edge caching)
- Reduced server load (no dynamic script serving)
- Better scalability (Cloudflare's global network)
- Cost efficiency (free tier for static assets)

## Scripts Available

- **attribution.v1.js** - Attribution tracking script
- **widget.v1.js** - Referral widget
- **attribution.latest.js** - Alias to latest attribution version
- **widget.latest.js** - Alias to latest widget version

## Development

### Local Development Server

Start the local development server with watch mode:

```bash
# From monorepo root - starts all services including assets
pnpm dev

# Or run assets server individually
pnpm -F @refref/assets dev
```

This will:
1. Watch attribution-script and widget dist files for changes
2. Auto-copy updated bundles to `public/` directory
3. Start Wrangler dev server on port 8787
4. Provide production-like Worker environment locally

Access scripts at:
- `http://localhost:8787/attribution.v1.js`
- `http://localhost:8787/widget.v1.js`
- `http://localhost:8787/attribution.js` (convenience alias)
- `http://localhost:8787/widget.js` (convenience alias)

### Build Assets Manually

```bash
# Build assets once (copies bundles to public/)
pnpm -F @refref/assets build

# Clean generated files
pnpm -F @refref/assets clean
```

### Build Output

The build script will:
1. Copy compiled bundles from packages to `public/`
2. Name them with version suffix (e.g., `attribution.v1.js`)
3. Generate checksums for verification
4. Display build statistics

## Deployment

### Quick Deploy with Wrangler CLI

Deploy directly from your local machine or CI/CD:

```bash
# Production deployment
pnpm -F @refref/assets deploy:cloudflare

# Dev/Preview deployment
pnpm -F @refref/assets deploy:cloudflare:dev

# Local preview with Wrangler
pnpm -F @refref/assets preview
```

**First-time setup:**
```bash
# Login to Cloudflare (one-time)
pnpm -F @refref/assets exec wrangler login

# Select your Cloudflare account when prompted
# Then deploy
pnpm -F @refref/assets deploy:cloudflare
```

**If you get auth errors:**
```bash
# Re-authenticate if token expires
pnpm -F @refref/assets exec wrangler logout
pnpm -F @refref/assets exec wrangler login
```

**Deployment Process:**

The deploy commands automatically:
1. Build the assets (runs `tsx scripts/build.ts`)
2. Copy bundles from packages to `public/` with versioning
3. Deploy `public/` directory to Cloudflare Workers
4. Production deploys to `refref-assets` worker
5. Dev deploys to `refref-assets-dev` worker

**After Deployment:**

Your scripts will be available at your workers.dev URL:
- Production: `https://refref-assets.<account-name>.workers.dev/attribution.v1.js`
- Dev: `https://refref-assets-dev.<account-name>.workers.dev/attribution.v1.js`

Example (replace with your account subdomain):
```
https://refref-assets.exa-fc4.workers.dev/attribution.v1.js
https://refref-assets.exa-fc4.workers.dev/widget.v1.js
```

Test your deployment:
```bash
# Check if scripts are accessible
curl -I https://refref-assets.<your-account>.workers.dev/attribution.v1.js
```

**Custom Domain Setup:**

After your first deployment:
1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker (`refref-assets`)
3. Go to Settings → Domains & Routes
4. Add custom domain: `assets.refref.ai`
5. Cloudflare will automatically provision SSL certificate

Then update your webapp environment:
```bash
# In apps/webapp/.env (or production environment)
NEXT_PUBLIC_ASSETS_URL="https://assets.refref.ai"
```

### Cloudflare Pages Setup (Alternative)

If you prefer using Cloudflare Pages dashboard instead of Wrangler:

1. **Connect Repository**
   - Go to Cloudflare Pages dashboard
   - Create new project from GitHub repo
   - Select `refref` repository

2. **Build Configuration**
   ```
   Build command:    pnpm -F @refref/assets build
   Build output dir: apps/assets/public
   Root directory:   (leave as repo root)
   ```

3. **Environment Variables**
   - None required (static files only)

4. **Custom Domain**
   - Add custom domain: `assets.refref.ai`
   - Configure DNS as instructed by Cloudflare

### CI/CD Deployment

Add to your GitHub Actions or CI/CD pipeline:

```yaml
# .github/workflows/deploy-assets.yml
name: Deploy Assets to Cloudflare

on:
  push:
    branches: [main]
    paths:
      - 'apps/assets/**'
      - 'packages/attribution-script/**'
      - 'packages/widget/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install

      - name: Build packages
        run: |
          pnpm -F @refref/attribution-script build
          pnpm -F @refref/widget build

      - name: Deploy to Cloudflare
        run: pnpm -F @refref/assets deploy:cloudflare
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

**Setup:**
1. Create a Cloudflare API Token with Workers Deploy permissions
2. Add as `CLOUDFLARE_API_TOKEN` in GitHub Secrets
3. Push changes to trigger deployment

### Configuration Files

**wrangler.toml** - Wrangler configuration for Workers Assets:
```toml
name = "refref-assets"
main = "src/index.ts"              # Worker script
compatibility_date = "2024-01-01"

[assets]
directory = "./public"              # Static assets directory
binding = "ASSETS"                  # Binding name for env.ASSETS

[env.dev]
name = "refref-assets-dev"         # Dev environment
```

**src/index.ts** - Worker script that handles:
- **Routing**: Redirects aliases (`/attribution.latest.js` → `/attribution.v1.js`)
- **Backward compatibility**: Maps `/scripts/*` to root files
- **Cache headers**: Immutable caching for versioned files
- **CORS**: Allows cross-origin requests for scripts

## Usage

### In Production

Use the CDN URLs in your production application:

```html
<!-- Versioned URL (recommended - immutable caching) -->
<script src="https://assets.refref.ai/attribution.v1.js"></script>
<script src="https://assets.refref.ai/widget.v1.js"></script>

<!-- Latest alias (always points to newest version) -->
<script src="https://assets.refref.ai/attribution.latest.js"></script>
<script src="https://assets.refref.ai/widget.latest.js"></script>

<!-- Convenience shortcuts (no version) -->
<script src="https://assets.refref.ai/attribution.js"></script>
<script src="https://assets.refref.ai/widget.js"></script>
```

**In Next.js (apps/webapp):**

```typescript
// Configured via NEXT_PUBLIC_ASSETS_URL environment variable
<Script
  src={`${env.NEXT_PUBLIC_ASSETS_URL}/attribution.v1.js`}
  strategy="beforeInteractive"
/>
```

### In Development

For local development, use the assets dev server:

```bash
# Assets server (wrangler dev) serves scripts at:
http://localhost:8787/attribution.v1.js
http://localhost:8787/widget.v1.js

# Or use convenience aliases:
http://localhost:8787/attribution.js
http://localhost:8787/widget.js

# Configure in apps/webapp/.env (already set as default):
NEXT_PUBLIC_ASSETS_URL="http://localhost:8787"
```

The assets dev server watches package dist files and auto-rebuilds when they change, providing the same routing and caching logic as production.

## Versioning Strategy

- **v1, v2, etc.** - Explicit versions with immutable caching
- **latest** - Always points to newest stable version
- **Bump version when:**
  - Breaking API changes
  - Significant behavior changes
  - Major feature additions

## How It Works

### Request Flow

1. **Request arrives** at Cloudflare Worker
2. **Worker checks** if path needs rewriting (e.g., `/scripts/widget.js` → `/widget.v1.js`)
3. **Worker fetches** asset from Cloudflare's asset storage via `env.ASSETS.fetch()`
4. **Worker adds** custom headers (cache control, CORS)
5. **Response sent** to client with optimized caching

### Supported Routes

| Request URL | Serves | Cache |
|-------------|--------|-------|
| `/attribution.v1.js` | Direct file | 1 year immutable |
| `/widget.v1.js` | Direct file | 1 year immutable |
| `/attribution.latest.js` | Redirects to v1 | 1 hour |
| `/widget.latest.js` | Redirects to v1 | 1 hour |
| `/attribution.js` | Redirects to v1 | 1 hour |
| `/widget.js` | Redirects to v1 | 1 hour |
| `/scripts/attribution.js` | Redirects to v1 | 1 hour |
| `/scripts/widget.js` | Redirects to v1 | 1 hour |

## File Structure

```
apps/assets/
├── public/              # Output directory (deployed to Cloudflare)
│   ├── attribution.v1.js   # Generated (gitignored)
│   └── widget.v1.js        # Generated (gitignored)
├── src/
│   └── index.ts         # Worker script (routing, headers)
├── scripts/
│   └── build.ts         # Build script (copies bundles)
├── wrangler.toml        # Wrangler configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### Build fails with "Source file not found"

Make sure to build the packages first:
```bash
pnpm -F @refref/attribution-script build
pnpm -F @refref/widget build
```

### Wrangler deployment fails

**Authentication Error (`Failed to fetch auth token` or `Body is unusable`):**

This happens when the Wrangler auth token expires or is invalid.

```bash
# Clear existing auth and re-login
pnpm -F @refref/assets exec wrangler logout
pnpm -F @refref/assets exec wrangler login

# Then retry deployment
pnpm -F @refref/assets deploy:cloudflare
```

The login will open your browser for OAuth authentication. Select your account when prompted.

**Build Errors:**
```bash
# Clean and rebuild
pnpm -F @refref/assets clean
pnpm -F @refref/attribution-script build
pnpm -F @refref/widget build
pnpm -F @refref/assets build
```

**Worker Already Exists:**
If deploying for the first time and the worker name is taken, update `wrangler.jsonc`:
```jsonc
{
  "name": "your-org-refref-assets"
}
```

### Scripts not loading in production

1. **Check Deployment Status**
   - Go to Cloudflare Dashboard → Workers & Pages
   - Verify deployment succeeded
   - Check deployment logs for errors

2. **Verify DNS Configuration**
   - Ensure custom domain is properly configured
   - Check DNS propagation (can take up to 24 hours)
   - Test with workers.dev URL first

3. **CORS Issues**
   - Check browser console for CORS errors
   - Verify `_headers` file is deployed
   - Test with curl: `curl -I https://assets.refref.ai/attribution.v1.js`

4. **Cache Issues**
   - Clear browser cache
   - Test in incognito mode
   - Check Cloudflare cache settings

### Local preview not working

```bash
# Ensure wrangler is installed
pnpm -F @refref/assets exec wrangler --version

# Try running directly
cd apps/assets
pnpm exec wrangler dev
```

## Maintenance

### Adding a New Script

1. Add configuration to `scripts/build.ts`:
   ```typescript
   {
     name: "new-script",
     version: "v1",
     sourcePath: join(ROOT_DIR, "packages", "new-script", "dist", "bundle.js"),
     outputName: "new-script.v1.js",
   }
   ```

2. Update `_headers` and `_redirects` files

3. Build and test

### Updating to v2

1. Update version in script config: `version: "v2"`
2. Update output name: `outputName: "attribution.v2.js"`
3. Update `_redirects` to point `latest` to new version
4. Keep v1 files for backwards compatibility
5. Deploy and test before updating application references

## Quick Reference

### Common Commands

```bash
# Build assets
pnpm -F @refref/assets build

# Deploy to production
pnpm -F @refref/assets deploy:cloudflare

# Deploy to dev/preview
pnpm -F @refref/assets deploy:cloudflare:dev

# Local preview
pnpm -F @refref/assets preview

# Clean generated files
pnpm -F @refref/assets clean

# Check wrangler version
pnpm -F @refref/assets exec wrangler --version

# View deployment logs
pnpm -F @refref/assets exec wrangler tail refref-assets
```

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_ASSETS_URL` | CDN URL in webapp | `https://assets.refref.ai` |
| `CLOUDFLARE_API_TOKEN` | CI/CD deployment | Set in GitHub Secrets |

### Deployment Checklist

- [ ] Build attribution and widget packages
- [ ] Build assets app
- [ ] Login to Wrangler (first time only)
- [ ] Deploy to Cloudflare Workers
- [ ] Verify deployment at workers.dev URL
- [ ] Configure custom domain (optional)
- [ ] Update `NEXT_PUBLIC_ASSETS_URL` in webapp
- [ ] Test scripts loading in production

## Related Documentation

- [apps/refer](../refer/README.md) - Referral redirect server
- [apps/webapp](../webapp/README.md) - Web application using these scripts
- [packages/attribution-script](../../packages/attribution-script/README.md) - Attribution tracking
- [packages/widget](../../packages/widget/README.md) - Referral widget
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
