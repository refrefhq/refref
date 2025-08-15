import { CookieManager } from "@/CookieManager";
import { FormManager } from "@/FormManager";
import type { AttributionConfig, FormElement } from "@/types";
import { COOKIE, URL, FORM } from "@/constants";

// Add global type declaration
declare global {
  interface Window {
    RefRefAttribution: typeof RefRefAttribution;
  }
}

let cookieManager: CookieManager;
let formManager: FormManager;
let isInitialized = false;
let refrefUniqueCode: string | undefined;

const RefRefAttribution = {
  init(config: AttributionConfig = {}): void {
    if (isInitialized) return;

    cookieManager = new CookieManager({
      enabled: config.cookieOptions?.enabled ?? true,
      ...config.cookieOptions,
      maxAge: COOKIE.MAX_AGE,
    });
    formManager = new FormManager(config.formOptions);
    // stored value in cookie if any
    const existingCodeInCookie = cookieManager.get(COOKIE.CODE_KEY);

    if (existingCodeInCookie) {
      refrefUniqueCode = existingCodeInCookie;
    }

    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get(URL.CODE_PARAM);

    if (codeFromUrl) {
      refrefUniqueCode = codeFromUrl;
    }

    if (!refrefUniqueCode) {
      isInitialized = true;
      return;
    }

    //! Save to cookie if cookies are enabled
    //! this will refresh the cookie value/duration with the (new) code
    if (cookieManager.enabled) {
      cookieManager.set(COOKIE.CODE_KEY, refrefUniqueCode);
    }
    // attach to all forms
    formManager.attachToAll(FORM.FIELD, refrefUniqueCode);

    isInitialized = true;
  },

  attachToAll(): void {
    if (!isInitialized) this.init();
    formManager.attachToAll(FORM.FIELD, refrefUniqueCode);
  },

  attachTo(form: FormElement): void {
    if (!isInitialized) this.init();
    formManager.attachTo(form, FORM.FIELD, refrefUniqueCode);
  },

  getCode(): string | undefined {
    if (!isInitialized) this.init();
    return refrefUniqueCode;
  },
};

// Add to window object if in browser environment
if (typeof window !== "undefined") {
  window.RefRefAttribution = RefRefAttribution;

  // Initialize automatically when the DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      RefRefAttribution.init(),
    );
  } else {
    RefRefAttribution.init();
  }
} else {
  console.error("RefRefAttribution is not supported in this environment");
}

export type { AttributionConfig };
export default RefRefAttribution;
