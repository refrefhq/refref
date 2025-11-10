import styles from "@refref/ui/globals.css?inline";
import { createRoot } from "react-dom/client";
import { WidgetContainer } from "./components/widget-container";
import { initRefRef } from "@/lib/refref";

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

    // @link https://github.com/tailwindlabs/tailwindcss/discussions/1935
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles.replaceAll(":root", ":host"));
    shadow.adoptedStyleSheets = [sheet];

    const shadowRoot = document.createElement("div");
    shadowRoot.id = "widget-root";
    shadowRoot.classList.toggle(
      "dark",
      document.documentElement.classList.contains("dark"),
    );

    const component = <WidgetContainer />;

    shadow.appendChild(shadowRoot);
    createRoot(shadowRoot).render(component);

    document.body.appendChild(element);
  } catch (error) {
    console.warn("Widget initialization failed:", error);
  }
}

function getClientKey() {
  const script = document.currentScript as HTMLScriptElement;
  const clientKey = script?.getAttribute("data-client-key") || "test";

  if (!clientKey) {
    throw new Error("Missing data-client-key attribute");
  }

  return clientKey;
}

initializeWidget();
