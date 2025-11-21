"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DEFAULT_WIDGET_CSS_VARS } from "@refref/types";

interface WidgetPreviewProps {
  children: ReactNode;
  cssVariables?: Record<string, string>;
}

/**
 * Component that renders the widget preview inside a Shadow DOM to match
 * how the production widget is rendered (with CSS isolation).
 * This ensures the preview accurately reflects the actual widget styling.
 */
export function WidgetPreview({
  children,
  cssVariables = {},
}: WidgetPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Root | null>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    // Create shadow root if it doesn't exist
    if (!shadowRef.current) {
      shadowRef.current = hostRef.current.attachShadow({ mode: "open" });

      // Clone all stylesheets from the parent page into shadow DOM
      // This ensures Tailwind and other global styles are available
      const styleSheets = Array.from(document.styleSheets);

      for (const sheet of styleSheets) {
        try {
          // Try to access cssRules to check if we can read the stylesheet
          if (sheet.cssRules) {
            const cssText = Array.from(sheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");

            const style = document.createElement("style");
            style.textContent = cssText;
            shadowRef.current.appendChild(style);
          }
        } catch (e) {
          // CORS issues with external stylesheets - try to clone the link element
          if (sheet.href) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = sheet.href;
            shadowRef.current.appendChild(link);
          }
        }
      }
    }

    // Merge default CSS variables with passed ones (passed ones override defaults)
    const mergedCssVars = { ...DEFAULT_WIDGET_CSS_VARS, ...cssVariables };

    // Apply CSS variables using adoptedStyleSheets if available
    if (shadowRef.current) {
      try {
        const varsSheet = new CSSStyleSheet();
        const cssVars = Object.entries(mergedCssVars)
          .map(([key, value]) => `  ${key}: ${value};`)
          .join("\n");

        // Use :host for shadow DOM scoping (equivalent to :root in normal DOM)
        varsSheet.replaceSync(`:host {\n${cssVars}\n}`);

        // Set adopted stylesheets (only CSS variables, no parent styles)
        shadowRef.current.adoptedStyleSheets = [varsSheet];
      } catch (e) {
        // Fallback: create a style element if adoptedStyleSheets not supported
        const style = document.createElement("style");
        const cssVars = Object.entries(mergedCssVars)
          .map(([key, value]) => `  ${key}: ${value};`)
          .join("\n");
        style.textContent = `:host {\n${cssVars}\n}`;

        // Clear any existing styles and add only our CSS variables
        const existingStyle = shadowRef.current.querySelector(
          "style[data-css-vars]",
        );
        if (existingStyle) {
          existingStyle.remove();
        }
        style.setAttribute("data-css-vars", "true");
        shadowRef.current.appendChild(style);
      }
    }

    // Create React root container inside shadow DOM
    if (!rootRef.current && shadowRef.current) {
      const container = document.createElement("div");
      container.id = "shadow-preview-root";
      shadowRef.current.appendChild(container);
      rootRef.current = createRoot(container);
    }

    // Render children into shadow DOM
    if (rootRef.current) {
      rootRef.current.render(<>{children}</>);
    }

    // Cleanup
    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, [children, cssVariables]);

  return <div ref={hostRef} className="w-full h-full" />;
}
