const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function takeNavigationScreenshots() {
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, 'navigation-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch();
  
  try {
    // 1. Desktop screenshot (1200x800) of the homepage showing the improved navigation bar
    console.log('Taking desktop screenshot...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewportSize({ width: 1200, height: 800 });
    await desktopPage.goto('http://localhost:3002');
    
    // Wait for the navigation to be fully loaded
    await desktopPage.waitForSelector('[data-testid="logo"]', { timeout: 10000 });
    await desktopPage.waitForTimeout(1000); // Additional wait for animations
    
    await desktopPage.screenshot({
      path: path.join(screenshotsDir, 'desktop-navigation-1200x800.png'),
      fullPage: false
    });
    console.log('✓ Desktop screenshot saved');
    
    // 2. Mobile screenshot (375x667) showing the burger menu closed
    console.log('Taking mobile screenshot (menu closed)...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewportSize({ width: 375, height: 667 });
    await mobilePage.goto('http://localhost:3002');
    
    // Wait for the navigation to be fully loaded
    await mobilePage.waitForSelector('[data-testid="logo"]', { timeout: 10000 });
    await mobilePage.waitForSelector('[data-testid="mobile-menu"]', { timeout: 10000 });
    await mobilePage.waitForTimeout(1000);
    
    await mobilePage.screenshot({
      path: path.join(screenshotsDir, 'mobile-navigation-closed-375x667.png'),
      fullPage: false
    });
    console.log('✓ Mobile screenshot (menu closed) saved');
    
    // 3. Mobile screenshot (375x667) showing the burger menu opened
    console.log('Taking mobile screenshot (menu opened)...');
    // Click the mobile menu button to open it
    await mobilePage.click('[data-testid="mobile-menu"]');
    
    // Wait for the mobile navigation to appear
    await mobilePage.waitForSelector('[data-testid="mobile-nav"]', { timeout: 5000 });
    await mobilePage.waitForTimeout(500); // Wait for animation to complete
    
    await mobilePage.screenshot({
      path: path.join(screenshotsDir, 'mobile-navigation-opened-375x667.png'),
      fullPage: false
    });
    console.log('✓ Mobile screenshot (menu opened) saved');
    
    // Close pages
    await desktopPage.close();
    await mobilePage.close();
    
    console.log('\n🎉 All navigation screenshots completed!');
    console.log('📁 Screenshots saved in:', screenshotsDir);
    console.log('\nScreenshots taken:');
    console.log('1. desktop-navigation-1200x800.png - Desktop view of navigation bar');
    console.log('2. mobile-navigation-closed-375x667.png - Mobile view with burger menu closed');
    console.log('3. mobile-navigation-opened-375x667.png - Mobile view with burger menu opened');
    
  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Run the screenshot function
takeNavigationScreenshots().catch(console.error);