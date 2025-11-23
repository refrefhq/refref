# @refref/better-auth

Better Auth integration for RefRef referral tracking. Automatically tracks user signups with referral attribution by extracting referral codes from cookies and calling the RefRef API.

## Installation

```bash
npm install @refref/better-auth
# or
pnpm add @refref/better-auth
# or
yarn add @refref/better-auth
```

## Quick Start

### 1. Set up Better Auth with RefRef plugin

```typescript
import { betterAuth } from "better-auth";
import { refrefAnalytics } from "@refref/better-auth";

export const auth = betterAuth({
  // ... your Better Auth config
  plugins: [
    refrefAnalytics({
      apiKey: process.env.REFREF_API_KEY!,
      productId: process.env.REFREF_PRODUCT_ID!,
      apiUrl: process.env.REFREF_API_URL, // optional, defaults to production
    }),
  ],
});
```

### 2. Set the referral cookie

When a user visits your site with a referral code (e.g., `?ref=ABC123`), set the cookie:

```typescript
// In your app's entry point or landing page
const urlParams = new URLSearchParams(window.location.search);
const refcode = urlParams.get("ref");

if (refcode) {
  document.cookie = `refref_refcode=${refcode}; path=/; max-age=${30 * 24 * 60 * 60}`; // 30 days
}
```

### 3. That's it!

When a new user signs up through Better Auth, the plugin will:

1. Extract the referral code from the cookie
2. Call the RefRef API to track the signup with attribution
3. Log the result for debugging

## Configuration Options

```typescript
interface RefRefPluginOptions {
  // Required
  apiKey: string; // Your RefRef API key
  productId: string; // Your RefRef product ID

  // Optional
  apiUrl?: string; // API endpoint (default: "https://api.refref.app")
  programId?: string; // Specific program ID (uses default if not provided)
  cookieName?: string; // Cookie name (default: "refref_refcode")

  // Advanced
  disableSignupTracking?: boolean; // Disable automatic tracking
  customSignupTrack?: (data: SignupTrackingData) => Promise<void>; // Custom logic
}
```

## How It Works

The plugin uses Better Auth's `user.create.after` hook to:

1. **Detect new signups**: Triggered automatically when a user is created
2. **Extract referral code**: Reads from the specified cookie
3. **Call RefRef API**: Sends signup event with user data and referral attribution
4. **Handle errors gracefully**: Logs errors without disrupting the auth flow

## API Reference

### Main Export

#### `refrefAnalytics(options: RefRefPluginOptions)`

Creates the Better Auth plugin instance.

### Utility Exports

#### `RefRefAPIClient`

Direct access to the API client for manual tracking:

```typescript
import { RefRefAPIClient } from "@refref/better-auth";

const client = new RefRefAPIClient(apiKey, apiUrl);
await client.trackSignup(payload);
await client.trackPurchase(payload);
```

#### `extractRefcodeFromRequest(request, cookieName?)`

Extract referral code from a request object:

```typescript
import { extractRefcodeFromRequest } from "@refref/better-auth";

const refcode = extractRefcodeFromRequest(request, "refref_refcode");
```

## Advanced Usage

### Custom Signup Tracking

Override the default tracking behavior:

```typescript
refrefAnalytics({
  apiKey: process.env.REFREF_API_KEY!,
  productId: process.env.REFREF_PRODUCT_ID!,
  customSignupTrack: async (data) => {
    // Add custom logic
    console.log("Custom tracking:", data);

    // Call your own API
    await fetch("/api/custom-track", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
});
```

### Manual Tracking

Access the API client directly from the auth instance:

```typescript
// After initializing auth with the plugin
const client = auth.api.refrefClient;

// Track a custom event
await client.trackPurchase({
  timestamp: new Date().toISOString(),
  productId: "your-product-id",
  payload: {
    userId: "user-123",
    orderAmount: 99.99,
    orderId: "order-456",
  },
});
```

### Disable Automatic Tracking

Use the plugin for manual tracking only:

```typescript
refrefAnalytics({
  apiKey: process.env.REFREF_API_KEY!,
  productId: process.env.REFREF_PRODUCT_ID!,
  disableSignupTracking: true, // Disable automatic tracking
});
```

## Environment Variables

Add these to your `.env` file:

```bash
REFREF_API_KEY=your_api_key_here
REFREF_PRODUCT_ID=your_product_id_here
REFREF_API_URL=https://api.refref.app  # Optional
```

## Cookie Management

The plugin expects a cookie with the referral code. Here's a complete example:

```typescript
// utils/referral.ts
export function setReferralCookie(refcode: string) {
  const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
  document.cookie = `refref_refcode=${refcode}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function getReferralCookie(): string | null {
  const match = document.cookie.match(/refref_refcode=([^;]+)/);
  return match ? match[1] : null;
}

export function clearReferralCookie() {
  document.cookie = "refref_refcode=; path=/; max-age=0";
}
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  RefRefPluginOptions,
  SignupTrackingData,
  TrackingResponse,
} from "@refref/better-auth";
```

## Troubleshooting

### Signup not being tracked

1. Check that the cookie is set correctly:

   ```javascript
   console.log(document.cookie); // Should include refref_refcode=XXX
   ```

2. Verify API key and product ID are correct

3. Check console for error messages

4. Ensure Better Auth is configured correctly

### Cookie not being read

1. Verify cookie name matches configuration
2. Check cookie path and domain settings
3. Ensure cookie hasn't expired

### API errors

1. Check network tab for failed requests
2. Verify API key has correct permissions
3. Check RefRef API status

## License

MIT

## Support

For issues or questions, please visit the RefRef documentation or contact support.
