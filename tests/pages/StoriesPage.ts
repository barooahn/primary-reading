import { Page, Locator } from '@playwright/test';

export class StoriesPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly searchInput: Locator;
  readonly genreFilter: Locator;
  readonly levelFilter: Locator;
  readonly storyCards: Locator;
  readonly bookmarkButtons: Locator;
  readonly printButtons: Locator;
  readonly popularStoriesSection: Locator;
  readonly allStoriesSection: Locator;
  readonly createStoryLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("Story Library")');
    this.searchInput = page.locator('input[placeholder*="Search stories"]');
    this.genreFilter = page.locator('select').first();
    this.levelFilter = page.locator('select').nth(1);
    this.storyCards = page.locator('[data-testid="story-card"]');
    this.bookmarkButtons = page.locator('[data-testid="bookmark-btn"]');
    this.printButtons = page.locator('[data-testid="print-btn"]');
    this.popularStoriesSection = page.locator('h2:has-text("Popular Adventures")');
    this.allStoriesSection = page.locator('h2:has-text("All Stories")');
    this.createStoryLink = page.locator('text="Create Your Own"');
  }

  async goto() {
    await this.page.goto('/stories');
  }

  async searchStories(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async filterByGenre(genre: string) {
    await this.genreFilter.selectOption(genre);
  }

  async filterByLevel(level: string) {
    await this.levelFilter.selectOption(level);
  }

  async clickFirstStoryCard() {
    await this.storyCards.first().click();
  }

  async bookmarkFirstStory() {
    await this.bookmarkButtons.first().click();
  }

  async printFirstStory() {
    await this.printButtons.first().click();
  }

  async getStoryCount() {
    return await this.storyCards.count();
  }

  async verifyStoriesPageElements() {
    await this.pageTitle.waitFor();
    await this.searchInput.waitFor();
    await this.genreFilter.waitFor();
    await this.levelFilter.waitFor();
    await this.popularStoriesSection.waitFor();
    await this.allStoriesSection.waitFor();
  }
}