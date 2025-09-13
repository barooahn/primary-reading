import { test, expect } from '@playwright/test';

// Test configuration for child-friendly mobile UX (ages 5-11)
const MOBILE_DEVICES = {
  'iPhone 12': { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  'iPhone SE': { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  'Pixel 5': { width: 393, height: 851, deviceScaleFactor: 2.75, isMobile: true, hasTouch: true },
};

// Child-friendly touch target standards (WCAG AAA for children)
const CHILD_UX_STANDARDS = {
  minTouchTarget: 44, // minimum 44px x 44px for children
  preferredTouchTarget: 48, // preferred 48px x 48px
  minimumSpacing: 8, // minimum 8px spacing between touch targets
  maxTextLineLength: 45, // maximum characters per line for readability
  minFontSize: 16, // minimum font size for children
  maxReadingWidth: 600, // maximum reading width for focus
};

// Story ID for testing - using mock story
const TEST_STORY_ID = '1';
const TEST_URL = `http://localhost:3004/read/${TEST_STORY_ID}`;

test.describe('Mobile Read Story Page UX Analysis (Ages 5-11)', () => {
  
  // Test each mobile device viewport
  Object.entries(MOBILE_DEVICES).forEach(([deviceName, viewport]) => {
    test.describe(`${deviceName} Viewport Tests`, () => {
      
      test.beforeEach(async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ 
          width: viewport.width, 
          height: viewport.height 
        });
        
        // Navigate to story page
        await page.goto(TEST_URL, { waitUntil: 'networkidle' });
        
        // Wait for story to load
        await page.waitForSelector('.netflix-reading-container', { timeout: 10000 });
      });

      test(`${deviceName}: Initial load and story display`, async ({ page }) => {
        // Take screenshot of initial load
        await page.screenshot({ 
          path: `mobile-screenshots/${deviceName.toLowerCase().replace(' ', '-')}-initial-load.png`,
          fullPage: true 
        });

        // Verify story title is visible
        await expect(page.locator('h1')).toBeVisible();
        const title = await page.locator('h1').textContent();
        expect(title).toBeTruthy();

        // Verify story content is loaded
        await expect(page.locator('.netflix-reading-container')).toBeVisible();
        
        // Check background image loads
        const backgroundDiv = page.locator('.netflix-reading-container .absolute.inset-0 div').first();
        await expect(backgroundDiv).toHaveCSS('background-image', /url/);
      });

      test(`${deviceName}: Navigation controls accessibility`, async ({ page }) => {
        // Test Previous/Next button sizing and positioning
        // const prevButton = page.locator('button').filter({ hasText: 'Previous' }).first();
        const nextButton = page.locator('button').filter({ hasText: 'Next' }).first();

        // Check if navigation buttons exist
        if (await nextButton.count() > 0) {
          const nextButtonBox = await nextButton.boundingBox();
          if (nextButtonBox) {
            // Verify touch target size meets child-friendly standards
            expect(nextButtonBox.height).toBeGreaterThanOrEqual(CHILD_UX_STANDARDS.minTouchTarget);
            expect(nextButtonBox.width).toBeGreaterThanOrEqual(CHILD_UX_STANDARDS.minTouchTarget);
            
            // Check button is in thumb-friendly zone (bottom 1/3 of screen)
            const thumbZoneStart = viewport.height * 0.67;
            expect(nextButtonBox.y).toBeGreaterThanOrEqual(thumbZoneStart);
          }
        }

        // Test actual button functionality
        if (await nextButton.count() > 0) {
          await nextButton.click();
          await page.waitForTimeout(1000);
          
          // Take screenshot after navigation
          await page.screenshot({ 
            path: `mobile-screenshots/${deviceName.toLowerCase().replace(' ', '-')}-after-next.png`,
            fullPage: true 
          });
        }
      });

      test(`${deviceName}: Reading progress bar visibility`, async ({ page }) => {
        // Find progress bar
        const progressBar = page.locator('.bg-primary').filter({ hasText: /^$/ }).first();
        
        if (await progressBar.count() > 0) {
          await expect(progressBar).toBeVisible();
          
          // Check progress bar height for touch accessibility
          const progressBox = await progressBar.boundingBox();
          if (progressBox) {
            // Progress bar should be at least 8px high for visibility
            expect(progressBox.height).toBeGreaterThanOrEqual(8);
          }
        }

        // Take screenshot focusing on progress area
        await page.screenshot({ 
          path: `mobile-screenshots/${deviceName.toLowerCase().replace(' ', '-')}-progress-bar.png`,
          fullPage: true 
        });
      });

      test(`${deviceName}: Story content readability`, async ({ page }) => {
        // Find story text content
        const storyContent = page.locator('.netflix-reading-container').first();
        await expect(storyContent).toBeVisible();

        // Check text is properly sized and spaced
        const contentBox = await storyContent.boundingBox();
        if (contentBox) {
          // Content should not exceed maximum reading width for children
          expect(contentBox.width).toBeLessThanOrEqual(CHILD_UX_STANDARDS.maxReadingWidth);
        }

        // Take screenshot of story content
        await page.screenshot({ 
          path: `mobile-screenshots/${deviceName.toLowerCase().replace(' ', '-')}-story-content.png`,
          fullPage: true 
        });
      });

      test(`${deviceName}: Header controls positioning`, async ({ page }) => {
        // Check header area with controls
        const headerArea = page.locator('.absolute.top-0.left-0.right-0').first();
        await expect(headerArea).toBeVisible();

        // Test control buttons in header
        const controlButtons = page.locator('.absolute.top-0 button');
        const buttonCount = await controlButtons.count();
        
        for (let i = 0; i < buttonCount; i++) {
          const button = controlButtons.nth(i);
          const buttonBox = await button.boundingBox();
          
          if (buttonBox) {
            // Verify each control button meets touch target standards
            expect(buttonBox.height).toBeGreaterThanOrEqual(CHILD_UX_STANDARDS.minTouchTarget);
            expect(buttonBox.width).toBeGreaterThanOrEqual(CHILD_UX_STANDARDS.minTouchTarget);
          }
        }

        // Take screenshot of header controls
        await page.screenshot({ 
          path: `mobile-screenshots/${deviceName.toLowerCase().replace(' ', '-')}-header-controls.png`,
          fullPage: true,
          clip: { x: 0, y: 0, width: viewport.width, height: 200 }
        });
      });

      test(`${deviceName}: Fullscreen mode toggle`, async ({ page }) => {
        // Find and test fullscreen toggle
        const fullscreenButton = page.locator('button[title*="Fullscreen"], button[title*="fullscreen"]').first();
        
        if (await fullscreenButton.count() > 0) {
          // Take screenshot before fullscreen
          await page.screenshot({ 
            path: `mobile-screenshots/${deviceName.toLowerCase().replace(' ', '-')}-before-fullscreen.png`,
            fullPage: true 
          });

          // Click fullscreen toggle
          await fullscreenButton.click();
          await page.waitForTimeout(1000);

          // Take screenshot in fullscreen mode
          await page.screenshot({ 
            path: `mobile-screenshots/${deviceName.toLowerCase().replace(' ', '-')}-fullscreen-mode.png`,
            fullPage: true 
          });

          // Toggle back
          const exitFullscreenButton = page.locator('button[title*="Exit"], button[title*="exit"]').first();
          if (await exitFullscreenButton.count() > 0) {
            await exitFullscreenButton.click();
            await page.waitForTimeout(1000);
          }
        }
      });

      test(`${deviceName}: Auto-reading functionality`, async ({ page }) => {
        // Test play/pause button
        const playButton = page.locator('button').filter({ hasText: /Play|Pause/ }).first();
        
        if (await playButton.count() > 0) {
          const buttonBox = await playButton.boundingBox();
          if (buttonBox) {
            // Verify play button meets touch standards
            expect(buttonBox.height).toBeGreaterThanOrEqual(CHILD_UX_STANDARDS.minTouchTarget);
            expect(buttonBox.width).toBeGreaterThanOrEqual(CHILD_UX_STANDARDS.minTouchTarget);
          }

          // Test play functionality
          await playButton.click();
          await page.waitForTimeout(1000);

          // Take screenshot during auto-reading
          await page.screenshot({ 
            path: `mobile-screenshots/${deviceName.toLowerCase().replace(' ', '-')}-auto-reading.png`,
            fullPage: true 
          });
        }
      });

      test(`${deviceName}: Questions interface (if available)`, async ({ page }) => {
        // Navigate through story to reach questions
        const nextButton = page.locator('button').filter({ hasText: 'Next' }).first();
        let clickCount = 0;
        const maxClicks = 10; // Prevent infinite loop
        
        while (await nextButton.count() > 0 && clickCount < maxClicks) {
          await nextButton.click();
          await page.waitForTimeout(1500);
          clickCount++;
          
          // Check if we've reached questions
          const questionsTitle = page.locator('h1').filter({ hasText: /Question|Comprehension/ });
          if (await questionsTitle.count() > 0) {
            break;
          }
        }

        // If questions are available, test their mobile UX
        const questionsContainer = page.locator('.container');
        if (await questionsContainer.count() > 0) {
          // Take screenshot of questions interface
          await page.screenshot({ 
            path: `mobile-screenshots/${deviceName.toLowerCase().replace(' ', '-')}-questions.png`,
            fullPage: true 
          });

          // Test answer buttons if they exist
          const answerButtons = page.locator('button').filter({ hasText: /^[A-D]/ });
          const answerCount = await answerButtons.count();
          
          for (let i = 0; i < Math.min(answerCount, 4); i++) {
            const answerButton = answerButtons.nth(i);
            const buttonBox = await answerButton.boundingBox();
            
            if (buttonBox) {
              // Answer buttons should meet child touch target standards
              expect(buttonBox.height).toBeGreaterThanOrEqual(CHILD_UX_STANDARDS.minTouchTarget);
              expect(buttonBox.width).toBeGreaterThanOrEqual(viewport.width * 0.8); // Should be wide for easy tapping
            }
          }
        }
      });

      test(`${deviceName}: Portrait vs Landscape orientation`, async ({ page }) => {
        // Test portrait mode (default)
        await page.screenshot({ 
          path: `mobile-screenshots/${deviceName.toLowerCase().replace(' ', '-')}-portrait.png`,
          fullPage: true 
        });

        // Switch to landscape
        await page.setViewportSize({ 
          width: viewport.height, 
          height: viewport.width 
        });
        
        await page.waitForTimeout(1000);

        // Test landscape mode
        await page.screenshot({ 
          path: `mobile-screenshots/${deviceName.toLowerCase().replace(' ', '-')}-landscape.png`,
          fullPage: true 
        });

        // Verify controls are still accessible in landscape
        const controlButtons = page.locator('button');
        const buttonCount = await controlButtons.count();
        
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = controlButtons.nth(i);
          if (await button.isVisible()) {
            const buttonBox = await button.boundingBox();
            if (buttonBox) {
              // Buttons should still meet size standards in landscape
              expect(buttonBox.height).toBeGreaterThanOrEqual(CHILD_UX_STANDARDS.minTouchTarget);
              expect(buttonBox.width).toBeGreaterThanOrEqual(CHILD_UX_STANDARDS.minTouchTarget);
            }
          }
        }
      });

      test(`${deviceName}: Content overlap and spacing issues`, async ({ page }) => {
        // Take full screenshot to analyze overlap
        await page.screenshot({ 
          path: `mobile-screenshots/${deviceName.toLowerCase().replace(' ', '-')}-full-analysis.png`,
          fullPage: true 
        });

        // Check for potential content overlap by measuring element positions
        const header = page.locator('.absolute.top-0').first();
        const content = page.locator('.netflix-reading-container').first();
        
        if (await header.count() > 0 && await content.count() > 0) {
          const headerBox = await header.boundingBox();
          const contentBox = await content.boundingBox();
          
          if (headerBox && contentBox) {
            // Ensure adequate spacing between header and content
            const spacing = contentBox.y - (headerBox.y + headerBox.height);
            expect(spacing).toBeGreaterThanOrEqual(-10); // Allow some overlap for design
          }
        }

        // Check bottom navigation positioning
        const bottomControls = page.locator('.fixed.bottom-0, .absolute.bottom-0');
        if (await bottomControls.count() > 0) {
          const bottomBox = await bottomControls.first().boundingBox();
          if (bottomBox) {
            // Bottom controls should be within viewport
            expect(bottomBox.y + bottomBox.height).toBeLessThanOrEqual(viewport.height + 10);
          }
        }
      });
    });
  });

  // Cross-device comparison test
  test('Cross-device UX consistency analysis', async ({ page }) => {
    const results: { [deviceName: string]: any } = {};
    
    for (const [deviceName, viewport] of Object.entries(MOBILE_DEVICES)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(TEST_URL, { waitUntil: 'networkidle' });
      await page.waitForSelector('.netflix-reading-container', { timeout: 10000 });
      
      // Measure key elements
      const measurements = {
        device: deviceName,
        viewport: viewport,
        headerHeight: 0,
        contentArea: 0,
        buttonCount: 0,
        touchTargetsMeetStandard: 0
      };
      
      // Measure header
      const header = page.locator('.absolute.top-0').first();
      if (await header.count() > 0) {
        const headerBox = await header.boundingBox();
        measurements.headerHeight = headerBox?.height || 0;
      }
      
      // Count accessible touch targets
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();
      measurements.buttonCount = buttonCount;
      
      let standardButtons = 0;
      for (let i = 0; i < buttonCount; i++) {
        const buttonBox = await buttons.nth(i).boundingBox();
        if (buttonBox && 
            buttonBox.height >= CHILD_UX_STANDARDS.minTouchTarget && 
            buttonBox.width >= CHILD_UX_STANDARDS.minTouchTarget) {
          standardButtons++;
        }
      }
      measurements.touchTargetsMeetStandard = standardButtons;
      
      results[deviceName] = measurements;
    }
    
    // Save comparison data
    console.log('Cross-device UX Analysis Results:', JSON.stringify(results, null, 2));
    
    // Take final comparison screenshot
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 for final shot
    await page.goto(TEST_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ 
      path: `mobile-screenshots/cross-device-analysis-summary.png`,
      fullPage: true 
    });
  });
});

