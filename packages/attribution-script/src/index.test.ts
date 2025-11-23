import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Helper to clear all cookies
function clearAllCookies() {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim() ?? "";
    document.cookie = `${name}=; Max-Age=-1; Path=/`;
  });
}

// Helper to get cookie value
function getCookie(name: string): string | null {
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  return value ? decodeURIComponent(value) : null;
}

// Helper to create a form element
function createForm(withDataRefRef = false): HTMLFormElement {
  const form = document.createElement("form");
  if (withDataRefRef) {
    form.setAttribute("data-refref", "");
  }
  document.body.appendChild(form);
  return form;
}

// Helper to get hidden field value from form
function getHiddenFieldValue(form: HTMLFormElement): string | null {
  const field = form.querySelector(
    'input[type="hidden"][name="refcode"]',
  ) as HTMLInputElement;
  return field ? field.value : null;
}

// Helper to check if form has hidden field
function hasHiddenField(form: HTMLFormElement): boolean {
  return !!form.querySelector('input[type="hidden"][name="refcode"]');
}

// Helper to create a script tag with config attributes
function createConfigScript(
  autoAttach?: string,
  cookieOptions?: string,
): HTMLScriptElement {
  const script = document.createElement("script");
  if (autoAttach !== undefined) {
    script.setAttribute("data-auto-attach", autoAttach);
  }
  if (cookieOptions !== undefined) {
    script.setAttribute("data-cookie-options", cookieOptions);
  }
  document.head.appendChild(script);
  return script;
}

