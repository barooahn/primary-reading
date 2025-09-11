const { chromium } = require('playwright');

async function testPublicStoryImages() {
  console.log('🚀 Starting public story image loading tests...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({
      type: msg.type(),
      text: text,
      timestamp: new Date().toISOString()
    });
    
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
    console.log('📍 Step 1: Testing public story browsing');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Look for "Browse Stories" or "Explore Stories" button
    const browseButton = page.locator('a:has-text("Browse Stories"), a:has-text("Explore Stories"), button:has-text("Browse"), button:has-text("Explore")').first();
    
    if (await browseButton.isVisible()) {
      console.log('✅ Found browse stories button');
      await browseButton.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: './test-results/03-public-stories-browse.png',
        fullPage: true 
      });
      console.log('✅ Public stories browse screenshot saved');
      
      // Check for story cards in public browse
      const publicStoryCards = page.locator('[data-testid*="story"], .story-card, [class*="story"], .grid > div, .flex > div').filter({
        has: page.locator('img, [role="img"]')
      });
      
      const publicStoryCount = await publicStoryCards.count();
      console.log(`📊 Found ${publicStoryCount} public story elements`);
      
      if (publicStoryCount > 0) {
        // Test the first few public stories
        for (let i = 0; i < Math.min(publicStoryCount, 3); i++) {
          const card = publicStoryCards.nth(i);
          const images = card.locator('img');
          const imageCount = await images.count();
          
          console.log(`📖 Public Story ${i + 1}: Found ${imageCount} images`);
          
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
              
              // Check if it's a fallback image
              if (src && (src.includes('placeholder') || src.includes('fallback') || src.includes('default'))) {
                console.log(`      - ⚠️  Appears to be a fallback image`);
              }
            }
          }
        }
        
        // Try clicking on the first story to read it
        console.log('\n📍 Step 2: Testing public story reading');
        const firstPublicStory = publicStoryCards.first();
        
        // Get story title for logging
        const storyTitle = await firstPublicStory.textContent();
        console.log(`📖 Clicking on public story: ${storyTitle?.substring(0, 50)}...`);
        
        await firstPublicStory.click();
        await page.waitForTimeout(4000);
        
        await page.screenshot({ 
          path: './test-results/04-public-story-reading.png',
          fullPage: true 
        });
        console.log('✅ Public story reading screenshot saved');
        
        // Check for story segment images in reading view
        const segmentImages = page.locator('img').filter({
          or: [
            { hasText: '' },
            { has: page.locator('[alt*="segment"]') },
            { has: page.locator('[alt*="illustration"]') },
            { has: page.locator('[src*="story"]') }
          ]
        });
        
        const segmentImageCount = await segmentImages.count();
        console.log(`📊 Found ${segmentImageCount} potential segment images`);
        
        if (segmentImageCount > 0) {
          for (let i = 0; i < Math.min(segmentImageCount, 5); i++) {
            const img = segmentImages.nth(i);
            const src = await img.getAttribute('src');
            const alt = await img.getAttribute('alt');
            const isLoaded = await img.evaluate((el) => el.complete && el.naturalHeight !== 0);
            
            console.log(`   📷 Segment Image ${i + 1}:`);
            console.log(`      - Src: ${src}`);
            console.log(`      - Alt: ${alt}`);
            console.log(`      - Loaded: ${isLoaded ? '✅' : '❌'}`);
            
            // Check for Supabase storage URLs
            if (src && src.includes('supabase')) {
              console.log(`      - 📦 Supabase storage URL detected`);
            }
            
            // Check if it's a fallback image
            if (src && (src.includes('placeholder') || src.includes('fallback') || src.includes('default'))) {
              console.log(`      - ⚠️  Appears to be a fallback image`);
            }
          }
        }
        
      } else {
        console.log('⚠️  No public stories found');
      }
      
    } else {
      console.log('⚠️  Browse stories button not found, trying direct navigation');
      
      // Try browsing stories directly
      await page.goto('http://localhost:3000/browse', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: './test-results/03-direct-browse-attempt.png',
        fullPage: true 
      });
      
      // Check if this page has stories
      const directBrowseStories = page.locator('[data-testid*="story"], .story-card, [class*="story"]');
      const directBrowseCount = await directBrowseStories.count();
      console.log(`📊 Direct browse found ${directBrowseCount} stories`);
    }
    
    console.log('\n📍 Step 3: Generating test report');
    
    const imageErrors = consoleMessages.filter(msg => 
      msg.type === 'error' && 
      (msg.text.includes('image') || msg.text.includes('404') || msg.text.includes('Failed to load') || msg.text.includes('storage'))
    );
    
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'public_stories',
      consoleErrors: consoleMessages.filter(msg => msg.type === 'error'),
      imageErrors: imageErrors,
      failedRequests: failedRequests,
      summary: {
        publicStoriesAccessible: true,
        consoleErrorCount: consoleMessages.filter(msg => msg.type === 'error').length,
        failedRequestCount: failedRequests.length,
        imageErrorCount: imageErrors.length
      }
    };
    
    require('fs').writeFileSync('./test-results/public-image-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📊 PUBLIC STORY TEST SUMMARY:');
    console.log(`   Console errors: ${report.summary.consoleErrorCount}`);
    console.log(`   Failed requests: ${report.summary.failedRequestCount}`);
    console.log(`   Image-specific errors: ${imageErrors.length}`);
    
    if (imageErrors.length > 0) {
      console.log('\n🔴 Image-related errors found:');
      imageErrors.forEach(error => {
        console.log(`   - ${error.text}`);
      });
    } else {
      console.log('\n✅ No image-specific errors detected');
    }
    
    if (failedRequests.length > 0) {
      console.log('\n🔴 Failed requests:');
      failedRequests.forEach(req => {
        console.log(`   - ${req.url}: ${req.failure}`);
      });
    } else {
      console.log('\n✅ No failed requests detected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    await page.screenshot({ 
      path: './test-results/public-test-error.png',
      fullPage: true 
    });
    
  } finally {
    console.log('\n🏁 Closing browser...');
    await browser.close();
  }
}

// Run the test
testPublicStoryImages().catch(console.error);