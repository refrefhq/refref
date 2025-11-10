import "@refref/ui/globals.css";

import { useEffect } from "react";
import { WidgetContainer } from "./widget/components/widget-container";
import { widgetStore } from "./lib/store";
import { fetchConfig } from "./lib/config";
import { useStore } from "zustand";

function App() {
  // const setConfig = useWidgetStore((state) => state.setConfig);

  // useEffect(() => {
  //   fetchConfig("dev-client-key")
  //     .then((config) => {
  //       setConfig(config);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching config:", error);
  //     });
  // }, []);

  const config = useStore(widgetStore, (state) => state.config);
  useEffect(() => {
    console.log("Config: ", config);
  }, [config]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Referral Widget Development</h1>
        <p className="mb-8 text-gray-600">
          This is a development environment for the referral widget. The widget
          should appear in the bottom-right corner.
        </p>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Content</h2>
          <p className="mb-4">
            This content helps simulate how the widget would appear alongside
            real content. The widget should overlay this content properly.
          </p>
        </div>
      </div>
      <WidgetContainer />
    </div>
  );
}

export default App;
