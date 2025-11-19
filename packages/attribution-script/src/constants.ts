import type { AutoAttachMode } from "@/types";

export const DEFAULT_AUTO_ATTACH: AutoAttachMode = "data-refref";

export const FORM = {
  SELECTOR: "form[data-refref]",
  SELECTOR_ALL: "form",
  FIELD: "refcode",
} as const;

export const URL = {
  CODE_PARAM: "refcode",
} as const;

export const COOKIE = {
  CODE_KEY: "refref-refcode",
  MAX_AGE: 90 * 24 * 60 * 60, // 90 days in seconds
} as const;
