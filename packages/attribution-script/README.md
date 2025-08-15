# @refref/attribution-script

A lightweight, flexible, and TypeScript-first attribution script for tracking referral codes in web applications.

## Features

- Track referral codes from URL parameters
- Store attribution data in cookies
- Automatic form field population
- Customizable cookie and form settings
- TypeScript support with exported types
- Automatic initialization on DOM ready
- Works with all modern frameworks and plain HTML

## Installation

```bash
npm install @refref/attribution-script
# or
yarn add @refref/attribution-script
# or
pnpm add @refref/attribution-script
```

## Usage

### Basic Setup (TypeScript/ESM)

```typescript
import RefRefAttribution, {
  AttributionConfig,
} from "@refref/attribution-script";

const config: AttributionConfig = {
  cookieOptions: {
    enabled: true,
    domain: "yourdomain.com",
    path: "/",
    maxAge: 90 * 24 * 60 * 60, // 90 days
    secure: true,
    sameSite: "Lax",
  },
  formOptions: {
    codeField: "rfc", // Name of the hidden field for referral code
  },
};

RefRefAttribution.init(config);
```

### Form Integration

Add the `data-refref` attribute to your forms to enable automatic attribution tracking:

```html
<form data-refref>
  <!-- Your form fields -->
</form>
```

Attach attribution tracking to all forms with `data-refref`:

```typescript
RefRefAttribution.attachToAll();
```

Or attach to a specific form:

```typescript
const form = document.querySelector("#my-form") as HTMLFormElement;
RefRefAttribution.attachTo(form);
```

#### Injected Form Fields

- The script injects a hidden `<input>` field into each form with `data-refref`.
- The field's `name` is set by the `codeField` option (default: `rfc`).
- The field's `value` is set to the referral code (if present in URL or cookie).

### Getting the Attribution Code

```typescript
const code = RefRefAttribution.getCode(); // Returns code from URL or cookie, or undefined if not found
```

### Global Usage

If loaded in a browser environment, `RefRefAttribution` is also available on `window.RefRefAttribution`:

```javascript
window.RefRefAttribution.getCode();
```

## URL Parameters

The script automatically captures the following URL parameter:

| Parameter | Description            |
| --------- | ---------------------- |
| `rfc`     | Referral code (string) |

- Only the `rfc` parameter is tracked by default. You can customize the field name in forms via the `codeField` option.

## Cookie Storage

- The referral code is stored in a cookie with the key `refref-unique-code` (unless disabled).
- Cookie options are fully configurable (see below).

## Configuration Options

### Cookie Options

| Option   | Type                        | Default   | Description                            |
| -------- | --------------------------- | --------- | -------------------------------------- |
| enabled  | boolean                     | true      | Enable/disable cookie storage          |
| domain   | string                      | undefined | The domain to set the cookie on        |
| path     | string                      | "/"       | The path to set the cookie on          |
| maxAge   | number                      | 90d       | Cookie expiration in seconds (90 days) |
| secure   | boolean                     | true      | Only send the cookie over HTTPS        |
| sameSite | "Strict" \| "Lax" \| "None" | "Lax"     | Cookie same-site policy                |

### Form Options

| Option    | Type   | Default | Description                                |
| --------- | ------ | ------- | ------------------------------------------ |
| codeField | string | "rfc"   | Name of the hidden field for referral code |

## Automatic Initialization

The script automatically initializes when the DOM is ready. You can also manually initialize it:

```typescript
RefRefAttribution.init();
```

## TypeScript Support

All public APIs and configuration objects are fully typed. You can import types for strict usage:

```typescript
import type {
  AttributionConfig,
  CookieOptions,
  FormOptions,
} from "@refref/attribution-script";
```

## Browser Support

The script is designed to work in browser environments and will log an error if used in a non-browser environment.

## Development

- Build: `pnpm build`
- Test: `pnpm test`
- Lint: `pnpm lint`
- Preview: `pnpm preview`

## License

MIT
