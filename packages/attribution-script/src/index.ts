import { CookieManager } from "@/CookieManager";
import { FormManager } from "@/FormManager";
import { DOMObserver } from "@/DOMObserver";
import type { FormElement, AutoAttachMode, CookieOptions } from "@/types";
import { COOKIE, URL, DEFAULT_AUTO_ATTACH } from "@/constants";

// Add global type declaration
declare global {
  interface Window {
    RefRefAttribution: typeof RefRefAttribution;
  }
}

let cookieManager: CookieManager;
let formManager: FormManager;
let domObserver: DOMObserver | null = null;
let isInitialized = false;
let refrefUniqueCode: string | undefined;
let autoAttachMode: AutoAttachMode = DEFAULT_AUTO_ATTACH;

/**
 * Get the auto-attach mode from script tag attribute
 */
function getAutoAttachFromScriptTag(): AutoAttachMode | undefined {
  if (typeof document === "undefined") return undefined;

  const scripts = document.querySelectorAll("script[data-auto-attach]");
  const lastScript = scripts[scripts.length - 1]; // Use the last script tag if multiple exist

  if (lastScript) {
    const mode = lastScript.getAttribute("data-auto-attach") as AutoAttachMode;
    if (mode === "false" || mode === "data-refref" || mode === "all") {
      return mode;
    }
  }

  return undefined;
}

/**
 * Get cookie options from script tag data-cookie-options attribute
 * Parses JSON string with error handling
 */
function getCookieOptionsFromScriptTag(): CookieOptions | undefined {
  if (typeof document === "undefined") return undefined;

  const scripts = document.querySelectorAll("script[data-cookie-options]");
  const lastScript = scripts[scripts.length - 1];

  if (lastScript) {
    const jsonString = lastScript.getAttribute("data-cookie-options");
    if (jsonString) {
      try {
        return JSON.parse(jsonString) as CookieOptions;
      } catch (error) {
        console.warn(
          "Failed to parse data-cookie-options JSON, using defaults:",
          error,
        );
      }
    }
  }

  return undefined;
}

/**
 * Internal initialization function
 * Automatically called on page load, not exposed to users
 */
function init(): void {
  if (isInitialized) return;

  // Determine auto-attach mode from script tag
  const scriptTagMode = getAutoAttachFromScriptTag();
  autoAttachMode = scriptTagMode ?? DEFAULT_AUTO_ATTACH;

  // Get cookie options from script tag
  const scriptTagCookieOptions = getCookieOptionsFromScriptTag();

  cookieManager = new CookieManager(scriptTagCookieOptions);
  formManager = new FormManager();

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

  // Save to cookie if we have a code
  // This will refresh the cookie value/duration with the (new) code
  if (refrefUniqueCode) {
    cookieManager.set(COOKIE.CODE_KEY, refrefUniqueCode);
  }

  // Only attach to forms if we have a referral code
  if (refrefUniqueCode) {
    // Attach to all forms based on auto-attach mode
    formManager.attachToAll(autoAttachMode, refrefUniqueCode);

    // Start DOM observer for dynamic forms (only for 'all' and 'data-refref' modes)
    if (autoAttachMode !== "false") {
      domObserver = new DOMObserver(
        formManager,
        autoAttachMode,
        refrefUniqueCode,
      );
      domObserver.start();
    }
  }

  isInitialized = true;
}

const RefRefAttribution = {
  attachToAll(): void {
    if (!isInitialized) init();
    formManager.attachToAll(autoAttachMode, refrefUniqueCode);
  },

  attachTo(form: FormElement): void {
    if (!isInitialized) init();
    formManager.attachTo(form, refrefUniqueCode);
  },

  getCode(): string | undefined {
    if (!isInitialized) init();
    return refrefUniqueCode;
  },

  stopObserver(): void {
    if (domObserver) {
      domObserver.stop();
    }
  },
};

// Add to window object if in browser environment
if (typeof window !== "undefined") {
  window.RefRefAttribution = RefRefAttribution;

  // Initialize automatically when the DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init());
  } else {
    init();
  }
} else {
  console.error("RefRefAttribution is not supported in this environment");
}

export default RefRefAttribution;
