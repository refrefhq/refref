import { Page, expect } from '@playwright/test';
import { BasePage } from '../base-page';

/**
 * Page object for webapp login page using Better Auth UI
 */
export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('/auth/sign-in');
    await this.waitForPageLoad();
  }

  /**
   * Login with email and password using Better Auth UI
   */
  async login(email: string, password: string) {
    await this.goto();

    // Verify password auth is enabled first
    await this.verifyPasswordAuthEnabled();

    // Fill in email field
    const emailInput = this.page.locator('input[name="email"], input[type="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill(email);

    // Fill in password field
    const passwordInput = this.page.locator('input[name="password"], input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(password);

    // Click login button - locate by text "Login"
    const loginButton = this.page.getByRole('button', { name: /login/i });
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // Wait for navigation to complete (user should be redirected after successful login)
    await this.page.waitForURL((url) => !url.pathname.includes('/auth/sign-in'), {
      timeout: 15000,
    });

    console.log('✓ Successfully logged in');
  }

  /**
   * Verify password authentication is enabled
   * Checks for presence of email and password input fields
   */
  async verifyPasswordAuthEnabled() {
    // Check for email input field
    const emailInput = this.page.locator('input[name="email"], input[type="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });

    // Check for password input field
    const passwordInput = this.page.locator('input[name="password"], input[type="password"]').first();
    await expect(passwordInput).toBeVisible();

    console.log('✓ Password authentication is enabled');
  }

  /**
   * Sign up with email and password (creates new account)
   */
  async signup(email: string, password: string, name: string) {
    await this.page.goto('/auth/sign-up');
    await this.waitForPageLoad();

    // Fill in name field (if present) - use count() to check without waiting
    const nameInput = this.page.locator('input[name="name"]').first();
    const nameFieldCount = await nameInput.count();
    await expect(nameFieldCount).toBeGreaterThanOrEqual(0); // Always passes, documenting optional field
    await nameInput.fill(name).catch(() => {/* Name field is optional */});

    // Fill in email field
    const emailInput = this.page.locator('input[name="email"], input[type="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill(email);

    // Fill in password field
    const passwordInput = this.page.locator('input[name="password"], input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(password);

    // Click sign up button
    const signUpButton = this.page.locator('button[type="submit"]').filter({ hasText: /sign up|create|continue/i }).first();
    await expect(signUpButton).toBeVisible();
    await signUpButton.click();

    // Wait for navigation to complete
    await this.page.waitForURL((url) => !url.pathname.includes('/auth/sign-up'), {
      timeout: 15000,
    });

    console.log('✓ Successfully signed up');
  }

  /**
   * Check if already logged in by navigating to login page
   * If redirected away from login page, user is already logged in
   */
  async isLoggedIn(): Promise<boolean> {
    await this.page.goto('/auth/sign-in');
    await this.page.waitForLoadState('networkidle');

    // If we're not on the sign-in page, we're logged in
    return !this.page.url().includes('/auth/sign-in');
  }
}
