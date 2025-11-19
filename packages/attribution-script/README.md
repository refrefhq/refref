# RefRef Attribution Script

A lightweight, flexible, and TypeScript-first attribution script for tracking referral codes in web applications. The attribution script captures referral codes from URL parameters, stores them in cookies, and automatically injects them into forms for seamless referral tracking.

## Features

- **Track referral codes from URL parameters** - Automatically captures `refcode` from query strings
- **Persistent cookie storage** - Stores referral codes in cookies for cross-session tracking
- **Automatic form field population** - Injects hidden form fields with referral codes
- **Customizable configuration** - Full control over cookie and form field settings
- **TypeScript support** - Fully typed with exported types
- **Automatic initialization** - Works out of the box with zero configuration
- **Framework agnostic** - Works with all modern frameworks and plain HTML
- **Privacy-friendly** - Respects cookie preferences and privacy settings

## Installation

Add the following script tag to your HTML (typically in the `<head>` or before the closing `</body>` tag):

```html
<script src="https://assets.refref.ai/attribution.v1.js"></script>
```

The script will automatically initialize when the DOM is ready with default settings. No additional configuration is required to get started.

## Usage

### Basic Setup

The script automatically initializes with default settings when loaded. Simply add the script tag and mark your forms with the `data-refref` attribute:

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://assets.refref.ai/attribution.v1.js"></script>
  </head>
  <body>
    <!-- Your content -->
    <form data-refref>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
      <!-- Hidden refcode field will be automatically injected here -->
    </form>
  </body>
</html>
```

### Custom Configuration (Optional)

If you need to customize cookie or form settings, you can configure the script after it loads:

```javascript
// Configure cookie and form options
window.RefRefAttribution.init({
  cookieOptions: {
    enabled: true,
    domain: "yourdomain.com",
    path: "/",
    secure: true,
    sameSite: "Lax",
  },
  formOptions: {
    codeField: "refcode", // Name of the hidden field for referral code
  },
});
```

**Note**: Configuration is optional. The script works out of the box with sensible defaults.

### How It Works

1. **Auto-Initialization**: The script automatically initializes when the DOM is ready (or immediately if DOM is already ready).
2. **URL Parameter Detection**: Checks for `refcode` in the URL query string (e.g., `https://yoursite.com?refcode=ABC123`).
3. **Cookie Check**: If no URL parameter is found, checks for an existing referral code in the cookie (`refref-refcode`).
4. **Priority**: URL parameters take priority over cookie values - if both exist, the URL parameter is used.
5. **Cookie Storage**: If a referral code is found (from URL or cookie), it's saved to a cookie for 90 days (if cookies are enabled).
6. **Form Integration**: Automatically injects hidden input fields into all forms with `data-refref` attribute, populating them with the referral code.

**Important**: Forms are automatically attached during initialization if a referral code exists. You can also manually call `attachToAll()` or `attachTo()` to attach to forms that are added dynamically or if you need to re-attach.

### Form Integration

Add the `data-refref` attribute to your forms to enable automatic attribution tracking:

```html
<form data-refref>
  <!-- Your form fields -->
</form>
```

**Automatic Attachment**: Forms with `data-refref` are automatically attached during initialization if a referral code exists. No additional code is needed.

**Manual Attachment**: You can also manually attach forms, useful for dynamically added forms:

```javascript
// Attach to all forms with data-refref attribute
window.RefRefAttribution.attachToAll();

// Attach to a specific form element
const form = document.querySelector("#my-form");
window.RefRefAttribution.attachTo(form);
```

#### Injected Form Fields

- The script automatically injects a hidden `<input>` field into each form with `data-refref` attribute
- The field's `name` is set by the `codeField` option (default: `"refcode"`)
- The field's `value` is set to the referral code (if present in URL or cookie)
- If a form already has an input with the same name, the existing field's value is updated instead of creating a duplicate

### Getting the Attribution Code

```typescript
const code = RefRefAttribution.getCode(); // Returns code from URL or cookie, or undefined if not found
```

### Global Usage

When loaded via CDN or in a browser environment, `RefRefAttribution` is available on `window.RefRefAttribution`:

```javascript
// Get the current referral code
const code = window.RefRefAttribution.getCode();

// Attach to all forms with data-refref attribute
window.RefRefAttribution.attachToAll();

// Attach to a specific form
const form = document.querySelector("#signup-form");
window.RefRefAttribution.attachTo(form);
```

### Integration with RefRef Widget

The attribution script works seamlessly with the RefRef widget. When both are installed:

1. The attribution script captures and stores referral codes from URL parameters
2. The widget reads the same cookie (`refref-refcode`) during initialization
3. The widget sends the referral code to the backend API for automatic attribution
4. Both scripts use the same cookie key for consistency

This ensures that referral tracking works across your entire application, whether users interact with forms or the referral widget.

## URL Parameters

The script automatically captures referral codes from URL query parameters:

| Parameter | Description            | Example                               |
| --------- | ---------------------- | ------------------------------------- |
| `refcode` | Referral code (string) | `https://yoursite.com?refcode=ABC123` |

**Priority**: URL parameters take priority over cookie values. If a user visits with a new `refcode` in the URL, it will overwrite any existing cookie value.

