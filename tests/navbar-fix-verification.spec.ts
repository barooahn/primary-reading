import { test, expect } from '@playwright/test';

test.describe('Navbar Fix Verification', () => {
  test('should have properly structured navbar with correct dimensions', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check header exists and has correct height
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    const headerBox = await header.boundingBox();
    expect(headerBox?.height).toBe(64); // Should be exactly 64px now
    
    // Check logo is properly positioned
    const logo = page.locator('[data-testid="logo"]');
    await expect(logo).toBeVisible();
    
    // Test mobile navigation - first switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile menu button exists and is visible on mobile
    const mobileMenuButton = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenuButton).toBeVisible();
    await mobileMenuButton.click();
    
    // Check mobile nav is visible
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    await expect(mobileNav).toBeVisible();
    
    // Check all mobile nav links are properly sized
    const mobileNavLinks = [
      page.locator('[data-testid="mobile-nav-dashboard"]'),
      page.locator('[data-testid="mobile-nav-stories"]'),
      page.locator('[data-testid="mobile-nav-create"]'),
      page.locator('[data-testid="mobile-nav-progress"]')
    ];
    
    for (const link of mobileNavLinks) {
      await expect(link).toBeVisible();
      const linkBox = await link.boundingBox();
      expect(linkBox?.height).toBeGreaterThanOrEqual(48); // Each link should be at least 48px tall
    }
  });
  
  test('should work correctly on key pages', async ({ page }) => {
    const pages = ['/', '/stories'];  // Test only pages we know have headers
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const header = page.locator('header').first();
      await expect(header).toBeVisible({timeout: 10000});
      
      const headerBox = await header.boundingBox();
      expect(headerBox?.height).toBe(64);
    }
  });
});