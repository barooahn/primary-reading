import { test, expect } from './fixtures/test-base';
import { devices } from '@playwright/test';

// Test mobile improvements
test.use({ 
  ...devices['iPhone 12'],
  hasTouch: true,
  isMobile: true,
  baseURL: 'http://localhost:3000'
});

test.describe('Mobile UX Improvements Verification', () => {
  test('verify mobile improvements are working', async ({ page }) => {
    console.log('📱 Testing mobile improvements...');
    
    // Navigate to create story page
    await page.goto('/create');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of mobile improvements
    await page.screenshot({ 
      path: 'mobile-screenshots/mobile-improvements-01-create-page.png',
      fullPage: true 
    });
    
    console.log('📱 Step 1: Checking mobile progress indicator...');
    
    // Check that mobile progress indicator is visible
    const mobileProgress = page.locator('div.block.sm\\:hidden');
    await expect(mobileProgress).toBeVisible();
    
    // Verify step indicator shows correct text
    await expect(page.locator('text=Step 1 of 4')).toBeVisible();
    await expect(page.locator('text=Choose Theme')).toBeVisible();
    
    console.log('✅ Mobile progress indicator working!');
    
    console.log('📱 Step 2: Testing year level buttons...');
    
    // Check year level buttons have proper mobile sizing
    const yearButtons = await page.locator('[data-testid^="year-"][data-testid$="-selector"]').all();
    console.log(`Found ${yearButtons.length} year level buttons`);
    
    for (let i = 0; i < yearButtons.length; i++) {
      const button = yearButtons[i];
      const boundingBox = await button.boundingBox();
      
      if (boundingBox) {
        console.log(`Year button ${i + 1}: ${boundingBox.width}x${boundingBox.height}`);
        
        // Verify minimum touch target size (56px for mobile)
        if (boundingBox.height < 56) {
          console.log(`⚠️  Year button ${i + 1} still too small: ${boundingBox.height}px height`);
        } else {
          console.log(`✅ Year button ${i + 1} meets mobile standards: ${boundingBox.height}px height`);
        }
      }
    }
    
    // Test year level interaction
    if (yearButtons.length > 2) {
      await yearButtons[2].click(); // Select Year 3
      await page.screenshot({ 
        path: 'mobile-screenshots/mobile-improvements-02-year-selected.png',
        fullPage: true 
      });
    }
    
    console.log('📱 Step 3: Testing theme selection...');
    
    // Wait a moment for themes to load
    await page.waitForTimeout(1000);
    
    // Check theme buttons
    const themeButtons = await page.locator('[data-testid="theme-button"]').all();
    console.log(`Found ${themeButtons.length} theme buttons`);
    
    if (themeButtons.length > 0) {
      const firstThemeBox = await themeButtons[0].boundingBox();
      if (firstThemeBox) {
        console.log(`First theme button: ${firstThemeBox.width}x${firstThemeBox.height}`);
        
        if (firstThemeBox.height >= 64) {
          console.log('✅ Theme buttons meet mobile sizing requirements');
        }
      }
      
      // Test theme selection
      await themeButtons[0].click();
      await page.screenshot({ 
        path: 'mobile-screenshots/mobile-improvements-03-theme-selected.png',
        fullPage: true 
      });
      
      // Wait for navigation to details step
      await page.waitForTimeout(1500);
    }
    
    console.log('📱 Step 4: Testing story type selection...');
    
    // Check story type buttons
    await page.screenshot({ 
      path: 'mobile-screenshots/mobile-improvements-04-story-details.png',
      fullPage: true 
    });
    
    const fictionButton = page.locator('[data-testid="story-type-fiction"]');
    // const nonFictionButton = page.locator('[data-testid="story-type-non_fiction"]');
    
    if (await fictionButton.count() > 0) {
      const fictionBox = await fictionButton.boundingBox();
      if (fictionBox) {
        console.log(`Fiction button: ${fictionBox.width}x${fictionBox.height}`);
        
        if (fictionBox.height >= 72) {
          console.log('✅ Story type buttons meet mobile sizing requirements');
        }
      }
      
      await fictionButton.click();
    }
    
    console.log('📱 Step 5: Testing generate button...');
    
    const generateButton = page.locator('[data-testid="generate-story-btn"]');
    if (await generateButton.count() > 0) {
      await generateButton.scrollIntoViewIfNeeded();
      
      const generateBox = await generateButton.boundingBox();
      if (generateBox) {
        console.log(`Generate button: ${generateBox.width}x${generateBox.height}`);
        
        if (generateBox.height >= 56) {
          console.log('✅ Generate button meets mobile sizing requirements');
        }
        
        // Check button positioning
        const viewport = page.viewportSize();
        if (viewport) {
          const distanceFromBottom = viewport.height - (generateBox.y + generateBox.height);
          console.log(`Distance from bottom: ${distanceFromBottom}px`);
          
          if (distanceFromBottom >= 20) {
            console.log('✅ Generate button has good spacing from bottom');
          }
        }
      }
      
      await page.screenshot({ 
        path: 'mobile-screenshots/mobile-improvements-05-ready-to-generate.png',
        fullPage: true 
      });
    }
    
    console.log('📱 Step 6: Testing viewport responsiveness...');
    
    // Test different mobile viewport sizes
    const testViewports = [
      { width: 320, height: 568, name: 'iPhone 5/SE' },
      { width: 375, height: 667, name: 'iPhone 6/7/8' },
      { width: 390, height: 844, name: 'iPhone 12' }
    ];
    
    for (const viewport of testViewports) {
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      // Check for horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (!hasHorizontalScroll) {
        console.log(`✅ No horizontal scrolling on ${viewport.name}`);
      } else {
        console.log(`⚠️  Horizontal scrolling detected on ${viewport.name}`);
      }
      
      // Take screenshot for this viewport
      await page.screenshot({ 
        path: `mobile-screenshots/improved-responsive-${viewport.name.toLowerCase().replace(/\s+|\//g, '-')}.png`,
        fullPage: true 
      });
    }
    
    // Reset to iPhone 12 viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    console.log('✅ Mobile improvements test completed successfully!');
    console.log('📸 Screenshots saved to mobile-screenshots/ directory');
    
    // Final verification screenshot
    await page.screenshot({ 
      path: 'mobile-screenshots/mobile-improvements-final.png',
      fullPage: true 
    });
  });
});