## Cookie Storage

- **Cookie Key**: `refref-refcode` (configurable via cookie options)
- **Default Expiration**: 90 days
- **Storage**: The referral code persists across browser sessions and page navigations
- **Privacy**: Respects browser cookie settings and privacy preferences

The cookie is used to:

- Persist referral codes across sessions
- Track referrals even when users navigate between pages
- Enable automatic attribution when users sign up later
- Work seamlessly with the RefRef widget

**Note**: If cookies are disabled or blocked by the browser, the script will still work for the current session using URL parameters, but won't persist across sessions.

## Configuration Options

Configuration is optional - the script works with sensible defaults. You can customize behavior by calling `window.RefRefAttribution.init()` with configuration options **before** the script auto-initializes, or call it manually after the script loads.

> **Note**: Cookie and form options are primarily intended for **development and testing purposes**. In production, the default settings are recommended and work well for most use cases.

### Cookie Options

Configure how referral codes are stored in cookies (primarily for dev/testing):

| Option   | Type                        | Default          | Description                                                               |
| -------- | --------------------------- | ---------------- | ------------------------------------------------------------------------- |
| enabled  | boolean                     | `true`           | Enable/disable cookie storage. If disabled, only URL parameters are used. |
| domain   | string                      | Current hostname | The domain to set the cookie on. Defaults to `window.location.hostname`.  |
| path     | string                      | `"/"`            | The path where the cookie is available. Defaults to root path.            |
| secure   | boolean                     | `true`           | Only send the cookie over HTTPS connections (recommended for production). |
| sameSite | "Strict" \| "Lax" \| "None" | `"Lax"`          | Cookie same-site policy. Use "Lax" for cross-site referrals.              |

**Important Notes:**

- Cookie expiration is **fixed at 90 days** and cannot be customized via configuration
- If `domain` is not specified, it defaults to the current page's hostname
- To include subdomains, set `domain` to `".yourdomain.com"` (with leading dot)

**Example Configuration:**

```javascript
// Configure before auto-initialization (call immediately after script loads)
window.RefRefAttribution.init({
  cookieOptions: {
    enabled: true,
    domain: ".yourdomain.com", // Include subdomains (note the leading dot)
    path: "/",
    secure: true, // HTTPS only
    sameSite: "Lax", // Allow cross-site referrals
  },
});
```

### Form Options

Configure how referral codes are injected into forms (primarily for dev/testing):

| Option    | Type   | Default     | Description                                                                        |
| --------- | ------ | ----------- | ---------------------------------------------------------------------------------- |
| codeField | string | `"refcode"` | Name of the hidden input field that will be injected into forms with `data-refref` |

**Example Configuration:**

```javascript
window.RefRefAttribution.init({
  formOptions: {
    codeField: "referral_code", // Custom field name instead of "refcode"
  },
});
```

## Automatic Initialization

The script automatically initializes when the DOM is ready with default settings. The initialization happens:

- **If DOM is loading**: Waits for `DOMContentLoaded` event
- **If DOM is ready**: Initializes immediately

**To configure before auto-initialization**, call `init()` immediately after the script tag:

```html
<script src="https://assets.refref.ai/attribution.v1.js"></script>
<script>
  // Configure before auto-initialization
  window.RefRefAttribution.init({
    cookieOptions: {
      domain: ".yourdomain.com",
    },
    formOptions: {
      codeField: "referral_code",
    },
  });
</script>
```

**Important**: The `init()` method is **idempotent** - once initialized, calling it again will not re-initialize or change settings. Configuration must be provided on the first call. If you need to change settings, you must do so before the script auto-initializes.

## TypeScript Support

When using the CDN version, TypeScript types are available via type declarations. The `window.RefRefAttribution` object is fully typed and provides IntelliSense support in TypeScript projects.

## API Reference

### Methods

- `window.RefRefAttribution.init(config?)`: Initialize or reconfigure the attribution script with optional configuration
- `window.RefRefAttribution.getCode()`: Get the current referral code from URL or cookie, returns `string | undefined`
- `window.RefRefAttribution.attachToAll()`: Attach referral code tracking to all forms with `data-refref` attribute
- `window.RefRefAttribution.attachTo(form)`: Attach referral code tracking to a specific form element

### Example: Complete Integration

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Load attribution script -->
    <script src="https://assets.refref.ai/attribution.v1.js"></script>
  </head>
  <body>
    <!-- Signup form with automatic referral tracking -->
    <form id="signup-form" data-refref method="POST" action="/signup">
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <!-- Hidden refcode field will be automatically injected here -->
      <button type="submit">Sign Up</button>
    </form>

    <script>
      // Get the current referral code
      const code = window.RefRefAttribution.getCode();
      console.log("Current referral code:", code);

      // The form will automatically include the referral code when submitted
      document.getElementById("signup-form").addEventListener("submit", (e) => {
        const formData = new FormData(e.target);
        console.log("Form data:", Object.fromEntries(formData));
        // refcode will be included if present
      });
    </script>
  </body>
</html>
```

## Browser Support

The script supports all modern browsers (Chrome, Firefox, Safari, Edge) and requires JavaScript enabled.

## Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Preview demo
pnpm preview
```
