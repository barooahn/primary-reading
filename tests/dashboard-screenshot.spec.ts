import { test } from '@playwright/test';

test('Dashboard screenshot with proper authentication', async ({ page }) => {
  console.log('Starting authentication process...');

  // Navigate to home page
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Try to click "Sign in to your account" link
  try {
    await page.click('text=Sign in to your account');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('Clicked sign in link');
  } catch {
    console.log('Sign in link not found, going to login page directly');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  // Wait for login form and fill it
  console.log('Looking for login form...');

  // Wait for email input to be visible and interactable
  const emailInput = await page.waitForSelector('input[type="email"], input[name="email"]', {
    state: 'visible',
    timeout: 10000
  });

  console.log('Found email input, filling credentials...');
  await emailInput.fill('barooahn@gmail.com');

  // Fill password
  const passwordInput = await page.waitForSelector('input[type="password"], input[name="password"]', {
    state: 'visible',
    timeout: 5000
  });
  await passwordInput.fill('g2442Y2L-17');

  // Submit the form
  console.log('Submitting login form...');
  const submitButton = await page.waitForSelector('button[type="submit"], button:has-text("Sign in"), button:has-text("Create Account")', {
    state: 'visible',
    timeout: 5000
  });

  await submitButton.click();

  // Wait for navigation after login
  console.log('Waiting for login to complete...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  // Check current URL
  let currentUrl = page.url();
  console.log('URL after login attempt:', currentUrl);

  // If still on login page, try dashboard directly (might be authenticated now)
  if (currentUrl.includes('/login')) {
    console.log('Still on login page, trying dashboard directly...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    currentUrl = page.url();
    console.log('URL after dashboard navigation:', currentUrl);
  }

  // Take screenshot regardless of authentication status
  await page.screenshot({
    path: 'test-results/dashboard-attempt.png',
    fullPage: true
  });

  // If we successfully reached dashboard, take additional screenshots
  if (!currentUrl.includes('/login')) {
    console.log('Successfully reached dashboard! Taking detailed screenshots...');

    // Full page screenshot
    await page.screenshot({
      path: 'test-results/authenticated-dashboard-full.png',
      fullPage: true
    });

    // Viewport screenshot
    await page.screenshot({
      path: 'test-results/authenticated-dashboard-viewport.png',
      fullPage: false
    });

    console.log('✅ Successfully captured authenticated dashboard screenshots!');
  } else {
    console.log('❌ Could not authenticate - still on login page');
  }

  // Final status
  const title = await page.title();
  console.log('Final page title:', title);
  console.log('Final URL:', currentUrl);
  console.log('Authentication successful:', !currentUrl.includes('/login'));
});