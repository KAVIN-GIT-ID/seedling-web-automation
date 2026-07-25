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
  async openSeedling(seedlingTitle: string, maxScrollAttempts = 20) {
    const seedlingHeading = this.page.getByRole('heading', { name: seedlingTitle });

    let found = false;
    for (let attempt = 0; attempt < maxScrollAttempts; attempt++) {
      if (await seedlingHeading.first().isVisible().catch(() => false)) {
        found = true;
        break;
      }
      await this.page.mouse.wheel(0, 800); // scroll the feed down
      await this.page.waitForTimeout(500); // brief pause for lazy-loaded video posts to render
    }

    if (!found) {
      throw new Error(
        `❌ Could not find seedling "${seedlingTitle}" after scrolling through ${maxScrollAttempts} screens of the feed`
      );
    }

    await seedlingHeading.first().scrollIntoViewIfNeeded();
    await seedlingHeading.first().click();
    await this.page.waitForLoadState('networkidle', { timeout: 300000 });
  }

  // ─────────────────────────────────────────
  // STEP 2 — Select a preset donation amount
  // ─────────────────────────────────────────
  // NOTE: amountIndex is the nth "$" amount button on the donation widget (0-based).
  // This matches the recorded flow (.nth(4)) but is positional — if the widget's
  // accessible names become more specific (e.g. "$25"), switch to an exact-name locator.
  async selectDonationAmount(amountIndex: number) {
    const amountButtons = this.page.getByRole('button', { name: '$' });
    const amountBtn = amountButtons.nth(amountIndex);
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
    amountIndex: number;
    incentiveValue: string;
  }) {
    await this.openSeedling(data.seedlingTitle);
    await this.selectDonationAmount(data.amountIndex);
    await this.selectIncentiveOption(data.incentiveValue);
    await this.donate();
    await this.skipFollowUpPrompt();
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