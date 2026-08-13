import { parseExtraDisposableDomains } from "./abuse.js";

/**
 * Runtime configuration for the refer app, read once from the environment.
 * Kept in one place so the reverse-proxy / infra contract is explicit.
 */
export interface ReferConfig {
  /** Path prefix the app is mounted under at the proxy, e.g. "/refer". */
  basePath: string;
  /** Public origin that serves /:code redirects, used to build referral links. */
  referralHostUrl: string;
  /** Where the friend is sent after submitting, e.g. https://welfie.com/signup */
  signupUrl: string;
  /** Consent copy version stored with each lead. */
  consentVersion: string;
  /** Link shown next to the consent checkbox. */
  privacyPolicyUrl: string;
  /** Hand-off token TTL in minutes. */
  handoffTtlMinutes: number;
  /** Extra disposable domains to reject, on top of the built-in list. */
  extraDisposableDomains: Set<string>;
  /** Optional Cloudflare Turnstile site key (renders the widget if set). */
  turnstileSiteKey?: string;
  /** Optional Cloudflare Turnstile secret (server-side verification if set). */
  turnstileSecret?: string;
}

function normalizeBasePath(raw: string | undefined): string {
  if (!raw) return "";
  let p = raw.trim();
  if (p === "/" || p === "") return "";
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

function stripTrailingSlash(raw: string): string {
  const v = raw.trim();
  return v.endsWith("/") ? v.slice(0, -1) : v;
}

export function loadReferConfig(env: NodeJS.ProcessEnv = process.env): ReferConfig {
  return {
    basePath: normalizeBasePath(env.REFER_BASE_PATH),
    referralHostUrl: stripTrailingSlash(
      env.REFERRAL_HOST_URL || "http://localhost:3002",
    ),
    signupUrl: env.WELFIE_SIGNUP_URL || "https://welfie.com/signup",
    consentVersion: env.REFERRAL_CONSENT_VERSION || "privacy-2026-08",
    privacyPolicyUrl:
      env.PRIVACY_POLICY_URL || "https://welfie.com/privacy",
    handoffTtlMinutes: Number(env.HANDOFF_TTL_MINUTES) || 10,
    extraDisposableDomains: parseExtraDisposableDomains(
      env.DISPOSABLE_DOMAINS_EXTRA,
    ),
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || undefined,
    turnstileSecret: env.TURNSTILE_SECRET || undefined,
  };
}

/** Server-side Cloudflare Turnstile verification. No-op pass if not configured. */
export async function verifyTurnstile(
  config: ReferConfig,
  token: string | undefined,
  remoteIp?: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!config.turnstileSecret) return true; // not enforced
  if (!token) return false;
  try {
    const body = new URLSearchParams({
      secret: config.turnstileSecret,
      response: token,
    });
    if (remoteIp) body.set("remoteip", remoteIp);
    const res = await fetchImpl(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
