import styles from "@refref/ui/globals.css?inline";
import { createRoot } from "react-dom/client";
import { WidgetContainer } from "./components/widget-container";
import { initRefRef } from "@/lib/refref";
import { widgetStore } from "@/lib/store";

function initializeWidget() {
  if (document.readyState !== "loading") {
    onReady();
  } else {
    document.addEventListener("DOMContentLoaded", onReady);
  }
}

function onReady() {
  try {
    // Initialize RefRef and process any queued commands
    initRefRef();

    const element = document.createElement("div");
    const shadow = element.attachShadow({ mode: "open" });

    // Get config from store to check for CSS variable overrides
    const config = widgetStore.getState().config;

    // @link https://github.com/tailwindlabs/tailwindcss/discussions/1935
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles.replaceAll(":root", ":host"));

    // Apply CSS variable overrides if provided
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

    const shadowRoot = document.createElement("div");
    shadowRoot.id = "widget-root";

    // Detect and apply dark mode from parent page
    const updateDarkMode = () => {
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

    document.body.appendChild(element);
  } catch (error) {
    console.warn("Widget initialization failed:", error);
  }
}

initializeWidget();
