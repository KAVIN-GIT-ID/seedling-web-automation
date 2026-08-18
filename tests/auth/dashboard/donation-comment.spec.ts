import { test, expect } from '../../../fixtures';
import { seedlingTestData } from '../../utils/seedlingdata';
import { donationTestData } from '../../utils/donationdata';

test.describe('Donation with Comment Flow', () => {

  test('completes text comment, video comment, and skip flows in a single run', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes timeout

    await page.goto('/');
    await page.waitForTimeout(2000); // Allow home feed to settle

    const incentiveButtonName = donationTestData.incentiveButtonName || '$2 Incentive available';
    const commentText = donationTestData.commentText || 'than you for the seedling';

    // ─────────────────────────────────────────
    // PART 1: Text Comment after Donation
    // ─────────────────────────────────────────
    const incentiveBtn1 = page.getByRole('button', { name: incentiveButtonName }).first();
    await incentiveBtn1.waitFor({ state: 'visible', timeout: 15000 });
    await incentiveBtn1.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await incentiveBtn1.click();
    await page.waitForTimeout(1500);

    const donateBtn1 = page.getByRole('button', { name: /^Donate \$/ });
    await expect(donateBtn1).toBeEnabled({ timeout: 10000 });
    await donateBtn1.click();
    await page.waitForTimeout(2000);

    const leaveCommentBtn = page.getByRole('button', { name: 'Leave a comment' });
    await leaveCommentBtn.waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(1000);
    await leaveCommentBtn.click();
    await page.waitForTimeout(1500);

    const commentInput = page.getByRole('textbox', { name: 'Share your thoughts…' });
    await commentInput.waitFor({ state: 'visible', timeout: 10000 });
    await commentInput.click();
    await page.waitForTimeout(500);
    // Realistic human typing
    await commentInput.pressSequentially(commentText, { delay: 60 });
    await page.waitForTimeout(1000);

    const submitCommentBtn = page.locator('.text-brand-600.disabled\\:opacity-40');
    await submitCommentBtn.waitFor({ state: 'visible', timeout: 10000 });
    await submitCommentBtn.click();
    await page.waitForTimeout(2000);

    // Verify success message on confirmation modal
    const successMessage = page.getByText(/Comment has been successfully/i);
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1500);

    const okBtn = page.getByRole('button', { name: 'OK' });
    await okBtn.waitFor({ state: 'visible', timeout: 10000 });
    await okBtn.click();
    await page.waitForTimeout(2000);

    await expect(leaveCommentBtn).not.toBeVisible({ timeout: 10000 });

    // ─────────────────────────────────────────
    // PART 2: Video Comment after Donation
    // ─────────────────────────────────────────
    const incentiveBtn2 = page.getByRole('button', { name: incentiveButtonName }).first();
    await incentiveBtn2.waitFor({ state: 'visible', timeout: 15000 });
    await incentiveBtn2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await incentiveBtn2.click();
    await page.waitForTimeout(1500);

    const donateBtn2 = page.getByRole('button', { name: /^Donate \$/ });
    await expect(donateBtn2).toBeEnabled({ timeout: 10000 });
    await donateBtn2.click();
    await page.waitForTimeout(2000);

    // 1. Click "Record a video" button after donation
    const recordVideoBtn = page.getByRole('button', { name: /record a video/i });
    await recordVideoBtn.waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(1000);
    await recordVideoBtn.click();
    await page.waitForTimeout(1500);

    // 2. Select / Upload file via "Or Choose A File"
    const fileInput = page.locator('input[type="file"]');
    const chooseFileBtn = page.getByRole('button', { name: 'Or Choose A File' });

    await Promise.race([
      chooseFileBtn.waitFor({ state: 'visible', timeout: 15000 }),
      fileInput.waitFor({ state: 'attached', timeout: 15000 }),
    ]).catch(() => { });

    if (await fileInput.count() > 0) {
      await fileInput.first().setInputFiles(seedlingTestData.mediaFile);
    } else {
      await chooseFileBtn.setInputFiles(seedlingTestData.mediaFile);
    }
    await page.waitForTimeout(3000); // Allow video processing preview

    // 3. Post / Submit the video file
    const postVideoBtn = page.getByRole('button', { name: /post|submit|done|upload|send/i });
    if (await postVideoBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await page.waitForTimeout(1000);
      await postVideoBtn.click();
      await page.waitForTimeout(2000);
    }

    // 4. Verify success message on confirmation modal after video post
    const videoSuccessMessage = page.getByText(/Comment has been successfully/i);
    await expect(videoSuccessMessage).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1500);

    // 5. Confirm OK on modal
    const finalOkBtn = page.getByRole('button', { name: 'OK' });
    await finalOkBtn.waitFor({ state: 'visible', timeout: 10000 });
    await finalOkBtn.click();
    await page.waitForTimeout(2000);

    // ─────────────────────────────────────────
    // PART 3: Skip for Now after Donation
    // ─────────────────────────────────────────
    const incentiveBtn3 = page.getByRole('button', { name: incentiveButtonName }).first();
    await incentiveBtn3.waitFor({ state: 'visible', timeout: 15000 });
    await incentiveBtn3.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await incentiveBtn3.click();
    await page.waitForTimeout(1500);

    const donateBtn3 = page.getByRole('button', { name: /^Donate \$/ });
    await expect(donateBtn3).toBeEnabled({ timeout: 10000 });
    await donateBtn3.click();
    await page.waitForTimeout(2000);

    const skipBtn = page.getByRole('button', { name: 'Skip for now' });
    await skipBtn.waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(1000);
    await skipBtn.click();
    await page.waitForTimeout(1500);

    await expect(skipBtn).not.toBeVisible({ timeout: 10000 });
  });

});
