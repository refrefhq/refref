import { Page } from '@playwright/test';
import { AcmeBasePage } from './acme-base-page';

/**
 * Page object for Acme app purchase flow
 * TODO: Implement in Task 3
 */
export class AcmePurchasePage extends AcmeBasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the purchase page
   */
  async goto() {
    await super.goto('/purchase');
  }

  /**
   * Complete a purchase
   * TODO: Implement in Task 3
   */
  async completePurchase(amount: number) {
    // TODO: Implement in Task 3
    throw new Error('Not implemented');
  }

  /**
   * Verify purchase event was tracked
   * TODO: Implement in Task 3
   */
  async verifyPurchaseTracked() {
    // TODO: Implement in Task 3
    throw new Error('Not implemented');
  }
}
