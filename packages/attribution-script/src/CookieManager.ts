import type { CookieOptions } from "@/types";

export class CookieManager {
  private options: CookieOptions;

  constructor(options: CookieOptions = {}) {
    // Apply defaults only for properties we explicitly support
    this.options = {
      Path: "/",
      "Max-Age": 90 * 24 * 60 * 60, // 90 days in seconds
      SameSite: "Lax",
      // Auto-detect Secure based on protocol (HTTPS = Secure: true)
      ...(window.location.protocol === "https:" ? { Secure: true } : {}),
      ...options, // User options override defaults
    };
  }

  public set(name: string, value: string): void {
    const parts: string[] = [`${name}=${encodeURIComponent(value)}`];

    // Dynamically build cookie string from all options
    for (const [key, val] of Object.entries(this.options)) {
      if (val === undefined || val === null) continue;

      // Boolean attributes (Secure, HttpOnly, etc.)
      if (typeof val === "boolean") {
        if (val) {
          parts.push(key); // Keep original casing
        }
      }
      // Key-value attributes (Domain, Path, Max-Age, etc.)
      else {
        parts.push(`${key}=${val}`); // Keep original casing
      }
    }

    document.cookie = parts.join("; ");
  }

  public get(name: string): string | null {
    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

    return value ? decodeURIComponent(value) : null;
  }

  public delete(name: string): void {
    // Use same options but set Max-Age to -1 to delete
    const deleteOptions = { ...this.options, "Max-Age": -1 };
    const parts: string[] = [`${name}=`];

    for (const [key, val] of Object.entries(deleteOptions)) {
      if (val === undefined || val === null) continue;

      if (typeof val === "boolean") {
        if (val) {
          parts.push(key); // Keep original casing
        }
      } else {
        parts.push(`${key}=${val}`); // Keep original casing
      }
    }

    document.cookie = parts.join("; ");
  }
}
