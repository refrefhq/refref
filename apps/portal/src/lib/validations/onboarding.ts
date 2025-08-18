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

export const productInfoSchema = z.object({
  projectName: z.string().min(1, "Product name is required").max(100),
  projectUrl: z.url({ message: "Please enter a valid URL" }),
});

export const appTypeSchema = z.object({
  appType: z.enum(appTypes, {
    message: "Please select an app type",
  }),
});

export const paymentProviderSchema = z.object({
  paymentProvider: z.enum(paymentProviders, {
    message: "Please select a payment provider",
  }),
  otherPaymentProvider: z.string().optional(),
});

export const onboardingSchema = z.object({
  projectName: z.string().min(1, "Product name is required").max(100),
  projectUrl: z.url({ message: "Please enter a valid URL" }),
  appType: z.enum(appTypes),
  paymentProvider: z.enum(paymentProviders),
  otherPaymentProvider: z.string().optional(),
});

export type ProductInfoFormData = z.infer<typeof productInfoSchema>;
export type AppTypeFormData = z.infer<typeof appTypeSchema>;
export type PaymentProviderFormData = z.infer<typeof paymentProviderSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;

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
