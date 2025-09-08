import { test, expect } from '@playwright/test';

test.describe('Navbar Visual Analysis', () => {
  test('should capture navbar screenshots for design analysis', async ({ page }) => {
    // Desktop view - 1280px
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Full page screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/navbar-analysis-desktop-full.png',
      fullPage: false
    });
    
    // Focused navbar screenshot
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    await header.screenshot({ path: 'tests/screenshots/navbar-analysis-desktop-focused.png' });
    
    // Large desktop view - 1440px
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ 
      path: 'tests/screenshots/navbar-analysis-large-desktop-full.png',
      fullPage: false
    });
    
    await header.screenshot({ path: 'tests/screenshots/navbar-analysis-large-desktop-focused.png' });
    
    // Check element dimensions for analysis
    const headerBox = await header.boundingBox();
    console.log('Header dimensions:', headerBox);
    
    // Check navigation elements
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();
    console.log('Navigation links found:', linkCount);
    
    for (let i = 0; i < Math.min(linkCount, 6); i++) {
      const link = navLinks.nth(i);
      const linkText = await link.textContent();
      const linkBox = await link.boundingBox();
      console.log(`Link ${i}: "${linkText}" - dimensions:`, linkBox);
    }
    
    // Check gamification elements
    const progressElement = page.locator('[class*="emerald"]').first();
    if (await progressElement.isVisible()) {
      const progressBox = await progressElement.boundingBox();
      console.log('Progress element dimensions:', progressBox);
    }
    
    const streakElement = page.locator('[class*="orange"]').first();
    if (await streakElement.isVisible()) {
      const streakBox = await streakElement.boundingBox();
      console.log('Streak element dimensions:', streakBox);
    }
    
    const levelElement = page.locator('[class*="yellow"]').first();
    if (await levelElement.isVisible()) {
      const levelBox = await levelElement.boundingBox();
      console.log('Level element dimensions:', levelBox);
    }
    
    // Test mobile view too
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'tests/screenshots/navbar-analysis-mobile.png' });
  });
});