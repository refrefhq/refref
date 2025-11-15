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

    // Wait for "Creating program..." loading state
    const creatingMessage = this.page.locator('text=Creating program...');
    await expect(creatingMessage).toBeVisible({ timeout: 5000 });

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
   * Get integration credentials from the program setup page
   * Must be on program setup/installation page (/programs/{id}/setup or /programs/{id})
   * @returns Object containing productId, programId, clientId, and clientSecret
   */
  async getIntegrationCredentials(): Promise<{
    productId: string;
    programId: string;
    clientId: string;
    clientSecret: string;
  }> {
    console.log('Retrieving integration credentials...');

    // Ensure we're on a program page (setup or detail)
    await expect(this.page).toHaveURL(/\/programs\//);

    // Navigate to installation step if not already there
    const currentUrl = this.page.url();
    await expect(currentUrl).toBeTruthy();

    // Extract program ID from current URL
    const urlMatch = currentUrl.match(/\/programs\/([^\/\?]+)/);
    const urlProgramId = urlMatch ? urlMatch[1] : null;
    await expect(urlProgramId).toBeTruthy();

    // Navigate to installation step explicitly
    await this.page.goto(`/programs/${urlProgramId}?step=installation`);
    await this.page.waitForLoadState('domcontentloaded');

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
   * Navigate to program detail page
   */
  async goto(programId: string) {
    await this.page.goto(`/programs/${programId}`);
    await this.waitForPageLoad();
  }
}
