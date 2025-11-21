"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

// Default CSS variables for the widget (light mode values from ui/globals.css)
// These match the production widget's default theme
const DEFAULT_WIDGET_CSS_VARS: Record<string, string> = {
  "--background": "oklch(1 0 0)",
  "--foreground": "oklch(0.145 0 0)",
  "--card": "oklch(1 0 0)",
  "--card-foreground": "oklch(0.145 0 0)",
  "--popover": "oklch(1 0 0)",
  "--popover-foreground": "oklch(0.145 0 0)",
  "--primary": "oklch(0.205 0 0)",
  "--primary-foreground": "oklch(0.985 0 0)",
  "--secondary": "oklch(0.97 0 0)",
  "--secondary-foreground": "oklch(0.205 0 0)",
  "--muted": "oklch(0.97 0 0)",
  "--muted-foreground": "oklch(0.556 0 0)",
  "--accent": "oklch(0.97 0 0)",
  "--accent-foreground": "oklch(0.205 0 0)",
  "--destructive": "oklch(0.577 0.245 27.325)",
  "--destructive-foreground": "oklch(0.577 0.245 27.325)",
  "--border": "oklch(0.922 0 0)",
  "--input": "oklch(0.922 0 0)",
  "--ring": "oklch(0.708 0 0)",
  "--radius": "0.625rem",
};

interface ShadowDomPreviewProps {
  children: ReactNode;
  cssVariables?: Record<string, string>;
}

/**
 * Component that renders its children inside a Shadow DOM to match
 * how the production widget is rendered (with CSS isolation).
 * This ensures the preview accurately reflects the actual widget styling.
 */
export function ShadowDomPreview({
  children,
  cssVariables = {},
}: ShadowDomPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Root | null>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    // Create shadow root if it doesn't exist
    if (!shadowRef.current) {
      shadowRef.current = hostRef.current.attachShadow({ mode: "open" });
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
