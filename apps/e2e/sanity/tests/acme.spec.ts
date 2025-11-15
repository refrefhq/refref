import { test, expect } from '@playwright/test';
import { getTestConfig } from '../../utils/config';

const config = getTestConfig();

test.describe('ACME App Tests', () => {
  // Reset ACME state before each test
  test.beforeEach(async ({ request }) => {
    await request.post(`${config.urls.acme}/api/test/reset`);
  });

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

test.describe('ACME Authentication Flow', () => {
  const johnUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  };

  // Reset ACME state before each test
  test.beforeEach(async ({ request }) => {
    await request.post(`${config.urls.acme}/api/test/reset`);
  });

  test('should allow John to signup and login', async ({ page }) => {
    console.log('\n=== Testing ACME Signup and Login Flow ===\n');

    // Step 1: Navigate to signup page
    await page.goto(`${config.urls.acme}/signup`);
    await expect(page).toHaveTitle(/ACME/);
    console.log('✓ Signup page loaded');

    // Step 2: Fill out signup form
    await page.getByTestId('acme-signup-name').fill(johnUser.name);
    await page.getByTestId('acme-signup-email').fill(johnUser.email);
    await page.getByTestId('acme-signup-password').fill(johnUser.password);
    console.log('✓ Signup form filled');

    // Step 3: Submit signup form
    await page.getByTestId('acme-signup-submit').click();
    console.log('✓ Signup form submitted');

    // Step 4: Verify redirect to dashboard
    await expect(page).toHaveURL(`${config.urls.acme}/dashboard`);
    console.log('✓ Redirected to dashboard after signup');

    // Step 5: Verify user info is displayed on dashboard
    // Wait for network to be idle to ensure /api/me call completes
    await page.waitForLoadState('networkidle');
    const dashboardContent = page.getByTestId('acme-dashboard-content');
    await expect(dashboardContent).toBeVisible();
    await expect(dashboardContent).toContainText(johnUser.name);
    await expect(dashboardContent).toContainText(johnUser.email);
    console.log('✓ Dashboard shows user information');

    // Step 6: Logout
    await page.getByTestId('acme-logout-button').click();
    await expect(page).toHaveURL(`${config.urls.acme}/login`);
    console.log('✓ Logged out successfully');

    // Step 7: Login with same credentials
    await page.getByTestId('acme-login-email').fill(johnUser.email);
    await page.getByTestId('acme-login-password').fill(johnUser.password);
    console.log('✓ Login form filled');

    await page.getByTestId('acme-login-submit').click();
    console.log('✓ Login form submitted');

    // Step 8: Verify redirect to dashboard again
    await expect(page).toHaveURL(`${config.urls.acme}/dashboard`);
    console.log('✓ Redirected to dashboard after login');

    // Step 9: Verify user info is still displayed
    await page.waitForLoadState('networkidle');
    await expect(dashboardContent).toBeVisible();
    await expect(dashboardContent).toContainText(johnUser.name);
    await expect(dashboardContent).toContainText(johnUser.email);
    console.log('✓ Dashboard shows user information after login');

    console.log('\n=== ACME Authentication Test Complete ===\n');
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    console.log('\n=== Testing Invalid Login ===\n');

    await page.goto(`${config.urls.acme}/login`);

    // Try to login with non-existent user
    await page.getByTestId('acme-login-email').fill('invalid@example.com');
    await page.getByTestId('acme-login-password').fill('wrongpassword');
    await page.getByTestId('acme-login-submit').click();

    // Verify error message is shown
    const errorMessage = page.getByTestId('acme-login-error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid email or password');
    console.log('✓ Error message shown for invalid credentials');

    console.log('\n=== Invalid Login Test Complete ===\n');
  });

  test('should show error for duplicate signup', async ({ page }) => {
    console.log('\n=== Testing Duplicate Signup ===\n');

    const duplicateUser = {
      name: 'Duplicate User',
      email: 'duplicate@example.com',
      password: 'password123',
    };

    // First signup
    await page.goto(`${config.urls.acme}/signup`);
    await page.getByTestId('acme-signup-name').fill(duplicateUser.name);
    await page.getByTestId('acme-signup-email').fill(duplicateUser.email);
    await page.getByTestId('acme-signup-password').fill(duplicateUser.password);
    await page.getByTestId('acme-signup-submit').click();
    await expect(page).toHaveURL(`${config.urls.acme}/dashboard`);
    await page.waitForLoadState('networkidle');
    console.log('✓ First signup successful');

    // Logout
    await page.getByTestId('acme-logout-button').click();

    // Try to signup again with same email
    await page.goto(`${config.urls.acme}/signup`);
    await page.getByTestId('acme-signup-name').fill('Another Name');
    await page.getByTestId('acme-signup-email').fill(duplicateUser.email);
    await page.getByTestId('acme-signup-password').fill('password456');
    await page.getByTestId('acme-signup-submit').click();

    // Verify error message is shown
    const errorMessage = page.getByTestId('acme-signup-error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('already exists');
    console.log('✓ Error message shown for duplicate email');

    console.log('\n=== Duplicate Signup Test Complete ===\n');
  });
});
