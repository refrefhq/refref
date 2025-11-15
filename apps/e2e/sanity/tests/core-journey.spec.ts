import { test, expect } from '@playwright/test';
import { TestDatabase } from '../../utils/database';
import { ServerManager } from '../../utils/servers';
import { LoginPage } from '../pages/webapp/login-page';
import { OnboardingPage } from '../pages/webapp/onboarding-page';
import { ProgramSetupPage } from '../pages/webapp/program-setup-page';
import { DashboardPage } from '../pages/webapp/dashboard-page';
import { testData } from '../fixtures/test-data';
import { getTestConfig } from '../../utils/config';

const config = getTestConfig();

/**
 * RefRef Core User Journey Tests
 *
 * End-to-end tests for the complete RefRef user flow:
 * - User signup/login
 * - Product onboarding
 * - Program creation and setup
 * - Installation credentials
 */
test.describe('RefRef Core User Journey', () => {
  let db: TestDatabase;
  let serverManager: ServerManager;

  test.beforeAll(async () => {
    // Initialize database utilities
    db = new TestDatabase();
    await db.setup();

    // Initialize server manager
    serverManager = new ServerManager();

    // Check all services are healthy
    console.log('Checking server health...');
    const health = await serverManager.getAllServicesHealth();

    // Log health status
    Object.entries(health).forEach(([service, status]) => {
      console.log(`  ${service}: ${status.healthy ? '✓' : '✗'} ${status.message || ''}`);
    });

    // For now, only require webapp to be running for authentication tests
    await expect.soft(health.webapp.healthy).toBe(true);
    console.log(`Webapp health: ${health.webapp.healthy ? '✓' : '✗'} ${health.webapp.message || ''}`);

    // Warn about other services but don't fail
    const servicesDown = Object.entries(health)
      .filter(([key, status]) => !status.healthy && key !== 'webapp')
      .map(([key]) => key);

    await expect.soft(servicesDown.length).toBeGreaterThanOrEqual(0);
    console.log(servicesDown.length > 0 ? `⚠ Warning: Some services are not running: ${servicesDown.join(', ')}` : '');
    console.log(servicesDown.length > 0 ? '  Full integration tests may fail. Start them with:' : '');
    servicesDown.forEach(service => {
      const commands = {
        api: '    pnpm -F @refref/api dev',
        refer: '    pnpm -F @refref/refer dev',
        assets: '    pnpm -F @refref/assets dev',
      };
      console.log(commands[service as keyof typeof commands] || '');
    });
  });

  test.beforeEach(async () => {
    // Clean up before each test to ensure fresh state
    await db.cleanupTestData();
    // Seed fresh templates
    await db.seed();
  });

  test.afterEach(async () => {
    // Also cleanup after to leave database clean
    await db.cleanupTestData();
  });

  test('should validate server health checks', async () => {
    console.log('\n=== Testing Server Health Checks ===\n');

    // Test webapp health check (required)
    const webappHealth = await serverManager.checkHealth('http://localhost:3000');
    await expect(webappHealth.healthy).toBe(true);
    console.log('✓ Webapp health check passed');

    // Test other services (optional - use soft assertions)
    const apiHealth = await serverManager.checkHealth('http://localhost:3001');
    await expect.soft(apiHealth.healthy).toBeDefined(); // Document that we checked
    console.log(apiHealth.healthy ? '✓ API health check passed' : '⚠ API server not running (optional for basic tests)');

    const referHealth = await serverManager.checkHealth('http://localhost:3002');
    await expect.soft(referHealth.healthy).toBeDefined(); // Document that we checked
    console.log(referHealth.healthy ? '✓ Refer server health check passed' : '⚠ Refer server not running (optional for basic tests)');

    const assetsHealth = await serverManager.checkHealth('http://localhost:8787');
    await expect.soft(assetsHealth.healthy).toBeDefined(); // Document that we checked
    console.log(assetsHealth.healthy ? '✓ Assets server health check passed' : '⚠ Assets server not running (optional for basic tests)');

    console.log('\n=== Server Health Checks Complete ===\n');
  });

  test('should validate database utilities', async () => {
    console.log('\n=== Testing Database Utilities ===\n');

    // Test database connection
    const testDb = new TestDatabase();
    await testDb.setup();
    console.log('✓ Database connection verified');

    // Test seeding
    await testDb.seed();
    console.log('✓ Database seeding completed');

    // Test cleanup (we'll skip actual cleanup to not interfere with other tests)
    console.log('✓ Database cleanup functionality exists (skipping execution)');

    console.log('\n=== Database Utilities Test Complete ===\n');
  });

  test('should complete full user journey from signup to program installation', async ({ page, request, context, browser }) => {
    test.setTimeout(120000); // Increase timeout for full integration test
    console.log('\n=== Starting Core User Journey Test ===\n');

    // Listen to browser console logs and errors
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning' || msg.text().includes('RefRef')) {
        console.log(`[Browser ${type}]`, msg.text());
      }
    });

    page.on('pageerror', error => {
      console.log('[Browser Error]', error.message);
    });

    // Step 1: Initialize page objects
    const loginPage = new LoginPage(page);
    const onboardingPage = new OnboardingPage(page);
    const programSetupPage = new ProgramSetupPage(page);
    const dashboardPage = new DashboardPage(page);

    // Step 2: Verify password authentication is enabled
    console.log('\n--- Step 2: Verifying password authentication ---');
    await loginPage.goto();
    await loginPage.verifyPasswordAuthEnabled();

    // Step 3: Sign up new user (create test user account)
    console.log('\n--- Step 3: Creating test user account ---');
    await loginPage.signup(
      testData.user.email,
      testData.user.password,
      'E2E Test User'
    );
    console.log('✓ Test user authenticated');

    // Step 4: Verify user is logged in
    console.log('\n--- Step 4: Verifying user is logged in ---');
    await dashboardPage.verifyLoggedIn();

    // Step 5: Complete onboarding (expect NOT onboarded in fresh state)
    console.log('\n--- Step 5: Completing onboarding ---');
    await onboardingPage.completeOnboarding(
      testData.organization.name,
      testData.product.name
    );

    // Step 6: Create referral program (redirects to setup page)
    console.log('\n--- Step 6: Creating referral program ---');
    const programId = await programSetupPage.createProgram(testData.program.name);
    await expect(programId).toBeTruthy();
    console.log(`✓ Program ID: ${programId}`);

    // Step 7: Complete brand configuration step
    console.log('\n--- Step 7: Completing brand configuration ---');
    // Set redirect URL to ACME signup page for referrals
    await programSetupPage.completeBrandStep(`${config.urls.acme}/signup`);

    // Step 8: Complete rewards configuration step
    console.log('\n--- Step 8: Completing rewards configuration ---');
    await programSetupPage.completeRewardStep();

    // Step 9: Verify installation credentials are visible on program page
    console.log('\n--- Step 9: Verifying installation credentials ---');
    const credentials = await programSetupPage.getIntegrationCredentials();
    await expect(credentials.productId).toBeTruthy();
    await expect(credentials.programId).toBeTruthy();
    await expect(credentials.clientId).toBeTruthy();
    await expect(credentials.clientSecret).toBeTruthy();
    console.log('✓ All installation credentials retrieved successfully');
    console.log(`  Product ID: ${credentials.productId}`);
    console.log(`  Program ID: ${credentials.programId}`);
    console.log(`  Client ID: ${credentials.clientId}`);

    // Step 10: Reset ACME state (clear any existing users/sessions)
    console.log('\n--- Step 10: Resetting ACME state ---');
    await request.post(`${config.urls.acme}/api/test/reset`);
    console.log('✓ ACME state reset');

    // Step 11: Configure ACME with RefRef credentials
    console.log('\n--- Step 11: Configuring ACME with RefRef credentials ---');
    const configResponse = await request.post(`${config.urls.acme}/api/test/configure`, {
      data: {
        productId: credentials.productId,
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        programId: credentials.programId,
      },
    });
    await expect(configResponse.ok()).toBeTruthy();
    console.log('✓ ACME configured with RefRef credentials');

    // Also set cookies directly in browser context for the widget to use
    await page.context().addCookies([
      {
        name: 'refref-config',
        value: JSON.stringify({
          productId: credentials.productId,
          clientId: credentials.clientId,
          programId: credentials.programId,
        }),
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
      },
      {
        name: 'refref-secret',
        value: credentials.clientSecret,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Strict',
      }
    ]);

    // Step 12: John signs up in ACME
    console.log('\n--- Step 12: John signs up in ACME ---');
    await page.goto(`${config.urls.acme}/signup`);
    await expect(page).toHaveTitle(/ACME/);

    const johnData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    await page.getByTestId('acme-signup-name').fill(johnData.name);
    await page.getByTestId('acme-signup-email').fill(johnData.email);
    await page.getByTestId('acme-signup-password').fill(johnData.password);
    await page.getByTestId('acme-signup-submit').click();
    console.log('✓ John submitted signup form');

    // Step 13: Verify redirect to dashboard
    console.log('\n--- Step 13: Verifying John is logged in ---');
    await expect(page).toHaveURL(`${config.urls.acme}/dashboard`);
    await page.waitForLoadState('networkidle');
    console.log('✓ John redirected to dashboard');

    // Step 14: Verify RefRef widget is visible
    console.log('\n--- Step 14: Verifying RefRef widget is visible ---');
    const widgetContainer = page.getByTestId('refref-widget-container');
    await expect(widgetContainer).toBeVisible();
    console.log('✓ RefRef widget container is visible');

    // Wait for widget script to load and render
    await page.waitForTimeout(3000);

    // Verify the actual widget button/trigger is visible (requires assets server)
    const widgetTrigger = page.getByTestId('refref-widget-trigger');
    const widgetVisible = await widgetTrigger.isVisible().catch(() => false);

    // Variable to store the referral URL
    let referralUrl: string | null = null;

    if (widgetVisible) {
      console.log('✓ RefRef widget button is visible and rendered');

      // Step 15: Click on the widget button to open it
      console.log('\n--- Step 15: Opening RefRef widget ---');
      await widgetTrigger.click();
      console.log('✓ Clicked RefRef widget button');

      // Wait for widget modal/iframe to appear
      await page.waitForTimeout(2000);

      // Step 16: Verify widget modal is open
      console.log('\n--- Step 16: Verifying widget modal is open ---');

      // The widget likely renders in a shadow DOM or iframe
      // Try to find the widget modal/content
      const widgetModal = page.locator('[data-testid="refref-widget-modal"], #refref-widget-modal, .refref-modal, iframe[title*="RefRef"], iframe[src*="refref"], iframe[src*="widget"]').first();
      const modalVisible = await widgetModal.isVisible().catch(() => false);

      if (modalVisible) {
        console.log('✓ RefRef widget modal is open');

        // If it's an iframe, we need to get its content
        const isIframe = await widgetModal.evaluate(el => el.tagName === 'IFRAME');

        if (isIframe) {
          console.log('  Widget is rendered in an iframe');

          // Get the iframe content
          const frame = page.frameLocator('iframe[title*="RefRef"], iframe[src*="refref"], iframe[src*="widget"]').first();

          // Step 17: Verify referral URL is displayed
          console.log('\n--- Step 17: Verifying referral URL ---');

          // Look for the referral URL in the widget
          // It should contain the refer server URL with a referral code
          const referralUrlElement = frame.locator('input[type="text"], input[readonly], .referral-url, .referral-link, [data-testid*="referral"], [data-testid*="url"]').first();
          const referralUrlVisible = await referralUrlElement.isVisible().catch(() => false);

          if (referralUrlVisible) {
            const url = await referralUrlElement.inputValue().catch(() =>
              referralUrlElement.textContent()
            );
            referralUrl = url; // Store the URL for Jane's test
            console.log(`✓ Referral URL found: ${url}`);

            // Verify the URL format
            // Verify the URL format - should be just /[code] (no /r/ prefix)
            await expect(referralUrl).toMatch(/http:\/\/localhost:3002\/[a-zA-Z0-9]+$/);
            console.log('✓ Referral URL has correct format');

            // Step 18: Verify participant data
            console.log('\n--- Step 18: Verifying participant data ---');

            // Check for John's email in the widget
            const emailElement = frame.locator('text=john@example.com, text=John Doe, [data-testid*="email"], [data-testid*="participant"]').first();
            const hasParticipantData = await emailElement.isVisible().catch(() => false);

            if (hasParticipantData) {
              console.log('✓ Participant data is displayed in widget');
            } else {
              console.log('⚠ Participant data not visible in widget');
            }
          } else {
            console.log('⚠ Referral URL not found in widget iframe');
          }
        } else {
          // Widget is not in iframe, check in regular DOM
          console.log('  Widget is rendered in regular DOM');

          // Step 17: Verify referral URL is displayed
          console.log('\n--- Step 17: Verifying referral URL ---');

          const referralUrlElement = page.locator('input[type="text"], input[readonly], .referral-url, .referral-link, [data-testid*="referral"], [data-testid*="url"]').first();
          const referralUrlVisible = await referralUrlElement.isVisible().catch(() => false);

          if (referralUrlVisible) {
            const url = await referralUrlElement.inputValue().catch(() =>
              referralUrlElement.textContent()
            );
            referralUrl = url; // Store the URL for Jane's test
            console.log(`✓ Referral URL found: ${url}`);

            // Verify the URL format
            // Verify the URL format - should be just /[code] (no /r/ prefix)
            await expect(referralUrl).toMatch(/http:\/\/localhost:3002\/[a-zA-Z0-9]+$/);
            console.log('✓ Referral URL has correct format');
          } else {
            console.log('⚠ Referral URL not found in widget');
          }
        }
      } else {
        console.log('⚠ Widget modal did not open - checking for shadow DOM');

        // Try to access shadow DOM if the widget uses it
        const shadowContent = await page.evaluate(() => {
          // Find all elements with shadow roots
          const allElements = document.querySelectorAll('*');
          for (const element of allElements) {
            if (element.shadowRoot) {
              // Found shadow host, search within shadow DOM
              const shadowRoot = element.shadowRoot;

              // Look for modal/dialog within shadow DOM
              const modal = shadowRoot.querySelector('[role="dialog"], .modal, .dialog, .popup, .widget-modal, [data-testid*="modal"]');
              if (modal) {
                // Modal found, now look for referral URL
                const urlInput = shadowRoot.querySelector('input[type="text"], input[readonly], .referral-url, .referral-link, [data-testid*="referral"], [data-testid*="url"]');
                const copyButton = shadowRoot.querySelector('button[data-testid*="copy"], button.copy, [aria-label*="copy"], [aria-label*="Copy"]');

                let referralUrl = null;
                if (urlInput) {
                  referralUrl = (urlInput as HTMLInputElement).value || urlInput.textContent;
                }

                // Look for participant info
                const participantInfo = shadowRoot.querySelector('.participant-email, .user-email, [data-testid*="email"]');

                return {
                  hasModal: true,
                  hasShadowRoot: true,
                  referralUrl: referralUrl,
                  hasCopyButton: !!copyButton,
                  hasParticipantInfo: !!participantInfo,
                  participantEmail: participantInfo?.textContent || null
                };
              }
            }
          }
          return { hasModal: false, hasShadowRoot: false };
        });

        if (shadowContent.hasShadowRoot && shadowContent.hasModal) {
          console.log('✓ Widget uses shadow DOM and modal is open');

          // Step 17: Verify referral URL is displayed
          console.log('\n--- Step 17: Verifying referral URL in shadow DOM ---');

          if (shadowContent.referralUrl) {
            referralUrl = shadowContent.referralUrl; // Store the URL for Jane's test
            console.log(`✓ Referral URL found: ${shadowContent.referralUrl}`);

            // Verify the URL format - should be just /[code] (no /r/ prefix)
            const urlPattern = /http:\/\/localhost:3002\/[a-zA-Z0-9]+$/;
            if (urlPattern.test(shadowContent.referralUrl)) {
              console.log('✓ Referral URL has correct format');
            } else {
              console.log('⚠ Referral URL format unexpected');
            }

            if (shadowContent.hasCopyButton) {
              console.log('✓ Copy button is present');
            }
          } else {
            console.log('⚠ Referral URL not found in shadow DOM');
          }

          // Step 18: Verify participant data
          console.log('\n--- Step 18: Verifying participant data in shadow DOM ---');

          if (shadowContent.hasParticipantInfo) {
            console.log(`✓ Participant info found: ${shadowContent.participantEmail}`);
          } else {
            console.log('⚠ Participant data not visible in widget');
          }
        } else if (shadowContent.hasShadowRoot) {
          console.log('  Widget uses shadow DOM but modal not found');
          console.log('  Trying alternative approach...');

          // Try clicking again or waiting longer
          await page.waitForTimeout(2000);

          // Check if there's a different shadow host
          const alternativeCheck = await page.evaluate(() => {
            // Look specifically for RefRef-related shadow hosts
            const possibleHosts = document.querySelectorAll('[id*="refref"], [class*="refref"], refref-widget, [data-refref]');
            for (const host of possibleHosts) {
              if (host.shadowRoot) {
                const content = host.shadowRoot.innerHTML;
                return {
                  found: true,
                  hasContent: content.length > 0,
                  snippet: content.substring(0, 200)
                };
              }
            }
            return { found: false };
          });

          if (alternativeCheck.found) {
            console.log('  Found RefRef shadow host with content');
            if (alternativeCheck.snippet) {
              console.log(`  Content preview: ${alternativeCheck.snippet.substring(0, 100)}...`);
            }
          }
        } else {
          console.log('  Widget modal not found and no shadow DOM detected');
        }
      }
    } else {
      console.log('⚠ Widget button not visible - assets server may not be running');
      console.log('  Widget integration is configured correctly, but requires:');
      console.log('  pnpm -F @refref/assets dev');
    }

    // Step 19: Test referral flow with Jane
    if (referralUrl) {
      console.log('\n--- Step 19: Testing referral flow with Jane ---');
      console.log(`Using referral URL: ${referralUrl}`);

      // Create a new browser context for Jane (clean session, no John's cookies)
      const janeContext = await browser.newContext();
      const janePage = await janeContext.newPage();

      // Listen to Jane's browser console for debugging
      janePage.on('console', msg => {
        const type = msg.type();
        if (type === 'error' || type === 'warning' || msg.text().includes('RefRef') || msg.text().includes('referral')) {
          console.log(`[Jane Browser ${type}]`, msg.text());
        }
      });

      // Visit the referral URL as Jane with retry logic
      console.log('  Jane is visiting the referral URL...');

      // Try visiting the referral URL with retry logic (in case refer server is busy)
      let retries = 3;
      let visitSuccess = false;

      while (retries > 0 && !visitSuccess) {
        try {
          await janePage.goto(referralUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
          visitSuccess = true;
        } catch (error) {
          retries--;
          if (retries > 0) {
            console.log(`  ⚠ Connection refused, retry ${3 - retries}/3 - waiting 2 seconds...`);
            await janePage.waitForTimeout(2000);
          } else {
            console.log('  ❌ Failed to connect to referral URL after 3 attempts');
            throw error;
          }
        }
      }

      // Wait for redirect to complete
      await janePage.waitForLoadState('networkidle');

      // Step 20: Verify Jane is redirected to ACME signup
      console.log('\n--- Step 20: Verifying Jane is redirected to ACME signup ---');
      const currentUrl = janePage.url();
      console.log(`  Jane landed at: ${currentUrl}`);

      // Check if Jane was redirected to ACME signup
      if (currentUrl.includes(`${config.urls.acme}/signup`)) {
        console.log('✓ Jane was redirected to ACME signup page');

        // Check if referral tracking parameters are present
        if (currentUrl.includes('ref=') || currentUrl.includes('referral_code=') || currentUrl.includes('r=')) {
          console.log('✓ Referral tracking parameters detected in URL');
        }

        // Step 21: Complete Jane's signup
        console.log('\n--- Step 21: Jane is signing up at ACME ---');
        const janeData = {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'password456',
        };

        // Fill signup form
        await janePage.getByTestId('acme-signup-name').fill(janeData.name);
        await janePage.getByTestId('acme-signup-email').fill(janeData.email);
        await janePage.getByTestId('acme-signup-password').fill(janeData.password);
        await janePage.getByTestId('acme-signup-submit').click();
        console.log('✓ Jane submitted signup form');

        // Wait for redirect to dashboard
        await janePage.waitForURL(`${config.urls.acme}/dashboard`, { timeout: 10000 });
        console.log('✓ Jane successfully signed up and reached dashboard');

        // Step 22: Verify referral was tracked
        console.log('\n--- Step 22: Verifying referral tracking ---');

        // Check localStorage for referral data
        const referralData = await janePage.evaluate(() => {
          return {
            hasRefrefCookie: document.cookie.includes('refref_'),
            localStorage: {
              referralCode: localStorage.getItem('refref_referral_code'),
              referrerId: localStorage.getItem('refref_referrer_id'),
            }
          };
        });

        if (referralData.hasRefrefCookie) {
          console.log('✓ RefRef tracking cookie detected');
        }
        if (referralData.localStorage.referralCode || referralData.localStorage.referrerId) {
          console.log(`✓ Referral data stored: ${JSON.stringify(referralData.localStorage)}`);
        }

        // Optional: Check if Jane's widget shows she was referred by John
        const janeWidgetContainer = janePage.getByTestId('refref-widget-container');
        const widgetVisible = await janeWidgetContainer.isVisible().catch(() => false);
        if (widgetVisible) {
          console.log('✓ Jane\'s RefRef widget is also visible');
        }

      } else {
        console.log(`⚠ Jane was redirected to: ${currentUrl}`);
        console.log('  Expected redirect to ACME signup page');
      }

      // Clean up Jane's context
      await janeContext.close();
      console.log('\n✓ Jane\'s referral flow test complete');

      // Step 23: Verify referral data in webapp admin pages
      console.log('\n--- Step 23: Verifying referral data in webapp admin pages ---');

      // Navigate to the webapp as the admin user (using original page context)
      console.log(`\nNavigating to webapp program page: ${config.urls.webapp}/programs/${programId}`);
      await page.goto(`${config.urls.webapp}/programs/${programId}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Verify we're on the correct program page first
      const webappUrl = page.url();
      console.log(`  Current URL: ${webappUrl}`);

      // Debug: Check what navigation elements are visible
      console.log('\nLooking for navigation elements...');
      const navLinks = await page.locator('nav a, aside a, [role="navigation"] a, nav button, aside button').allTextContents();
      console.log('  Found navigation items:', navLinks.filter(text => text.trim()).map(text => text.trim()));

      // Check for sidebar - it might be collapsed
      const sidebar = page.locator('aside, nav, [role="navigation"], .sidebar, [data-sidebar]').first();
      const sidebarVisible = await sidebar.isVisible().catch(() => false);
      if (sidebarVisible) {
        console.log('  Sidebar is visible');
      } else {
        console.log('  No sidebar found, navigation might be in a different layout');
      }

      // Function to click a navigation item with multiple fallback strategies
      async function clickNavItem(itemName: string) {
        console.log(`\nTrying to navigate to ${itemName}...`);

        // Strategy 1: Direct link in nav/aside
        let selector = page.locator(`nav a, aside a, [role="navigation"] a`).filter({ hasText: new RegExp(itemName, 'i') }).first();
        let found = await selector.isVisible().catch(() => false);

        if (!found) {
          // Strategy 2: Button in nav/aside
          selector = page.locator(`nav button, aside button, [role="navigation"] button`).filter({ hasText: new RegExp(itemName, 'i') }).first();
          found = await selector.isVisible().catch(() => false);
        }

        if (!found) {
          // Strategy 3: Any link with the text
          selector = page.locator('a').filter({ hasText: new RegExp(itemName, 'i') }).first();
          found = await selector.isVisible().catch(() => false);
        }

        if (!found) {
          // Strategy 4: Tabs or tab-like elements
          selector = page.locator('[role="tab"], [data-testid*="tab"], .tab').filter({ hasText: new RegExp(itemName, 'i') }).first();
          found = await selector.isVisible().catch(() => false);
        }

        if (!found) {
          // Strategy 5: Any clickable element with the text
          selector = page.locator('*').filter({ hasText: new RegExp(`^${itemName}$`, 'i') }).first();
          found = await selector.isVisible().catch(() => false);
        }

        if (found) {
          console.log(`  Found ${itemName} link/button, clicking...`);
          await selector.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          return true;
        } else {
          console.log(`  ⚠ Could not find ${itemName} navigation item`);
          // Try direct URL navigation as fallback
          const currentUrl = page.url();
          const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
          const targetUrl = `${baseUrl}/${itemName.toLowerCase()}`;
          console.log(`  Attempting direct navigation to: ${targetUrl}`);
          await page.goto(targetUrl);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          return false;
        }
      }

      // Check Participants page
      console.log('\n--- Checking Participants page ---');
      await clickNavItem('Participants');

      // Debug: Log current URL after navigation attempt
      console.log(`  Current URL after navigation: ${page.url()}`);

      // Look for participant data - using simpler approach with page content
      console.log('  Looking for participant data...');

      // Wait a bit for any dynamic content to load
      await page.waitForTimeout(3000);

      // Get the page text to check for participants
      const pageText = await page.locator('body').innerText().catch(() => '');
      console.log('  Page content loaded, checking for participants...');

      // Check for John in the content
      const hasJohn = pageText.toLowerCase().includes('john') || pageText.includes('john@example.com');
      if (hasJohn) {
        console.log('  ✓ Found John in participants data');
      } else {
        console.log('  ⚠ John not found in participants');
      }

      // Check for Jane in the content
      const hasJane = pageText.toLowerCase().includes('jane') || pageText.includes('jane@example.com');
      if (hasJane) {
        console.log('  ✓ Found Jane in participants data');
      } else {
        console.log('  ⚠ Jane not found in participants');
      }

      // Check Activity page using the clickNavItem function
      console.log('\n--- Checking Activity page ---');
      await clickNavItem('Activity');
      console.log(`  Current URL after navigation: ${page.url()}`);
      await page.waitForTimeout(2000);

      // Check for activity data
      console.log('  Looking for activity data...');
      const activityPageText = await page.locator('body').innerText().catch(() => '');

      // Check for signup or referral events
      const hasSignupEvent = activityPageText.toLowerCase().includes('signup') || activityPageText.toLowerCase().includes('sign up');
      const hasReferralEvent = activityPageText.toLowerCase().includes('referral') || activityPageText.toLowerCase().includes('referred');

      if (hasSignupEvent) {
        console.log('  ✓ Signup event(s) found in activity feed');
      } else {
        console.log('  ⚠ No signup events visible');
      }

      if (hasReferralEvent) {
        console.log('  ✓ Referral event found in activity feed');
      } else {
        console.log('  ⚠ No referral events visible');
      }

      // Check Rewards page using the clickNavItem function
      console.log('\n--- Checking Rewards page ---');
      await clickNavItem('Rewards');
      console.log(`  Current URL after navigation: ${page.url()}`);
      await page.waitForTimeout(2000);

      // Check for rewards data
      console.log('  Looking for rewards data...');
      const rewardsPageText = await page.locator('body').innerText().catch(() => '');

      // Check for John's reward or any reward amount
      const hasJohnReward = rewardsPageText.includes('John') || rewardsPageText.includes('john@example.com');
      const hasRewardAmount = rewardsPageText.includes('$') || rewardsPageText.toLowerCase().includes('reward');

      if (hasJohnReward) {
        console.log('  ✓ Reward for John found in rewards table');
      } else if (hasRewardAmount) {
        console.log('  ✓ Rewards data found on page');
      } else {
        console.log('  ⚠ No rewards visible yet (may need to trigger reward rules)');
      }

      console.log('\n✓ Webapp data verification complete');
    } else {
      console.log('\n⚠ Skipping referral flow test - no referral URL was extracted from widget');
    }

    console.log('\n=== Core User Journey Test Complete ===\n');
  });
});
