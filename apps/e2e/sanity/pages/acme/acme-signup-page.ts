import { Page } from "@playwright/test";
import { AcmeBasePage } from "./acme-base-page";

/**
 * Page object for Acme app signup page
 * TODO: Implement in Task 3
 */
export class AcmeSignupPage extends AcmeBasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to signup page with referral link
   * TODO: Implement in Task 3
   */
  async gotoWithReferralLink(referralUrl: string) {
    // TODO: Implement in Task 3
    throw new Error("Not implemented");
  }

  /**
   * Sign up as a referred user
   * TODO: Implement in Task 3
   */
  async signup(name: string, email: string) {
    // TODO: Implement in Task 3
    throw new Error("Not implemented");
  }
}
