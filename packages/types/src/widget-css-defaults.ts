/**
 * Default CSS variables for the RefRef widget.
 * These values define the default theme and appearance of the widget.
 */
export const DEFAULT_WIDGET_CSS_VARS: Record<string, string> = {
  // Color System
  "--background": "oklch(1.0000 0 0)",
  "--foreground": "oklch(0.2686 0 0)",
  "--card": "oklch(1.0000 0 0)",
  "--card-foreground": "oklch(0.2686 0 0)",
  "--popover": "oklch(1.0000 0 0)",
  "--popover-foreground": "oklch(0.2686 0 0)",
  "--primary": "oklch(0.7686 0.1647 70.0804)",
  "--primary-foreground": "oklch(0 0 0)",
  "--secondary": "oklch(0.9670 0.0029 264.5419)",
  "--secondary-foreground": "oklch(0.4461 0.0263 256.8018)",
  "--muted": "oklch(0.9846 0.0017 247.8389)",
  "--muted-foreground": "oklch(0.5510 0.0234 264.3637)",
  "--accent": "oklch(0.9869 0.0214 95.2774)",
  "--accent-foreground": "oklch(0.4732 0.1247 46.2007)",
  "--destructive": "oklch(0.6368 0.2078 25.3313)",
  "--destructive-foreground": "oklch(1.0000 0 0)",
  "--border": "oklch(0.9276 0.0058 264.5313)",
  "--input": "oklch(0.9276 0.0058 264.5313)",
  "--ring": "oklch(0.7686 0.1647 70.0804)",

  // Chart Colors
  "--chart-1": "oklch(0.7686 0.1647 70.0804)",
  "--chart-2": "oklch(0.6658 0.1574 58.3183)",
  "--chart-3": "oklch(0.5553 0.1455 48.9975)",
  "--chart-4": "oklch(0.4732 0.1247 46.2007)",
  "--chart-5": "oklch(0.4137 0.1054 45.9038)",

  // Sidebar
  "--sidebar": "oklch(0.9846 0.0017 247.8389)",
  "--sidebar-foreground": "oklch(0.2686 0 0)",
  "--sidebar-primary": "oklch(0.7686 0.1647 70.0804)",
  "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
  "--sidebar-accent": "oklch(0.9869 0.0214 95.2774)",
  "--sidebar-accent-foreground": "oklch(0.4732 0.1247 46.2007)",
  "--sidebar-border": "oklch(0.9276 0.0058 264.5313)",
  "--sidebar-ring": "oklch(0.7686 0.1647 70.0804)",

  // Typography
  "--font-sans": "Inter, sans-serif",
  "--font-serif": "Source Serif 4, serif",
  "--font-mono": "JetBrains Mono, monospace",

  // Layout
  "--radius": "0.375rem",
  "--spacing": "0.25rem",

  // Tracking
  "--tracking-normal": "0em",

  // Shadows
  "--shadow-x": "0px",
  "--shadow-y": "4px",
  "--shadow-blur": "8px",
  "--shadow-spread": "-1px",
  "--shadow-opacity": "0.1",
  "--shadow-color": "hsl(0 0% 0%)",
  "--shadow-2xs": "0px 4px 8px -1px hsl(0 0% 0% / 0.05)",
  "--shadow-xs": "0px 4px 8px -1px hsl(0 0% 0% / 0.05)",
  "--shadow-sm":
    "0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10)",
  "--shadow":
    "0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10)",
  "--shadow-md":
    "0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 2px 4px -2px hsl(0 0% 0% / 0.10)",
  "--shadow-lg":
    "0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 4px 6px -2px hsl(0 0% 0% / 0.10)",
  "--shadow-xl":
    "0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 8px 10px -2px hsl(0 0% 0% / 0.10)",
  "--shadow-2xl": "0px 4px 8px -1px hsl(0 0% 0% / 0.25)",
};

/**
 * Type definition for widget CSS variables
 */
export type WidgetCSSVariables = typeof DEFAULT_WIDGET_CSS_VARS;
