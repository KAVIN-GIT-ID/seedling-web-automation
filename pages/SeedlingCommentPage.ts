import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SeedlingCommentPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async dismissContinueDialogIfPresent(): Promise<void> {
    const continueBtn = this.page.getByRole('button', { name: 'Continue' });
    if (await continueBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await continueBtn.click();
    }
  }

  /**
   * Scrolls the video feed on the home page until the target seedling title heading is visible.
   * Then clicks the seedling heading and navigates into the comments section.
   */
  async findAndOpenSeedlingComments(seedlingTitle: string, maxScrollAttempts = 25, maxRefreshes = 3): Promise<void> {
    await this.page.waitForTimeout(3000); // Allow home page feed to settle

    const seedlingHeadingLocator = this.page.getByRole('heading', { name: seedlingTitle });

    for (let refreshAttempt = 0; refreshAttempt < maxRefreshes; refreshAttempt++) {
      for (let scrollAttempt = 0; scrollAttempt < maxScrollAttempts; scrollAttempt++) {
        // 1. Check if any matching heading is currently visible
        const visibleHeading = await this.getVisibleElement(seedlingHeadingLocator);

        if (visibleHeading) {
          await visibleHeading.scrollIntoViewIfNeeded();
          await this.page.waitForTimeout(500);
          await visibleHeading.click();
          await this.page.waitForLoadState('domcontentloaded').catch(() => {});
          await this.page.waitForTimeout(1500);

          // Click comments section/button if separate from heading
          await this.openCommentsSection();
          return;
        }

        // 2. Not visible, scroll down to load more content
        await this.scrollDown();
      }

      // 3. Exhausted scroll attempts; reload and try again
      if (refreshAttempt < maxRefreshes - 1) {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.dismissContinueDialogIfPresent();
        await this.page.waitForTimeout(2000);
      }
    }

    throw new Error(`Seedling with title "${seedlingTitle}" was not found after scrolling feed.`);
  }

  /**
   * Clicks the comments section or comment trigger button on the current seedling
   */
  async openCommentsSection(): Promise<void> {
    const commentBtn = this.page.getByRole('button', { name: /comment|leave a comment/i }).first();
    const commentIconBtn = this.page.locator('button[aria-label*="comment" i], button:has(svg.lucide-message-circle), button:has(svg.lucide-message-square)').first();
    const commentInput = this.page.getByPlaceholder(' ').or(
      this.page.getByRole('textbox', { name: /Share your thoughts|comment/i })
    ).first();

    if (await commentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await commentBtn.click();
    } else if (await commentIconBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await commentIconBtn.click();
    } else if (await commentInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await commentInput.click();
    }
    await this.page.waitForTimeout(1000);
  }

  /**
   * Evaluates all elements matched by a locator and returns the first one that is visible.
   */
  private async getVisibleElement(locator: Locator): Promise<Locator | null> {
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
  private async scrollDown(): Promise<void> {
    const viewport = this.page.viewportSize();
    if (viewport) {
      await this.page.mouse.move(viewport.width / 2, viewport.height / 2);
    }
    await this.page.mouse.wheel(0, 800);
    await this.page.waitForTimeout(1500); // Allow time for lazy-loaded components to render
  }

  async triggerAuthPrompt(): Promise<void> {
    const likeButton = this.page.getByRole('button', { name: /Like/i }).first();
    const commentInput = this.page.getByPlaceholder(' ').or(
      this.page.getByRole('textbox', { name: /Share your thoughts|comment/i })
    ).first();
    const signInBtn = this.page.getByRole('button', { name: 'Sign In' });

    // If Sign In button is already directly visible
    if (await signInBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await signInBtn.click();
      return;
    }

    // Clicking like or comment area prompts guest for Sign In
    if (await likeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await likeButton.click();
    } else if (await commentInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await commentInput.click();
    }

    await signInBtn.waitFor({ state: 'visible', timeout: 10000 });
    await signInBtn.click();
  }

  async login(email: string, pass: string): Promise<void> {
    const emailInput = this.page.getByRole('textbox', { name: 'Email or Phone Number*' });
    const passInput = this.page.getByRole('textbox', { name: 'Password*' });
    const signInBtn = this.page.getByRole('button', { name: 'Sign In' });

    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.fill(email);
    await passInput.fill(pass);
    await signInBtn.click();
  }

  async postComment(commentText: string): Promise<void> {
    const commentInput = this.page.getByPlaceholder(' ').or(
      this.page.getByRole('textbox', { name: /Share your thoughts|comment/i })
    ).first();

    await commentInput.waitFor({ state: 'visible', timeout: 25000 });
    await commentInput.click();
    await commentInput.fill(commentText);

    const submitBtn = this.page.locator('.flex.gap-4.p-2 > button:nth-child(4)')
      .or(this.page.locator('.text-brand-600.disabled\\:opacity-40'))
      .or(this.page.getByRole('button', { name: /post|submit|send/i }))
      .first();

    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
    await submitBtn.click();
  }

  async verifyCommentPosted(commentText: string): Promise<void> {
    const commentOrSuccessMsg = this.page.getByText(commentText).or(
      this.page.getByText(/Comment has been successfully/i)
    ).first();

    await expect(commentOrSuccessMsg).toBeVisible({ timeout: 15000 });

    const okBtn = this.page.getByRole('button', { name: 'OK' });
    if (await okBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await okBtn.click();
    }
  }
}
