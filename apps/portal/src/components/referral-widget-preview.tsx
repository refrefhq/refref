"use client";

import { ReferralWidgetContent } from "@refref/ui/components/referral-widget/referral-widget-dialog-content";

export default function ReferralWidgetPreview() {
  const referralLink = "acme.refref.ai/r/th5tdf";

  // Color values from screenshot
  const containerBgColor = "#23263a";
  const containerTextColor = "#fff";
  const primaryColor = "#a259ff"; // Purple button

  // Social channels in the order of the screenshot
  const enabledChannels: ("x" | "linkedin" | "email" | "share")[] = [
    "x",
    "linkedin",
    "email",
    "share",
  ];

  const widgetConfig = {
    position: "bottom-right" as const,
    triggerText: "Refer & Earn",
    buttonBgColor: primaryColor,
    buttonTextColor: containerTextColor,
    borderRadius: 25,
    icon: "gift" as const,
    title: "Refer friends, get rewards",
    subtitle: "Earn rewards for each referral",
    logoUrl: "",
    modalBgColor: containerBgColor,
    accentColor: primaryColor,
    textColor: containerTextColor,
    modalBorderRadius: 12,
    shareMessage: "Join me and get a reward!",
    enabledPlatforms: {
      facebook: false,
      twitter: enabledChannels.includes("x"),
      linkedin: enabledChannels.includes("linkedin"),
      whatsapp: false,
      email: enabledChannels.includes("email"),
      instagram: false,
      telegram: false,
    },
    referralLink: referralLink,
    productName: "YourSaaS",
  };

  return (
    <div className="flex items-center justify-center">
      <ReferralWidgetContent config={widgetConfig} />
    </div>
  );
}
