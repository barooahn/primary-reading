const { chromium } = require('playwright');

async function finalImageCheck() {
  console.log('🚀 Final comprehensive image loading test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // Track all requests and responses
  const requests = [];
  const responses = [];
  const consoleMessages = [];
  
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      timestamp: new Date().toISOString()
    });
  });
  
  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status(),
      contentType: response.headers()['content-type'],
      timestamp: new Date().toISOString()
    });
  });
  
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
  
  try {
    console.log('📍 Step 1: Direct navigation to stories API');
    
    // First, check the stories API directly
    const apiResponse = await page.goto('http://localhost:3000/api/stories?limit=20', { 
      waitUntil: 'networkidle' 
    });
    
    console.log(`API Response Status: ${apiResponse.status()}`);
    
    if (apiResponse.status() === 200) {
      const apiData = await apiResponse.json();
      const stories = apiData.stories || [];
      console.log(`✅ API returned ${stories.length} stories`);
      
      // Check if any stories have image paths
      const storiesWithImages = stories.filter(story => 
        story.image_path || story.thumbnail_path || story.thumbnail_url
      );
      
      console.log(`📊 Stories with image data: ${storiesWithImages.length}`);
      
      if (storiesWithImages.length > 0) {
        console.log('\n📷 Sample story image data:');
        storiesWithImages.slice(0, 3).forEach((story, i) => {
          console.log(`   Story ${i + 1} (${story.title?.substring(0, 30)}...):`);
          console.log(`      - image_path: ${story.image_path || 'null'}`);
          console.log(`      - thumbnail_path: ${story.thumbnail_path || 'null'}`);
          console.log(`      - thumbnail_url: ${story.thumbnail_url || 'null'}`);
        });
      }
    }
    
    console.log('\n📍 Step 2: Testing stories page rendering');
    
    // Navigate to stories page
    await page.goto('http://localhost:3000/stories', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: './test-results/05-stories-page-final.png',
      fullPage: true 
    });
    console.log('✅ Stories page screenshot saved');
    
    // Look for story cards with images
    const storyCards = page.locator('[data-testid*="story"], .story-card, [class*="story"], [class*="grid"] > div').filter({
      has: page.locator('img')
    });
    
    const storyCount = await storyCards.count();
    console.log(`📊 Found ${storyCount} story cards with images`);
    
    if (storyCount > 0) {
      console.log('\n📷 Analyzing story card images...');
      
      for (let i = 0; i < Math.min(storyCount, 5); i++) {
        const card = storyCards.nth(i);
        
        // Get story title
        const titleElement = card.locator('h1, h2, h3, h4, [class*="title"], [class*="heading"]').first();
        const title = await titleElement.textContent().catch(() => `Story ${i + 1}`);
        
        console.log(`\n📖 Analyzing: ${title?.substring(0, 40)}...`);
        
        const images = card.locator('img');
        const imageCount = await images.count();
        
        for (let j = 0; j < imageCount; j++) {
          const img = images.nth(j);
          const src = await img.getAttribute('src');
          const alt = await img.getAttribute('alt');
          const isLoaded = await img.evaluate((el) => el.complete && el.naturalHeight !== 0);
          const naturalWidth = await img.evaluate((el) => el.naturalWidth);
          const naturalHeight = await img.evaluate((el) => el.naturalHeight);
          
          console.log(`   📷 Image ${j + 1}:`);
          console.log(`      - Src: ${src}`);
          console.log(`      - Alt: ${alt}`);
          console.log(`      - Loaded: ${isLoaded ? '✅' : '❌'}`);
          console.log(`      - Dimensions: ${naturalWidth}x${naturalHeight}`);
          
          // Analyze image URL patterns
          if (src) {
            if (src.includes('supabase')) {
              console.log(`      - 📦 Supabase storage URL`);
            } else if (src.includes('placeholder') || src.includes('fallback')) {
              console.log(`      - ⚠️  Fallback/placeholder image`);
            } else if (src.startsWith('data:')) {
              console.log(`      - 📄 Base64 data URL`);
            } else if (src.startsWith('/')) {
              console.log(`      - 🏠 Local file path`);
            } else {
              console.log(`      - 🌐 External URL`);
            }
          }
          
          if (!isLoaded || naturalWidth === 0) {
            console.log(`      - 🔴 IMAGE FAILED TO LOAD PROPERLY`);
          }
        }
      }
      
      console.log('\n📍 Step 3: Testing individual story reading');
      
      // Click on first story to read it
      const firstStory = storyCards.first();
      await firstStory.click();
      await page.waitForTimeout(4000);
      
      await page.screenshot({ 
        path: './test-results/06-story-reading-final.png',
        fullPage: true 
      });
      console.log('✅ Story reading page screenshot saved');
      
      // Check for story content images
      const contentImages = page.locator('img');
      const contentImageCount = await contentImages.count();
      
      console.log(`\n📊 Found ${contentImageCount} images on story reading page`);
      
      if (contentImageCount > 0) {
        console.log('\n📷 Analyzing story content images...');
        
        for (let i = 0; i < Math.min(contentImageCount, 8); i++) {
          const img = contentImages.nth(i);
          const src = await img.getAttribute('src');
          const alt = await img.getAttribute('alt');
          const isLoaded = await img.evaluate((el) => el.complete && el.naturalHeight !== 0);
          const naturalWidth = await img.evaluate((el) => el.naturalWidth);
          const naturalHeight = await img.evaluate((el) => el.naturalHeight);
          
          console.log(`   📷 Content Image ${i + 1}:`);
          console.log(`      - Src: ${src?.substring(0, 80)}${src?.length > 80 ? '...' : ''}`);
          console.log(`      - Alt: ${alt}`);
          console.log(`      - Loaded: ${isLoaded ? '✅' : '❌'}`);
          console.log(`      - Dimensions: ${naturalWidth}x${naturalHeight}`);
          
          if (!isLoaded || naturalWidth === 0) {
            console.log(`      - 🔴 CONTENT IMAGE FAILED TO LOAD`);
          }
        }
      }
    }
    
    console.log('\n📍 Step 4: Analyzing network requests');
    
    // Filter image requests
    const imageRequests = requests.filter(req => 
      req.resourceType === 'image' || 
      req.url.includes('.jpg') || 
      req.url.includes('.jpeg') || 
      req.url.includes('.png') || 
      req.url.includes('.webp') || 
      req.url.includes('.svg')
    );
    
    const imageResponses = responses.filter(res => 
      res.contentType?.includes('image') || 
      res.url.includes('.jpg') || 
      res.url.includes('.jpeg') || 
      res.url.includes('.png') || 
      res.url.includes('.webp') || 
      res.url.includes('.svg')
    );
    
    console.log(`📊 Image requests made: ${imageRequests.length}`);
    console.log(`📊 Image responses received: ${imageResponses.length}`);
    
    const failedImageRequests = imageResponses.filter(res => res.status >= 400);
    console.log(`🔴 Failed image requests: ${failedImageRequests.length}`);
    
    if (failedImageRequests.length > 0) {
      console.log('\n🔴 Failed image requests:');
      failedImageRequests.forEach(req => {
        console.log(`   - ${req.status}: ${req.url}`);
      });
    }
    
    // Supabase storage requests
    const supabaseRequests = imageRequests.filter(req => req.url.includes('supabase'));
    console.log(`📦 Supabase storage requests: ${supabaseRequests.length}`);
    
    console.log('\n📍 Step 5: Final report generation');
    
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'comprehensive_image_check',
      findings: {
        apiAccessible: apiResponse?.status() === 200,
        storiesFoundOnPage: storyCount > 0,
        totalImageRequests: imageRequests.length,
        totalImageResponses: imageResponses.length,
        failedImageRequests: failedImageRequests.length,
        supabaseStorageRequests: supabaseRequests.length,
        consoleErrors: consoleMessages.filter(msg => msg.type === 'error').length,
        imageSpecificErrors: consoleMessages.filter(msg => 
          msg.type === 'error' && 
          (msg.text.includes('image') || msg.text.includes('Failed to load'))
        ).length
      },
      detailedData: {
        imageRequests: imageRequests,
        imageResponses: imageResponses,
        failedImageRequests: failedImageRequests,
        consoleErrors: consoleMessages.filter(msg => msg.type === 'error'),
        supabaseRequests: supabaseRequests
      }
    };
    
    require('fs').writeFileSync('./test-results/final-comprehensive-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n🏆 FINAL TEST RESULTS:');
    console.log(`   API accessible: ${report.findings.apiAccessible ? '✅' : '❌'}`);
    console.log(`   Stories found on page: ${report.findings.storiesFoundOnPage ? '✅' : '❌'}`);
    console.log(`   Total image requests: ${report.findings.totalImageRequests}`);
    console.log(`   Failed image requests: ${report.findings.failedImageRequests}`);
    console.log(`   Supabase storage requests: ${report.findings.supabaseStorageRequests}`);
    console.log(`   Console errors: ${report.findings.consoleErrors}`);
    console.log(`   Image-specific errors: ${report.findings.imageSpecificErrors}`);
    
    const overallStatus = report.findings.apiAccessible && 
                         report.findings.storiesFoundOnPage && 
                         report.findings.failedImageRequests === 0;
    
    console.log(`\n🎯 Overall Status: ${overallStatus ? '✅ IMAGES WORKING' : '❌ ISSUES DETECTED'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    await page.screenshot({ 
      path: './test-results/final-test-error.png',
      fullPage: true 
    });
    
  } finally {
    console.log('\n🏁 Test completed, closing browser...');
    await browser.close();
  }
}

// Run the final test
finalImageCheck().catch(console.error);