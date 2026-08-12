export interface CharitySearchCase {
  query: string;
  headingName: string;
  descriptionSnippet: string;
  addressLine1: string;
  addressLine2: string;
  einSnippet: string;
  useCharitiesTab: boolean;
}

export const charitySearchCases: CharitySearchCase[] = [
  {
    query: 'seedling social giving',
    headingName: 'SEEDLING SOCIAL GIVING',
    descriptionSnippet: 'Seedling Social Giving is a dedicated fundraising platform providing nonprofits global exposure to increase awareness of their mission through targeted campaigns. Donors can find, research, and fund their interests in a manner that engages them with like-minded donors and makes giving a fun, socially-connected experience through campaigns, challenges, and calls to action.',
    addressLine1: 'E LIVE OAK DR',
    addressLine2: 'LOS ANGELES, CA, USA, 90068-',
    einSnippet: 'EIN: 99-',
    useCharitiesTab: true,
  },
  {
    query: 'la opera',
    headingName: 'LA Opera',
    descriptionSnippet: 'LA Opera created a sensation',
    addressLine1: 'North Grand Avenue',
    addressLine2: 'Los Angeles, CA, USA,',
    einSnippet: 'EIN: 95-',
    useCharitiesTab: false,
  },
  {
    query: 'Hope Women Empowerment Organization Inc.',
    headingName: 'Hope Women Empowerment Organization Inc.',
    descriptionSnippet: '',
    addressLine1: '239 S HILLWARD AVE',
    addressLine2: 'WEST COVINA, CA, USA, 91791-1919',
    einSnippet: 'EIN: 92-1919356',
    useCharitiesTab: false,
  },
  {
    query: 'Love Always Sanctuary Inc.',
    headingName: 'Love Always Sanctuary Inc.',
    descriptionSnippet: '',
    addressLine1: '9841 LA TUNA CANYON RD',
    addressLine2: 'SUN VALLEY, CA, USA, 91352-2254',
    einSnippet: 'EIN: 82-2871439',
    useCharitiesTab: false,
  },
];