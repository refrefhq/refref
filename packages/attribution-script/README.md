# RefRef Attribution Script

A lightweight, flexible attribution script for tracking referral codes in web applications. The attribution script captures referral codes from URL parameters, stores them in cookies, and automatically injects them into forms for seamless referral tracking.

## Features

- **Automatic referral code tracking** - Captures `refcode` from URL parameters (`?refcode=ABC123`)
- **Persistent cookie storage** - Stores referral codes in cookies for 90-day tracking
- **Smart form attachment** - Only attaches to forms when a referral code exists (no empty fields)
- **Dynamic form detection** - MutationObserver automatically detects forms added after page load (SPAs, modals)
- **Flexible auto-attach modes** - Choose between "data-refref" (default), "all", or "false"
- **Simple script tag configuration** - All configuration via HTML attributes (no JavaScript required)
- **MDN-compliant cookie options** - Supports all standard Set-Cookie attributes
- **Auto-detect HTTPS** - Automatically adds Secure attribute on HTTPS sites
- **TypeScript support** - Fully typed with exported types
- **Framework agnostic** - Works with React, Vue, Svelte, plain HTML, and all modern frameworks
- **Zero configuration** - Works out of the box with sensible defaults

## Installation

Add the script tag to your HTML (typically in the `<head>` or before closing `</body>`):

```html
<script src="https://assets.refref.ai/attribution.v1.js"></script>
```

The script automatically initializes when the DOM is ready. No additional configuration required.

## Quick Start

### Default Behavior (Opt-In Mode)

By default, the script only attaches to forms with the `data-refref` attribute:

```html
<script src="https://assets.refref.ai/attribution.v1.js"></script>

<!-- This form WILL be tracked (has data-refref) -->
<form data-refref action="/signup" method="POST">
  <input type="email" name="email" required />
  <button type="submit">Sign Up</button>
  <!-- Hidden field automatically injected: <input type="hidden" name="refcode" value="ABC123" /> -->
</form>

<!-- This form WILL NOT be tracked (no data-refref) -->
<form action="/search" method="GET">
  <input type="text" name="query" />
  <button type="submit">Search</button>
</form>
```

When a user visits `https://yoursite.com?refcode=ABC123`:

1. The code is saved to a cookie for 90 days
2. Forms with `data-refref` get a hidden `<input type="hidden" name="refcode" value="ABC123" />`
3. Dynamically added forms with `data-refref` are automatically detected

## Auto-Attach Modes

Control which forms get referral tracking using the `data-auto-attach` attribute:

### Mode: "data-refref" (Default, Recommended)

Only attaches to forms with the `data-refref` attribute. **This is the default and recommended mode.**

```html
<script src="https://assets.refref.ai/attribution.v1.js"></script>
<!-- OR explicitly set: -->
<script
  src="https://assets.refref.ai/attribution.v1.js"
  data-auto-attach="data-refref"
></script>
```

```html
<!-- Tracked ✓ -->
<form data-refref action="/signup" method="POST">
  <input type="email" name="email" />
  <button>Sign Up</button>
</form>

<!-- NOT tracked (no data-refref attribute) -->
<form action="/search" method="GET">
  <input type="text" name="query" />
  <button>Search</button>
</form>
```

**Use when:**

- ✅ You want explicit control over which forms include referral codes
- ✅ You have non-referral forms (search, filters, internal forms) to exclude
- ✅ You prefer opt-in behavior (recommended for most use cases)
- ✅ You want to avoid cluttering every form with hidden fields

---

### Mode: "all"

Attaches to **ALL forms** on the page, regardless of `data-refref` attribute.

```html
<script
  src="https://assets.refref.ai/attribution.v1.js"
  data-auto-attach="all"
></script>
```

```html
<!-- Both forms are tracked (no data-refref needed) -->
<form action="/signup" method="POST">
  <input type="email" name="email" />
  <button>Sign Up</button>
</form>

<form action="/contact" method="POST">
  <input type="text" name="name" />
  <button>Contact</button>
</form>
```

**Use when:**

- ✅ You want to track every single form on your site
- ✅ Your site only has referral-related forms
- ✅ You want the simplest setup (no attributes to add)

