import { Page, Locator, TestInfo, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  private readonly continueBtn: Locator;
  private readonly feedEndMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.continueBtn = page.getByRole('button', { name: 'Continue' });
    this.feedEndMessage = page.getByText("You've reached the end.", { exact: false })
      .or(page.getByText("The world always needs more Seedlings.", { exact: false }));
  }

  async goto() {
    await this.navigate('/');
    await this.page.waitForTimeout(2000);
  }

  async acceptCookiesIfPresent() {
    if (await this.continueBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.continueBtn.click();
    }
  }

  async scrollFeedAndCapture(testInfo: TestInfo, maxScrolls: number = 20): Promise<number> {
    let scrollCount = 0;

    while (scrollCount < maxScrolls) {
      // 1. Check if home feed end page text is visible
      const endElement = await this.getVisibleEndPageElement();

      if (endElement) {
        // Scroll the end page screen fully into view
        await endElement.scrollIntoViewIfNeeded().catch(() => {});
        await this.page.waitForTimeout(1000);

        // Take ONE final screenshot of the end page
        const endScreenshot = await this.page.screenshot({ fullPage: false });
        await testInfo.attach('seedling-feed-end-page', {
          body: endScreenshot,
          contentType: 'image/png',
        });

        console.log('📌 Home feed end page reached and scrolled into view. Captured 1 final screenshot, refreshing page, and ending test.');
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.page.waitForTimeout(1500);
        return scrollCount;
      }

      // 2. Capture screenshot of current video feed item
      const screenshot = await this.page.screenshot({ fullPage: false });
      await testInfo.attach(`seedling-feed-item-${scrollCount + 1}`, {
        body: screenshot,
        contentType: 'image/png',
      });

      // 3. Scroll down to next video feed item
      await this.scrollDown();
      scrollCount++;
    }

    return scrollCount;
  }

  private async getVisibleEndPageElement(): Promise<Locator | null> {
    const endTextLocator = this.page.getByText("You've reached the end.", { exact: false })
      .or(this.page.getByText("The world always needs more Seedlings.", { exact: false }));

    const count = await endTextLocator.count();
    for (let i = 0; i < count; i++) {
      const el = endTextLocator.nth(i);
      if (await el.isVisible().catch(() => false)) {
        return el;
      }
    }
    return null;
  }

  private async scrollDown() {
    const viewport = this.page.viewportSize();
    if (viewport) {
      await this.page.mouse.move(viewport.width / 2, viewport.height / 2);
    }
    await this.page.mouse.wheel(0, 800);
    await this.page.waitForTimeout(1500);
  }
}
