/**
 * RefRef Assets Worker
 * Serves static assets with custom headers and routing logic
 */

interface Env {
  ASSETS: Fetcher;
}

// Route mappings for aliases and backward compatibility
const ROUTE_MAP: Record<string, string> = {
  // Latest aliases
  "/attribution.latest.js": "/attribution.v1.js",
  "/widget.latest.js": "/widget.v1.js",

  // Convenience aliases without version
  "/attribution.js": "/attribution.v1.js",
  "/widget.js": "/widget.v1.js",

  // Backward compatibility with refer server paths
  "/scripts/attribution.js": "/attribution.v1.js",
  "/scripts/widget.js": "/widget.v1.js",
};

// Cache headers based on file pattern
function getCacheHeaders(pathname: string): Record<string, string> {
  // Versioned files: immutable, 1 year cache
  if (pathname.match(/\.(v\d+)\.js$/)) {
    return {
      "Cache-Control": "public, max-age=31536000, immutable",
    };
  }

  // Latest aliases: short cache
  if (pathname.includes(".latest.")) {
    return {
      "Cache-Control": "public, max-age=3600",
    };
  }

  // Default: no cache for other files
  return {
    "Cache-Control": "public, max-age=3600",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Check if this path needs to be rewritten
    const targetPath = ROUTE_MAP[pathname];
    if (targetPath) {
      // Rewrite the URL to the target path
      url.pathname = targetPath;
      request = new Request(url, request);
    }

    // Fetch the asset from Cloudflare's asset storage
    const response = await env.ASSETS.fetch(request);

    // Clone response to modify headers
    const newResponse = new Response(response.body, response);

    // Add custom headers based on file type
    const cacheHeaders = getCacheHeaders(url.pathname);
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });

    // Always set CORS headers for scripts
    if (url.pathname.endsWith(".js")) {
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      newResponse.headers.set(
        "Content-Type",
        "application/javascript; charset=utf-8",
      );
    }

    return newResponse;
  },
};
