import { createStore } from "zustand/vanilla";
import { create } from "zustand";
import { WidgetConfigType, WidgetStore } from "@refref/types";
import { defaultConfig } from "./config";

export const widgetStore = createStore<WidgetStore>((set) => ({
  initialized: false,
  token: undefined,
  projectId: undefined,
  widgetElementSelector: null,
  isOpen: false,
  config: defaultConfig,
  participantId: "",
  referralLinks: {},
  setIsOpen: (isOpen) => set({ isOpen }),
  setToken: (token) => set({ token }),
  setConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setReferralLinks: (links) => set({ referralLinks: links }),
}));
