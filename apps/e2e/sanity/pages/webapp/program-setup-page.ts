import { Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

/**
 * Page object for setting up a referral program
 * Handles program creation and credential retrieval
 */
export class ProgramSetupPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Create a new referral program by selecting the first available template
   * Expects NO programs to exist (fresh state)
   * Waits for program creation and redirect to setup page with credentials
   * @param programName - Name of the program (note: actual name is set by template)
   * @returns The program ID if creation is successful
   */
  async createProgram(programName: string): Promise<string | null> {
    console.log('Creating new program...');

    // Navigate to programs page
    await this.page.goto('/programs');
    await this.page.waitForLoadState('domcontentloaded');

    // Wait a moment for page to settle
    await this.page.waitForTimeout(1000);

    // Verify NO existing programs (fresh state)
    const existingCard = this.page.locator('div[data-slot="card"]').first();
    await expect(existingCard).not.toBeVisible({ timeout: 3000 });

    // Click "Create Program" button
    const createButton = this.page.locator('button').filter({ hasText: /create program/i }).first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();

    // Wait for template chooser dialog to open
    await this.page.waitForTimeout(500);

    // Select the first available program template
    const firstTemplate = this.page.locator('div[class*="card"]').first();
    await expect(firstTemplate).toBeVisible({ timeout: 5000 });
    await firstTemplate.click();

    // Wait for "Creating program..." loading state (optional - may not always appear)
    const creatingMessage = this.page.locator('text=Creating program...');
    await creatingMessage.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {
      console.log('  (Loading message not shown, proceeding...)');
    });

    // Wait for redirect to program setup page after creation
    await this.page.waitForURL('**/programs/*/setup', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Extract program ID from URL (/programs/{id}/setup)
    const url = this.page.url();
    const match = url.match(/\/programs\/([^\/]+)\/setup/);
    const programId = match ? match[1] : null;

    console.log(`✓ Program created with ID: ${programId}`);
    return programId;
  }

  /**
   * Get integration credentials from the program detail page
   * Must be on program detail page (/programs/{id})
   * @returns Object containing productId, programId, clientId, and clientSecret
   */
  async getIntegrationCredentials(): Promise<{
    productId: string;
    programId: string;
    clientId: string;
    clientSecret: string;
  }> {
    console.log('Retrieving integration credentials...');

    // Ensure we're on a program detail page (not setup)
    await expect(this.page).toHaveURL(/\/programs\/[^\/]+$/);

    // Wait for credentials card title to be visible
    const credentialsTitle = this.page.locator('text=Installation Credentials');
    await expect(credentialsTitle).toBeVisible({ timeout: 10000 });

    // Extract Product ID
    const productIdInput = this.page.locator('input#productId').first();
    await expect(productIdInput).toBeVisible();
    const productId = await productIdInput.inputValue();

    // Extract Program ID
    const programIdInput = this.page.locator('input#programId').first();
    await expect(programIdInput).toBeVisible();
    const programId = await programIdInput.inputValue();

    // Extract Client ID
    const clientIdInput = this.page.locator('input#clientId').first();
    await expect(clientIdInput).toBeVisible();
    const clientId = await clientIdInput.inputValue();

    // Extract Client Secret (need to reveal it first)
    const clientSecretInput = this.page.locator('input#clientSecret').first();
    await expect(clientSecretInput).toBeVisible();

    // Click the eye icon to reveal the secret
    const eyeButton = this.page.locator('button').filter({ has: this.page.locator('svg.lucide-eye') }).first();
    await expect(eyeButton).toBeVisible({ timeout: 5000 });
    await eyeButton.click();

    // Wait for reveal animation
    await this.page.waitForTimeout(300);

    // Get the revealed secret value
    const clientSecret = await clientSecretInput.inputValue();

    console.log('✓ Retrieved integration credentials');
    console.log(`  Product ID: ${productId}`);
    console.log(`  Program ID: ${programId}`);
    console.log(`  Client ID: ${clientId}`);
    console.log(`  Client Secret: ${clientSecret.substring(0, 10)}...`);

    return {
      productId,
      programId,
      clientId,
      clientSecret,
    };
  }

  /**
   * Complete the brand configuration step
   * Sets redirect URL to ACME signup page
   * Accepts default brand color and clicks Next
   */
  async completeBrandStep(redirectUrl: string = 'http://localhost:3003/signup') {
    console.log('Completing brand configuration step...');

    // Wait for brand color input to be visible
    const colorInput = this.page.getByTestId('brand-color-hex');
    await expect(colorInput).toBeVisible({ timeout: 10000 });

    // Set the redirect URL for referral links
    const redirectUrlInput = this.page.locator('input[name="redirectUrl"], input[placeholder*="redirect"], input[id*="redirect"]').first();
    const inputVisible = await redirectUrlInput.isVisible().catch(() => false);

    if (inputVisible) {
      await redirectUrlInput.clear();
      await redirectUrlInput.fill(redirectUrl);
      console.log(`  Set redirect URL to: ${redirectUrl}`);
    } else {
      console.log('  Redirect URL input not found, checking for alternative selectors...');
      // Try alternative selectors
      const altInput = this.page.locator('input').filter({ hasText: /redirect/i });
      const altVisible = await altInput.isVisible().catch(() => false);
      if (altVisible) {
        await altInput.clear();
        await altInput.fill(redirectUrl);
        console.log(`  Set redirect URL to: ${redirectUrl}`);
      }
    }

    // Brand color is already set to default (#3b82f6), just click Next
    const nextButton = this.page.getByTestId('setup-next-btn');
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    console.log('✓ Brand step completed');
  }

  /**
   * Complete the rewards configuration step
   * Accepts default reward settings and clicks Complete Setup
   */
  async completeRewardStep() {
    console.log('Completing rewards configuration step...');

    // Wait for reward step to be visible
    const referrerToggle = this.page.getByTestId('referrer-reward-enabled');
    await expect(referrerToggle).toBeVisible({ timeout: 10000 });

    // Rewards are already enabled by default, just click Complete Setup
    const completeButton = this.page.getByTestId('setup-next-btn');
    await expect(completeButton).toBeVisible();
    await completeButton.click();

    // Wait for redirect to program page (not setup page)
    await this.page.waitForURL(/\/programs\/[^\/]+$/, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('✓ Rewards step completed, redirected to program page');
  }

  /**
   * Navigate to program detail page
   */
  async goto(programId: string) {
    await this.page.goto(`/programs/${programId}`);
    await this.waitForPageLoad();
  }
}
