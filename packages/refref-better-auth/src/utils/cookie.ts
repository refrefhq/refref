/**
 * Cookie utilities for extracting referral codes from HTTP requests
 */

/**
 * Parse cookie string into key-value pairs
 */
export function parseCookieString(
  cookieString: string,
): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!cookieString) {
    return cookies;
  }

  // Split by semicolon and process each cookie
  cookieString.split(";").forEach((cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name) {
      // Join value parts in case value contains '='
      const value = valueParts.join("=");
      cookies[name] = decodeURIComponent(value || "");
    }
  });

  return cookies;
}

/**
 * Extract referral code from request headers
 */
export function extractRefcodeFromRequest(
  request: Request | { headers?: Headers | Record<string, string> },
  cookieName: string = "refref_refcode",
): string | undefined {
  let cookieString: string | undefined;

  // Handle different request formats
  if ("headers" in request && request.headers) {
    if (request.headers instanceof Headers) {
      // Standard Headers object
      cookieString = request.headers.get("cookie") || undefined;
    } else if (typeof request.headers === "object") {
      // Plain object headers
      cookieString = request.headers["cookie"] || request.headers["Cookie"];
    }
  } else if (request instanceof Request) {
    // Native Request object
    cookieString = request.headers.get("cookie") || undefined;
  }

  if (!cookieString) {
    return undefined;
  }

  const cookies = parseCookieString(cookieString);
  const refcode = cookies[cookieName];

  // Validate refcode format (basic validation)
  if (refcode && refcode.length > 0) {
    return refcode;
  }

  return undefined;
}

/**
 * Extract referral code from Better Auth context
 * Better Auth provides the request in the hook context
 */
export function extractRefcodeFromContext(
  context: {
    request?: Request | { headers?: Headers | Record<string, string> };
  },
  cookieName: string = "refref_refcode",
): string | undefined {
  if (!context.request) {
    return undefined;
  }

  return extractRefcodeFromRequest(context.request, cookieName);
}
