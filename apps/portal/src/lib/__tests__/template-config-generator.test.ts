import { generateWidgetConfigFromTemplate } from "../template-config-generator";
import { RewardConfigType } from "@refref/types";

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

      expect(result.buttonBgColor).toBe("#ff0000");
      expect(result.accentColor).toBe("#ff0000");
      expect(result.title).toBe("Invite your friends");
      expect(result.logoUrl).toBe("");
    });

    it("should generate share message based on reward config", () => {
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

      expect(result.shareMessage).toContain("Get 20% off");
      expect(result.shareMessage).toContain("I'll earn $10");
      expect(result.subtitle).toContain("Earn $10 per referral");
      expect(result.subtitle).toContain("Friends get 20% off");
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

      expect(result.shareMessage).toContain("Get $5 off");
      expect(result.shareMessage).toContain("I'll earn 15% cashback");
      expect(result.subtitle).toContain("Earn 15% on referrals");
      expect(result.subtitle).toContain("Friends get $5 off");
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

      expect(result.shareMessage).toBe(
        "Join me on Platform and get exclusive rewards!",
      );
      expect(result.subtitle).toBe(
        "Share your referral link and earn rewards when your friends join!",
      );
    });
  });
});
