import { test } from '@playwright/test';

test('debug height calculation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  
  const storyUrl = 'http://localhost:3001/read/b6932872-7059-4f2b-8463-1878e145a456';
  await page.goto(storyUrl);
  
  await page.waitForSelector('.netflix-reading-container');
  
  // Close reading tip if present
  try {
    await page.waitForSelector('.fixed.inset-0.z-\\[100\\]', { timeout: 3000 });
    await page.click('button:has-text("Got it!")');
    await page.waitForSelector('.fixed.inset-0.z-\\[100\\]', { state: 'detached' });
  } catch {
    // Modal not found, continue
  }
  
  const debug = await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    const container = document.querySelector('.netflix-reading-container');
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    
    return {
      windowInnerHeight: window.innerHeight,
      documentScrollHeight: document.documentElement.scrollHeight,
      bodyScrollHeight: body.scrollHeight,
      bodyOffsetHeight: body.offsetHeight,
      bodyClientHeight: body.clientHeight,
      bodyBoundingRect: body.getBoundingClientRect(),
      htmlScrollHeight: html.scrollHeight,
      containerHeight: container?.getBoundingClientRect().height || 0,
      containerTop: container?.getBoundingClientRect().top || 0,
      headerHeight: header?.getBoundingClientRect().height || 0,
      mainHeight: main?.getBoundingClientRect().height || 0,
      bodyOverflow: window.getComputedStyle(body).overflow,
      bodyOverflowY: window.getComputedStyle(body).overflowY,
      containerClasses: container?.className || '',
      allElements: Array.from(document.body.children).map(el => ({
        tag: el.tagName,
        height: el.getBoundingClientRect().height,
        top: el.getBoundingClientRect().top,
        bottom: el.getBoundingClientRect().bottom,
        classes: el.className
      }))
    };
  });
  
  console.log('🔍 Debug Height Information:');
  console.log('Window Inner Height:', debug.windowInnerHeight);
  console.log('Document Scroll Height:', debug.documentScrollHeight);
  console.log('Body Scroll Height:', debug.bodyScrollHeight);
  console.log('Body Offset Height:', debug.bodyOffsetHeight);
  console.log('Body Client Height:', debug.bodyClientHeight);
  console.log('Body Bounding Rect:', debug.bodyBoundingRect);
  console.log('HTML Scroll Height:', debug.htmlScrollHeight);
  console.log('Container Height:', debug.containerHeight);
  console.log('Container Top:', debug.containerTop);
  console.log('Header Height:', debug.headerHeight);
  console.log('Main Height:', debug.mainHeight);
  console.log('Body Overflow:', debug.bodyOverflow);
  console.log('Body Overflow Y:', debug.bodyOverflowY);
  console.log('Container Classes:', debug.containerClasses);
  console.log('\n📊 All Body Children:');
  debug.allElements.forEach((el, i) => {
    console.log(`${i + 1}. ${el.tag}: ${el.height}px (top: ${el.top}, bottom: ${el.bottom}) - ${el.classes}`);
  });
  
  // Calculate total height
  const totalHeight = debug.allElements.reduce((sum, el) => {
    return sum + el.height;
  }, 0);
  console.log('\n📐 Total calculated height:', totalHeight);
  console.log('📐 Difference from viewport:', debug.documentScrollHeight - debug.windowInnerHeight);
});