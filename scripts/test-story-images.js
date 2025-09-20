const { chromium } = require('playwright');

async function testStoryImages() {
  console.log('🚀 Starting story image loading tests...\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Keep visible to see what's happening
    slowMo: 1000      // Slow down for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Capture console messages for error checking
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({
      type: msg.type(),
      text: text,
      timestamp: new Date().toISOString()
    });
    
    // Log errors and warnings to our console
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`🔴 Console ${msg.type()}: ${text}`);
    }
  });
  
  // Capture network failures
  const failedRequests = [];
  page.on('requestfailed', request => {
    const url = request.url();
    const failure = request.failure();
    failedRequests.push({
      url: url,
      failure: failure?.errorText || 'Unknown error',
      timestamp: new Date().toISOString()
    });
    console.log(`🔴 Request failed: ${url} - ${failure?.errorText}`);
  });
  
  try {
    console.log('📍 Step 1: Navigating to localhost:3000');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: './test-results/01-homepage.png',
      fullPage: true 
    });
    console.log('✅ Homepage screenshot saved');
    
    console.log('\n📍 Step 2: Navigating to my-stories page');
    
    // Look for navigation to my-stories
    const myStoriesLink = page.locator('a[href*="my-stories"], a:has-text("My Stories"), [data-testid*="my-stories"]').first();
    
    if (await myStoriesLink.isVisible()) {
      await myStoriesLink.click();
      console.log('✅ Clicked on My Stories link');
    } else {
      // Try direct navigation
      console.log('ℹ️ My Stories link not found, navigating directly');
      await page.goto('http://localhost:3000/my-stories', { waitUntil: 'networkidle' });
    }
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Take screenshot of my-stories page
    await page.screenshot({ 
      path: './test-results/02-my-stories-page.png',
      fullPage: true 
    });
    console.log('✅ My Stories page screenshot saved');
    
    console.log('\n📍 Step 3: Checking for story cards and images');
    
    // Look for story cards
    const storyCards = page.locator('[data-testid*="story"], .story-card, [class*="story"]');
    const storyCount = await storyCards.count();
    
    console.log(`📊 Found ${storyCount} story elements`);
    
    if (storyCount > 0) {
      // Check each story card for images
      for (let i = 0; i < Math.min(storyCount, 5); i++) {
        const card = storyCards.nth(i);
        const images = card.locator('img');
        const imageCount = await images.count();
        
        console.log(`📖 Story ${i + 1}: Found ${imageCount} images`);
        
        if (imageCount > 0) {
          for (let j = 0; j < imageCount; j++) {
            const img = images.nth(j);
            const src = await img.getAttribute('src');
            const alt = await img.getAttribute('alt');
            const isLoaded = await img.evaluate((el) => el.complete && el.naturalHeight !== 0);
            
            console.log(`   📷 Image ${j + 1}:`);
            console.log(`      - Src: ${src}`);
            console.log(`      - Alt: ${alt}`);
            console.log(`      - Loaded: ${isLoaded ? '✅' : '❌'}`);
            
            if (!isLoaded) {
              console.log(`      - 🔴 Image failed to load properly`);
            }
          }
        }
      }
      
      console.log('\n📍 Step 4: Testing story reading page');
      
      // Click on the first story to read it
      const firstStory = storyCards.first();
      const firstStoryTitle = await firstStory.textContent();
      console.log(`📖 Clicking on first story: ${firstStoryTitle?.substring(0, 50)}...`);
      
      await firstStory.click();
      await page.waitForTimeout(3000); // Wait for story to load
      
      // Take screenshot of story reading page
      await page.screenshot({ 
        path: './test-results/03-story-reading-page.png',
        fullPage: true 
      });
      console.log('✅ Story reading page screenshot saved');
      
      // Check for story segment images
      const segmentImages = page.locator('img[src*="story"], img[alt*="segment"], img[alt*="illustration"]');
      const segmentImageCount = await segmentImages.count();
      
      console.log(`📊 Found ${segmentImageCount} story segment images`);
      
      if (segmentImageCount > 0) {
        for (let i = 0; i < segmentImageCount; i++) {
          const img = segmentImages.nth(i);
          const src = await img.getAttribute('src');
          const alt = await img.getAttribute('alt');
          const isLoaded = await img.evaluate((el) => el.complete && el.naturalHeight !== 0);
          
          console.log(`   📷 Segment Image ${i + 1}:`);
          console.log(`      - Src: ${src}`);
          console.log(`      - Alt: ${alt}`);
          console.log(`      - Loaded: ${isLoaded ? '✅' : '❌'}`);
        }
      }
      
    } else {
      console.log('⚠️  No stories found on the my-stories page');
    }
    
    console.log('\n📍 Step 5: Generating test report');
    
    // Generate summary report
    const imageErrors = consoleMessages.filter(msg => 
      msg.type === 'error' && 
      (msg.text.includes('image') || msg.text.includes('404') || msg.text.includes('Failed to load'))
    );
    
    const report = {
      timestamp: new Date().toISOString(),
      storyCount: storyCount,
      consoleErrors: consoleMessages.filter(msg => msg.type === 'error'),
      imageErrors: imageErrors,
      failedRequests: failedRequests,
      summary: {
        storiesFound: storyCount > 0,
        imagesPresent: true, // We'll update this based on findings
        consoleErrorCount: consoleMessages.filter(msg => msg.type === 'error').length,
        failedRequestCount: failedRequests.length
      }
    };
    
    // Save report
    require('fs').writeFileSync('./test-results/image-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 TEST SUMMARY:');
    console.log(`   Stories found: ${report.summary.storiesFound ? '✅' : '❌'}`);
    console.log(`   Console errors: ${report.summary.consoleErrorCount}`);
    console.log(`   Failed requests: ${report.summary.failedRequestCount}`);
    console.log(`   Image-specific errors: ${imageErrors.length}`);
    
    if (imageErrors.length > 0) {
      console.log('\n🔴 Image-related errors found:');
      imageErrors.forEach(error => {
        console.log(`   - ${error.text}`);
      });
    }
    
    if (failedRequests.length > 0) {
      console.log('\n🔴 Failed requests:');
      failedRequests.forEach(req => {
        console.log(`   - ${req.url}: ${req.failure}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: './test-results/error-screenshot.png',
      fullPage: true 
    });
    
  } finally {
    console.log('\n🏁 Closing browser...');
    await browser.close();
  }
}

// Run the test
testStoryImages().catch(console.error);