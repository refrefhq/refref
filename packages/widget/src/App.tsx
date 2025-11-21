import "@refref/ui/globals.css";

import { useEffect, useState, useMemo } from "react";
import { WidgetContainer } from "./widget/components/widget-container";
import { widgetStore } from "./lib/store";
import { defaultConfig } from "./lib/config";

function App() {
  const [configJson, setConfigJson] = useState(
    JSON.stringify(
      {
        ...defaultConfig,
        position: "bottom-right",
        cssVariables: {
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
          "--chart-1": "oklch(0.7686 0.1647 70.0804)",
          "--chart-2": "oklch(0.6658 0.1574 58.3183)",
          "--chart-3": "oklch(0.5553 0.1455 48.9975)",
          "--chart-4": "oklch(0.4732 0.1247 46.2007)",
          "--chart-5": "oklch(0.4137 0.1054 45.9038)",
          "--sidebar": "oklch(0.9846 0.0017 247.8389)",
          "--sidebar-foreground": "oklch(0.2686 0 0)",
          "--sidebar-primary": "oklch(0.7686 0.1647 70.0804)",
          "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
          "--sidebar-accent": "oklch(0.9869 0.0214 95.2774)",
          "--sidebar-accent-foreground": "oklch(0.4732 0.1247 46.2007)",
          "--sidebar-border": "oklch(0.9276 0.0058 264.5313)",
          "--sidebar-ring": "oklch(0.7686 0.1647 70.0804)",
          "--font-sans": "Inter, sans-serif",
          "--font-serif": "Source Serif 4, serif",
          "--font-mono": "JetBrains Mono, monospace",
          "--radius": "0.375rem",
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
          "--tracking-normal": "0em",
          "--spacing": "0.25rem",
        },
      },
      null,
      2,
    ),
  );

  const [error, setError] = useState<string | null>(null);
  const [parsedConfig, setParsedConfig] = useState<any>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(configJson);
      setParsedConfig(parsed);
      widgetStore.setState({
        initialized: true,
        config: parsed,
      });
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [configJson]);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(configJson);
      setConfigJson(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e) {
      // Ignore format errors if JSON is invalid
    }
  };

  // Extract CSS variables from config to apply to the widget container
  const cssVariablesStyle = useMemo(() => {
    if (!parsedConfig?.cssVariables) return {};
    return parsedConfig.cssVariables as React.CSSProperties;
  }, [parsedConfig]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Referral Widget Development
            </h1>
            <p className="text-gray-600">
              Interactive playground for testing widget configurations and
              styles.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sample Content
            </h2>
            <div className="prose max-w-none text-gray-600">
              <p className="mb-4">
                This area simulates your main application content. The widget
                should float above this content in the configured position.
              </p>
              <p>
                Try modifying the configuration on the right to see real-time
                updates to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Widget position</li>
                <li>Colors and styling (via CSS variables)</li>
                <li>Text content and labels</li>
                <li>Enabled social platforms</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">
                Current Status
              </h3>
              <div className="flex items-center gap-2 text-blue-700">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Widget Initialized
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <h3 className="font-semibold text-green-900 mb-2">
                Active Config
              </h3>
              <div className="text-green-700 text-sm">
                {error ? "Invalid JSON" : "Valid Configuration"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Sidebar */}
      <div className="w-[500px] bg-white border-l border-gray-200 flex flex-col shadow-xl z-10">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <span>⚙️</span> Configuration
          </h2>
          <button
            onClick={handleFormat}
            className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Format JSON
          </button>
        </div>

        <div className="flex-1 relative flex flex-col">
          <textarea
            className="flex-1 w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none"
            value={configJson}
            onChange={(e) => setConfigJson(e.target.value)}
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-t border-red-100">
            <div className="flex items-start gap-2 text-red-600 text-sm">
              <span className="font-bold">Error:</span>
              <span className="font-mono break-all">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Wrapper to apply CSS variables */}
      <div style={cssVariablesStyle}>
        <WidgetContainer />
      </div>
    </div>
  );
}

export default App;
