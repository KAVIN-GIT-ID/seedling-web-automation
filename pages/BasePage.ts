import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async waitForPageLoad() {
    await this.page.waitForLoadState('load');
  }

  async navigate(path = '/') {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }
}