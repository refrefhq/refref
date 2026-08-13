/** Minimal dependency-free HTML rendering for the public invite page. */

export function escapeHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface InvitePageParams {
  referrerName: string | null;
  code: string;
  /** Absolute or root-relative path the form POSTs to. */
  actionPath: string;
  consentVersion: string;
  privacyPolicyUrl: string;
  primaryColor: string;
  turnstileSiteKey?: string;
  /** Carried-through UTM params to re-post as hidden fields. */
  utm?: Record<string, string>;
  /** Sticky field values + error message when re-rendering after a failure. */
  values?: { email?: string; firstName?: string };
  error?: string;
}

/**
 * Render the personalised referee landing page. Fields are intentionally
 * limited to first name + email (policy: no phone/DOB/financial data on a
 * referral form for a wealth product). Includes a honeypot field ("company")
 * and, if configured, a Cloudflare Turnstile widget.
 */
export function renderInvitePage(p: InvitePageParams): string {
  const who = p.referrerName ? escapeHtml(p.referrerName) : "A friend";
  const color = /^#[0-9A-Fa-f]{6}$/.test(p.primaryColor)
    ? p.primaryColor
    : "#4f46e5";
  const utmHidden = Object.entries(p.utm ?? {})
    .map(
      ([k, v]) =>
        `<input type="hidden" name="utm_${escapeHtml(k)}" value="${escapeHtml(v)}">`,
    )
    .join("");

  const turnstile = p.turnstileSiteKey
    ? `<div class="cf-turnstile" data-sitekey="${escapeHtml(p.turnstileSiteKey)}"></div>
       <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`
    : "";

  const errorBlock = p.error
    ? `<div class="error" role="alert">${escapeHtml(p.error)}</div>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>You've been invited to Welfie</title>
<style>
  :root { --brand: ${color}; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background:#f6f7f9; color:#111827; }
  .wrap { max-width: 460px; margin: 0 auto; padding: 48px 20px; }
  .card { background:#fff; border-radius:16px; padding:32px; box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 10px 30px rgba(0,0,0,.05); }
  h1 { font-size: 1.5rem; margin: 0 0 8px; }
  p.lead { color:#4b5563; margin: 0 0 24px; }
  label { display:block; font-size:.875rem; font-weight:600; margin: 16px 0 6px; }
  input[type=email], input[type=text] { width:100%; padding:12px 14px; border:1px solid #d1d5db; border-radius:10px; font-size:1rem; }
  input:focus { outline: 2px solid var(--brand); border-color: var(--brand); }
  .consent { display:flex; gap:10px; align-items:flex-start; margin:20px 0; font-size:.8125rem; color:#4b5563; }
  .consent input { margin-top:3px; }
  button { width:100%; margin-top:20px; padding:13px 16px; border:0; border-radius:10px; background:var(--brand); color:#fff; font-size:1rem; font-weight:600; cursor:pointer; }
  button:hover { filter: brightness(0.95); }
  .error { background:#fef2f2; color:#991b1b; border:1px solid #fecaca; padding:10px 12px; border-radius:10px; font-size:.875rem; margin-bottom:16px; }
  .hp { position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden; }
  .foot { text-align:center; color:#9ca3af; font-size:.75rem; margin-top:20px; }
  a { color: var(--brand); }
</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>${who} invited you to Welfie</h1>
      <p class="lead">Enter your details below and we'll get your Welfie account started.</p>
      ${errorBlock}
      <form method="post" action="${escapeHtml(p.actionPath)}" novalidate>
        <label for="firstName">First name</label>
        <input id="firstName" name="firstName" type="text" autocomplete="given-name"
               value="${escapeHtml(p.values?.firstName)}" maxlength="80">

        <label for="email">Email address</label>
        <input id="email" name="email" type="email" required autocomplete="email"
               value="${escapeHtml(p.values?.email)}" maxlength="254">

        <!-- Honeypot: real users never see or fill this. -->
        <div class="hp" aria-hidden="true">
          <label for="company">Company</label>
          <input id="company" name="company" type="text" tabindex="-1" autocomplete="off">
        </div>

        <div class="consent">
          <input id="consent" name="consent" type="checkbox" value="yes" required>
          <label for="consent" style="font-weight:400;margin:0;">
            I agree to Welfie contacting me about this referral and to the
            <a href="${escapeHtml(p.privacyPolicyUrl)}" target="_blank" rel="noopener">privacy policy</a>.
          </label>
        </div>

        <input type="hidden" name="consent_version" value="${escapeHtml(p.consentVersion)}">
        ${utmHidden}
        ${turnstile}
        <button type="submit">Continue to Welfie</button>
      </form>
      <p class="foot">Referral code: ${escapeHtml(p.code)}</p>
    </div>
  </div>
</body>
</html>`;
}
