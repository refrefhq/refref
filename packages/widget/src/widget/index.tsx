import styles from "@refref/ui/globals.css?inline";
import { createRoot } from "react-dom/client";
import { WidgetContainer } from "./components/widget-container";
import { initRefRef } from "@/lib/refref";
import { widgetStore } from "@/lib/store";

// Track if widget is already mounted to prevent duplicates
let widgetMounted = false;
let shadowHost: HTMLDivElement | null = null;

function initializeWidget() {
  if (document.readyState !== "loading") {
    setupWidget();
  } else {
    document.addEventListener("DOMContentLoaded", setupWidget);
  }
}

/**
 * Sets up the widget initialization listener.
 * Does not create shadow DOM - waits for store initialization.
 */
function setupWidget() {
  try {
    // Initialize RefRef API proxy and process any queued commands
    initRefRef();

    // Check if already initialized (for dev mode where store is pre-initialized)
    if (widgetStore.getState().initialized && !widgetMounted) {
      mountWidget();
      return;
    }

    // Subscribe to initialization state changes
    const unsubscribe = widgetStore.subscribe((state) => {
      if (state.initialized && !widgetMounted) {
        mountWidget();
        unsubscribe();
      }
    });
  } catch (error) {
    console.warn("Widget setup failed:", error);
  }
}

/**
 * Creates the shadow DOM and mounts the widget.
 * Only called after store is initialized with proper config.
 */
function mountWidget() {
  try {
    // Prevent duplicate mounting
    if (widgetMounted) {
      console.warn("Widget already mounted, skipping duplicate mount");
      return;
    }
    widgetMounted = true;

    // Get the actual config from the initialized store
    const config = widgetStore.getState().config;

    // Create shadow host element
    shadowHost = document.createElement("div");
    const shadow = shadowHost.attachShadow({ mode: "open" });

    // Create main stylesheet with :root replaced by :host
    // Reset inherited properties at shadow boundary, then apply widget styles
    // @link https://github.com/tailwindlabs/tailwindcss/discussions/1935
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(
      `:host { all: initial; }\n` + styles.replaceAll(":root", ":host"),
    );

    // Apply CSS variable overrides from actual config
    if (config.cssVariables && Object.keys(config.cssVariables).length > 0) {
      const varsSheet = new CSSStyleSheet();
      const cssVars = Object.entries(config.cssVariables)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join("\n");
      varsSheet.replaceSync(`:host {\n${cssVars}\n}`);
      shadow.adoptedStyleSheets = [sheet, varsSheet];
    } else {
      shadow.adoptedStyleSheets = [sheet];
    }

    // Create widget root container inside shadow DOM
    // Base classes here (not on :host) so dark mode variables apply correctly
    const shadowRoot = document.createElement("div");
    shadowRoot.id = "widget-root";
    shadowRoot.className = "bg-background text-foreground";

    // Detect and apply dark mode from parent page
    const updateDarkMode = () => {
      //! ignore for now
      return;
      const htmlHasDark = document.documentElement.classList.contains("dark");
      const bodyHasDark = document.body.classList.contains("dark");
      const systemPrefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)",
      ).matches;

      const shouldBeDark = htmlHasDark || bodyHasDark || systemPrefersDark;
      shadowRoot.classList.toggle("dark", shouldBeDark);
    };

    // Initial dark mode detection
    updateDarkMode();

    // Watch for dark mode changes on parent page
    const observer = new MutationObserver(updateDarkMode);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Watch for system preference changes
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    darkModeMediaQuery.addEventListener("change", updateDarkMode);

    const component = <WidgetContainer />;

    shadow.appendChild(shadowRoot);
    createRoot(shadowRoot).render(component);

    document.body.appendChild(shadowHost);

    console.log("Widget mounted successfully with config:", config);
  } catch (error) {
    console.warn("Widget mounting failed:", error);
  }
}

initializeWidget();
