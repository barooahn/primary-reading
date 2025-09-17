/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';

// Define custom fixtures for PrimaryReading app
type PrimaryReadingFixtures = {
  // Mock user authentication state
  authenticatedPage: import('@playwright/test').Page;
  // Story creation helpers
  storyCreationFlow: StoryCreationFlow;
  // Reading session helpers
  readingSessionFlow: ReadingSessionFlow;
};

interface StoryCreationFlow {
  selectYearLevel: (year: number) => Promise<void>;
  selectTheme: (themeName: string) => Promise<void>;
  selectStoryType: (type: 'fiction' | 'non_fiction') => Promise<void>;
  generateStory: () => Promise<void>;
  saveToLibrary: () => Promise<void>;
}

interface ReadingSessionFlow {
  startReading: (storyId: string) => Promise<void>;
  navigateToNextSegment: () => Promise<void>;
  answerQuestion: (answerIndex: number) => Promise<void>;
  completeReading: () => Promise<void>;
}

export const test = base.extend<PrimaryReadingFixtures>({
  // Mock authenticated user session
  authenticatedPage: async ({ page }, use) => {
    // Mock authentication state (since we don't have real auth in development)
    await page.addInitScript(() => {
      // Mock user session
      window.localStorage.setItem('mock_user_authenticated', 'true');
      window.localStorage.setItem('mock_user_id', 'test-user-123');
      window.localStorage.setItem('mock_user_profile', JSON.stringify({
        id: 'test-user-123',
        username: 'testuser',
        display_name: 'Test User',
        grade_level: 3,
        reading_level: 'intermediate',
      }));
    });
    
    await use(page);
  },

  // Story creation workflow helper
  storyCreationFlow: async ({ page }, use) => {
    const storyFlow = {
      async selectYearLevel(year: number) {
        await page.click(`[data-testid="year-${year}-selector"]`);
      },
      
      async selectTheme(themeName: string) {
        await page.click(`text="${themeName}"`);
      },
      
      async selectStoryType(type: 'fiction' | 'non_fiction') {
        await page.click(`[data-testid="story-type-${type}"]`);
      },
      
      async generateStory() {
        await page.click('[data-testid="generate-story-btn"]');
        // Wait for story generation to complete (mock will be instant)
        await page.waitForSelector('[data-testid="story-preview"]', { timeout: 30000 });
      },
      
      async saveToLibrary() {
        await page.click('[data-testid="save-to-library-btn"]');
        await page.waitForSelector('[data-testid="story-saved-confirmation"]');
      }
    };
    
    await use(storyFlow);
  },

  // Reading session workflow helper
  readingSessionFlow: async ({ page }, use) => {
    const readingFlow = {
      async startReading(storyId: string) {
        await page.goto(`/read/${storyId}`);
        await page.waitForSelector('[data-testid="story-content"]');
      },
      
      async navigateToNextSegment() {
        await page.click('[data-testid="next-segment-btn"]');
      },
      
      async answerQuestion(answerIndex: number) {
        await page.click(`[data-testid="answer-option-${answerIndex}"]`);
      },
      
      async completeReading() {
        // Navigate through all segments and questions
        while (await page.isVisible('[data-testid="next-segment-btn"]')) {
          await this.navigateToNextSegment();
          await page.waitForTimeout(1000); // Give time for content to load
        }
        
        // Complete questions if they appear
        while (await page.isVisible('[data-testid="answer-option-0"]')) {
          await this.answerQuestion(0); // Answer first option for simplicity
          await page.waitForTimeout(1000);
        }
        
        // Wait for results page
        await page.waitForSelector('[data-testid="reading-results"]');
      }
    };
    
    await use(readingFlow);
  }
});

export { expect } from '@playwright/test';