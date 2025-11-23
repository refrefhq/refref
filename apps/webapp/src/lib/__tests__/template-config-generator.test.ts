import {
  generateWidgetConfigFromTemplate,
  mergeWidgetConfig,
  type ProductMetadata,
} from "../template-config-generator";
import { RewardConfigType, WidgetConfigType } from "@refref/types";

describe("Template Config Generator", () => {
  describe("generateWidgetConfigFromTemplate", () => {
    it("should generate widget config with brand color applied", () => {
      const brandConfig = {
        primaryColor: "#ff0000",
      };

      const result = generateWidgetConfigFromTemplate(
        brandConfig,
        undefined,
        "TestApp",
      );

      expect(result.title).toBe("Invite your friends");
      expect(result.logoUrl).toBe("");
      expect(result.cssVariables).toEqual({
        "--widget-primary": "#ff0000",
      });
    });

    it("should generate share message for BOTH rewards", () => {
      const brandConfig = {
        primaryColor: "#3b82f6",
      };

      const rewardConfig: RewardConfigType = {
        referrer: {
          type: "cash",
          valueType: "fixed",
          value: 10,
          currency: "USD",
        },
        referee: {
          type: "discount",
          valueType: "percentage",
          value: 20,
          validityDays: 30,
        },
      };

      const result = generateWidgetConfigFromTemplate(
        brandConfig,
        rewardConfig,
        "MyApp",
      );

      expect(result.title).toBe("Share & Earn Together");
      expect(result.shareMessage).toBe("Get 20% off at MyApp!");
      expect(result.subtitle).toBe("Earn $10 per referral • Friends get 20% off");
      expect(result.triggerText).toBe("Refer & Earn");
      expect(result.icon).toBe("gift");
    });

    it("should handle REFERRER ONLY rewards", () => {
      const brandConfig = {
        primaryColor: "#10b981",
      };

      const rewardConfig: RewardConfigType = {
        referrer: {
          type: "cash",
          valueType: "fixed",
          value: 15,
          currency: "USD",
        },
        // No referee reward
      };

      const result = generateWidgetConfigFromTemplate(
        brandConfig,
        rewardConfig,
        "ShopApp",
      );

      expect(result.title).toBe("Earn with every referral");
      expect(result.shareMessage).toBe("Check out ShopApp!");
      expect(result.subtitle).toBe("Earn $15 for every successful referral");
      expect(result.triggerText).toBe("Earn Rewards");
      expect(result.icon).toBe("zap");
    });

    it("should handle REFEREE ONLY rewards", () => {
      const brandConfig = {
        primaryColor: "#10b981",
      };

      const rewardConfig: RewardConfigType = {
        // No referrer reward
        referee: {
          type: "discount",
          valueType: "percentage",
          value: 25,
          validityDays: 30,
        },
      };

      const result = generateWidgetConfigFromTemplate(
        brandConfig,
        rewardConfig,
        "DealApp",
      );

      expect(result.title).toBe("Share exclusive savings");
      expect(result.shareMessage).toBe("Get 25% off at DealApp!");
      expect(result.subtitle).toBe("Give your friends 25% off");
      expect(result.triggerText).toBe("Share Savings");
      expect(result.icon).toBe("heart");
    });

    it("should handle percentage-based referrer rewards", () => {
      const brandConfig = {
        primaryColor: "#10b981",
      };

      const rewardConfig: RewardConfigType = {
        referrer: {
          type: "cash",
          valueType: "percentage",
          value: 15,
          currency: "USD",
        },
        referee: {
          type: "discount",
          valueType: "fixed",
          value: 5,
          currency: "USD",
          validityDays: 14,
        },
      };

      const result = generateWidgetConfigFromTemplate(
        brandConfig,
        rewardConfig,
        "ShopApp",
      );

      expect(result.shareMessage).toBe("Get $5 off at ShopApp!");
      expect(result.subtitle).toBe("Earn 15% per referral • Friends get $5 off");
    });

    it("should use default values when no rewards configured", () => {
      const brandConfig = {
        primaryColor: "#6366f1",
      };

      const result = generateWidgetConfigFromTemplate(
        brandConfig,
        undefined,
        "Platform",
      );

      expect(result.title).toBe("Invite your friends");
      expect(result.shareMessage).toBe("Join me on Platform!");
      expect(result.subtitle).toBe(
        "Share your referral link and earn rewards when your friends join!",
      );
      expect(result.triggerText).toBe("Refer & Earn");
      expect(result.icon).toBe("gift");
    });

    it("should handle edge case where rewardConfig exists but has no rewards", () => {
      const brandConfig = {
        primaryColor: "#6366f1",
      };

      // RewardConfig exists but both referrer and referee are undefined
      const rewardConfig: RewardConfigType = {};

      const result = generateWidgetConfigFromTemplate(
        brandConfig,
        rewardConfig,
        "TestPlatform",
      );

      expect(result.title).toBe("Refer & Earn");
      expect(result.shareMessage).toBe("Check out TestPlatform!");
      expect(result.subtitle).toBe("Share your referral link with friends");
      expect(result.triggerText).toBe("Refer Friends");
      expect(result.icon).toBe("star");
    });

    describe("Currency Formatting", () => {
      it("should format different currencies correctly", () => {
        const brandConfig = { primaryColor: "#000000" };

        const euroReward: RewardConfigType = {
          referrer: {
            type: "cash",
            valueType: "fixed",
            value: 15,
            currency: "EUR",
          },
        };
        const resultEuro = generateWidgetConfigFromTemplate(
          brandConfig,
          euroReward,
          "App",
        );
        expect(resultEuro.subtitle).toContain("€15");

        const gbpReward: RewardConfigType = {
          referrer: {
            type: "cash",
            valueType: "fixed",
            value: 20,
            currency: "GBP",
          },
        };
        const resultGBP = generateWidgetConfigFromTemplate(
          brandConfig,
          gbpReward,
          "App",
        );
        expect(resultGBP.subtitle).toContain("£20");
      });
    });

    describe("Product Metadata Integration", () => {
      it("should select platforms based on target audience", () => {
        const brandConfig = { primaryColor: "#000000" };

        const professionalMeta: ProductMetadata = {
          targetAudience: "professional",
        };
        const resultPro = generateWidgetConfigFromTemplate(
          brandConfig,
          undefined,
          "App",
          professionalMeta,
        );
        expect(resultPro.enabledPlatforms.linkedin).toBe(true);
        expect(resultPro.enabledPlatforms.instagram).toBe(false);

        const consumerMeta: ProductMetadata = {
          targetAudience: "consumer",
        };
        const resultConsumer = generateWidgetConfigFromTemplate(
          brandConfig,
          undefined,
          "App",
          consumerMeta,
        );
        expect(resultConsumer.enabledPlatforms.instagram).toBe(true);
        expect(resultConsumer.enabledPlatforms.linkedin).toBe(false);
      });
    });
  });

  describe("mergeWidgetConfig", () => {
    it("should merge configs correctly", () => {
      const generated: WidgetConfigType = {
        title: "Generated Title",
        subtitle: "Generated Subtitle",
        shareMessage: "Generated Message",
        triggerText: "Generated Trigger",
        icon: "gift",
        position: "bottom-right",
        logoUrl: "",
        referralLink: "",
        productName: "TestApp",
        enabledPlatforms: {
          facebook: true,
          twitter: true,
          linkedin: true,
          whatsapp: true,
          email: true,
          instagram: false,
          telegram: false,
        },
      };

      const existing = {
        title: "Custom Title",
        referralLink: "https://example.com/ref/123",
        productName: "CustomApp",
      };

      const merged = mergeWidgetConfig(generated, existing);

      expect(merged.title).toBe("Custom Title");
      expect(merged.referralLink).toBe("https://example.com/ref/123");
      expect(merged.productName).toBe("CustomApp");
      expect(merged.subtitle).toBe("Generated Subtitle");
      expect(merged.shareMessage).toBe("Generated Message");
    });

    it("should return generated config when no existing config", () => {
      const generated: WidgetConfigType = {
        title: "Test Title",
        subtitle: "Test Subtitle",
        shareMessage: "Test Message",
        triggerText: "Test Trigger",
        icon: "star",
        position: "bottom-right",
        logoUrl: "",
        referralLink: "",
        productName: "App",
        enabledPlatforms: {
          facebook: true,
          twitter: true,
          linkedin: true,
          whatsapp: true,
          email: true,
          instagram: false,
          telegram: false,
        },
      };

      const merged = mergeWidgetConfig(generated, undefined);
      expect(merged).toEqual(generated);
    });
  });
});