describe("RefRef Attribution Script - End-to-End Tests", () => {
  let cleanupScripts: HTMLScriptElement[] = [];

  beforeEach(() => {
    // Stop any running observers from previous tests
    if (window.RefRefAttribution) {
      try {
        window.RefRefAttribution.stopObserver();
      } catch (e) {
        // Ignore errors if already stopped
      }
    }

    // Reset window.RefRefAttribution
    // @ts-ignore
    delete window.RefRefAttribution;

    // Reset modules to allow fresh initialization
    vi.resetModules();

    // Clear all cookies
    clearAllCookies();

    // Clear document body and head
    document.body.innerHTML = "";
    cleanupScripts.forEach((script) => script.remove());
    cleanupScripts = [];

    // Clear any existing script tags with config attributes
    document
      .querySelectorAll("script[data-auto-attach], script[data-cookie-options]")
      .forEach((script) => script.remove());
  });

  afterEach(() => {
    // Stop any running observers
    if (window.RefRefAttribution) {
      try {
        window.RefRefAttribution.stopObserver();
      } catch (e) {
        // Ignore errors
      }
    }

    // Cleanup
    cleanupScripts.forEach((script) => script.remove());
    clearAllCookies();
  });

  describe("Auto-attach modes", () => {
    it('should only attach to forms with data-refref attribute in default "data-refref" mode', async () => {
      // Setup environment
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=TEST123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      // Create forms BEFORE loading script
      const formWith = createForm(true);
      const formWithout = createForm(false);

      // Load script (auto-initializes)
      await import("./index");

      // Wait for initialization
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify behavior
      expect(hasHiddenField(formWith)).toBe(true);
      expect(getHiddenFieldValue(formWith)).toBe("TEST123");
      expect(hasHiddenField(formWithout)).toBe(false);
    });

    it('should attach to all forms in "all" mode', async () => {
      // Setup environment
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=TEST123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      // Create config script tag
      const script = createConfigScript("all");
      cleanupScripts.push(script);

      // Create forms
      const form1 = createForm(true);
      const form2 = createForm(false);
      const form3 = createForm(false);

      // Load script
      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      // All forms should have hidden field
      expect(hasHiddenField(form1)).toBe(true);
      expect(getHiddenFieldValue(form1)).toBe("TEST123");
      expect(hasHiddenField(form2)).toBe(true);
      expect(getHiddenFieldValue(form2)).toBe("TEST123");
      expect(hasHiddenField(form3)).toBe(true);
      expect(getHiddenFieldValue(form3)).toBe("TEST123");
    });

    it('should not attach to any forms in "false" mode', async () => {
      // Setup environment
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=TEST123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      // Create config script tag
      const script = createConfigScript("false");
      cleanupScripts.push(script);

      // Create forms
      const form1 = createForm(true);
      const form2 = createForm(false);

      // Load script
      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      // No automatic attachment
      expect(hasHiddenField(form1)).toBe(false);
      expect(hasHiddenField(form2)).toBe(false);
    });
  });

  describe("Cookie configuration", () => {
    it("should set cookie with default options", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=TEST123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      const setSpy = vi.spyOn(document, "cookie", "set");

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Cookie should be set
      expect(getCookie("refref-refcode")).toBe("TEST123");

      // Verify default options
      const cookieString = setSpy.mock.calls[0]?.[0];
      expect(cookieString).toBeDefined();
      expect(cookieString).toContain("Path=/");
      expect(cookieString).toContain("Max-Age=7776000");
      expect(cookieString).toContain("SameSite=Lax");

      setSpy.mockRestore();
    });

    it("should apply custom cookie options from data-cookie-options", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=TEST123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      // Create config script with custom cookie options
      const script = createConfigScript(
        undefined,
        JSON.stringify({
          Domain: ".example.com",
          "Max-Age": 3600,
          SameSite: "Strict",
        }),
      );
      cleanupScripts.push(script);

      const setSpy = vi.spyOn(document, "cookie", "set");

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      const cookieString = setSpy.mock.calls[0]?.[0];
      expect(cookieString).toContain("Domain=.example.com");
      expect(cookieString).toContain("Max-Age=3600");
      expect(cookieString).toContain("SameSite=Strict");

      setSpy.mockRestore();
    });

    it("should auto-detect Secure attribute on HTTPS", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=TEST123", protocol: "https:" },
        writable: true,
        configurable: true,
      });

      const setSpy = vi.spyOn(document, "cookie", "set");

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      const cookieString = setSpy.mock.calls[0]?.[0];
      expect(cookieString).toContain("Secure");

      setSpy.mockRestore();
    });

    it("should NOT add Secure attribute on HTTP", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=TEST123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      const setSpy = vi.spyOn(document, "cookie", "set");

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      const cookieString = setSpy.mock.calls[0]?.[0];
      expect(cookieString).not.toContain("Secure");

      setSpy.mockRestore();
    });

    it("should handle invalid JSON in data-cookie-options gracefully", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=TEST123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Create script with invalid JSON
      const script = createConfigScript(undefined, "{invalid-json}");
      cleanupScripts.push(script);

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to parse data-cookie-options JSON"),
        expect.anything(),
      );

      // Cookie should still be set with defaults
      expect(getCookie("refref-refcode")).toBe("TEST123");

      consoleWarnSpy.mockRestore();
    });
  });

  describe("Referral code handling", () => {
    it("should extract refcode from URL parameter and set cookie", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=URL123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(getCookie("refref-refcode")).toBe("URL123");
      expect(window.RefRefAttribution.getCode()).toBe("URL123");
    });

    it("should use existing cookie value when no URL parameter", async () => {
      // Set cookie manually before loading script
      document.cookie = "refref-refcode=EXISTING123; Path=/";

      Object.defineProperty(window, "location", {
        value: { search: "", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(window.RefRefAttribution.getCode()).toBe("EXISTING123");
    });

    it("should refresh cookie when URL parameter overrides existing cookie", async () => {
      // Set old cookie
      document.cookie = "refref-refcode=OLD123; Path=/";

      Object.defineProperty(window, "location", {
        value: { search: "?refcode=NEW123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(getCookie("refref-refcode")).toBe("NEW123");
      expect(window.RefRefAttribution.getCode()).toBe("NEW123");
    });

    it("should NOT attach to forms when no referral code exists", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      // Create forms
      const form1 = createForm(true);
      const form2 = createForm(false);

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      // No forms should have hidden fields (no refcode)
      expect(hasHiddenField(form1)).toBe(false);
      expect(hasHiddenField(form2)).toBe(false);
    });
  });

  describe("Dynamic form detection", () => {
    it("should attach to dynamically added forms in 'all' mode", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=DYNAMIC123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      const script = createConfigScript("all");
      cleanupScripts.push(script);

      // Load script first
      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Then add form dynamically
      const dynamicForm = createForm(false);

      // Wait for MutationObserver
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(hasHiddenField(dynamicForm)).toBe(true);
      expect(getHiddenFieldValue(dynamicForm)).toBe("DYNAMIC123");
    });

    it("should attach to dynamically added forms with data-refref in 'data-refref' mode", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=DYNAMIC123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      // Load script (default mode is "data-refref")
      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Add forms dynamically
      const formWith = createForm(true);
      const formWithout = createForm(false);

      // Wait for MutationObserver
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(hasHiddenField(formWith)).toBe(true);
      expect(getHiddenFieldValue(formWith)).toBe("DYNAMIC123");
      expect(hasHiddenField(formWithout)).toBe(false);
    });

    it("should detect forms added inside containers", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=CONTAINER123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      const script = createConfigScript("all");
      cleanupScripts.push(script);

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Add container with form inside
      const container = document.createElement("div");
      const form = document.createElement("form");
      container.appendChild(form);
      document.body.appendChild(container);

      // Wait for MutationObserver
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(hasHiddenField(form)).toBe(true);
      expect(getHiddenFieldValue(form)).toBe("CONTAINER123");
    });
  });

  describe("Public API", () => {
    it("should expose window.RefRefAttribution.getCode()", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=API123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(window.RefRefAttribution).toBeDefined();
      expect(typeof window.RefRefAttribution.getCode).toBe("function");
      expect(window.RefRefAttribution.getCode()).toBe("API123");
    });

    it("should return undefined from getCode() when no referral code", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(window.RefRefAttribution.getCode()).toBeUndefined();
    });

    it("should allow manual form attachment via attachTo()", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=MANUAL123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      const script = createConfigScript("false");
      cleanupScripts.push(script);

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      const form = createForm(false);

      // Forms should NOT be attached automatically
      expect(hasHiddenField(form)).toBe(false);

      // Manually attach using API
      window.RefRefAttribution.attachTo(form);

      // Now it should be attached
      expect(hasHiddenField(form)).toBe(true);
      expect(getHiddenFieldValue(form)).toBe("MANUAL123");
    });

    it("should stop MutationObserver via stopObserver()", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=STOP123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      const script = createConfigScript("all");
      cleanupScripts.push(script);

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Stop observer
      window.RefRefAttribution.stopObserver();

      // Add form after stopping
      const form = createForm(false);

      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should NOT be attached (observer stopped)
      expect(hasHiddenField(form)).toBe(false);
    });
  });

  describe("Multiple forms", () => {
    it("should attach to multiple forms on the page", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=MULTI123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      const script = createConfigScript("all");
      cleanupScripts.push(script);

      // Create multiple forms
      const forms = Array.from({ length: 5 }, () => createForm(false));

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      // All forms should have hidden field
      forms.forEach((form) => {
        expect(hasHiddenField(form)).toBe(true);
        expect(getHiddenFieldValue(form)).toBe("MULTI123");
      });
    });

    it("should use field name 'refcode' for all hidden inputs", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=FIELDNAME123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      const form = createForm(true);

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      const hiddenField = form.querySelector(
        'input[type="hidden"]',
      ) as HTMLInputElement;
      expect(hiddenField).toBeTruthy();
      expect(hiddenField.name).toBe("refcode");
      expect(hiddenField.value).toBe("FIELDNAME123");
    });
  });

  describe("Script tag configuration", () => {
    it("should use last script tag when multiple exist", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=TEST123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      // Create multiple script tags
      const script1 = createConfigScript("false");
      const script2 = createConfigScript("all"); // This should win
      cleanupScripts.push(script1, script2);

      const form = createForm(false);

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should use "all" mode (from last script tag)
      expect(hasHiddenField(form)).toBe(true);
    });

    it("should fall back to default when no config script exists", async () => {
      Object.defineProperty(window, "location", {
        value: { search: "?refcode=DEFAULT123", protocol: "http:" },
        writable: true,
        configurable: true,
      });

      const formWith = createForm(true);
      const formWithout = createForm(false);

      await import("./index");
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should use default "data-refref" mode
      expect(hasHiddenField(formWith)).toBe(true);
      expect(hasHiddenField(formWithout)).toBe(false);
    });
  });
});
