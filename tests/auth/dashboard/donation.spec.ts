import { test, expect } from '../../../fixtures';
import { DonationPage } from '../../../pages/DonationPage';
import { donationTestData } from '../../utils/donationdata';
test.describe('Donation Flow', () => {

  test('donates to a seedling using a preset amount and incentive tier', async ({ page }) => {
    const donationPage = new DonationPage(page);

    await page.goto('/');

    await donationPage.makeDonation({
      seedlingTitle:  donationTestData.seedlingTitle,
      amountIndex:    donationTestData.amountIndex,
      incentiveValue: donationTestData.incentiveValue,
    });

    await expect(page.getByRole('button', { name: 'Skip for now' })).not.toBeVisible({ timeout: 10000 });
  });
});