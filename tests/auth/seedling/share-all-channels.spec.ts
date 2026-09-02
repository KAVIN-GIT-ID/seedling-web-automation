import { test } from '@playwright/test';
import { SeedlingSharePage } from '../../../pages/SeedlingSharePage';
import { env } from '../../config/env';

test.describe.serial(`Seedling Video Share - all channels ${env.ENV_TAG}`, () => {
  test.beforeEach(async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    const sharePage = new SeedlingSharePage(page);
    await sharePage.dismissContinueDialogIfPresent();
  });

  test('Copy Link', async ({ page }) => {
    const sharePage = new SeedlingSharePage(page);
    const copiedText = await sharePage.copyShareLink();
    await sharePage.verifyCopiedShareLink(copiedText);
  });

  test('Download', async ({ page }) => {
    const sharePage = new SeedlingSharePage(page);
    const download = await sharePage.downloadShareQr();
    await sharePage.verifyShareQrDownload(download);
  });

  test('Email', async ({ page }) => {
    const sharePage = new SeedlingSharePage(page);
    await sharePage.clickEmailShare();
  });

  test('Facebook', async ({ page }) => {
    const sharePage = new SeedlingSharePage(page);
    const popup = await sharePage.triggerFacebookShare();
    await sharePage.verifyFacebookShareUrl(popup);
  });

  test('Twitter', async ({ page }) => {
    const sharePage = new SeedlingSharePage(page);
    const popup = await sharePage.triggerTwitterShare();
    await sharePage.verifyTwitterShareUrl(popup);
  });
});