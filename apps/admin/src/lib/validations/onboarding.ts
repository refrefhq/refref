import { z } from "zod";

export const appTypes = [
  "saas",
  "ecommerce",
  "mobile_app",
  "marketplace",
  "content_platform",
  "other",
] as const;

export const paymentProviders = [
  "stripe",
  "chargebee",
  "lemonsqueezy",
  "paddle",
  "other",
] as const;

// ───────────────────────────────────────────────────────────────
// Unified schema for the entire onboarding flow
// ───────────────────────────────────────────────────────────────
export const onboardingSchema = z
  .object({
    projectName: z.string().min(1, "Product name is required").max(100),
    projectUrl: z
      .string()
      .min(1, "Website URL is required")
      .transform((val) => {
        // Add https:// if no protocol is specified
        if (!val.match(/^https?:\/\//)) {
          return `https://${val}`;
        }
        return val;
      })
      .pipe(z.url({ message: "Please enter a valid URL" })),
    appType: z.enum(appTypes, {
      message: "Please select an app type",
    }),
    paymentProvider: z.enum(paymentProviders, {
      message: "Please select a payment provider",
    }),
    otherPaymentProvider: z.string(),
  })
  .refine(
    (data) => {
      // If "other" is selected, otherPaymentProvider must be provided
      if (data.paymentProvider === "other") {
        return (
          data.otherPaymentProvider &&
          data.otherPaymentProvider.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Please specify your payment provider",
      path: ["otherPaymentProvider"],
    },
  );

// ───────────────────────────────────────────────────────────────
// Step-level schemas derived from the master onboarding schema
// ───────────────────────────────────────────────────────────────

export const productInfoSchema = onboardingSchema.pick({
  projectName: true,
  projectUrl: true,
});

export const appTypeSchema = onboardingSchema.pick({
  appType: true,
});

export const paymentProviderSchema = onboardingSchema
  .pick({ paymentProvider: true, otherPaymentProvider: true })
  .refine(
    (data) => {
      if (data.paymentProvider === "other") {
        return (
          data.otherPaymentProvider &&
          data.otherPaymentProvider.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Please specify your payment provider",
      path: ["otherPaymentProvider"],
    },
  );

export type ProductInfoFormData = z.infer<typeof productInfoSchema>;
export type AppTypeFormData = z.infer<typeof appTypeSchema>;
export type PaymentProviderFormData = z.infer<typeof paymentProviderSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Type helpers for optional fields
export type AppType = (typeof appTypes)[number];
export type PaymentProvider = (typeof paymentProviders)[number];

export const appTypeLabels: Record<(typeof appTypes)[number], string> = {
  saas: "SaaS",
  ecommerce: "E-commerce",
  mobile_app: "Mobile App",
  marketplace: "Marketplace",
  content_platform: "Content Platform",
  other: "Other",
};

export const paymentProviderLabels: Record<
  (typeof paymentProviders)[number],
  string
> = {
  stripe: "Stripe",
  chargebee: "Chargebee",
  lemonsqueezy: "LemonSqueezy",
  paddle: "Paddle",
  other: "Other",
};
