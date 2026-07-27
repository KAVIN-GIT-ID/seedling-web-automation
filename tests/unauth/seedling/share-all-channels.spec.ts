import { test } from '@playwright/test';
import { SeedlingSharePage } from '../../../pages/SeedlingSharePage';


test.describe.serial('Guest - Seedling Video Share - all channels', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // TODO: replace '/' with the actual public/guest-accessible seedling
    // share page URL, since a guest won't land on the logged-in dashboard.
    // e.g. await page.goto('/seedling/123/share');
    await page.goto('/');

    const sharePage = new SeedlingSharePage(page);
    await sharePage.dismissContinueDialogIfPresent();
  });

  test('Guest - Copy Link', async ({ page }) => {
    const sharePage = new SeedlingSharePage(page);
    const copiedText = await sharePage.copyShareLink();
    await sharePage.verifyCopiedShareLink(copiedText);
  });

  test('Guest - Download', async ({ page }) => {
    const sharePage = new SeedlingSharePage(page);
    const download = await sharePage.downloadShareQr();
    await sharePage.verifyShareQrDownload(download);
  });

  test('Guest - Email', async ({ page }) => {
    const sharePage = new SeedlingSharePage(page);
    await sharePage.clickEmailShare();
  });

  test('Guest - Facebook', async ({ page }) => {
    const sharePage = new SeedlingSharePage(page);
    const popup = await sharePage.triggerFacebookShare();
    await sharePage.verifyFacebookShareUrl(popup);
  });

  test('Guest - Twitter', async ({ page }) => {
    const sharePage = new SeedlingSharePage(page);
    const popup = await sharePage.triggerTwitterShare();
    await sharePage.verifyTwitterShareUrl(popup);
  });
});