**Note:** This attaches to ALL forms including search forms, filter forms, etc. Be intentional about this choice.

---

### Mode: "false"

No automatic attachment. Use manual API calls only.

```html
<script
  src="https://assets.refref.ai/attribution.v1.js"
  data-auto-attach="false"
></script>

<script>
  // Manually attach to specific forms
  const signupForm = document.querySelector("#signup-form");
  window.RefRefAttribution.attachTo(signupForm);

  // Or attach to all forms manually
  window.RefRefAttribution.attachToAll(); // Respects auto-attach mode
</script>
```

**Use when:**

- ✅ You need full manual control over form attachment
- ✅ You have custom logic for when/how to attach
- ✅ Performance-sensitive scenarios (no MutationObserver overhead)
- ✅ Advanced integrations with custom frameworks

**Note:** MutationObserver is disabled in this mode. You must manually call `attachTo()` for dynamically added forms.

## Cookie Configuration

Configure cookie behavior using the `data-cookie-options` attribute with a JSON string:

```html
<script
  src="https://assets.refref.ai/attribution.v1.js"
  data-cookie-options='{"Domain":".example.com","Max-Age":7776000,"SameSite":"Strict"}'
></script>
```

### Default Cookie Options

The script uses these defaults (no configuration needed):

- **Path**: `/` (available across your entire site)
- **Max-Age**: `7776000` (90 days in seconds)
- **SameSite**: `Lax` (allows cross-site referrals)
- **Secure**: Auto-detected (added automatically on HTTPS, omitted on HTTP)

### Available Cookie Attributes

The script accepts **any MDN-compliant Set-Cookie attribute**. Common options:

| Attribute     | Type    | Example                           | Description                                                   |
| ------------- | ------- | --------------------------------- | ------------------------------------------------------------- |
| `Domain`      | string  | `".example.com"`                  | Cookie domain (include subdomains with leading `.`)           |
| `Path`        | string  | `"/"`                             | Cookie path                                                   |
| `Max-Age`     | number  | `7776000`                         | Cookie lifetime in seconds (90 days default)                  |
| `SameSite`    | string  | `"Strict"` \| `"Lax"` \| `"None"` | Cookie same-site policy                                       |
| `Secure`      | boolean | `true`                            | Only send over HTTPS (auto-detected by default)               |
| `HttpOnly`    | boolean | `true`                            | Prevent JavaScript access (not recommended for this use case) |
| `Partitioned` | boolean | `true`                            | CHIPS (Chrome privacy feature)                                |
| `Priority`    | string  | `"High"`                          | Cookie priority                                               |

**Full list of attributes:** See [MDN Set-Cookie documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)

### Example Configurations

**Subdomain tracking (e.g., app.example.com and www.example.com):**

```html
<script
  src="https://assets.refref.ai/attribution.v1.js"
  data-cookie-options='{"Domain":".example.com"}'
></script>
```

**Strict same-site policy:**

```html
<script
  src="https://assets.refref.ai/attribution.v1.js"
  data-cookie-options='{"SameSite":"Strict"}'
></script>
```

**Custom expiration (30 days):**

```html
<script
  src="https://assets.refref.ai/attribution.v1.js"
  data-cookie-options='{"Max-Age":2592000}'
></script>
```

**Multiple options:**

```html
<script
  src="https://assets.refref.ai/attribution.v1.js"
  data-cookie-options='{"Domain":".example.com","Max-Age":2592000,"SameSite":"Strict","Secure":true}'
></script>
```

### Auto-Detect Secure Attribute

The `Secure` attribute is automatically added based on the page protocol:

- **HTTPS**: `Secure` attribute is automatically added to cookies
- **HTTP**: `Secure` attribute is NOT added (allows cookies to work on localhost)

You can override this by explicitly setting `Secure` in `data-cookie-options`.

### Invalid JSON Handling

If the `data-cookie-options` JSON is invalid, the script:

1. Logs a warning to the console
2. Falls back to default cookie options
3. Continues to function normally

## How It Works