// Additional child UX specific tests
test.describe('Child-Specific UX Requirements (Ages 5-11)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Use iPhone 12 as primary test device
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(TEST_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('.netflix-reading-container', { timeout: 10000 });
  });

  test('Touch target size compliance for children', async ({ page }) => {
    const allButtons = page.locator('button:visible');
    const buttonCount = await allButtons.count();
    
    let compliantButtons = 0;
    const nonCompliantButtons = [];
    
    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const buttonBox = await button.boundingBox();
      const buttonText = await button.textContent() || `Button ${i}`;
      
      if (buttonBox) {
        const meetsStandard = 
          buttonBox.height >= CHILD_UX_STANDARDS.minTouchTarget && 
          buttonBox.width >= CHILD_UX_STANDARDS.minTouchTarget;
        
        if (meetsStandard) {
          compliantButtons++;
        } else {
          nonCompliantButtons.push({
            text: buttonText,
            size: `${buttonBox.width}x${buttonBox.height}px`,
            position: `x:${buttonBox.x}, y:${buttonBox.y}`
          });
        }
      }
    }
    
    console.log(`Touch Target Analysis:
      Total buttons: ${buttonCount}
      Compliant buttons: ${compliantButtons}
      Non-compliant buttons: ${nonCompliantButtons.length}
      Non-compliant details:`, nonCompliantButtons);
    
    // At least 80% of buttons should meet child-friendly standards
    expect(compliantButtons / buttonCount).toBeGreaterThanOrEqual(0.8);
  });

  test('Reading content accessibility for young children', async ({ page }) => {
    // Check font sizes and line spacing
    const storyText = page.locator('.netflix-reading-container p, .netflix-reading-container div').filter({ hasText: /\w+/ }).first();
    
    if (await storyText.count() > 0) {
      const fontSize = await storyText.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).fontSize);
      });
      
      const lineHeight = await storyText.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).lineHeight);
      });
      
      // Font size should be at least 16px for children
      expect(fontSize).toBeGreaterThanOrEqual(CHILD_UX_STANDARDS.minFontSize);
      
      // Line height should be at least 1.4 times font size
      expect(lineHeight).toBeGreaterThanOrEqual(fontSize * 1.4);
    }
  });

  test('Navigation simplicity for children', async ({ page }) => {
    // Count primary navigation elements
    const primaryNavButtons = page.locator('button').filter({ hasText: /Next|Previous|Play|Questions/ });
    const primaryNavCount = await primaryNavButtons.count();
    
    // Should have clear, simple navigation (not too many options)
    expect(primaryNavCount).toBeLessThanOrEqual(6);
    expect(primaryNavCount).toBeGreaterThanOrEqual(2);
    
    // Check button text is child-friendly
    for (let i = 0; i < primaryNavCount; i++) {
      const buttonText = await primaryNavButtons.nth(i).textContent();
      expect(buttonText).toMatch(/^(Next|Previous|Play|Pause|Questions?|Back|Home)$/i);
    }
  });

  test('Visual feedback and engagement elements', async ({ page }) => {
    // Take screenshot for visual analysis
    await page.screenshot({ 
      path: 'mobile-screenshots/child-engagement-analysis.png',
      fullPage: true 
    });
    
    // Check for progress indicators
    const progressElements = page.locator('[class*="progress"], [class*="bar"]');
    expect(await progressElements.count()).toBeGreaterThanOrEqual(1);
    
    // Check for visual feedback on interactions
    const nextButton = page.locator('button').filter({ hasText: 'Next' }).first();
    if (await nextButton.count() > 0) {
      // Test hover/focus states
      await nextButton.hover();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'mobile-screenshots/button-hover-feedback.png',
        fullPage: true 
      });
    }
  });
});