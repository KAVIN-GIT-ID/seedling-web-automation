import { test, expect } from '../../../fixtures';
import { seedlingTestData } from '../../utils/seedlingdata';
import { SeedlingPage } from '../../../pages/SeedlingPage';

// ✅ storageState auto-loaded — already logged in, no login code needed

test.describe('Create Seedling - Full Flow', () => {

  test('creates a complete seedling with all steps', async ({ page }) => {
    test.setTimeout(10 * 60 * 1000);
    const seedlingPage = new SeedlingPage(page);
    const uniqueSuffix = Date.now();
    const dynamicTitle = `Seedling full flow - ${uniqueSuffix}`;
    const dynamicCampaignTitle = `Campaign full flow - ${uniqueSuffix}`;

    await page.goto('/');

    // Step 1 — Open form
    await seedlingPage.openCreateSeedling();

    // Step 2 — Select charity
    await seedlingPage.selectCharity(
      seedlingTestData.charitySearch,
      seedlingTestData.charityLabel
    );

    // Step 3 — Seedling details + co-sponsor + campaign
    await seedlingPage.fillSeedlingDetails({
      title:               dynamicTitle,
      description:         seedlingTestData.description,
      coSponsorSearch:     seedlingTestData.coSponsorSearch,
      coSponsorName:       seedlingTestData.coSponsorName,
      campaignTitle:       dynamicCampaignTitle,
      campaignDescription: seedlingTestData.campaignDescription,
    });

    // Step 4 — Goals
    await seedlingPage.fillGoals({
      seedlingGoal: seedlingTestData.seedlingGoal,
      endSeedling:  true,
      campaignGoal: seedlingTestData.campaignGoal,
      endCampaign:  true,
    });

    // Step 5 — All incentives
    await seedlingPage.fillIncentives({
      tier1Description:          seedlingTestData.tier1Description,
      tier2Description:          seedlingTestData.tier2Description,
      tier3Description:          seedlingTestData.tier3Description,
      tier4Description:          seedlingTestData.tier4Description,
      highestDonorDescription:   seedlingTestData.highestDonorDescription,
      groupIncentiveDescription: seedlingTestData.groupIncentiveDescription,
      campaignGroupDescription:  seedlingTestData.campaignGroupDescription,
    });

    // Step 6 — Challenge match
    await seedlingPage.fillChallengeMatch(seedlingTestData.matchingAmount);

    // Step 7 — Video upload
    await seedlingPage.uploadVideo(seedlingTestData.mediaFile);

    // Step 8 — Verify review page then submit
    await seedlingPage.submitSeedling({
      charityLabel:              seedlingTestData.charityLabel,
      title:                     dynamicTitle,
      description:               seedlingTestData.description,
      coSponsorName:             seedlingTestData.coSponsorName,
      campaignTitle:             dynamicCampaignTitle,
      campaignDescription:       seedlingTestData.campaignDescription,
      seedlingGoal:              seedlingTestData.seedlingGoal,
      campaignGoal:              seedlingTestData.campaignGoal,
      tier1Description:          seedlingTestData.tier1Description,
      tier2Description:          seedlingTestData.tier2Description,
      tier3Description:          seedlingTestData.tier3Description,
      tier4Description:          seedlingTestData.tier4Description,
      highestDonorDescription:   seedlingTestData.highestDonorDescription,
      groupIncentiveDescription: seedlingTestData.groupIncentiveDescription,
      campaignGroupDescription:  seedlingTestData.campaignGroupDescription,
      matchingAmount:            seedlingTestData.matchingAmount,
    });
  });

  test('creates seedling without goal amount', async ({ page }) => {
    test.setTimeout(10 * 60 * 1000);
    const seedlingPage = new SeedlingPage(page);
    const uniqueSuffix = Date.now();
    const dynamicTitle = `Seedling without goal amount - ${uniqueSuffix}`;
    const dynamicCampaignTitle = `Campaign without goal amount - ${uniqueSuffix}`;

    await page.goto('/');

    // Step 1 — Open form
    await seedlingPage.openCreateSeedling();

    // Step 2 — Select charity
    await seedlingPage.selectCharity(
      seedlingTestData.charitySearch,
      seedlingTestData.charityLabel
    );

    // Step 3 — Seedling details + co-sponsor + campaign
    await seedlingPage.fillSeedlingDetails({
      title:               dynamicTitle,
      description:         seedlingTestData.description,
      coSponsorSearch:     seedlingTestData.coSponsorSearch,
      coSponsorName:       seedlingTestData.coSponsorName,
      campaignTitle:       dynamicCampaignTitle,
      campaignDescription: seedlingTestData.campaignDescription,
    });

    // Step 4 — Goals (Left empty without checking end goal checkboxes)
    await seedlingPage.fillGoals({
      endSeedling: false,
      endCampaign: false,
    });

    // Step 5 — All incentives
    await seedlingPage.fillIncentives({
      tier1Description:          seedlingTestData.tier1Description,
      tier2Description:          seedlingTestData.tier2Description,
      tier3Description:          seedlingTestData.tier3Description,
      tier4Description:          seedlingTestData.tier4Description,
      highestDonorDescription:   seedlingTestData.highestDonorDescription,
      groupIncentiveDescription: seedlingTestData.groupIncentiveDescription,
      campaignGroupDescription:  seedlingTestData.campaignGroupDescription,
    });

    // Step 6 — Challenge match
    await seedlingPage.fillChallengeMatch(seedlingTestData.matchingAmount);

    // Step 7 — Video upload
    await seedlingPage.uploadVideo(seedlingTestData.mediaFile);

    // Step 8 — Submit without goal amount in review verification
    await seedlingPage.submitSeedling({
      charityLabel:              seedlingTestData.charityLabel,
      title:                     dynamicTitle,
      description:               seedlingTestData.description,
      coSponsorName:             seedlingTestData.coSponsorName,
      campaignTitle:             dynamicCampaignTitle,
      campaignDescription:       seedlingTestData.campaignDescription,
      tier1Description:          seedlingTestData.tier1Description,
      tier2Description:          seedlingTestData.tier2Description,
      tier3Description:          seedlingTestData.tier3Description,
      tier4Description:          seedlingTestData.tier4Description,
      highestDonorDescription:   seedlingTestData.highestDonorDescription,
      groupIncentiveDescription: seedlingTestData.groupIncentiveDescription,
      campaignGroupDescription:  seedlingTestData.campaignGroupDescription,
      matchingAmount:            seedlingTestData.matchingAmount,
    });
  });

  test('creates seedling without ticking end goal checkboxes', async ({ page }) => {
    test.setTimeout(10 * 60 * 1000);
    const seedlingPage = new SeedlingPage(page);
    const uniqueSuffix = Date.now();
    const dynamicTitle = `Seedling without ticking end goal checkboxes - ${uniqueSuffix}`;
    const dynamicCampaignTitle = `Campaign without ticking end goal checkboxes - ${uniqueSuffix}`;

    await page.goto('/');

    // Step 1 — Open form
    await seedlingPage.openCreateSeedling();

    // Step 2 — Select charity
    await seedlingPage.selectCharity(
      seedlingTestData.charitySearch,
      seedlingTestData.charityLabel
    );

    // Step 3 — Seedling details + co-sponsor + campaign
    await seedlingPage.fillSeedlingDetails({
      title:               dynamicTitle,
      description:         seedlingTestData.description,
      coSponsorSearch:     seedlingTestData.coSponsorSearch,
      coSponsorName:       seedlingTestData.coSponsorName,
      campaignTitle:       dynamicCampaignTitle,
      campaignDescription: seedlingTestData.campaignDescription,
    });

    // Step 4 — Goals (Goals provided, end goal checkboxes UNTICKED)
    await seedlingPage.fillGoals({
      seedlingGoal: seedlingTestData.seedlingGoal,
      endSeedling:  false,
      campaignGoal: seedlingTestData.campaignGoal,
      endCampaign:  false,
    });

    // Step 5 — All incentives
    await seedlingPage.fillIncentives({
      tier1Description:          seedlingTestData.tier1Description,
      tier2Description:          seedlingTestData.tier2Description,
      tier3Description:          seedlingTestData.tier3Description,
      tier4Description:          seedlingTestData.tier4Description,
      highestDonorDescription:   seedlingTestData.highestDonorDescription,
      groupIncentiveDescription: seedlingTestData.groupIncentiveDescription,
      campaignGroupDescription:  seedlingTestData.campaignGroupDescription,
    });

    // Step 6 — Challenge match
    await seedlingPage.fillChallengeMatch(seedlingTestData.matchingAmount);

    // Step 7 — Video upload
    await seedlingPage.uploadVideo(seedlingTestData.mediaFile);

    // Step 8 — Submit
    await seedlingPage.submitSeedling({
      charityLabel:              seedlingTestData.charityLabel,
      title:                     dynamicTitle,
      description:               seedlingTestData.description,
      coSponsorName:             seedlingTestData.coSponsorName,
      campaignTitle:             dynamicCampaignTitle,
      campaignDescription:       seedlingTestData.campaignDescription,
      seedlingGoal:              seedlingTestData.seedlingGoal,
      campaignGoal:              seedlingTestData.campaignGoal,
      tier1Description:          seedlingTestData.tier1Description,
      tier2Description:          seedlingTestData.tier2Description,
      tier3Description:          seedlingTestData.tier3Description,
      tier4Description:          seedlingTestData.tier4Description,
      highestDonorDescription:   seedlingTestData.highestDonorDescription,
      groupIncentiveDescription: seedlingTestData.groupIncentiveDescription,
      campaignGroupDescription:  seedlingTestData.campaignGroupDescription,
      matchingAmount:            seedlingTestData.matchingAmount,
    });
  });
});