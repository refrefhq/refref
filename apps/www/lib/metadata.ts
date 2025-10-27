import { Metadata } from "next";

export const baseUrl = new URL(
  process.env.NEXT_PUBLIC_APP_URL ?? "https://refref.ai",
);

export function createMetadata(metadata: Metadata): Metadata {
  return {
    ...metadata,
    title: {
      template: "%s | RefRef - Open Source Referral Management Platform",
      default: "RefRef - Open Source Referral Management Platform",
    },
    description:
      "Open Source Referral Management Platform. Launch your referral program in minutes.",
    metadataBase: baseUrl,
    openGraph: {
      title: "RefRef - Open Source Referral Management Platform",
      description:
        "Open Source Referral Management Platform. Launch your referral program in minutes.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "RefRef - Open Source Referral Management Platform",
      description:
        "Open Source Referral Management Platform. Launch your referral program in minutes.",
    },
  };
}
