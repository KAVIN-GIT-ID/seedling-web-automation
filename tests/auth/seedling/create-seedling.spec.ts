import { test, expect } from '../../../fixtures';
import { seedlingTestData } from '../../utils/seedlingdata';
import { SeedlingPage } from '../../../pages/SeedlingPage';

// ✅ storageState auto-loaded — already logged in, no login code needed

type TestCase = {
  name: string;
  title: string;
  campaignTitle?: string;
  seedlingGoal?: string;
  campaignGoal?: string;
  endSeedling: boolean;
  endCampaign: boolean;
  campaignGroupDescription?: string;
  skipChallengeMatch?: boolean;
  skipPaymentFlow?: boolean;
};

const testCases: TestCase[] = [
  {
    name: 'creates a complete seedling with all steps',
    title: 'Seedling Full Flow',
    campaignTitle: 'Campaign Full Flow',
    seedlingGoal: seedlingTestData.seedlingGoal,
    campaignGoal: seedlingTestData.campaignGoal,
    endSeedling: true,
    endCampaign: true,
    campaignGroupDescription: seedlingTestData.campaignGroupDescription,
  },
  {
    name: 'creates seedling without goal amount',
    title: 'Seedling Without Goal Amount',
    campaignTitle: 'Campaign Without Goal Amount',
    seedlingGoal: undefined,
    campaignGoal: undefined,
    endSeedling: false,
    endCampaign: false,
    campaignGroupDescription: seedlingTestData.campaignGroupDescription,
  },
  {
    name: 'creates seedling without ticking end goal checkboxes',
    title: 'Seedling Without Ticking End Goal Checkboxes',
    campaignTitle: 'Campaign Without Ticking End Goal Checkboxes',
    seedlingGoal: seedlingTestData.seedlingGoal,
    campaignGoal: seedlingTestData.campaignGoal,
    endSeedling: false,
    endCampaign: false,
    campaignGroupDescription: seedlingTestData.campaignGroupDescription,
  },
  {
    name: 'creates seedling without campaign',
    title: 'Seedling Without Campaign',
    campaignTitle: undefined,
    seedlingGoal: seedlingTestData.seedlingGoal,
    campaignGoal: undefined,
    endSeedling: true,
    endCampaign: false,
    campaignGroupDescription: undefined,
  },
  {
    name: 'creates seedling without challenge match and skips payment',
    title: 'Seedling Without Challenge Match',
    campaignTitle: 'Campaign Without Challenge Match',
    seedlingGoal: seedlingTestData.seedlingGoal,
    campaignGoal: seedlingTestData.campaignGoal,
    endSeedling: true,
    endCampaign: true,
    campaignGroupDescription: seedlingTestData.campaignGroupDescription,
    skipChallengeMatch: true,
    skipPaymentFlow: true,
  },
];

test.describe('Create Seedling - Full Flow', () => {
  for (const tc of testCases) {
    test(tc.name, async ({ page }) => {
      test.setTimeout(10 * 60 * 1000);
      const seedlingPage = new SeedlingPage(page);

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
        title:               tc.title,
        description:         seedlingTestData.description,
        coSponsorSearch:     seedlingTestData.coSponsorSearch,
        coSponsorName:       seedlingTestData.coSponsorName,
        campaignTitle:       tc.campaignTitle,
        campaignDescription: tc.campaignTitle ? seedlingTestData.campaignDescription : undefined,
      });

      // Step 4 — Goals
      await seedlingPage.fillGoals({
        seedlingGoal: tc.seedlingGoal,
        endSeedling:  tc.endSeedling,
        campaignGoal: tc.campaignGoal,
        endCampaign:  tc.endCampaign,
      });

      // Step 5 — All incentives
      await seedlingPage.fillIncentives({
        tier1Description:          seedlingTestData.tier1Description,
        tier2Description:          seedlingTestData.tier2Description,
        tier3Description:          seedlingTestData.tier3Description,
        tier4Description:          seedlingTestData.tier4Description,
        highestDonorDescription:   seedlingTestData.highestDonorDescription,
        groupIncentiveDescription: tc.endSeedling ? seedlingTestData.groupIncentiveDescription : undefined,
        campaignGroupDescription:  tc.campaignGroupDescription,
      });

      // Step 6 — Challenge match
      await seedlingPage.fillChallengeMatch(tc.skipChallengeMatch ? undefined : seedlingTestData.matchingAmount);

      // Step 7 — Video upload
      await seedlingPage.uploadVideo(seedlingTestData.mediaFile);

      // Step 8 — Verify review page then submit
      await seedlingPage.submitSeedling({
        charityName:               seedlingTestData.charityName,
        title:                     tc.title,
        description:               seedlingTestData.description,
        coSponsorName:             seedlingTestData.coSponsorName,
        campaignTitle:             tc.campaignTitle,
        campaignDescription:       tc.campaignTitle ? seedlingTestData.campaignDescription : undefined,
        seedlingGoal:              tc.seedlingGoal,
        campaignGoal:              tc.campaignGoal,
        tier1Description:          seedlingTestData.tier1Description,
        tier2Description:          seedlingTestData.tier2Description,
        tier3Description:          seedlingTestData.tier3Description,
        tier4Description:          seedlingTestData.tier4Description,
        highestDonorDescription:   seedlingTestData.highestDonorDescription,
        groupIncentiveDescription: tc.endSeedling ? seedlingTestData.groupIncentiveDescription : undefined,
        campaignGroupDescription:  tc.campaignGroupDescription,
        matchingAmount:            tc.skipChallengeMatch ? undefined : seedlingTestData.matchingAmount,
        skipPaymentFlow:           tc.skipPaymentFlow,
      });
    });
  }
});