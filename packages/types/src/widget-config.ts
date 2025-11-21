import { z } from "zod";

export const widgetPositionSchema = z.enum([
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
]);
export const socialPlatformSchema = z.enum([
  "facebook",
  "x",
  "linkedin",
  "whatsapp",
  "email",
  "instagram",
  "telegram",
]);
export const widgetIconSchema = z.enum(["gift", "heart", "star", "zap"]);

// WidgetConfig Zod schema and type
export const widgetConfigSchema = z.object({
  // Widget Button
  position: widgetPositionSchema,
  triggerText: z.string(),
  icon: widgetIconSchema,

  // Modal
  title: z.string(),
  subtitle: z.string(),
  logoUrl: z.string(),

  // Theme (CSS Variables)
  cssVariables: z.record(z.string(), z.string()).optional(),

  // Sharing
  shareMessage: z.string(),
  enabledPlatforms: z.object({
    facebook: z.boolean(),
    twitter: z.boolean(),
    linkedin: z.boolean(),
    whatsapp: z.boolean(),
    email: z.boolean(),
    instagram: z.boolean(),
    telegram: z.boolean(),
  }),

  // User data
  referralLink: z.string(),
  productName: z.string(),
});

export type WidgetConfigType = z.infer<typeof widgetConfigSchema>;

// Default widget configuration
export const defaultWidgetConfig: WidgetConfigType = {
  position: "bottom-right",
  triggerText: "Refer & Earn",
  icon: "gift",
  title: "Invite your friends",
  subtitle: "Share your referral link and earn rewards when your friends join!",
  logoUrl: "",
  shareMessage: "Join me on {productName} and get a reward!",
  enabledPlatforms: {
    facebook: true,
    twitter: true,
    linkedin: true,
    whatsapp: true,
    email: true,
    instagram: false,
    telegram: false,
  },
  referralLink: "https://i.refref.ai/<ref_code>",
  productName: "YourSaaS",
};
