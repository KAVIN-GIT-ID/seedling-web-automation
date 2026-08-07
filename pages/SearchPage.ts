import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async dismissContinueDialogIfPresent(): Promise<void> {
    const continueBtn = this.page.getByRole('button', { name: 'Continue' });
    if (await continueBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await continueBtn.click();
    }
  }

  async openSearchMenu(): Promise<void> {
    await this.page.getByRole('menuitem', { name: 'Search' }).click();
  }

  async searchFor(query: string): Promise<void> {
    const searchBox = this.page.getByRole('searchbox', { name: 'Search' });
    await searchBox.click();
    await searchBox.fill(query);
    await this.page.getByRole('button', { name: 'Search', exact: true }).click();
  }

 async openCharitiesTab(): Promise<void> {
  const charitiesTab = this.page.getByRole('tab', { name: 'Charities' });
  await expect(charitiesTab).toBeVisible({ timeout: 60000 });

  await expect
    .poll(
      async () => {
        await charitiesTab.click();
        return charitiesTab.getAttribute('aria-selected');
      },
      { timeout: 20000, intervals: [500, 1000, 2000] },
    )
    .toBe('true');
}

  async openResultByHeading(name: string): Promise<void> {
    await this.page.getByRole('heading', { name, exact: true }).click();
  }

  async verifyCharityDetails(details: {
    descriptionSnippet: string;
    addressLine1: string;
    addressLine2: string;
    einSnippet: string;
  }): Promise<void> {
    await expect.soft(this.page.getByText(details.descriptionSnippet)).toBeVisible();
    await expect.soft(this.page.getByText(details.addressLine1)).toBeVisible();
    await expect.soft(this.page.getByText(details.addressLine2)).toBeVisible();
    await expect.soft(this.page.getByText(details.einSnippet)).toBeVisible();
  }
}