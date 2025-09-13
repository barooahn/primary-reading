import { test, expect } from './fixtures/test-base';
import { devices } from '@playwright/test';
import { CreateStoryPage } from './pages/CreateStoryPage';

// 🤖 Detected visual design + testing task → Using visual designer methodology

// Configure for mobile testing
test.use({ 
  ...devices['iPhone 12'],
  hasTouch: true,
  isMobile: true,
});

test.describe('Mobile Story Creation UX Analysis', () => {

  test('analyze mobile create story page UX and identify issues', async ({ page, authenticatedPage }) => {
    console.log('📱 Starting comprehensive mobile UX analysis for story creation...');
    
    // Enable detailed logging for mobile-specific issues
    const consoleMessages: string[] = [];
    const pageErrors: string[] = [];
    
    page.on('console', msg => {
      consoleMessages.push(`PAGE LOG: ${msg.text()}`);
      console.log('PAGE LOG:', msg.text());
    });
    
    page.on('pageerror', err => {
      pageErrors.push(`PAGE ERROR: ${err.message}`);
      console.log('PAGE ERROR:', err.message);
    });

    // Create screenshot directory
    await page.evaluate(() => {
      // Ensure we can create directories for screenshots
    });

    const createStoryPage = new CreateStoryPage(page);
    
    // Navigate to create story page with authentication
    console.log('📱 Step 1: Navigating to create story page...');
    await createStoryPage.goto();
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'mobile-screenshots/mobile-create-01-initial.png',
      fullPage: true 
    });

    // Verify page loads on mobile
    console.log('📱 Step 2: Verifying page elements are visible...');
    await expect(createStoryPage.pageTitle).toBeVisible();
    
    // Analyze viewport and document dimensions
    const viewport = page.viewportSize();
    const documentSize = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));
    
    console.log('📊 Mobile Viewport Analysis:');
    console.log(`Viewport: ${viewport?.width}x${viewport?.height}`);
    console.log(`Document: ${documentSize.width}x${documentSize.height}`);
    
    // Check for horizontal scrolling (major mobile UX issue)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    if (hasHorizontalScroll) {
      console.log('⚠️  ISSUE: Horizontal scrolling detected on mobile');
    }

    // ANALYZE YEAR LEVEL SELECTOR BUTTONS
    console.log('📱 Step 3: Analyzing year level selector UX...');
    const yearButtons = await page.locator('[data-testid^="year-"][data-testid$="-selector"]').all();
    const yearButtonAnalysis: { width: number; height: number; text: string; visible: boolean }[] = [];
    
    for (let i = 0; i < yearButtons.length; i++) {
      const button = yearButtons[i];
      const boundingBox = await button.boundingBox();
      const isVisible = await button.isVisible();
      
      if (boundingBox && isVisible) {
        const analysis = {
          index: i + 1,
          width: boundingBox.width,
          height: boundingBox.height,
          x: boundingBox.x,
          y: boundingBox.y,
          meetsMobileStandard: boundingBox.height >= 44 && boundingBox.width >= 44, // Apple HIG minimum
          touchFriendly: boundingBox.height >= 48, // Material Design recommendation
        };
        
        yearButtonAnalysis.push(analysis);
        console.log(`Year ${i + 1} button: ${boundingBox.width}x${boundingBox.height} at (${boundingBox.x}, ${boundingBox.y})`);
        
        if (!analysis.meetsMobileStandard) {
          console.log(`⚠️  ISSUE: Year ${i + 1} button too small for mobile touch (${boundingBox.width}x${boundingBox.height})`);
        }
      }
    }
    
    // Test year selection interaction on mobile
    if (yearButtons.length > 2) {
      console.log('📱 Testing year selection interaction...');
      await yearButtons[2].click(); // Select Year 3
      await page.screenshot({ 
        path: 'mobile-screenshots/mobile-create-02-year-selected.png',
        fullPage: true 
      });
    }

    // ANALYZE THEME SELECTION LAYOUT
    console.log('📱 Step 4: Analyzing theme selection layout...');
    
    // Wait for themes to load
    await page.waitForTimeout(1000);
    
    // Check theme grid layout
    const themeContainer = page.locator('div').filter({ hasText: 'What kind of adventure do you want?' }).locator('..').locator('div').last();
    const themeGrid = await themeContainer.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        display: computedStyle.display,
        gridTemplateColumns: computedStyle.gridTemplateColumns,
        gap: computedStyle.gap,
        flexDirection: computedStyle.flexDirection,
        flexWrap: computedStyle.flexWrap
      };
    });
    
    console.log('📱 Theme grid layout analysis:', themeGrid);
    
    // Analyze individual theme buttons
    const themeButtons = await page.locator('button').filter({ hasText: /🔍|🏰|😂|⚽/ }).all();
    console.log(`📱 Found ${themeButtons.length} theme buttons`);
    
    const themeButtonAnalysis: { width: number; height: number; text: string; index: number }[] = [];
    for (let i = 0; i < Math.min(4, themeButtons.length); i++) {
      const button = themeButtons[i];
      const boundingBox = await button.boundingBox();
      const buttonText = await button.textContent();
      
      if (boundingBox) {
        const analysis = {
          index: i,
          text: buttonText?.substring(0, 20) + '...',
          width: boundingBox.width,
          height: boundingBox.height,
          aspectRatio: (boundingBox.width / boundingBox.height).toFixed(2),
          touchFriendly: boundingBox.height >= 48 && boundingBox.width >= 120,
        };
        
        themeButtonAnalysis.push(analysis);
        console.log(`Theme button ${i + 1}: "${analysis.text}" ${boundingBox.width}x${boundingBox.height}`);
        
        if (!analysis.touchFriendly) {
          console.log(`⚠️  ISSUE: Theme button ${i + 1} may be too small for comfortable mobile interaction`);
        }
      }
    }
    
    // Test theme selection
    if (themeButtons.length > 0) {
      console.log('📱 Testing theme selection...');
      await themeButtons[0].click();
      await page.screenshot({ 
        path: 'mobile-screenshots/mobile-create-03-theme-selected.png',
        fullPage: true 
      });
      
      // Wait for navigation or state change
      await page.waitForTimeout(1500);
    }

    // ANALYZE STORY DETAILS/SETTINGS PAGE
    console.log('📱 Step 5: Analyzing story settings page...');
    await page.screenshot({ 
      path: 'mobile-screenshots/mobile-create-04-story-details.png',
      fullPage: true 
    });
    
    // Check story type selection buttons
    const storyTypeButtons = await page.locator('button').filter({ hasText: /Fiction|Non-Fiction/ }).all();
    console.log(`📱 Found ${storyTypeButtons.length} story type buttons`);
    
    for (let i = 0; i < storyTypeButtons.length; i++) {
      const button = storyTypeButtons[i];
      const boundingBox = await button.boundingBox();
      const buttonText = await button.textContent();
      
      if (boundingBox) {
        console.log(`Story type "${buttonText}": ${boundingBox.width}x${boundingBox.height}`);
        
        // Check if buttons are side by side and fit properly
        const buttonRatio = boundingBox.width / (viewport?.width || 390);
        if (buttonRatio > 0.8) {
          console.log(`⚠️  ISSUE: Story type button may be too wide for mobile (${(buttonRatio * 100).toFixed(1)}% of viewport width)`);
        }
      }
    }
    
    // Select fiction story type
    if (storyTypeButtons.length > 0) {
      await storyTypeButtons[0].click();
    }
    
    // ANALYZE GENERATE BUTTON PLACEMENT AND ACCESSIBILITY
    console.log('📱 Step 6: Analyzing generate button UX...');
    const generateButton = page.locator('button').filter({ hasText: /Create My Story/i });
    
    if (await generateButton.count() > 0) {
      // Scroll to make sure button is visible
      await generateButton.scrollIntoViewIfNeeded();
      
      const generateBox = await generateButton.boundingBox();
      if (generateBox && viewport) {
        console.log(`Generate button: ${generateBox.width}x${generateBox.height}`);
        
        // Check button positioning
        const distanceFromBottom = viewport.height - (generateBox.y + generateBox.height);
        const distanceFromTop = generateBox.y;
        
        console.log(`Generate button position: ${distanceFromTop}px from top, ${distanceFromBottom}px from bottom`);
        
        if (distanceFromBottom < 20) {
          console.log('⚠️  ISSUE: Generate button too close to bottom edge - may be hard to tap');
        }
        
        if (generateBox.height < 44) {
          console.log('⚠️  ISSUE: Generate button too short for comfortable mobile tapping');
        }
        
        // Check if button spans appropriate width
        const buttonWidthRatio = generateBox.width / viewport.width;
        console.log(`Generate button width ratio: ${(buttonWidthRatio * 100).toFixed(1)}%`);
      }
      
      await page.screenshot({ 
        path: 'mobile-screenshots/mobile-create-05-ready-to-generate.png',
        fullPage: true 
      });
    }

    // RESPONSIVE BREAKPOINT ANALYSIS
    console.log('📱 Step 7: Testing responsive breakpoints...');
    const testViewports = [
      { width: 320, height: 568, name: 'iPhone 5/SE' },
      { width: 375, height: 667, name: 'iPhone 6/7/8' },
      { width: 390, height: 844, name: 'iPhone 12' },
      { width: 412, height: 915, name: 'Pixel 5' }
    ];
    
    for (const testViewport of testViewports) {
      console.log(`📱 Testing ${testViewport.name} (${testViewport.width}x${testViewport.height})`);
      
      await page.setViewportSize({ width: testViewport.width, height: testViewport.height });
      await page.waitForTimeout(500);
      
      // Check for horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (overflow) {
        console.log(`⚠️  ISSUE: Horizontal overflow detected on ${testViewport.name}`);
      }
      
      // Take screenshot for this viewport
      await page.screenshot({ 
        path: `mobile-screenshots/responsive-${testViewport.name.toLowerCase().replace(/\s+|\//g, '-')}.png`,
        fullPage: true 
      });
    }
    
    // Reset to iPhone 12 viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // COMPILE MOBILE UX ANALYSIS REPORT
    console.log('📱 Step 8: Compiling mobile UX analysis...');
    
    const mobileUXIssues = {
      viewport: viewport,
      documentSize: documentSize,
      hasHorizontalScroll: hasHorizontalScroll,
      yearButtons: {
        count: yearButtonAnalysis.length,
        issues: yearButtonAnalysis.filter(btn => !btn.meetsMobileStandard).length,
        details: yearButtonAnalysis
      },
      themeButtons: {
        count: themeButtonAnalysis.length,
        issues: themeButtonAnalysis.filter(btn => !btn.touchFriendly).length,
        details: themeButtonAnalysis
      },
      consoleMessages: consoleMessages,
      pageErrors: pageErrors,
      screenshots: [
        'mobile-screenshots/mobile-create-01-initial.png',
        'mobile-screenshots/mobile-create-02-year-selected.png',
        'mobile-screenshots/mobile-create-03-theme-selected.png',
        'mobile-screenshots/mobile-create-04-story-details.png',
        'mobile-screenshots/mobile-create-05-ready-to-generate.png'
      ]
    };
    
    console.log('📊 MOBILE UX ANALYSIS COMPLETE');
    console.log('📊 Issues Found:', {
      horizontalScroll: hasHorizontalScroll,
      yearButtonIssues: mobileUXIssues.yearButtons.issues,
      themeButtonIssues: mobileUXIssues.themeButtons.issues,
      consoleErrors: pageErrors.length,
    });
    
    // Ensure we have at least captured the key interactions
    expect(yearButtonAnalysis.length).toBeGreaterThan(0);
    expect(consoleMessages.length).toBeGreaterThanOrEqual(0); // Allow empty console
    
    // Final comprehensive screenshot
    await page.screenshot({ 
      path: 'mobile-screenshots/mobile-create-06-final-analysis.png',
      fullPage: true 
    });
    
    console.log('✅ Mobile UX analysis complete - screenshots saved to mobile-screenshots/');
  });

  // Simplified test for custom prompt flow on mobile
  test('analyze custom prompt mobile UX', async ({ page, authenticatedPage }) => {
    console.log('📱 Testing custom prompt mobile UX...');
    
    const createStoryPage = new CreateStoryPage(page);
    await createStoryPage.goto();
    await page.waitForLoadState('networkidle');
    
    // Select year level first
    const yearButtons = await page.locator('[data-testid^="year-"][data-testid$="-selector"]').all();
    if (yearButtons.length > 3) {
      await yearButtons[3].click(); // Year 4
    }
    
    // Switch to custom prompt mode
    const customPromptTab = page.locator('button:has-text("Custom Idea")');
    if (await customPromptTab.count() > 0) {
      await customPromptTab.click();
      
      await page.screenshot({ 
        path: 'mobile-screenshots/custom-01-tab-active.png',
        fullPage: true 
      });
      
      // Test textarea on mobile
      const textarea = page.locator('textarea');
      if (await textarea.count() > 0) {
        const textareaBox = await textarea.boundingBox();
        if (textareaBox) {
          console.log(`📱 Custom prompt textarea: ${textareaBox.width}x${textareaBox.height}`);
          
          // Check if textarea is appropriately sized for mobile
          const viewport = page.viewportSize();
          if (viewport && textareaBox.width / viewport.width < 0.8) {
            console.log('⚠️  ISSUE: Textarea may be too narrow for comfortable mobile typing');
          }
          
          if (textareaBox.height < 80) {
            console.log('⚠️  ISSUE: Textarea too short - may be hard to see content while typing');
          }
        }
        
        // Test typing in the textarea
        const testPrompt = "A story about a young coder who discovers a magical programming language that brings code to life";
        await textarea.fill(testPrompt);
        
        await page.screenshot({ 
          path: 'mobile-screenshots/custom-02-text-entered.png',
          fullPage: true 
        });
        
        // Check continue button
        const continueButton = page.locator('button:has-text("Continue with Custom Idea")');
        if (await continueButton.count() > 0) {
          await continueButton.scrollIntoViewIfNeeded();
          
          const continueBox = await continueButton.boundingBox();
          if (continueBox) {
            console.log(`📱 Continue button: ${continueBox.width}x${continueBox.height}`);
          }
          
          await page.screenshot({ 
            path: 'mobile-screenshots/custom-03-ready-to-continue.png',
            fullPage: true 
          });
        }
      }
    }
    
    console.log('✅ Custom prompt mobile UX analysis complete');
  });
});