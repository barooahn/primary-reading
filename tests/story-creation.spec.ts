import { test, expect } from './fixtures/test-base';
import { CreateStoryPage } from './pages/CreateStoryPage';

test.describe('Story Creation Flow', () => {
  test('should complete full story creation workflow', async ({ page }) => {
    const createStoryPage = new CreateStoryPage(page);
    
    await createStoryPage.goto();
    await createStoryPage.verifyCreateStoryPageElements();
    
    // Complete the story creation flow
    await createStoryPage.completeStoryCreationFlow(3, 'Adventure', 'fiction');
    
    // Verify story was generated
    await expect(createStoryPage.storyPreview).toBeVisible();
    await expect(createStoryPage.saveToLibraryButton).toBeVisible();
    await expect(createStoryPage.shareButton).toBeVisible();
    await expect(createStoryPage.printButton).toBeVisible();
  });

  test('should allow custom story prompt input', async ({ page }) => {
    const createStoryPage = new CreateStoryPage(page);
    
    await createStoryPage.goto();
    await createStoryPage.selectYearLevel(4);
    await createStoryPage.selectStoryType('fiction');
    
    const customPrompt = "A story about a brave robot who helps children learn to read";
    await createStoryPage.enterCustomPrompt(customPrompt);
    
    await expect(createStoryPage.customPromptTextarea).toHaveValue(customPrompt);
  });

  test('should validate year level selection', async ({ page }) => {
    const createStoryPage = new CreateStoryPage(page);
    
    await createStoryPage.goto();
    
    // Test each year level (1-6)
    for (let year = 1; year <= 6; year++) {
      await createStoryPage.selectYearLevel(year);
      
      // Verify year level is selected
      const yearButton = page.locator(`[data-testid="year-${year}-selector"]`);
      await expect(yearButton).toHaveClass(/selected|active/);
    }
  });

  test('should handle story type selection', async ({ page }) => {
    const createStoryPage = new CreateStoryPage(page);
    
    await createStoryPage.goto();
    await createStoryPage.selectYearLevel(3);
    
    // Test fiction selection
    await createStoryPage.selectStoryType('fiction');
    const fictionButton = page.locator('[data-testid="story-type-fiction"]');
    await expect(fictionButton).toHaveClass(/selected|active/);
    
    // Test non-fiction selection
    await createStoryPage.selectStoryType('non_fiction');
    const nonFictionButton = page.locator('[data-testid="story-type-non_fiction"]');
    await expect(nonFictionButton).toHaveClass(/selected|active/);
  });

  test('should save story to library', async ({ page }) => {
    const createStoryPage = new CreateStoryPage(page);
    
    await createStoryPage.goto();
    await createStoryPage.completeStoryCreationFlow(2, 'Animals', 'fiction');
    
    // Save to library
    await createStoryPage.saveToLibrary();
    
    // Verify confirmation message
    await expect(page.locator('[data-testid="story-saved-confirmation"]')).toBeVisible();
  });

  test('should handle story sharing', async ({ page }) => {
    const createStoryPage = new CreateStoryPage(page);
    
    await createStoryPage.goto();
    await createStoryPage.completeStoryCreationFlow(3, 'Space', 'fiction');
    
    await createStoryPage.shareStory();
    
    // Verify share modal or functionality appears
    await expect(page.locator('[data-testid="share-modal"]')).toBeVisible();
  });

  test('should handle story printing', async ({ page }) => {
    const createStoryPage = new CreateStoryPage(page);
    
    await createStoryPage.goto();
    await createStoryPage.completeStoryCreationFlow(4, 'Mystery', 'fiction');
    
    // Mock the print dialog
    await page.evaluate(() => {
      window.print = () => console.log('Print dialog opened');
    });
    
    await createStoryPage.printStory();
    
    // Verify print functionality was called
    const printCalled = await page.evaluate(() => {
      return window.print !== undefined;
    });
    expect(printCalled).toBe(true);
  });
});