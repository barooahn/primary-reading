import { test, expect } from './fixtures/test-base';
import { HomePage } from './pages/HomePage';

test.describe('Homepage', () => {
  test('should display homepage elements correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.verifyHomepageElements();
    
    await expect(homePage.heroTitle).toBeVisible();
    await expect(homePage.getStartedButton).toBeVisible();
    await expect(homePage.createStoryButton).toBeVisible();
    await expect(homePage.browseStoriesButton).toBeVisible();
  });

  test('should navigate to story creation when clicking Create Story', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.clickCreateStory();
    
    await expect(page).toHaveURL('/create');
  });

  test('should navigate to stories library when clicking Browse Stories', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    await homePage.clickBrowseStories();
    
    await expect(page).toHaveURL('/stories');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.goto();
    
    await expect(homePage.heroTitle).toBeVisible();
    await expect(homePage.createStoryButton).toBeVisible();
  });
});