import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heroTitle: Locator;
  readonly getStartedButton: Locator;
  readonly createStoryButton: Locator;
  readonly browseStoriesButton: Locator;
  readonly featuresSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroTitle = page.locator('h1').first();
    this.getStartedButton = page.locator('text="Get Started - It\'s Free!"').first();
    this.createStoryButton = page.locator('text="Create Your Story"').first();
    this.browseStoriesButton = page.locator('text="Browse Stories"').first();
    this.featuresSection = page.locator('[data-testid="features-section"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickGetStarted() {
    await this.getStartedButton.click();
  }

  async clickCreateStory() {
    await this.createStoryButton.click();
  }

  async clickBrowseStories() {
    await this.browseStoriesButton.click();
  }

  async verifyHomepageElements() {
    await this.heroTitle.waitFor();
    await this.getStartedButton.waitFor();
    await this.createStoryButton.waitFor();
    await this.browseStoriesButton.waitFor();
  }
}