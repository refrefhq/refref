import { WidgetConfigType, RewardConfigType } from "@refref/types";

interface BrandConfig {
  primaryColor: string;
}

/**
 * Generates a share message based on reward configuration
 */
function generateShareMessage(
  rewardConfig: RewardConfigType,
  productName: string,
): string {
  const messages: string[] = [];

  // Add referee reward message
  if (rewardConfig.referee) {
    const { valueType, value } = rewardConfig.referee;
    if (valueType === "percentage") {
      messages.push(`Get ${value}% off your first purchase`);
    } else {
      messages.push(`Get $${value} off your first purchase`);
    }
  }

  // Add referrer reward message
  if (rewardConfig.referrer) {
    const { valueType, value } = rewardConfig.referrer;
    if (valueType === "percentage") {
      messages.push(`and I'll earn ${value}% cashback`);
    } else {
      messages.push(`and I'll earn $${value}`);
    }
  }

  // Combine messages
  if (messages.length > 0) {
    return `Join ${productName}! ${messages.join(" ")}`;
  }

  // Default message if no rewards configured
  return `Join me on ${productName} and get exclusive rewards!`;
}

/**
 * Generates widget subtitle based on reward configuration
 */
function generateWidgetSubtitle(rewardConfig: RewardConfigType): string {
  const messages: string[] = [];

  if (rewardConfig.referrer) {
    const { valueType, value } = rewardConfig.referrer;
    if (valueType === "percentage") {
      messages.push(`Earn ${value}% on referrals`);
    } else {
      messages.push(`Earn $${value} per referral`);
    }
  }

  if (rewardConfig.referee) {
    const { valueType, value } = rewardConfig.referee;
    if (valueType === "percentage") {
      messages.push(`Friends get ${value}% off`);
    } else {
      messages.push(`Friends get $${value} off`);
    }
  }

  if (messages.length > 0) {
    return messages.join(" • ");
  }

  return "Share your referral link and earn rewards when your friends join!";
}

/**
 * Generates a complete widget configuration from brand and reward settings
 */
export function generateWidgetConfigFromTemplate(
  brandConfig: BrandConfig,
  rewardConfig?: RewardConfigType,
  productName: string = "Our Platform",
): WidgetConfigType {
  // Use primary color for UI elements
  const primaryColor = brandConfig.primaryColor || "#3b82f6";

  // Generate dynamic content based on rewards
  const subtitle = rewardConfig
    ? generateWidgetSubtitle(rewardConfig)
    : "Share your referral link and earn rewards when your friends join!";

  const shareMessage = rewardConfig
    ? generateShareMessage(rewardConfig, productName)
    : `Join me on ${productName} and get exclusive rewards!`;

  return {
    // Widget Button
    position: "bottom-right",
    triggerText: "Refer & Earn",
    borderRadius: 25,
    icon: "gift",

    // Modal
    title: "Invite your friends",
    subtitle,
    logoUrl: "",
    modalBorderRadius: 12,

    // Sharing
    shareMessage,
    enabledPlatforms: {
      facebook: true,
      twitter: true,
      linkedin: true,
      whatsapp: true,
      email: true,
      instagram: false,
      telegram: false,
    },

    // User data (will be filled by the system)
    referralLink: "",
    productName,
  };
}

/**
 * Merges template-generated config with any existing widget config
 */
export function mergeWidgetConfig(
  generated: WidgetConfigType,
  existing?: Partial<WidgetConfigType>,
): WidgetConfigType {
  if (!existing) {
    return generated;
  }

  return {
    ...generated,
    ...existing,
    // Preserve certain fields from existing config if they exist
    referralLink: existing.referralLink || generated.referralLink,
    productName: existing.productName || generated.productName,
    enabledPlatforms: existing.enabledPlatforms || generated.enabledPlatforms,
  };
}
