/**
 * Abuse / fraud controls for the public referee form.
 *
 * The invite form is genuinely public: anyone holding a valid code can POST it.
 * These are the application-layer checks. Per the implementation plan, per-IP
 * and per-code RATE LIMITS plus WAF/CAPTCHA live at the reverse proxy; this
 * module covers what only the application can know (self-referral, disposable
 * domains, honeypot).
 */

/** A compact, curated disposable/temporary-email domain blocklist. */
export const DISPOSABLE_DOMAINS = new Set<string>([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "throwawaymail.com",
  "yopmail.com",
  "getnada.com",
  "trashmail.com",
  "sharklasers.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
  "mailnesia.com",
  "mohmal.com",
  "mintemail.com",
  "spam4.me",
  "emailondeck.com",
  "tempinbox.com",
  "discard.email",
  "byom.de",
]);

/** Common free consumer providers — a shared domain here is NOT self-referral. */
export const FREE_EMAIL_PROVIDERS = new Set<string>([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.com.au",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "live.com.au",
  "msn.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "bigpond.com",
  "bigpond.net.au",
  "optusnet.com.au",
  "iinet.net.au",
]);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return null;
  return email.slice(at + 1).toLowerCase();
}

/** Basic shape check; the real validator is zod at the route, this is a guard. */
export function looksLikeEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isDisposableEmail(
  email: string,
  extraDomains: ReadonlySet<string> = new Set(),
): boolean {
  const domain = emailDomain(email);
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain) || extraDomains.has(domain);
}

export type SelfReferralReason = "same_email" | "same_domain" | null;

/**
 * Detect obvious self-referral: the referee using the referrer's own address,
 * or the referrer's *custom* (non-free) email domain. Sharing gmail.com is not
 * treated as self-referral. IP-based self-referral is handled at the proxy.
 */
export function selfReferralReason(
  refereeEmail: string,
  referrer: { email?: string | null },
): SelfReferralReason {
  if (!referrer.email) return null;
  const referee = normalizeEmail(refereeEmail);
  const ref = normalizeEmail(referrer.email);
  if (referee === ref) return "same_email";

  const refereeDomain = emailDomain(referee);
  const refDomain = emailDomain(ref);
  if (
    refereeDomain &&
    refDomain &&
    refereeDomain === refDomain &&
    !FREE_EMAIL_PROVIDERS.has(refDomain)
  ) {
    return "same_domain";
  }
  return null;
}

/** Parse a comma/space separated env list of extra disposable domains. */
export function parseExtraDisposableDomains(
  raw: string | undefined,
): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(/[\s,]+/)
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean),
  );
}
