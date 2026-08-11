import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SeedlingPage extends BasePage {

  constructor(page: Page) {
    super(page);
  }

  private async safeClick(getLocator: () => Locator, verify?: () => Promise<boolean>, timeout = 15000) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const locator = getLocator();
        await locator.scrollIntoViewIfNeeded();
        await locator.waitFor({ state: 'visible', timeout });
        await locator.click({ timeout });
        if (verify) await expect.poll(verify, { timeout: 5000 }).toBe(true);
        return;
      } catch (err) {
        lastError = err;
        await this.page.waitForTimeout(500 * attempt);
      }
    }
    throw new Error(`safeClick failed: ${lastError}`);
  }
  private async waitEnabledThenClick(locator: Locator, settleMs = 10_000, timeout = 300_000) {
  await expect(locator).toBeEnabled({ timeout });
  await this.page.waitForTimeout(settleMs);
  await locator.click();
}

  private async safeFill(getLocator: () => Locator, value: string, timeout = 15000) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const locator = getLocator();
        await locator.scrollIntoViewIfNeeded();
        await locator.waitFor({ state: 'visible', timeout });
        await locator.click();
        await locator.fill(value);
        await expect(locator).toHaveValue(value, { timeout: 5000 });
        await this.page.waitForTimeout(150);
        await expect(locator).toHaveValue(value, { timeout: 5000 }); // re-check after settle, catches the reset-to-empty race
        return;
      } catch (err) {
        lastError = err;
        await this.page.waitForTimeout(500 * attempt);
      }
    }
    throw new Error(`safeFill failed: ${lastError}`);
  }

  private async safeSelect(getLocator: () => Locator, value: string, timeout = 15000) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const locator = getLocator();
        await locator.scrollIntoViewIfNeeded();
        await locator.waitFor({ state: 'visible', timeout });
        await locator.selectOption(value);
        await expect(locator).toHaveValue(value, { timeout: 5000 });
        return;
      } catch (err) {
        lastError = err;
        await this.page.waitForTimeout(500 * attempt);
      }
    }
    throw new Error(`safeSelect failed: ${lastError}`);
  }

  private async clickNext(nextStepMarker?: () => Locator) {
    const nextBtn = () => this.page.getByRole('button', { name: 'Next' });
    await expect(nextBtn()).toBeEnabled({ timeout: 15000 });
    await this.safeClick(nextBtn);
    if (nextStepMarker) {
      await expect(nextStepMarker()).toBeVisible({ timeout: 30000 });
    } else {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => { });
    }
  }

  async openCreateSeedling() {
    await this.safeClick(() => this.page.getByRole('menuitem', { name: 'Create Seedling' }));

    const createBtn = () => this.page.getByRole('button', { name: 'Create New Seedling' });
    try {
      await createBtn().waitFor({ state: 'visible', timeout: 5000 });
      await this.safeClick(createBtn);
      await expect(this.page.getByRole('textbox', { name: 'Search for a charity...' })).toBeVisible({ timeout: 30000 });
    } catch {
    }
  }

  async selectCharity(charityName: string, charityLabel: string) {
    const charitySearch = () => this.page.getByRole('textbox', { name: 'Search for a charity...' });
    await charitySearch().waitFor({ state: 'visible', timeout: 55000 });
    await this.safeFill(charitySearch, charityName);

    const dropdownResult = () => this.page.locator('div').filter({ hasText: charityLabel }).first();
    await dropdownResult().waitFor({ state: 'visible', timeout: 55000 });
    await this.safeClick(dropdownResult);

    await this.clickNext(() => this.page.getByRole('textbox', { name: 'Seedling Title*' }));
  }

  async fillSeedlingDetails(data: {
    title: string;
    description: string;
    coSponsorSearch: string;
    coSponsorName: string;
    campaignTitle: string;
    campaignDescription: string;
  }) {
    const titleField = () => this.page.getByRole('textbox', { name: 'Seedling Title*' });
    await titleField().waitFor({ state: 'visible', timeout: 15000 });
    await this.safeFill(titleField, data.title);

    await this.safeFill(() => this.page.getByRole('textbox', { name: 'Seedling Description' }), data.description);

    const coSponsorSearch = () => this.page.getByRole('textbox', { name: 'Search for a co-sponsor...' });
    await this.safeFill(coSponsorSearch, data.coSponsorSearch);

    const sponsorResult = () => this.page.getByText(data.coSponsorName);
    await sponsorResult().waitFor({ state: 'visible', timeout: 15000 });
    await this.safeClick(sponsorResult);

    const campaignCheckbox = () => this.page.getByRole('checkbox', { name: 'Create a campaign' });
    await this.safeClick(campaignCheckbox, async () => await campaignCheckbox().isChecked());

    const campaignTitleField = () => this.page.getByRole('textbox', { name: 'Campaign title' });
    await campaignTitleField().waitFor({ state: 'visible', timeout: 30000 });
    await this.safeFill(campaignTitleField, data.campaignTitle);

    await this.safeFill(() => this.page.getByRole('textbox', { name: 'Campaign description' }), data.campaignDescription);

    await this.clickNext(() => this.page.getByRole('textbox', { name: 'Goal Amount Goal Amount' }));
  }

  async fillGoals(data: {
    seedlingGoal?: string;
    endSeedling?: boolean;
    campaignGoal?: string;
    endCampaign?: boolean;
  }) {
    if (data.seedlingGoal) {
      const goalField = () => this.page.getByRole('textbox', { name: 'Goal Amount Goal Amount' });
      await goalField().waitFor({ state: 'visible', timeout: 15000 });
      await this.safeFill(goalField, data.seedlingGoal);
    }

    if (data.endSeedling) {
      const endSeedlingCheckbox = () => this.page.getByRole('checkbox', { name: /End Seedling if/ });
      await this.safeClick(endSeedlingCheckbox, async () => await endSeedlingCheckbox().isChecked());
    }

    if (data.campaignGoal) {
      const campaignGoalField = () => this.page.getByPlaceholder(' ').nth(1);
      await campaignGoalField().waitFor({ state: 'visible', timeout: 30000 });
      await this.safeFill(campaignGoalField, data.campaignGoal);
    }

    if (data.endCampaign) {
      const endCampaignCheckbox = () => this.page.getByRole('checkbox', { name: /End Campaign if/ });
      await this.safeClick(endCampaignCheckbox, async () => await endCampaignCheckbox().isChecked());
    }

    await this.clickNext(() => this.page.getByRole('checkbox', { name: /Add a giving incentive to/ }).first());
  }

  async fillIncentives(data: {
    tier1Description: string;
    tier2Description: string;
    tier3Description: string;
    tier4Description: string;
    highestDonorDescription: string;
    groupIncentiveDescription: string;
    campaignGroupDescription: string;
  }) {
    const incentiveCheckboxes = () => this.page.getByRole('checkbox', { name: /Add a giving incentive to/ });
    const categoryComboboxes = () => this.page.getByRole('combobox');

    await incentiveCheckboxes().nth(0).waitFor({ state: 'visible', timeout: 80000 });

    const tierData = [
      { descNth: 1, desc: data.tier1Description, cat: '1500' },
      { descNth: 3, desc: data.tier2Description, cat: '1501' },
      { descNth: 5, desc: data.tier3Description, cat: '1501' },
      { descNth: 7, desc: data.tier4Description, cat: '1502' },
    ];

    for (let i = 0; i < tierData.length; i++) {
      const checkbox = () => incentiveCheckboxes().nth(i);
      await this.safeClick(checkbox, async () => await checkbox().isChecked(), 80000);

      const desc = () => this.page.getByPlaceholder(' ').nth(tierData[i].descNth);
      await this.safeFill(desc, tierData[i].desc, 80000);

      const combo = () => categoryComboboxes().nth(i);
      await this.safeSelect(combo, tierData[i].cat, 80000);
    }

    const highestCheck = () => this.page.getByRole('checkbox', { name: 'Highest Donor Incentive' });
    await this.safeClick(highestCheck, async () => await highestCheck().isChecked(), 80000);
    await this.safeFill(
      () => this.page.getByRole('textbox', { name: 'Describe your Highest Donor incentive' }),
      data.highestDonorDescription,
      80000
    );

    const groupCheck = () => this.page.getByRole('checkbox', { name: 'Group Incentive', exact: true });
    if (await groupCheck().isVisible().catch(() => false)) {
      await this.safeClick(groupCheck, async () => await groupCheck().isChecked(), 10000);
      await this.safeFill(
        () => this.page.getByRole('textbox', { name: 'Describe your Group incentive' }),
        data.groupIncentiveDescription,
        10000
      );
    }

    const campaignGroupCheck = () => this.page.getByRole('checkbox', { name: 'Campaign Group Incentive' });
    if (await campaignGroupCheck().isVisible().catch(() => false)) {
      await this.safeClick(campaignGroupCheck, async () => await campaignGroupCheck().isChecked(), 10000);
      await this.safeFill(
        () => this.page.getByRole('textbox', { name: 'Describe your Campaign Group incentive' }),
        data.campaignGroupDescription,
        10000
      );
    }

    await this.clickNext(() => this.page.getByRole('checkbox', { name: 'Create a Challenge Match' }));
  }

  async fillChallengeMatch(matchingAmount: string) {
    const matchCheck = () => this.page.getByRole('checkbox', { name: 'Create a Challenge Match' });
    await matchCheck().waitFor({ state: 'visible', timeout: 55000 });
    await this.safeClick(matchCheck, async () => await matchCheck().isChecked());

    const amountField = () => this.page.getByRole('textbox', { name: 'Matching Amount' });
    await amountField().waitFor({ state: 'visible', timeout: 50000 });
    await this.safeFill(amountField, matchingAmount);

    await this.clickNext(() => this.page.getByRole('button', { name: 'Or Choose A File' }));
  }

  async uploadVideo(filePath: string) {
  const chooseFileBtn = this.page.getByRole('button', { name: 'Or Choose A File' });
  await chooseFileBtn.waitFor({ state: 'visible', timeout: 15000 });

  const fileInput = this.page.locator('input[type="file"]');
  await fileInput.waitFor({ state: 'attached', timeout: 30000 });

  await fileInput.evaluate((el: any) => {
    el.style.display = 'block';
    el.style.opacity = '1';
    el.style.position = 'fixed';
  });

  await fileInput.setInputFiles(filePath);

  await this.page.waitForSelector(
    'video, [class*="success"], [class*="uploaded"], [class*="complete"]',
    { timeout: 60000 }
  );

  await this.clickNext();
}

  async verifyReviewPage(data: {
    charityLabel: string;
    title: string;
    description: string;
    coSponsorName: string;
    campaignTitle: string;
    campaignDescription: string;
    seedlingGoal?: string;
    campaignGoal?: string;
    tier1Description: string;
    tier2Description: string;
    tier3Description: string;
    tier4Description: string;
    highestDonorDescription: string;
    groupIncentiveDescription: string;
    campaignGroupDescription: string;
    matchingAmount: string;
  }) {
    await expect(this.page.getByText(data.title)).toBeVisible({ timeout: 45000 });
    await expect(this.page.getByText('Amazon Watch')).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByText(data.description)).toBeVisible({ timeout: 30000 });
    await expect(this.page.getByText(data.coSponsorName)).toBeVisible({ timeout: 30000 });
    await expect(this.page.getByText(data.campaignTitle)).toBeVisible({ timeout: 30000 });
    await expect(this.page.getByText(data.campaignDescription)).toBeVisible({ timeout: 30000 });
    if (data.seedlingGoal) {
      await expect(this.page.getByText(data.seedlingGoal).first()).toBeVisible({ timeout: 30000 });
    }
    await expect(this.page.getByText(data.tier1Description)).toBeVisible({ timeout: 30000 });
    await expect(this.page.getByText(data.tier2Description)).toBeVisible({ timeout: 30000 });
    await expect(this.page.getByText(data.tier3Description)).toBeVisible({ timeout: 30000 });
    await expect(this.page.getByText(data.tier4Description)).toBeVisible({ timeout: 30000 });
    await expect(this.page.getByText(data.highestDonorDescription)).toBeVisible({ timeout: 30000 });
    if (data.seedlingGoal) {
      await expect(this.page.getByText(data.groupIncentiveDescription)).toBeVisible({ timeout: 30000 });
      await expect(this.page.getByText(data.campaignGroupDescription)).toBeVisible({ timeout: 30000 });
    }
    await expect(this.page.getByText(data.matchingAmount).first()).toBeVisible({ timeout: 50000 });
  }

  async submitSeedling(data: {
  charityLabel: string;
  title: string;
  description: string;
  coSponsorName: string;
  campaignTitle: string;
  campaignDescription: string;
  seedlingGoal?: string;
  campaignGoal?: string;
  tier1Description: string;
  tier2Description: string;
  tier3Description: string;
  tier4Description: string;
  highestDonorDescription: string;
  groupIncentiveDescription: string;
  campaignGroupDescription: string;
  matchingAmount: string;
}) {
    await this.verifyReviewPage(data);

    const confirmBtn = this.page.getByRole('button', { name: 'Confirm & Submit' });

   await expect(confirmBtn).toBeEnabled({ timeout: 300_000 });
   await this.waitEnabledThenClick(confirmBtn);

  const authorizeBtn = this.page.getByRole('button', { name: /Authorize \$/ });
  await authorizeBtn.waitFor({ state: 'visible', timeout: 45000 });
  await authorizeBtn.click();
  const authenticatingBtn = this.page.getByRole('button', { name: 'Authenticating' });
if (await authenticatingBtn.isVisible().catch(() => false)) {
  await authenticatingBtn.waitFor({ state: 'hidden', timeout: 90000 });
}

  const okBtn = this.page.getByRole('button', { name: 'OK' });
  await expect(confirmBtn).toBeEnabled({ timeout: 60000 });

  await okBtn.click();

  await okBtn.waitFor({ state: 'hidden', timeout: 15000 });
}
}