import { Page } from "@playwright/test";
import { BasePage } from "../base-page";

/**
 * Base page for Acme test application pages
 * Acme app runs on port 3003
 */
export class AcmeBasePage extends BasePage {
  protected baseUrl: string;

  constructor(page: Page) {
    super(page);
    this.baseUrl = process.env.ACME_URL || "http://localhost:3003";
  }

  /**
   * Navigate to a specific path in the Acme app
   */
  async goto(path: string) {
    await this.page.goto(`${this.baseUrl}${path}`);
  }
}
