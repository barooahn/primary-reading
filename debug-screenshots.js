import { chromium } from 'playwright';

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const devices = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
    { name: 'mobile-large', width: 414, height: 896 }
  ];

  try {
    for (const device of devices) {
      console.log(`Taking screenshot for ${device.name} (${device.width}x${device.height})`);

      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

      // Wait for any images to load
      await page.waitForTimeout(3000);

      // Take full page screenshot
      await page.screenshot({
        path: `debug-${device.name}.png`,
        fullPage: true
      });

      // Take hero section screenshot
      const heroSection = page.locator('section').first();
      if (await heroSection.count() > 0) {
        await heroSection.screenshot({
          path: `debug-hero-${device.name}.png`
        });
      }

      console.log(`✓ Screenshots saved for ${device.name}`);
    }

    // Check for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });

    // Check if images are loading
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const images = await page.locator('img').all();
    console.log(`\nFound ${images.length} img elements on page`);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const isVisible = await img.isVisible();
      const opacity = await img.evaluate(el => getComputedStyle(el).opacity);
      console.log(`Image ${i + 1}: src="${src}", alt="${alt}", visible=${isVisible}, opacity=${opacity}`);
    }

  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
