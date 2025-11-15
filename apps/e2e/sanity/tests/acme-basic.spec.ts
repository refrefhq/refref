import { test, expect } from '@playwright/test';
import { getTestConfig } from '../../utils/config';

const config = getTestConfig();

test.describe('ACME App Basic Tests', () => {
  test('should load ACME login page', async ({ page }) => {
    console.log('\n=== Testing ACME Login Page ===\n');

    // Navigate to ACME login page
    await page.goto(`${config.urls.acme}/login`);

    // Verify page title
    await expect(page).toHaveTitle(/ACME/);

    // Verify login form elements are visible
    const emailInput = page.getByTestId('acme-login-email');
    await expect(emailInput).toBeVisible();

    const passwordInput = page.getByTestId('acme-login-password');
    await expect(passwordInput).toBeVisible();

    const submitButton = page.getByTestId('acme-login-submit');
    await expect(submitButton).toBeVisible();

    console.log('✓ ACME login page loaded successfully');
    console.log('✓ Email input visible');
    console.log('✓ Password input visible');
    console.log('✓ Submit button visible');

    console.log('\n=== ACME Basic Test Complete ===\n');
  });
});
