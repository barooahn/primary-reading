import { test, expect } from '@playwright/test';

test.describe('Desktop Reading Interface', () => {
  test('should not have vertical scrollbars in normal mode', async ({ page, browserName }) => {
    console.log(`🖥️ Testing scrollbars on ${browserName}...`);
    
    // Set desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Navigate directly to story reading page (using known UUID)
    const storyUrl = 'http://localhost:3001/read/b6932872-7059-4f2b-8463-1878e145a456';
    await page.goto(storyUrl);
    
    // Wait for story content to load
    await page.waitForSelector('.netflix-reading-container', { timeout: 10000 });
    
    // Wait for reading tip modal to appear and close it
    try {
      await page.waitForSelector('.fixed.inset-0.z-\\[100\\]', { timeout: 3000 });
      await page.click('button:has-text("Got it!")');
      await page.waitForSelector('.fixed.inset-0.z-\\[100\\]', { state: 'detached' });
      console.log('✅ Closed reading tip modal');
    } catch {
      console.log('ℹ️ No reading tip modal found or already closed');
    }
    
    // Check viewport vs document dimensions
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const hasVerticalScrollbar = documentHeight > viewportHeight;
    
    console.log(`📏 Viewport height: ${viewportHeight}px`);
    console.log(`📏 Document height: ${documentHeight}px`);
    console.log(`📜 Has vertical scrollbar: ${hasVerticalScrollbar}`);
    
    // Check if body element has overflow
    const bodyOverflow = await page.evaluate(() => {
      return window.getComputedStyle(document.body).overflow;
    });
    console.log(`📜 Body overflow: ${bodyOverflow}`);
    
    // Check reading container height
    const containerHeight = await page.evaluate(() => {
      const container = document.querySelector('.netflix-reading-container');
      return container ? container.getBoundingClientRect().height : 0;
    });
    console.log(`📏 Reading container height: ${containerHeight}px`);
    
    // Test scrolling behavior
    const initialScrollTop = await page.evaluate(() => window.pageYOffset);
    await page.evaluate(() => window.scrollTo(0, 100));
    const afterScrollTop = await page.evaluate(() => window.pageYOffset);
    
    console.log(`📜 Initial scroll position: ${initialScrollTop}px`);
    console.log(`📜 After scroll attempt: ${afterScrollTop}px`);
    
    // Reset scroll position
    await page.evaluate(() => window.scrollTo(0, 0));
    
    // The key test: document height should not exceed viewport height significantly
    // Allow for small browser chrome differences (up to 10px tolerance)
    expect(documentHeight).toBeLessThanOrEqual(viewportHeight + 10);
    
    // Verify no significant scrolling occurred
    expect(afterScrollTop).toBeLessThanOrEqual(10); // Should stay near top
    
    console.log('✅ Desktop scrollbar test passed!');
  });
  
  test('should maintain correct layout in fullscreen mode', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    const storyUrl = 'http://localhost:3001/read/b6932872-7059-4f2b-8463-1878e145a456?fullscreen=true';
    await page.goto(storyUrl);
    
    await page.waitForSelector('.netflix-reading-container.fullscreen-mode');
    
    // Close reading tip if present
    try {
      await page.waitForSelector('.fixed.inset-0.z-\\[100\\]', { timeout: 3000 });
      await page.click('button:has-text("Got it!")');
      await page.waitForSelector('.fixed.inset-0.z-\\[100\\]', { state: 'detached' });
    } catch {
      // Modal not found, continue
    }
    
    const containerClasses = await page.evaluate(() => {
      const container = document.querySelector('.netflix-reading-container');
      return container ? container.className : '';
    });
    
    expect(containerClasses).toContain('fullscreen-mode');
    expect(containerClasses).toContain('fixed');
    expect(containerClasses).toContain('z-[99999]');
    
    console.log('✅ Fullscreen mode layout verified!');
  });
});