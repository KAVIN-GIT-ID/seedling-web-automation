import { test, expect } from '../../../fixtures';
import { DonationPage } from '../../../pages/DonationPage';
import { donationTestData } from '../../utils/donationdata';
import { seedlingTestData } from '../../utils/seedlingdata';

test.describe('Donation Flow', () => {

  test('donates to a seedling using a preset amount and incentive tier', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds timeout
    const donationPage = new DonationPage(page);

    await page.goto('/');

    const status = await donationPage.makeDonation({
      seedlingTitle:  seedlingTestData.title,
      amountIndex:    donationTestData.amountIndex,
      incentiveValue: donationTestData.incentiveValue,
    });

    await expect(page.getByRole('button', { name: 'Skip for now' })).not.toBeVisible({ timeout: 10000 });
  });
});