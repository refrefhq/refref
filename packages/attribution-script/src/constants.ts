export const FORM = {
  SELECTOR: "form[data-refref]",
  FIELD: "rfc",
} as const;

export const URL = {
  CODE_PARAM: "rfc",
} as const;

export const COOKIE = {
  CODE_KEY: "refref-unique-code",
  MAX_AGE: 90 * 24 * 60 * 60, // 90 days in seconds
} as const;