1. **Auto-initialization**: Script initializes automatically when DOM is ready
2. **URL parameter check**: Looks for `?refcode=ABC123` in the URL
3. **Cookie check**: If no URL parameter, checks for existing cookie (`refref-refcode`)
4. **Priority**: URL parameters override cookie values (refreshes the cookie)
5. **Cookie storage**: Saves referral code to cookie if found (90-day default)
6. **Form attachment** (only when referral code exists):
   - **Mode "data-refref"** (default): Injects hidden fields into forms with `data-refref` attribute
   - **Mode "all"**: Injects hidden fields into ALL forms
   - **Mode "false"**: No automatic injection
7. **Dynamic detection**: MutationObserver watches for new forms and auto-attaches (for "all" and "data-refref" modes)

### Important: Forms Only Attach When Code Exists

The script **only injects hidden fields when a referral code exists** (from URL or cookie). This prevents empty `<input type="hidden" name="refcode" value="">` fields from cluttering your forms.

**Example:**

```html
<!-- User visits WITHOUT ?refcode parameter and no existing cookie -->
<form data-refref>
  <input type="email" name="email" />
  <!-- NO hidden field injected -->
</form>

<!-- User visits WITH ?refcode=ABC123 -->
<form data-refref>
  <input type="email" name="email" />
  <!-- Hidden field IS injected: -->
  <input type="hidden" name="refcode" value="ABC123" />
</form>
```

## Form Integration

### Injected Hidden Fields

When a referral code exists, the script injects:

```html
<input type="hidden" name="refcode" value="ABC123" />
```

- **Field name**: Always `"refcode"` (not configurable)
- **Field value**: The referral code from URL or cookie
- **Injection behavior**: Creates new field or updates existing field with same name
- **Conditional**: Only injected when referral code exists

### Dynamic Forms (SPAs, Modals, Lazy-Loaded Content)

The MutationObserver automatically detects forms added after page load:

```javascript
// This form is added dynamically after 2 seconds
setTimeout(() => {
  const modalForm = document.createElement("form");
  modalForm.setAttribute("data-refref", "");
  modalForm.innerHTML = `
    <input type="email" name="email" />
    <button type="submit">Subscribe</button>
  `;
  document.body.appendChild(modalForm);
  // MutationObserver automatically detects and attaches
}, 2000);
```

**Note:** MutationObserver is active for "all" and "data-refref" modes. It's disabled in "false" mode.

## Public API

The script exposes `window.RefRefAttribution` with the following methods:

### `getCode(): string | undefined`

Get the current referral code (from URL or cookie).

```typescript
const code = window.RefRefAttribution.getCode();
console.log(code); // "ABC123" or undefined
```

**Returns:**

- `string`: The referral code if present
- `undefined`: No referral code found

---

### `attachTo(form: HTMLFormElement): void`

Manually attach referral tracking to a specific form.

```typescript
const form = document.querySelector("#signup-form");
window.RefRefAttribution.attachTo(form);
```

**Parameters:**

- `form`: The form element to attach to

**Behavior:**

- Creates/updates hidden `<input type="hidden" name="refcode" />` field
- Only sets value if referral code exists

---

### `attachToAll(): void`

Manually attach referral tracking to all forms (respects `data-auto-attach` mode).

```typescript
window.RefRefAttribution.attachToAll();
```

**Behavior (based on current mode):**

- **"data-refref"**: Attaches to forms with `data-refref` attribute
- **"all"**: Attaches to ALL forms
- **"false"**: No-op (does nothing)

**Use case:** Call after dynamically adding multiple forms in "false" mode.

---

### `stopObserver(): void`

Stop the MutationObserver from watching for new forms.

```typescript
window.RefRefAttribution.stopObserver();
```

**Use cases:**

- Performance optimization (if you know no more forms will be added)
- Cleanup before page unload
- Switching to fully manual control

**Note:** After calling `stopObserver()`, dynamically added forms won't be automatically tracked. You must manually call `attachTo()` or `attachToAll()`.

## Complete Examples

### Example 1: Default Setup (Opt-In with data-refref)

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://assets.refref.ai/attribution.v1.js"></script>
  </head>
  <body>
    <!-- Only this form is tracked (has data-refref) -->
    <form data-refref action="/signup" method="POST">
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <button type="submit">Sign Up</button>
      <!-- Hidden refcode field automatically injected when code exists -->
    </form>

    <!-- This form is NOT tracked (no data-refref) -->
    <form action="/search" method="GET">
      <input type="text" name="query" />
      <button type="submit">Search</button>
    </form>
  </body>
