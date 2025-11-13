export const FORM = {
  SELECTOR: "form[data-refref]",
  FIELD: "refcode",
} as const;

export const URL = {
  CODE_PARAM: "refcode",
} as const;

export const COOKIE = {
  CODE_KEY: "refref-refcode",
  MAX_AGE: 90 * 24 * 60 * 60, // 90 days in seconds
} as const;
