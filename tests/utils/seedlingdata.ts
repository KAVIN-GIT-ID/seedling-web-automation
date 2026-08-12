import * as path from 'path';

export const seedlingTestData = {
  charitySearch: 'Amazon Watch',
  charityLabel:  'Amazon WatchOAKLAND, CA',
  charityName:   'Amazon Watch',

  title:               'The New Seedling',
  description:         'the new description',
  coSponsorSearch:     'ang',
  coSponsorName:       'Angelina Jolie',
  campaignTitle:       'campaign new one',
  campaignDescription: 'new to the campaign',

  seedlingGoal: '$100',
  campaignGoal: '$100',

  tier1Description:          'happy wishes',
  tier2Description:          'welcome to the prime elite',
  tier3Description:          'thank you for the donation',
  tier4Description:          'very very helpful',
  highestDonorDescription:   'welcome to the highest donor batch',
  groupIncentiveDescription: 'thank you for all',
  campaignGroupDescription:  'Welcome you for all donors',

  matchingAmount: '$100',

  // ✅ Your exact video path
  mediaFile: path.join(process.cwd(), 'videos', '19548_Test_Promo_To_Live_1777396685503.mp4'),
};