</html>
```

### Example 2: Track All Forms

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      src="https://assets.refref.ai/attribution.v1.js"
      data-auto-attach="all"
    ></script>
  </head>
  <body>
    <!-- Both forms are automatically tracked -->
    <form action="/signup" method="POST">
      <input type="email" name="email" />
      <button type="submit">Sign Up</button>
    </form>

    <form action="/contact" method="POST">
      <input type="text" name="name" />
      <button type="submit">Contact</button>
    </form>
  </body>
</html>
```

### Example 3: Custom Cookie Configuration

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      src="https://assets.refref.ai/attribution.v1.js"
      data-cookie-options='{"Domain":".example.com","Max-Age":2592000,"SameSite":"Strict"}'
    ></script>
  </head>
  <body>
    <form data-refref action="/signup" method="POST">
      <input type="email" name="email" />
      <button type="submit">Sign Up</button>
    </form>
  </body>
</html>
```

### Example 4: Manual Control

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      src="https://assets.refref.ai/attribution.v1.js"
      data-auto-attach="false"
    ></script>
  </head>
  <body>
    <form id="signup-form" action="/signup" method="POST">
      <input type="email" name="email" />
      <button type="submit">Sign Up</button>
    </form>

    <script>
      // Manual attachment
      const form = document.querySelector("#signup-form");
      window.RefRefAttribution.attachTo(form);

      // Get current code
      const code = window.RefRefAttribution.getCode();
      console.log("Referral code:", code);

      // Manually attach to dynamically added forms
      setTimeout(() => {
        const newForm = document.createElement("form");
        newForm.innerHTML = `
          <input type="email" name="email" />
          <button type="submit">Newsletter</button>
        `;
        document.body.appendChild(newForm);

        // Must manually attach in "false" mode
        window.RefRefAttribution.attachTo(newForm);
      }, 2000);
    </script>
  </body>
</html>
```

### Example 5: React/SPA Integration

```jsx
import { useEffect } from "react";

function SignupForm() {
  useEffect(() => {
    // Get referral code on component mount
    const code = window.RefRefAttribution?.getCode();
    console.log("Referral code:", code);

    // Forms with data-refref automatically get tracking
    // No manual attachment needed!
  }, []);

  return (
    <form data-refref action="/signup" method="POST">
      <input type="email" name="email" required />
      <button type="submit">Sign Up</button>
      {/* Hidden refcode field automatically injected */}
    </form>
  );
}
```

## Integration with RefRef Widget

The attribution script works seamlessly with the RefRef widget:

1. **Attribution script** captures and stores referral codes from URL parameters
2. **Widget** reads the same cookie (`refref-refcode`) during initialization
3. **Widget** sends the referral code to the backend API for automatic attribution
4. Both scripts use the same cookie key for consistency

This ensures referral tracking works across your entire application.

## URL Parameters

The script automatically captures referral codes from URL query parameters:

| Parameter | Description   | Example                               |
| --------- | ------------- | ------------------------------------- |
| `refcode` | Referral code | `https://yoursite.com?refcode=ABC123` |

**Priority:** URL parameters override cookie values. If a user visits with a new `refcode`, it refreshes the cookie.

## Cookie Storage

- **Cookie name**: `refref-refcode`
- **Default expiration**: 90 days (7776000 seconds)
- **Storage**: Persists across browser sessions and page navigations
- **Privacy**: Respects browser cookie settings and privacy preferences

**Note:** If cookies are disabled, the script still works for the current session using URL parameters, but won't persist across sessions.

## TypeScript Support

The script is fully typed. When using the CDN version, TypeScript types are available:

```typescript
declare global {
  interface Window {
    RefRefAttribution: {
      getCode(): string | undefined;
      attachTo(form: HTMLFormElement): void;
      attachToAll(): void;
      stopObserver(): void;
    };
  }
}
```

## Browser Support

Supports all modern browsers:

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

Requires JavaScript enabled.

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm type:check
```

## License

MIT
