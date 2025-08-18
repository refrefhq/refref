export interface CookieOptions {
  enabled?: boolean;
  domain?: string;
  path?: string;
  maxAge?: number;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

export interface AttributionData {
  code?: string;
}

export interface AttributionConfig {
  cookieOptions?: CookieOptions;
  formOptions?: FormOptions;
}

export interface FormOptions {
  codeField?: string;
}

export interface FormElement extends HTMLFormElement {
  [key: string]: unknown;
}
