import { test } from '@playwright/test';

test.describe('Navbar Layout Investigation', () => {
  test('should examine navbar layout and dimensions', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the navbar area
    await page.screenshot({ 
      path: 'tests/screenshots/navbar-full.png',
      fullPage: false
    });
    
    // Find the header/navbar element
    const header = page.locator('header').first();
    
    if (await header.isVisible()) {
      // Get header dimensions and properties
      const headerBox = await header.boundingBox();
      console.log('Header dimensions:', headerBox);
      
      // Take focused screenshot of navbar
      await header.screenshot({ path: 'tests/screenshots/navbar-focused.png' });
      
      // Check for navigation elements
      const navElements = await page.locator('nav, [role="navigation"]').count();
      console.log('Navigation elements found:', navElements);
      
      // Check for logo/brand
      const logo = page.locator('[data-testid="logo"], .logo, h1').first();
      if (await logo.isVisible()) {
        const logoBox = await logo.boundingBox();
        console.log('Logo dimensions:', logoBox);
      }
      
      // Check for navigation links
      const navLinks = page.locator('header a, nav a');
      const linkCount = await navLinks.count();
      console.log('Navigation links found:', linkCount);
      
      // Check each link's dimensions
      for (let i = 0; i < Math.min(linkCount, 10); i++) {
        const link = navLinks.nth(i);
        const linkText = await link.textContent();
        const linkBox = await link.boundingBox();
        console.log(`Link ${i}: "${linkText}" - dimensions:`, linkBox);
      }
      
      // Check for mobile menu button
      const mobileMenuButton = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"], .mobile-menu');
      const hasMobileMenu = await mobileMenuButton.count() > 0;
      console.log('Mobile menu button present:', hasMobileMenu);
      
      // Check overall header computed styles
      const headerStyles = await header.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          flexDirection: styles.flexDirection,
          justifyContent: styles.justifyContent,
          alignItems: styles.alignItems,
          padding: styles.padding,
          margin: styles.margin,
          height: styles.height,
          width: styles.width
        };
      });
      console.log('Header computed styles:', headerStyles);
      
    } else {
      console.log('No header element found');
      
      // Look for any navigation-related elements
      const possibleNavs = await page.locator('[class*="nav"], [class*="header"], [class*="menu"]').count();
      console.log('Possible navigation elements:', possibleNavs);
    }
    
    // Check viewport size
    const viewport = page.viewportSize();
    console.log('Current viewport:', viewport);
    
    // Test on mobile viewport too
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ path: 'tests/screenshots/navbar-mobile.png' });
    
    if (await header.isVisible()) {
      const mobileHeaderBox = await header.boundingBox();
      console.log('Mobile header dimensions:', mobileHeaderBox);
    }
  });
  
  test('should check navbar on different pages', async ({ page }) => {
    const pages = ['/', '/stories', '/create', '/progress'];
    
    for (const pagePath of pages) {
      console.log(`\n=== Checking navbar on ${pagePath} ===`);
      
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const header = page.locator('header').first();
      
      if (await header.isVisible()) {
        const headerBox = await header.boundingBox();
        console.log(`${pagePath} header dimensions:`, headerBox);
        
        await page.screenshot({ path: `tests/screenshots/navbar-${pagePath.replace('/', 'home')}.png` });
      } else {
        console.log(`No header found on ${pagePath}`);
      }
    }
  });
});