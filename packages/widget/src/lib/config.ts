import { WidgetConfigType } from "@refref/types";

export const defaultConfig: WidgetConfigType = {
  position: "bottom-left",
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
