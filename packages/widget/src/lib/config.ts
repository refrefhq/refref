import { WidgetConfigType } from "@refref/types";

export const defaultConfig: WidgetConfigType = {
  position: "bottom-left",
  triggerText: "Refer & Earn",
  borderRadius: 25,
  icon: "gift",
  title: "Invite your friends",
  subtitle: "Share your referral link and earn rewards when your friends join!",
  logoUrl: "",
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
  referralLink: "https://i.refref.ai/<ref_code>",
  productName: "YourSaaS",
};

export async function fetchConfig(
  clientKey: string,
): Promise<WidgetConfigType> {
  // TODO: Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // resolve(defaultConfig);
    }, 500);
  });
}
