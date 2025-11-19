export type AutoAttachMode = "false" | "data-refref" | "all";

/**
 * MDN-compliant cookie attributes
 * Accepts any cookie attribute as per MDN spec.
 * Only attributes with defaults are explicitly typed.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
 */
export interface CookieOptions extends Record<string, any> {
  Path?: string; // Default: "/"
  "Max-Age"?: number; // Default: 7776000 (90 days in seconds)
  SameSite?: "Strict" | "Lax" | "None"; // Default: "Lax"
}

export interface FormElement extends HTMLFormElement {
  [key: string]: unknown;
}
