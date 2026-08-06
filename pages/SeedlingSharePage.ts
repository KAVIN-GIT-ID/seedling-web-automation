import { Page, Locator, Download, expect } from '@playwright/test';
import { BasePage } from './BasePage';

type ShareOption = 'Copy Link' | 'Download' | 'Email' | 'Facebook' | 'Twitter';

export class SeedlingSharePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async dismissContinueDialogIfPresent(): Promise<void> {
    const continueBtn = this.page.getByRole('button', { name: 'Continue' });
    if (await continueBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.safeClick(continueBtn);
    }
  }

  async openShareMenu(): Promise<void> {
    await this.safeClick(this.page.getByRole('button', { name: 'Share Share' }).first());
  }

  private optionLocator(label: ShareOption): Locator {
    return this.page
      .locator('div')
      .filter({ hasText: label })
      .filter({ has: this.page.locator('.bg-surface-raised') })
      .last();
  }

  private verifyShareTargetShape(targetUrlRaw: string): void {
    const target = new URL(targetUrlRaw);
    expect(target.protocol).toBe('https:');
    const expectedBaseUrl = process.env.BASE_URL || 'https://qa.seedlingsocial.org';
    const expectedHostname = new URL(expectedBaseUrl).hostname;
    expect(target.hostname).toBe(expectedHostname);
    expect(target.pathname).toMatch(/^\/seedlingshareVideo\/[A-Za-z0-9+/]+=*$/);
    expect(target.searchParams.get('encode')).toBe('true');
  }

  async copyShareLink(): Promise<string> {
    await this.openShareMenu();
    await this.safeClick(this.optionLocator('Copy Link'));
    await this.safeClick(this.page.getByRole('button', { name: 'OK' }));
    return this.page.evaluate(() => (navigator as any).clipboard.readText());
  }

  async verifyCopiedShareLink(copiedText: string): Promise<void> {
    expect(copiedText).toBeTruthy();
    this.verifyShareTargetShape(copiedText);
  }

  async downloadShareQr(): Promise<Download> {
    await this.openShareMenu();
    const downloadPromise = this.page.waitForEvent('download');
    await this.safeClick(this.optionLocator('Download'));
    return downloadPromise;
  }

  async verifyShareQrDownload(download: Download): Promise<void> {
    expect(download.suggestedFilename()).toMatch(/\.(png|jpe?g|svg)$/i);
    expect(await download.path()).toBeTruthy();
  }

  async clickEmailShare(): Promise<void> {
    await this.openShareMenu();
    await this.safeClick(this.optionLocator('Email'));
  }

  async triggerFacebookShare(): Promise<Page> {
    await this.openShareMenu();
    const popupPromise = this.page.waitForEvent('popup');
    await this.safeClick(this.optionLocator('Facebook'));
    return popupPromise;
  }

  async verifyFacebookShareUrl(popup: Page): Promise<void> {
    await popup.waitForURL(/facebook\.com\/sharer\/sharer\.php/, { timeout: 10000 });
    const parsed = new URL(popup.url());
    expect(parsed.hostname).toBe('www.facebook.com');
    expect(parsed.pathname).toBe('/sharer/sharer.php');
    const targetUrl = parsed.searchParams.get('u');
    expect(targetUrl).toBeTruthy();
    this.verifyShareTargetShape(targetUrl!);
    await popup.close();
  }

  async triggerTwitterShare(): Promise<Page> {
    await this.openShareMenu();
    const popupPromise = this.page.waitForEvent('popup');
    await this.safeClick(this.optionLocator('Twitter'));
    return popupPromise;
  }

  async verifyTwitterShareUrl(popup: Page): Promise<void> {
    await popup.waitForURL(
      /(twitter|x)\.com\/(intent\/(tweet|post)|i\/jf\/onboarding\/web)/,
      { timeout: 10000 },
    );
    const parsed = new URL(popup.url());
    expect(parsed.hostname).toMatch(/(twitter|x)\.com$/);

    let targetUrl: string | null;
    if (parsed.pathname.startsWith('/intent/')) {
      targetUrl = parsed.searchParams.get('url');
    } else {
      const redirectAfterLogin = parsed.searchParams.get('redirect_after_login');
      expect(redirectAfterLogin).toBeTruthy();
      const innerIntent = new URL(`https://x.com${redirectAfterLogin}`);
      targetUrl = innerIntent.searchParams.get('url');
    }

    expect(targetUrl).toBeTruthy();
    this.verifyShareTargetShape(targetUrl!);
    await popup.close();
  }

  private async safeClick(locator: Locator, attempts = 3): Promise<void> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        await locator.waitFor({ state: 'visible', timeout: 15000 });
        await locator.click();
        return;
      } catch (err) {
        lastError = err;
        await this.page.waitForTimeout(500 * attempt);
      }
    }
    throw new Error(`safeClick failed: ${lastError}`);
  }
}