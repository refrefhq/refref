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
  values?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  error?: string;
}

/**
 * Render the personalised referee landing page. Includes a honeypot field
 * ("company") and, if configured, a Cloudflare Turnstile widget.
 */
export function renderInvitePage(p: InvitePageParams): string {
  const who = p.referrerName ? escapeHtml(p.referrerName) : "A friend";
  const color = brandColor(p.primaryColor);
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
<style>${baseStyles(color)}</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>${who} invited you to Welfie</h1>
      <p class="lead">Enter your details below and we'll get your Welfie account started.</p>
      ${errorBlock}
      <form method="post" action="${escapeHtml(p.actionPath)}" novalidate>
        <label for="referredBy">Referred by</label>
        <input id="referredBy" type="text" readonly tabindex="-1"
               value="${who}" aria-describedby="referredByHint">
        <p id="referredByHint" class="hint">This is who invited you and can't be changed.</p>

        <div class="row">
          <div>
            <label for="firstName">First name</label>
            <input id="firstName" name="firstName" type="text" autocomplete="given-name"
                   value="${escapeHtml(p.values?.firstName)}" maxlength="80">
          </div>
          <div>
            <label for="lastName">Last name</label>
            <input id="lastName" name="lastName" type="text" autocomplete="family-name"
                   value="${escapeHtml(p.values?.lastName)}" maxlength="80">
          </div>
        </div>

        <label for="email">Email address</label>
        <input id="email" name="email" type="email" required autocomplete="email"
               value="${escapeHtml(p.values?.email)}" maxlength="254">

        <label for="phone">Phone number</label>
        <input id="phone" name="phone" type="tel" autocomplete="tel"
               value="${escapeHtml(p.values?.phone)}" maxlength="32">

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

export interface JoinPageParams {
  /** Product the referral program belongs to, used in the page copy. */
  productName: string;
  /** Product the form posts back, carried as a hidden field. */
  productId: string;
  /** Absolute or root-relative path the form POSTs to. */
  actionPath: string;
  consentVersion: string;
  privacyPolicyUrl: string;
  primaryColor: string;
  turnstileSiteKey?: string;
  values?: { email?: string; firstName?: string };
  error?: string;
}

/**
 * Render the public "get your own referral link" form. Unlike the invite page
 * this has no referrer: an anonymous visitor identifies themselves by email
 * only, and receives a link they can share.
 */
export function renderJoinPage(p: JoinPageParams): string {
  const color = brandColor(p.primaryColor);
  const product = escapeHtml(p.productName);

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
<title>Get your ${product} referral link</title>
<style>${baseStyles(color)}</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Get your ${product} referral link</h1>
      <p class="lead">Enter your email and we'll create a personal link you can share. Come back with the same email any time to get the same link.</p>
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
            I agree to ${product} contacting me about this referral program and to the
            <a href="${escapeHtml(p.privacyPolicyUrl)}" target="_blank" rel="noopener">privacy policy</a>.
          </label>
        </div>

        <input type="hidden" name="productId" value="${escapeHtml(p.productId)}">
        <input type="hidden" name="consent_version" value="${escapeHtml(p.consentVersion)}">
        ${turnstile}
        <button type="submit">Get my link</button>
      </form>
    </div>
  </div>
</body>
</html>`;
}

export interface JoinSuccessPageParams {
  productName: string;
  referralLink: string;
  code: string;
  primaryColor: string;
}

/** Render the referral link handed back to an anonymous referrer. */
export function renderJoinSuccessPage(p: JoinSuccessPageParams): string {
  const color = brandColor(p.primaryColor);
  const product = escapeHtml(p.productName);
  const link = escapeHtml(p.referralLink);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Your ${product} referral link</title>
<style>${baseStyles(color)}
  .link { display:flex; gap:8px; margin-top:8px; }
  .link input { flex:1; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:.875rem; }
  .link button { width:auto; margin-top:0; padding:12px 16px; white-space:nowrap; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Your referral link is ready</h1>
      <p class="lead">Share this link with friends. When they sign up for ${product}, we'll credit the referral to you.</p>
      <label for="referralLink">Your link</label>
      <div class="link">
        <input id="referralLink" type="text" readonly value="${link}">
        <button type="button" id="copy">Copy</button>
      </div>
      <p class="foot">Referral code: ${escapeHtml(p.code)}</p>
    </div>
  </div>
  <script>
    document.getElementById("copy").addEventListener("click", function () {
      var input = document.getElementById("referralLink");
      input.select();
      navigator.clipboard.writeText(input.value).then(function () {
        var b = document.getElementById("copy");
        b.textContent = "Copied";
        setTimeout(function () { b.textContent = "Copy"; }, 2000);
      });
    });
  </script>
</body>
</html>`;
}

function brandColor(raw: string): string {
  return /^#[0-9A-Fa-f]{6}$/.test(raw) ? raw : "#4f46e5";
}

function baseStyles(color: string): string {
  return `
  :root { --brand: ${color}; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background:#f6f7f9; color:#111827; }
  .wrap { max-width: 460px; margin: 0 auto; padding: 48px 20px; }
  .card { background:#fff; border-radius:16px; padding:32px; box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 10px 30px rgba(0,0,0,.05); }
  h1 { font-size: 1.5rem; margin: 0 0 8px; }
  p.lead { color:#4b5563; margin: 0 0 24px; }
  label { display:block; font-size:.875rem; font-weight:600; margin: 16px 0 6px; }
  input[type=email], input[type=text], input[type=tel] { width:100%; padding:12px 14px; border:1px solid #d1d5db; border-radius:10px; font-size:1rem; }
  input:focus { outline: 2px solid var(--brand); border-color: var(--brand); }
  input[readonly] { background:#f3f4f6; color:#4b5563; cursor:default; }
  input[readonly]:focus { outline:none; border-color:#d1d5db; }
  p.hint { margin:6px 0 0; font-size:.75rem; color:#6b7280; }
  .row { display:flex; gap:12px; }
  .row > div { flex:1; min-width:0; }
  .consent { display:flex; gap:10px; align-items:flex-start; margin:20px 0; font-size:.8125rem; color:#4b5563; }
  .consent input { margin-top:3px; }
  button { width:100%; margin-top:20px; padding:13px 16px; border:0; border-radius:10px; background:var(--brand); color:#fff; font-size:1rem; font-weight:600; cursor:pointer; }
  button:hover { filter: brightness(0.95); }
  .error { background:#fef2f2; color:#991b1b; border:1px solid #fecaca; padding:10px 12px; border-radius:10px; font-size:.875rem; margin-bottom:16px; }
  .hp { position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden; }
  .foot { text-align:center; color:#9ca3af; font-size:.75rem; margin-top:20px; }
  a { color: var(--brand); }`;
}
