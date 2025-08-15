import type { CookieOptions } from "@/types";

export class CookieManager {
  private options: Required<CookieOptions>;

  constructor(options: CookieOptions = {}) {
    this.options = {
      enabled: true,
      domain: options.domain ?? window.location.hostname,
      path: options.path ?? "/",
      maxAge: options.maxAge ?? 30 * 24 * 60 * 60, // 30 days in seconds
      secure: options.secure ?? true,
      sameSite: options.sameSite ?? "Lax",
      ...options,
    };
  }

  public get enabled(): boolean {
    return this.options.enabled;
  }

  public set(name: string, value: string): void {
    if (!this.options.enabled) return;

    const cookie = [
      `${name}=${encodeURIComponent(value)}`,
      `domain=${this.options.domain}`,
      `path=${this.options.path}`,
      `max-age=${this.options.maxAge}`,
      this.options.secure ? "secure" : "",
      `samesite=${this.options.sameSite}`,
    ]
      .filter(Boolean)
      .join("; ");

    document.cookie = cookie;
  }

  public get(name: string): string | null {
    if (!this.options.enabled) return null;

    const value = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

    return value ? decodeURIComponent(value) : null;
  }

  public delete(name: string): void {
    if (!this.options.enabled) return;

    const cookie = [
      `${name}=`,
      `domain=${this.options.domain}`,
      `path=${this.options.path}`,
      "max-age=-1",
      this.options.secure ? "secure" : "",
      `samesite=${this.options.sameSite}`,
    ]
      .filter(Boolean)
      .join("; ");

    document.cookie = cookie;
  }
}
