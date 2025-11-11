import {
  WidgetConfigType,
  WidgetInitRequestType,
  WidgetInitResponseType,
} from "@refref/types";
import { widgetStore } from "@/lib/store";
import { defaultConfig } from "@/lib/config";

export interface RefRef {
  init: (params: {
    productId: string;
    participantId: string;
    token?: string;
    demo?: boolean;
  }) => Promise<void>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
  setConfig: (config: Partial<WidgetConfigType>) => void;
  getConfig: () => WidgetConfigType;
}

// Helper function to safely parse cookies
function getCookie(name: string): string | null {
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : null;
}

// Define the store state type
class RefRefImpl implements RefRef {
  private static instance: RefRefImpl;
  private store: typeof widgetStore;

  private constructor() {
    // Get the raw store API without the React hooks
    this.store = widgetStore;
  }

  static getInstance(): RefRefImpl {
    if (!RefRefImpl.instance) {
      RefRefImpl.instance = new RefRefImpl();
    }
    return RefRefImpl.instance;
  }

  async init({
    productId,
    participantId,
    token,
    demo = false,
  }: {
    productId: string;
    participantId: string;
    token?: string;
    demo?: boolean;
  }) {
    try {
      // Demo mode: if demo flag is true, skip API call
      if (demo) {
        console.log("Demo mode: Initializing without backend");

        // Use defaultConfig with demo-specific overrides
        const demoConfig = {
          ...defaultConfig,
          // Add widgetElementSelector for data attribute support
          widgetElementSelector: "[data-refref-trigger]",
          // Override with demo-specific referral link
          referralLink: "https://demo.refref.app/ref/DEMO123",
        };

        this.store.setState({
          initialized: true,
          token,
          participantId,
          productId,
          config: demoConfig as any,
        });

        console.log("Demo widget initialized with config: ", demoConfig);
        return;
      }

      // Normal mode: make API call
      // Check for referral code (RFC) to enable auto-attribution
      // 1. Query string parameters (freshest intent, works even with cookies blocked, available in SSR)
      // 2. Cookie (persistent across sessions and page navigations, but may be blocked by privacy settings)
      const urlParams = new URLSearchParams(window.location.search);
      const rfcFromQuery = urlParams.get("rfc");
      const rfcFromCookie = getCookie("refref-unique-code");

      // Query string takes priority as it represents the most recent referral click
      const referralCode = rfcFromQuery || rfcFromCookie || undefined;

      const response = await fetch("/api/scripts/widget/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productId,
          referralCode,
        } satisfies WidgetInitRequestType),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to initialize widget");
      }

      const data = (await response.json()) as WidgetInitResponseType;

      this.store.setState((state) => ({
        initialized: true,
        token,
        participantId,
        productId,
        config: {
          ...data,
        },
      }));

      console.log("Widget config: ", data);

      // this.setConfig(data);
    } catch (error) {
      console.error("Failed to initialize RefRef widget:", error);
      throw error;
    }
  }

  open() {
    this.store.setState({ isOpen: true });
  }

  close() {
    this.store.setState({ isOpen: false });
  }

  toggle() {
    this.store.setState((state) => ({ isOpen: !state.isOpen }));
  }

  get isOpen() {
    return this.store.getState().isOpen;
  }

  setConfig(config: Partial<WidgetConfigType>) {
    this.store.setState((state) => ({
      config: { ...state.config, ...config },
    }));
  }

  getConfig(): WidgetConfigType {
    return this.store.getState().config;
  }
}

// Initialize RefRef on window
// Hybrid proxy pattern: supports both .push and method calls forever

declare global {
  interface Window {
    RefRef: any;
  }
}

// Store the real API instance and command queue
let refRefApi: RefRef | null = null;
const commandQueue: Array<[keyof RefRef | "push", ...any[]]> = Array.isArray(
  window.RefRef,
)
  ? window.RefRef
  : [];

// Proxy handler to support both .push and method calls
const handler: ProxyHandler<any> = {
  get(_target, prop) {
    if (prop === "push") {
      return (cmd: [keyof RefRef, ...any[]]) => {
        if (refRefApi && typeof refRefApi[cmd[0]] === "function") {
          (refRefApi as any)[cmd[0]](...cmd.slice(1));
        } else {
          commandQueue.push(cmd);
        }
      };
    }
    // If API is ready and method exists, call it
    if (refRefApi && typeof refRefApi[prop as keyof RefRef] === "function") {
      return (...args: any[]) => (refRefApi as any)[prop](...args);
    }
    // Otherwise, queue the command
    return (...args: any[]) => {
      commandQueue.push([prop as keyof RefRef, ...args]);
    };
  },
  // Support property access for isOpen/getConfig
  getOwnPropertyDescriptor(_target, prop) {
    if (refRefApi && (prop === "isOpen" || prop === "getConfig")) {
      return {
        configurable: true,
        enumerable: true,
        value: (refRefApi as any)[prop],
      };
    }
    return undefined;
  },
};

window.RefRef = new Proxy({}, handler);

export const initRefRef = () => {
  const refRef = RefRefImpl.getInstance();
  refRefApi = refRef;
  // Process any queued commands
  while (commandQueue.length > 0) {
    const [method, ...args] = commandQueue.shift()!;
    if (typeof (refRef as any)[method] === "function") {
      (refRef as any)[method](...args);
    }
  }
  return refRef;
};
