import "@refref/ui/globals.css";

import { useEffect, useState, useMemo } from "react";
import { WidgetContainer } from "./widget/components/widget-container";
import { widgetStore } from "./lib/store";
import { defaultConfig } from "./lib/config";
import { DEFAULT_WIDGET_CSS_VARS } from "@refref/types";

function App() {
  const [configJson, setConfigJson] = useState(
    JSON.stringify(
      {
        ...defaultConfig,
        position: "bottom-right",
        cssVariables: DEFAULT_WIDGET_CSS_VARS,
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
