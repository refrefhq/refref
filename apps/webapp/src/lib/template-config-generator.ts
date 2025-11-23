import { WidgetConfigType, RewardConfigType } from "@refref/types";

export interface BrandConfig {
  primaryColor: string;
  landingPageUrl?: string;
}

export interface ProductMetadata {
  industry?: string;
  category?: string;
  description?: string;
  targetAudience?: string;
}

/**
 * Formats currency value with proper symbol and formatting
 */
function formatCurrencyValue(
  valueType: "fixed" | "percentage",
  value: number,
  currency: string = "USD",
): string {
  if (valueType === "percentage") {
    return `${value}%`;
  }

  // Currency symbols mapping
  const currencySymbols: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "C$",
    AUD: "A$",
  };

  const symbol = currencySymbols[currency] || "$";
  return `${symbol}${value}`;
}

/**
 * Generates widget title based on reward structure
 */
function generateWidgetTitle(
  rewardConfig: RewardConfigType | undefined,
  productName: string,
): string {
  if (!rewardConfig) {
    return "Invite your friends";
  }

  const hasBothRewards = rewardConfig.referrer && rewardConfig.referee;
  const hasReferrerOnly = rewardConfig.referrer && !rewardConfig.referee;
  const hasRefereeOnly = !rewardConfig.referrer && rewardConfig.referee;

  if (hasBothRewards) {
    return "Share & Earn Together";
  } else if (hasReferrerOnly) {
    return "Earn with every referral";
  } else if (hasRefereeOnly) {
    return "Share exclusive savings";
  }

  return "Refer & Earn";
}

/**
 * Generates share message based on reward configuration
 * IMPORTANT: Only mentions referee benefits, never referrer earnings (privacy)
 */
function generateShareMessage(
  rewardConfig: RewardConfigType | undefined,
  productName: string,
): string {
  if (!rewardConfig) {
    return `Join me on ${productName}!`;
  }

  // Format referee reward if available
  const refereeReward = rewardConfig.referee
    ? formatCurrencyValue(
        rewardConfig.referee.valueType,
        rewardConfig.referee.value,
        rewardConfig.referee.currency,
      )
    : null;

  // Generate message based on referee benefits ONLY
  if (refereeReward) {
    // Referee gets a discount (with or without referrer reward)
    return `Get ${refereeReward} off at ${productName}!`;
  }

  // No referee reward (referrer only or no rewards)
  return `Check out ${productName}!`;
}

/**
 * Generates widget subtitle based on reward configuration
 */
function generateWidgetSubtitle(
  rewardConfig: RewardConfigType | undefined,
  productName: string,
): string {
  if (!rewardConfig) {
    return "Share your referral link and earn rewards when your friends join!";
  }

  // Format reward values with proper currency
  const referrerReward = rewardConfig.referrer
    ? formatCurrencyValue(
        rewardConfig.referrer.valueType,
        rewardConfig.referrer.value,
        rewardConfig.referrer.currency,
      )
    : null;

  const refereeReward = rewardConfig.referee
    ? formatCurrencyValue(
        rewardConfig.referee.valueType,
        rewardConfig.referee.value,
        rewardConfig.referee.currency,
      )
    : null;

  // Build subtitle based on available rewards
  if (referrerReward && refereeReward) {
    // Both rewards
    return `Earn ${referrerReward} per referral • Friends get ${refereeReward} off`;
  } else if (referrerReward && !refereeReward) {
    // Referrer only
    return `Earn ${referrerReward} for every successful referral`;
  } else if (refereeReward && !referrerReward) {
    // Referee only
    return `Give your friends ${refereeReward} off`;
  }

  // No rewards defined (edge case)
  return "Share your referral link with friends";
}

/**
 * Generates button text based on reward configuration
 */
function generateTriggerText(rewardConfig: RewardConfigType | undefined): string {
  if (!rewardConfig) {
    return "Refer & Earn";
  }

  const hasBothRewards = rewardConfig.referrer && rewardConfig.referee;
  const hasReferrerOnly = rewardConfig.referrer && !rewardConfig.referee;
  const hasRefereeOnly = !rewardConfig.referrer && rewardConfig.referee;

  if (hasBothRewards) {
    return "Refer & Earn";
  } else if (hasReferrerOnly) {
    return "Earn Rewards";
  } else if (hasRefereeOnly) {
    return "Share Savings";
  }

  return "Refer Friends";
}

/**
 * Selects appropriate icon based on reward structure
 */
function selectWidgetIcon(
  rewardConfig: RewardConfigType | undefined,
): "gift" | "heart" | "star" | "zap" {
  if (!rewardConfig) {
    return "gift";
  }

  const hasBothRewards = rewardConfig.referrer && rewardConfig.referee;
  const hasMoneyReward = rewardConfig.referrer?.valueType === "fixed";
  const hasRefereeOnly = !rewardConfig.referrer && rewardConfig.referee;

  if (hasBothRewards) return "gift";
  if (hasMoneyReward) return "zap";
  if (hasRefereeOnly) return "heart";
  return "star";
}

/**
 * Selects appropriate social platforms based on target audience
 */
function selectPlatformsForAudience(targetAudience: string | undefined) {
  if (!targetAudience) {
    return {
      facebook: true,
      twitter: true,
      linkedin: true,
      whatsapp: true,
      email: true,
      instagram: false,
      telegram: false,
    };
  }

  const audienceMap: { [key: string]: any } = {
    professional: {
      facebook: false,
      twitter: true,
      linkedin: true,
      whatsapp: false,
      email: true,
      instagram: false,
      telegram: false,
    },
    consumer: {
      facebook: true,
      twitter: true,
      linkedin: false,
      whatsapp: true,
      email: true,
      instagram: true,
      telegram: false,
    },
    tech: {
      facebook: false,
      twitter: true,
      linkedin: true,
      whatsapp: false,
      email: true,
      instagram: false,
      telegram: true,
    },
  };

  return audienceMap[targetAudience] || audienceMap.default;
}

/**
 * Generates a complete widget configuration from brand and reward settings
 */
export function generateWidgetConfigFromTemplate(
  brandConfig: BrandConfig,
  rewardConfig?: RewardConfigType,
  productName: string = "Our Platform",
  productMetadata?: ProductMetadata,
): WidgetConfigType {
  // Generate all dynamic content
  const title = generateWidgetTitle(rewardConfig, productName);
  const subtitle = generateWidgetSubtitle(rewardConfig, productName);
  const shareMessage = generateShareMessage(rewardConfig, productName);
  const triggerText = generateTriggerText(rewardConfig);
  const icon = selectWidgetIcon(rewardConfig);

  // Determine enabled platforms based on product metadata
  const enabledPlatforms = selectPlatformsForAudience(productMetadata?.targetAudience);

  return {
    // Widget Button
    position: "bottom-right",
    triggerText,
    icon,

    // Modal
    title,
    subtitle,
    logoUrl: "",

    // Sharing
    shareMessage,
    enabledPlatforms,

    // User data (will be filled by the system)
    referralLink: "",
    productName,

    // Optional CSS customization
    cssVariables: brandConfig.primaryColor
      ? {
          "--widget-primary": brandConfig.primaryColor,
        }
      : undefined,
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