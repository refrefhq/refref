# RefRef Widget

A customizable referral widget that can be easily embedded into any website.

## Installation

Add the following script tag to your HTML:

```html
<script src="https://assets.refref.io/widget.js"></script>
```

## Usage

### Basic Usage

The widget can be triggered in multiple ways:

1. Using a data attribute:

```html
<button data-refref-trigger>Refer a Friend</button>
```

2. Programmatically using the RefRef object:

```javascript
// Open the widget
window.RefRef.open();

// Close the widget
window.RefRef.close();

// Toggle the widget
window.RefRef.toggle();
```

### Configuration

> **Note:** In production, widget configuration is typically managed through your RefRef dashboard and loaded automatically via the `init()` method. The `setConfig()` method is primarily intended for **development and demo purposes** to override or test configuration locally.

You can customize the widget's appearance and behavior locally using `setConfig()`. The widget uses shadcn-style CSS variables for theming:

```javascript
window.RefRef.setConfig({
  // Widget button settings
  position: "bottom-right", // 'bottom-left', 'top-right', 'top-left'
  triggerText: "Refer & Earn",
  icon: "gift", // 'gift', 'heart', 'star', 'zap'

  // Modal content
  title: "Invite your friends",
  subtitle: "Share your referral link and earn rewards when your friends join!",
  logoUrl: "",

  // Theme customization using CSS variables (shadcn-style)
  cssVariables: {
    "--primary": "oklch(0.646 0.222 41.116)", // Primary color
    "--primary-foreground": "oklch(0.985 0 0)", // Text on primary
    "--secondary": "oklch(0.97 0 0)", // Secondary color
    "--secondary-foreground": "oklch(0.205 0 0)", // Text on secondary
    "--background": "oklch(1 0 0)", // Background color
    "--foreground": "oklch(0.145 0 0)", // Text color
    "--muted": "oklch(0.97 0 0)", // Muted background
    "--muted-foreground": "oklch(0.556 0 0)", // Muted text
    "--accent": "oklch(0.97 0 0)", // Accent color
    "--accent-foreground": "oklch(0.205 0 0)", // Text on accent
    "--border": "oklch(0.922 0 0)", // Border color
    "--radius": "0.625rem", // Border radius
  },

  // Sharing settings
  shareMessage: "Join me on {productName} and get a reward!",
  enabledPlatforms: {
    facebook: true,
    twitter: true,
    linkedin: true,
    whatsapp: true,
    email: true,
    instagram: false,
    telegram: false,
  },

  // User data
  referralLink: "https://your-domain.com/ref/[CODE]",
  productName: "Your Product Name",
});
```

**Theming:** The widget uses CSS variables following the shadcn/ui design system. You can override any CSS variable to customize colors, spacing, and other design tokens. The widget automatically supports dark mode by detecting the `dark` class on the parent page's `<html>` or `<body>` element.

**Important:** When you call `init()`, the widget will fetch the configuration from your backend, which will override any settings made via `setConfig()`. To persist configuration changes, update them in your RefRef dashboard rather than using `setConfig()`.

### Advanced: Pre-initialization Command Queue

You can queue commands before the widget script loads. This is useful for setting config or initializing with user data as soon as possible. The `init` call is used to associate the widget with a specific product and user, and optionally a token for authentication. This enables personalized referral links and campaign tracking.

```html
<script>
  window.RefRef = window.RefRef || [];
  window.RefRef.push([
    "setConfig",
    {
      cssVariables: {
        "--primary": "oklch(0.577 0.245 27.325)", // Custom primary color
      },
    },
  ]);
  window.RefRef.push([
    "init",
    {
      productId: "my-product",
      externalId: "user123", // Optional: identifier of the user in your system
      token: "your-jwt-token", // Optional: JWT token for authentication
    },
  ]);
</script>
<script async src="https://assets.refref.ai/widget.v1.js"></script>
```

### Checking Widget State

