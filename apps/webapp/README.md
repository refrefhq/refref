# Console app

This is a [T3 Stack](https://create.t3.gg/) product bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this product as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this product, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Authentication and Route Protection

This product implements a comprehensive authentication system with multiple layers of protection:

### Route Protection Layers

1. **Middleware Protection (Server-side)**

   - Implemented in `src/middleware.ts`
   - Intercepts all requests and verifies authentication status
   - Redirects unauthenticated users from protected routes
   - Redirects authenticated users from auth pages

2. **Layout Route Groups (Server-side)**

   - Protected routes use the `(dashboard)` route group with auth verification
   - Auth routes use the `auth` route group with redirect-if-authenticated logic

3. **Client Components (Client-side)**

   - `<ProtectedClientRoute>` - Component wrapper for client pages that need auth
   - `<PublicClientRoute>` - Component wrapper to redirect authenticated users

4. **Custom Hook (Client-side)**
   - `useAuthGuard` - Hook for client components that need auth guards

### Usage Examples

**Server-side Protected Routes:**

- Place pages in the `(dashboard)` route group
- The layout already includes authentication checks

**Client-side Protection:**

```tsx
import { ProtectedClientRoute } from "@/components/auth/ProtectedClientRoute";

export default function ProtectedPage() {
  return (
    <ProtectedClientRoute>
      <YourClientComponent />
    </ProtectedClientRoute>
  );
}
```

**Client-side Public Route:**

```tsx
import { PublicClientRoute } from "@/components/auth/PublicClientRoute";

export default function PublicPage() {
  return (
    <PublicClientRoute>
      <YourPublicComponent />
    </PublicClientRoute>
  );
}
```

**Using the Auth Guard Hook:**

```tsx
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function YourComponent() {
  // Redirect if not authenticated
  const { session, isLoading } = useAuthGuard();

  // Or redirect if authenticated
  // const { session, isLoading } = useAuthGuard({ redirectIfAuthenticated: true });

  if (isLoading) return <div>Loading...</div>;

  return <div>Protected Content for {session?.user?.email}</div>;
}
```
## Refcode Concept

### Global vs Local Codes

RefRef now supports two types of referral codes:

#### 1. Global Codes
- **Format**: 7 characters (numbers + lowercase letters: `23456789abcdefghjkmnpqrstuvwxyz`)
- **Example**: `abc1234`
- **URL Pattern**: `REFERRAL_HOST_URL/:code`
  - Example: `https://refer.refref.app/abc1234`
- **Uniqueness**: Globally unique across the entire RefRef system
- **Generation**: Auto-generated with profanity filtering
- **Use Case**: Default referral codes for all participants

#### 2. Local Codes
- **Format**: User-specified vanity strings (3-50 characters, alphanumeric + hyphens)
- **Example**: `john-doe`, `ceo`, `founder`
- **URL Pattern**: `REFERRAL_HOST_URL/:product_slug/:code`
  - Example: `https://refer.refref.app/acme/john-doe`
- **Uniqueness**: Unique within a specific product
- **Generation**: User-provided (validated for length, characters, and profanity)
- **Use Case**: Custom vanity URLs for branding and memorability

### Key Characteristics

Both code types share these properties:
- **Case-insensitive**: Stored and compared in lowercase
- **Program Association**: Every refcode belongs to a specific program and participant
- **Product Association**: Every refcode is associated with a product
- **Profanity Filtered**: All codes are checked against a profanity filter
- **Attribution-ready**: Can be used in cookies, URL params, and form fields as `refcode`
- **Multiple Codes**: A participant can have multiple refcodes for a program (e.g., both global and local codes)
  - When fetching for display/widget, always use the **most recent** one (ORDER BY created_at DESC)

---