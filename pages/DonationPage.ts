import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DonationPage extends BasePage {

  constructor(page: Page) {
    super(page);
  }

  // ─────────────────────────────────────────
  // STEP 1 — Open a seedling/campaign by its heading
  // ─────────────────────────────────────────
  // The home feed contains multiple video posts and lazy-loads more as you
  // scroll, so the target heading may not exist in the DOM yet. Scroll down
  // in increments, polling for the heading after each scroll, instead of
  // assuming it's already on screen.
  async openSeedling(seedlingTitle: string, maxScrollAttempts = 20, maxRefreshes = 3): Promise<"success" | "seedling title not found"> {
    await this.page.waitForTimeout(3000); // Allow home page feed to settle

    const seedlingHeadingLocator = this.page.getByRole('heading', { name: seedlingTitle });

    for (let refreshAttempt = 0; refreshAttempt < maxRefreshes; refreshAttempt++) {
      for (let scrollAttempt = 0; scrollAttempt < maxScrollAttempts; scrollAttempt++) {
        
        // 1. Check if any matching heading is currently visible
        const visibleHeading = await this.getVisibleElement(seedlingHeadingLocator);
        
        if (visibleHeading) {
          await visibleHeading.scrollIntoViewIfNeeded();
          await visibleHeading.click();
          await this.page.waitForLoadState('load');
          return "success";
        }

        // 2. Not visible, scroll down to load more content
        await this.scrollDown();
      }
      
      // 3. Exhausted scroll attempts; reload and try again
      if (refreshAttempt < maxRefreshes - 1) {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.page.waitForTimeout(2000);
      }
    }

    return "seedling title not found";
  }

  /**
   * Evaluates all elements matched by a locator and returns the first one that is visible.
   */
  private async getVisibleElement(locator: ReturnType<Page['locator']>) {
    const count = await locator.count();
    for (let i = 0; i < count; i++) {
      const element = locator.nth(i);
      if (await element.isVisible().catch(() => false)) {
        return element;
      }
    }
    return null;
  }

  /**
   * Scrolls the page down by simulating a mouse wheel event.
   */
  private async scrollDown() {
    const viewport = this.page.viewportSize();
    if (viewport) {
      await this.page.mouse.move(viewport.width / 2, viewport.height / 2);
    }
    await this.page.mouse.wheel(0, 800);
    await this.page.waitForTimeout(1500); // Allow time for lazy-loaded components to render
  }

  // ─────────────────────────────────────────
  // STEP 2 — Select a preset donation amount
  // ─────────────────────────────────────────
  // NOTE: amountIndex is the nth "$" amount button on the donation widget (0-based).
  // This matches the recorded flow (.nth(4)) but is positional — if the widget's
  // accessible names become more specific (e.g. "$25"), switch to an exact-name locator.
  async selectDonationAmount(amountIndex: number = 4, incentiveButtonName?: string) {
    const amountBtn = incentiveButtonName
      ? this.page.getByRole('button', { name: incentiveButtonName })
      : this.page.getByRole('button', { name: '$' }).nth(amountIndex);
    await amountBtn.waitFor({ state: 'visible', timeout: 15000 }); // wait for donation widget to load
    await amountBtn.click();
  }

  // ─────────────────────────────────────────
  // STEP 3 — Select an incentive/tier option from the dropdown
  // ─────────────────────────────────────────
  async selectIncentiveOption(value: string) {
    const combobox = this.page.getByRole('combobox');
    await combobox.waitFor({ state: 'visible', timeout: 10000 }); // wait for incentive dropdown to render
    await combobox.selectOption(value);
  }

  // ─────────────────────────────────────────
  // STEP 4 — Submit the donation
  // ─────────────────────────────────────────
  async donate() {
    const donateBtn = this.page.getByRole('button', { name: /^Donate \$/ });
    await expect(donateBtn).toBeEnabled({ timeout: 10000 }); // wait for form validation to pass
    await donateBtn.click();
  }

  // ─────────────────────────────────────────
  // STEP 5 — Dismiss the post-donation follow-up prompt
  // ─────────────────────────────────────────
  async skipFollowUpPrompt() {
    const skipBtn = this.page.getByRole('button', { name: 'Skip for now' });
    await skipBtn.waitFor({ state: 'visible', timeout: 150000 }); // wait for post-donation modal
    await skipBtn.click();
    await skipBtn.waitFor({ state: 'hidden', timeout: 10000 }); // wait for modal to close
  }

  // ─────────────────────────────────────────
  // High-level action — full donation flow in one call
  // ─────────────────────────────────────────
  async makeDonation(data: {
    seedlingTitle: string;
    amountIndex?: number;
    incentiveButtonName?: string;
    incentiveValue?: string;
  }) {
    const status = await this.openSeedling(data.seedlingTitle);
    if (status === "seedling title not found") {
      return status;
    }
    await this.selectDonationAmount(data.amountIndex ?? 4, data.incentiveButtonName);
    if (data.incentiveValue) {
      await this.selectIncentiveOption(data.incentiveValue);
    }
    await this.donate();
    await this.skipFollowUpPrompt();
    return "success";
  }

  // ─────────────────────────────────────────
  // Verification — confirm donation succeeded
  // ─────────────────────────────────────────
  // NOTE: placeholder text match — replace with the real success toast/message
  // once confirmed against the actual page (no snapshot of this state was provided).
  async verifyDonationSuccess() {
    await expect(
      this.page.getByText(/thank you|donation successful/i),
      '❌ Donation success confirmation not visible'
    ).toBeVisible({ timeout: 15000 });
  }
}