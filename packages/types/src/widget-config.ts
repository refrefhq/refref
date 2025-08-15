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
  buttonBgColor: z.string(),
  buttonTextColor: z.string(),
  borderRadius: z.number(),
  icon: widgetIconSchema,

  // Modal
  title: z.string(),
  subtitle: z.string(),
  logoUrl: z.string(),
  modalBgColor: z.string(),
  accentColor: z.string(),
  textColor: z.string(),
  modalBorderRadius: z.number(),

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
  buttonBgColor: "#3b82f6",
  buttonTextColor: "#ffffff",
  borderRadius: 25,
  icon: "gift",
  title: "Invite your friends",
  subtitle: "Share your referral link and earn rewards when your friends join!",
  logoUrl: "",
  modalBgColor: "#ffffff",
  accentColor: "#3b82f6",
  textColor: "#1f2937",
  modalBorderRadius: 12,
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
  referralLink: "https://yourapp.com/ref/user123",
  productName: "YourSaaS",
};
