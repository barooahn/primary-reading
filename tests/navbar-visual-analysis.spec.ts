import { test } from '@playwright/test';

test.describe('Navbar Visual Analysis', () => {
  test('should capture navbar screenshots at different viewport sizes', async ({ page }) => {
    // Go to homepage first (main dashboard)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any animations to settle
    await page.waitForTimeout(1000);
    
    console.log('=== DESKTOP VIEW (1280px) ===');
    
    // Set to desktop view (1280px width)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'navbar-desktop-1280-full.png',
      fullPage: true
    });
    
    // Take navbar-focused screenshot
    const header = page.locator('header').first();
    if (await header.isVisible()) {
      await header.screenshot({ path: 'navbar-desktop-1280-focused.png' });
      
      // Get header dimensions and info
      const headerBox = await header.boundingBox();
      console.log('Desktop 1280px Header dimensions:', headerBox);
      
      // Analyze navigation elements
      const navElements = page.locator('nav').first();
      if (await navElements.isVisible()) {
        const navBox = await navElements.boundingBox();
        console.log('Desktop 1280px Nav dimensions:', navBox);
        
        // Check individual nav links
        const navLinks = navElements.locator('a');
        const linkCount = await navLinks.count();
        console.log('Desktop 1280px Nav links count:', linkCount);
        
        for (let i = 0; i < linkCount; i++) {
          const link = navLinks.nth(i);
          const linkText = await link.textContent();
          const linkBox = await link.boundingBox();
          console.log(`Desktop 1280px Link ${i}: "${linkText?.trim()}" - dimensions:`, linkBox);
        }
      }
      
      // Check right side elements (gamification)
      const rightElements = page.locator('header div').last();
      const rightBox = await rightElements.boundingBox();
      console.log('Desktop 1280px Right elements dimensions:', rightBox);
    }
    
    console.log('\n=== LARGE DESKTOP VIEW (1440px) ===');
    
    // Set to large desktop view (1440px width)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'navbar-desktop-1440-full.png',
      fullPage: true
    });
    
    // Take navbar-focused screenshot
    if (await header.isVisible()) {
      await header.screenshot({ path: 'navbar-desktop-1440-focused.png' });
      
      // Get header dimensions and info
      const headerBox = await header.boundingBox();
      console.log('Desktop 1440px Header dimensions:', headerBox);
      
      // Analyze navigation elements
      const navElements = page.locator('nav').first();
      if (await navElements.isVisible()) {
        const navBox = await navElements.boundingBox();
        console.log('Desktop 1440px Nav dimensions:', navBox);
        
        // Check individual nav links
        const navLinks = navElements.locator('a');
        const linkCount = await navLinks.count();
        console.log('Desktop 1440px Nav links count:', linkCount);
        
        for (let i = 0; i < linkCount; i++) {
          const link = navLinks.nth(i);
          const linkText = await link.textContent();
          const linkBox = await link.boundingBox();
          console.log(`Desktop 1440px Link ${i}: "${linkText?.trim()}" - dimensions:`, linkBox);
        }
      }
      
      // Check right side elements (gamification)
      const rightElements = page.locator('header div').last();
      const rightBox = await rightElements.boundingBox();
      console.log('Desktop 1440px Right elements dimensions:', rightBox);
    }
    
    console.log('\n=== ANALYZING ELEMENT SPACING AND ALIGNMENT ===');
    
    // Go back to 1440px for detailed analysis
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    
    // Analyze all button elements for consistency
    const allButtons = page.locator('header button, header a');
    const buttonCount = await allButtons.count();
    console.log('Total header buttons/links:', buttonCount);
    
    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const buttonText = await button.textContent();
      const buttonBox = await button.boundingBox();
      const buttonStyles = await button.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          width: styles.width,
          height: styles.height,
          padding: styles.padding,
          margin: styles.margin,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight
        };
      });
      console.log(`Button ${i}: "${buttonText?.trim()}" - box:`, buttonBox, 'styles:', buttonStyles);
    }
    
    // Check the container alignment
    const headerContainer = page.locator('header > div').first();
    if (await headerContainer.isVisible()) {
      const containerStyles = await headerContainer.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          justifyContent: styles.justifyContent,
          alignItems: styles.alignItems,
          gap: styles.gap,
          padding: styles.padding,
          flexWrap: styles.flexWrap
        };
      });
      console.log('Header container styles:', containerStyles);
    }
    
    // Check logo alignment
    const logo = page.locator('[data-testid="logo"]');
    if (await logo.isVisible()) {
      const logoBox = await logo.boundingBox();
      const logoStyles = await logo.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          alignItems: styles.alignItems,
          gap: styles.gap,
          flexShrink: styles.flexShrink
        };
      });
      console.log('Logo dimensions:', logoBox, 'styles:', logoStyles);
    }
  });
  
  test('should analyze navbar on different pages', async ({ page }) => {
    const pages = [
      { path: '/', name: 'dashboard' },
      { path: '/stories', name: 'stories' },
      { path: '/create', name: 'create' },
      { path: '/progress', name: 'progress' }
    ];
    
    for (const pageInfo of pages) {
      console.log(`\n=== Analyzing ${pageInfo.name} page navbar ===`);
      
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      // Set to large desktop for consistency
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(300);
      
      // Take screenshot
      await page.screenshot({ 
        path: `navbar-${pageInfo.name}-page-full.png`,
        fullPage: false,
        clip: { x: 0, y: 0, width: 1440, height: 150 } // Just the top navbar area
      });
      
      const header = page.locator('header').first();
      if (await header.isVisible()) {
        await header.screenshot({ path: `navbar-${pageInfo.name}-page-focused.png` });
        
        const headerBox = await header.boundingBox();
        console.log(`${pageInfo.name} page header dimensions:`, headerBox);
        
        // Check if active states are properly applied
        const activeLinks = page.locator('header a[href="' + pageInfo.path + '"]');
        const activeCount = await activeLinks.count();
        console.log(`Active navigation indicators on ${pageInfo.name}:`, activeCount);
      }
    }
  });
});