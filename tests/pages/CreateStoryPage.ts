import { Page, Locator } from '@playwright/test';

export class CreateStoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly yearLevelButtons: Locator;
  readonly themeButtons: Locator;
  readonly customPromptTab: Locator;
  readonly customPromptTextarea: Locator;
  readonly storyTypeButtons: Locator;
  readonly generateButton: Locator;
  readonly storyPreview: Locator;
  readonly saveToLibraryButton: Locator;
  readonly shareButton: Locator;
  readonly printButton: Locator;
  readonly downloadButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("Create Your Own Story")');
    this.yearLevelButtons = page.locator('[data-testid^="year-"][data-testid$="-selector"]');
    this.themeButtons = page.locator('[data-testid="theme-button"]');
    this.customPromptTab = page.locator('text="Custom Idea"');
    this.customPromptTextarea = page.locator('textarea[placeholder*="story idea"]');
    this.storyTypeButtons = page.locator('[data-testid^="story-type-"]');
    this.generateButton = page.locator('[data-testid="generate-story-btn"]');
    this.storyPreview = page.locator('[data-testid="story-preview"]');
    this.saveToLibraryButton = page.locator('[data-testid="save-to-library-btn"]');
    this.shareButton = page.locator('[data-testid="share-story-btn"]');
    this.printButton = page.locator('[data-testid="print-story-btn"]');
    this.downloadButton = page.locator('[data-testid="download-story-btn"]');
  }

  async goto() {
    await this.page.goto('/create');
  }

  async selectYearLevel(year: number) {
    await this.page.locator(`[data-testid="year-${year}-selector"]`).click();
  }

  async selectTheme(themeName: string) {
    // Look for button containing the theme name
    await this.page.locator(`button:has-text("${themeName}")`).click();
  }

  async selectStoryType(type: 'fiction' | 'non_fiction') {
    await this.page.locator(`[data-testid="story-type-${type}"]`).click();
  }

  async enterCustomPrompt(prompt: string) {
    await this.customPromptTab.click();
    await this.customPromptTextarea.fill(prompt);
  }

  async generateStory() {
    await this.generateButton.click();
    // Wait for story generation (this might take a while with real API)
    await this.storyPreview.waitFor({ timeout: 60000 });
  }

  async saveToLibrary() {
    await this.saveToLibraryButton.click();
    await this.page.waitForSelector('[data-testid="story-saved-confirmation"]');
  }

  async shareStory() {
    await this.shareButton.click();
  }

  async printStory() {
    await this.printButton.click();
  }

  async downloadStory() {
    await this.downloadButton.click();
  }

  async verifyCreateStoryPageElements() {
    await this.pageTitle.waitFor();
    await this.yearLevelButtons.first().waitFor();
  }

  async completeStoryCreationFlow(year: number, theme: string, type: 'fiction' | 'non_fiction') {
    await this.selectYearLevel(year);
    await this.selectTheme(theme);
    await this.selectStoryType(type);
    await this.generateStory();
  }
}