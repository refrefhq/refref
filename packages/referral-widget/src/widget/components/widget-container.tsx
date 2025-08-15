import { useEffect } from "react";
import { Widget } from "./widget";
import { widgetStore } from "../../lib/store";
import { useStore } from "zustand";

export function WidgetContainer() {
  const { initialized, widgetElementSelector, setIsOpen } =
    useStore(widgetStore);

  useEffect(() => {
    if (!initialized) return;
    // Setup data attribute triggers
    const setupTriggers = () => {
      if (!widgetElementSelector) return;
      document.querySelectorAll(widgetElementSelector).forEach((element) => {
        element.addEventListener("click", () => {
          setIsOpen(true);
        });
      });
    };

    setupTriggers();
    const observer = new MutationObserver(setupTriggers);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [initialized, widgetElementSelector]);

  if (!initialized) {
    return null;
  }

  return <Widget />;
}
