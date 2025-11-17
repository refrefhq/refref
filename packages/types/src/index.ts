import { z } from "zod";
import {
  socialPlatformSchema,
  widgetConfigSchema,
  WidgetConfigType,
  widgetPositionSchema,
} from "./widget-config";

export * from "./program-config";
export * from "./program-template-steps";
export * from "./program-templates";
export * from "./widget-config";
export * from "./event-config";
export * from "./reward-config";

export const referralLinkSchema = z.object({
  code: z.string(),
  url: z.string(),
});
export type ReferralLinkType = z.infer<typeof referralLinkSchema>;

export type WidgetInitResponseType = WidgetConfigType;

export interface WidgetStore {
  initialized: boolean;
  token: string | null | undefined;
  productId: string | null | undefined;
  widgetElementSelector: string | null | undefined;
  isOpen: boolean;
  config: WidgetConfigType;
  participantId: string;
  referralLinks: Record<string, string>;
  setIsOpen: (isOpen: boolean) => void;
  setToken: (token: string | null | undefined) => void;
  setConfig: (config: Partial<WidgetConfigType>) => void;
  toggle: () => void;
  setReferralLinks: (links: Record<string, string>) => void;
}

/**
 * Allowed keys for setup steps. Extend this union as needed for new step types.
 */
export type SetupStepKeyType = "company" | "brand" | "reward";

// ActionTypeConfig Zod schema and type
export const actionTypeConfigSchema = z.object({
  schemaVersion: z.number(),
  tracking: z.object({
    method: z.enum(["automatic", "manual"]),
  }),
  verification: z.object({
    method: z.enum(["automatic", "manual"]),
  }),
});
export type ActionTypeConfigType = z.infer<typeof actionTypeConfigSchema>;

/**
 * JWT payload schema for authentication and authorization
 */
export const jwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  productId: z.string(),
});
export type JwtPayloadType = z.infer<typeof jwtPayloadSchema>;

export const widgetInitRequestSchema = z.object({
  productId: z.string(),
  refcode: z.string().optional(),
});
export type WidgetInitRequestType = z.infer<typeof widgetInitRequestSchema>;
