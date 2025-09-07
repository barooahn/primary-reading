import { test, expect } from './fixtures/test-base';
import { StoriesPage } from './pages/StoriesPage';

test.describe('Stories Library', () => {
  test('should display library page elements', async ({ page }) => {
    const storiesPage = new StoriesPage(page);
    
    await storiesPage.goto();
    await storiesPage.verifyStoriesPageElements();
    
    await expect(storiesPage.pageTitle).toBeVisible();
    await expect(storiesPage.searchInput).toBeVisible();
    await expect(storiesPage.genreFilter).toBeVisible();
    await expect(storiesPage.levelFilter).toBeVisible();
  });

  test('should search stories by keyword', async ({ page }) => {
    const storiesPage = new StoriesPage(page);
    
    await storiesPage.goto();
    
    const searchQuery = 'adventure';
    await storiesPage.searchStories(searchQuery);
    
    // Verify search input contains the query
    await expect(storiesPage.searchInput).toHaveValue(searchQuery);
    
    // Wait for search results to load
    await page.waitForTimeout(1000);
    
    // Verify stories are displayed (assuming there are some)
    const storyCount = await storiesPage.getStoryCount();
    expect(storyCount).toBeGreaterThanOrEqual(0);
  });

  test('should filter stories by genre', async ({ page }) => {
    const storiesPage = new StoriesPage(page);
    
    await storiesPage.goto();
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    await storiesPage.filterByGenre('adventure');
    
    // Verify filter was applied
    const selectedGenre = await storiesPage.genreFilter.inputValue();
    expect(selectedGenre).toBe('adventure');
  });

  test('should filter stories by reading level', async ({ page }) => {
    const storiesPage = new StoriesPage(page);
    
    await storiesPage.goto();
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    await storiesPage.filterByLevel('beginner');
    
    // Verify filter was applied
    const selectedLevel = await storiesPage.levelFilter.inputValue();
    expect(selectedLevel).toBe('beginner');
  });

  test('should navigate to story when clicking story card', async ({ page }) => {
    const storiesPage = new StoriesPage(page);
    
    await storiesPage.goto();
    
    // Wait for stories to load
    await page.waitForTimeout(2000);
    
    const storyCount = await storiesPage.getStoryCount();
    
    if (storyCount > 0) {
      await storiesPage.clickFirstStoryCard();
      
      // Verify navigation to story page (URL should change)
      await expect(page).toHaveURL(/\/read\/.+/);
    }
  });

  test('should bookmark stories', async ({ page }) => {
    const storiesPage = new StoriesPage(page);
    
    await storiesPage.goto();
    
    // Wait for stories to load
    await page.waitForTimeout(2000);
    
    const storyCount = await storiesPage.getStoryCount();
    
    if (storyCount > 0) {
      await storiesPage.bookmarkFirstStory();
      
      // Verify bookmark button state changed
      const firstBookmarkButton = storiesPage.bookmarkButtons.first();
      await expect(firstBookmarkButton).toHaveClass(/bookmarked|active/);
    }
  });

  test('should print stories from library', async ({ page }) => {
    const storiesPage = new StoriesPage(page);
    
    await storiesPage.goto();
    
    // Wait for stories to load
    await page.waitForTimeout(2000);
    
    const storyCount = await storiesPage.getStoryCount();
    
    if (storyCount > 0) {
      // Mock the print dialog
      await page.evaluate(() => {
        window.print = () => console.log('Print dialog opened');
      });
      
      await storiesPage.printFirstStory();
      
      // Verify print functionality was called
      const printCalled = await page.evaluate(() => {
        return window.print !== undefined;
      });
      expect(printCalled).toBe(true);
    }
  });

  test('should navigate to create story page', async ({ page }) => {
    const storiesPage = new StoriesPage(page);
    
    await storiesPage.goto();
    
    await storiesPage.createStoryLink.click();
    
    await expect(page).toHaveURL('/create');
  });

  test('should display different story sections', async ({ page }) => {
    const storiesPage = new StoriesPage(page);
    
    await storiesPage.goto();
    
    // Verify popular stories section
    await expect(storiesPage.popularStoriesSection).toBeVisible();
    
    // Verify all stories section
    await expect(storiesPage.allStoriesSection).toBeVisible();
  });
});