```javascript
// Check if the widget is open
const isOpen = window.RefRef.isOpen;

// Get current configuration
const config = window.RefRef.getConfig();
```

### API Reference

- `window.RefRef.open()`: Open the widget.
- `window.RefRef.close()`: Close the widget.
- `window.RefRef.toggle()`: Toggle the widget open/closed.
- `window.RefRef.setConfig(config)`: Update the widget configuration locally (primarily for development/demo purposes). Configuration from `init()` will override these settings.
- `window.RefRef.getConfig()`: Get the current widget configuration.
- `window.RefRef.isOpen`: Boolean indicating if the widget is open.
- `window.RefRef.init({ productId?, externalId?, token? })`: (Optional) Programmatically initialize the widget with user/product info.
  Makes api call to load the config data. Either `productId` or `token` must be provided. If `token` is provided, `productId` can be omitted (it will be extracted from the token).

#### `init` Method Details

The `init` method is used to associate the widget instance with a specific product and user. This enables personalized referral links, campaign tracking, and secure widget initialization. It is especially useful if you want to dynamically set the user context after page load or in a single-page app.

**Parameters:**

- `productId` (string, required if no token, optional if token provided): The unique identifier for your referral campaign or product. If a `token` is provided, the `productId` in the request must match the `productId` in the JWT token (used as a validation check). If only a `token` is provided, the `productId` can be omitted and will be extracted from the token.
- `externalId` (string, optional): The unique identifier for the current user in your system. This should match the user identifier you use in your application.
- `token` (string, optional): A JWT authentication token for secure access. The token must include a `sub` field containing the user's external ID and a `productId` field.

**Authentication Requirements:**

Either `externalId` or `token` must be provided:

- If `token` is provided: The system will extract the `sub` field from the JWT token and use it as the `externalId`. The token is verified against your product's secret key. If `productId` is also provided, it must match the `productId` in the token (used as a security validation).
- If `externalId` is provided without `token`: The widget will initialize without authentication (useful for demo/preview modes). In this case, `productId` is required.
- If both are provided: The `token` takes precedence, and the `externalId` from the token (`sub` field) will be used.

**JWT Token Structure:**

The JWT token should follow this structure:

```json
{
  "sub": "user-external-id-123", // Required: User identifier in your system
  "email": "user@example.com", // Optional: User email
  "name": "John Doe", // Optional: User name
  "productId": "your-product-id" // Required: Must match the productId parameter
}
```

The token is verified using your product's client secret, which is securely stored in the RefRef backend. The `sub` field in the token is used as the `externalId` to identify and create/update the participant record.

**Usage Examples:**

```javascript
// With JWT token only (productId extracted from token)
window.RefRef.init({
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
});

// With JWT token and productId (productId validated against token)
window.RefRef.init({
  productId: "my-product-id", // Must match productId in token
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
});

// With externalId only (for demo/preview, no authentication)
window.RefRef.init({
  productId: "my-product-id", // Required when no token
  externalId: "user-123",
});

// Both externalId and token provided (token takes precedence)
window.RefRef.init({
  productId: "my-product-id", // Must match productId in token
  externalId: "user-123", // Ignored if token is present
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
});
```

**What it does:**

- Makes a POST request to `/v1/widget/init` endpoint to initialize the referral context.
- If a token is provided, it verifies the JWT and extracts user information (`sub`, `email`, `name`) from the token.
- Creates or updates a participant record using the `externalId` (from token `sub` field or provided `externalId`).
- Retrieves the active referral program configuration and generates/retrieves the user's referral code.
- Stores the referral link and user context in the widget state.
- Enables personalized sharing and tracking for the participant.
- If called before the widget script loads (via the command queue), initialization will occur as soon as the widget is ready.

## Development

1. Install dependencies:

```bash
pnpm install
```

2. Start development server:

```bash
pnpm run dev
```

3. Build for production:

```bash
pnpm run build
```

## Browser Support

The widget supports all modern browsers (Chrome, Firefox, Safari, Edge) and uses Shadow DOM for style isolation.
