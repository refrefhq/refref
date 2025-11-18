import { Page, expect } from "@playwright/test";
import { BasePage } from "../base-page";

/**
 * Page object for the RefRef webapp dashboard
 * The main dashboard is the /programs page after login
 */
export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the dashboard (programs page)
   */
  async goto() {
    await this.page.goto("/");
    await this.waitForPageLoad();
  }

  /**
   * Verify user is logged in
   * Checks for authenticated-only UI elements and ensures not on login page
   */
  async verifyLoggedIn() {
    console.log("Verifying user is logged in...");

    // Navigate to root and wait for redirect
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");

    // Should NOT be on the auth/sign-in page - use expect assertion
    await expect(this.page).not.toHaveURL(/\/auth\/sign-in/);

    const currentUrl = this.page.url();

    // Log the state (ternary in logging is acceptable)
    console.log(
      currentUrl.includes("/onboarding")
        ? "✓ User is logged in (on onboarding page)"
        : "✓ User is logged in and authenticated",
    );

    // Verify authenticated state: either on onboarding page OR has auth UI elements
    // Define all possible indicators of being logged in
    const onboardingIndicator = this.page
      .locator("text=/product|onboarding/i")
      .first();
    const programsHeading = this.page.locator("text=Programs").first();
    const createButton = this.page
      .locator("button")
      .filter({ hasText: /create program/i })
      .first();
    const programsLink = this.page.locator('a[href="/programs"]').first();
    const nav = this.page.locator("nav").first();

    // At least one indicator of being logged in must be present
    // Use .first() on the combined selector to avoid strict mode violation
    await expect(
      onboardingIndicator
        .or(programsHeading)
        .or(createButton)
        .or(programsLink)
        .or(nav)
        .first(),
    ).toBeVisible({ timeout: 5000 });
  }

  /**
   * Navigate to program settings for the first available program
   * @returns The program ID of the selected program
   */
  async goToProgramSettings(): Promise<string | null> {
    console.log("Navigating to program settings...");

    // Navigate to programs page first
    await this.page.goto("/programs");
    await this.waitForPageLoad();

    // Find the first program card
    const firstProgramCard = this.page
      .locator('[class*="card"]')
      .filter({ has: this.page.locator("text=/referral|program|advocate/i") })
      .first();

    await expect(firstProgramCard).toBeVisible({ timeout: 10000 });

    // Click on the program card to navigate to program details
    await firstProgramCard.click();

    // Wait for navigation to program page
    await this.page.waitForURL("**/programs/*", { timeout: 10000 });

    // Extract program ID from URL
    const url = this.page.url();
    const match = url.match(/\/programs\/([^\/]+)/);
    const programId = match ? match[1] : null;

    console.log(`✓ Navigated to program: ${programId}`);

    return programId;
  }

  /**
   * Check if any programs exist
   */
  async hasProgramsexist(): Promise<boolean> {
    await this.page.goto("/programs");
    await this.waitForPageLoad();

    // Check if "No programs yet" message is visible
    const noProgramsMessage = this.page.locator("text=No programs yet").first();
    const hasNoPrograms = await noProgramsMessage
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    return !hasNoPrograms;
  }

  /**
   * Get the count of programs on the dashboard
   */
  async getProgramCount(): Promise<number> {
    await this.page.goto("/programs");
    await this.waitForPageLoad();

    const programCards = this.page.locator('[class*="card"]').filter({
      has: this.page.locator("text=/referral|program|advocate/i"),
    });

    return await programCards.count();
  }
}
