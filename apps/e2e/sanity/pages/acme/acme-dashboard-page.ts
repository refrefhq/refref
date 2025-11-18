import { Page } from "@playwright/test";
import { AcmeBasePage } from "./acme-base-page";

/**
 * Page object for Acme app dashboard (user logged in)
 * TODO: Implement in Task 3
 */
export class AcmeDashboardPage extends AcmeBasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the dashboard
   */
  async goto() {
    await super.goto("/dashboard");
  }

  /**
   * Get the referral widget link
   * TODO: Implement in Task 3
   */
  async getReferralLink() {
    // TODO: Implement in Task 3
    throw new Error("Not implemented");
  }

  /**
   * Verify widget is loaded
   * TODO: Implement in Task 3
   */
  async verifyWidgetLoaded() {
    // TODO: Implement in Task 3
    throw new Error("Not implemented");
  }
}
