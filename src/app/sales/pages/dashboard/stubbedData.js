export const contractedRevenue = {
  colors: ['#E6E6E7', '#146DFF'],
  data: [
    { value: 200, name: 'Proposal Revenue' },
    { value: 500, name: 'Contract Revenue' },
  ],
  stats: {
    total: '1,200',
  },
};

export const visits = {
  colors: ['#146DFF', '#FFA95B', '#A9DEFF', '#E43F32'],
  data: [
    { value: 1048, name: 'Existing' },
    { value: 735, name: 'Old' },
    { value: 580, name: 'New' },
    { value: 580, name: 'Lost' },
  ],
  stats: {
    increaseInSale: '1%',
    decreaseInSale: null,
    totalBusiness: '10 business',
    total: '50,000',
  },
};

export const LocationBySalesPerson = {
  colors: ['#E43F32', '#31A150', '#FFAC0D', '#146DFF'],
  dataLabels: ['Abbie D.', 'Areli H.', 'Ashton T.', 'Ben H.', 'Catherine H.'],
  series: {
    Visit: [320, 302, 301, 334, 322],
    Proposal: [120, 132, 101, 134, 122],
    Contracts: [220, 182, 191, 234, 443],
    Lost: [150, 212, 201, 154, 150],
  },
};

export const SalesFunnel = {
  dataLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  data: {
    visit: [0, 3, 5, 7, 9, 11, 20, 15, 20, 17, 14, 10],
    proposal: [0, 3, 5, 4, 9, 66, 20, 15, 20, 18, 14, 33],
    contracts: [4, 13, 5, 4, 9, 16, 20, 15, 20, 18, 14, 43],
    lost: [14, 31, 5, 34, 19, 36, 32, 45, 40, 38, 30, 40],
  },
  stats: {
    contracts: 3,
    lost: 1,
    proposal: 4,
    visit: 2,
  },
  colors: {
    visits: ['#FFAC0D', '#00000000'], ///yellow
    proposals: ['#146DFF', '#00000000'], //blue
    contracts: ['#31A150', '#00000000'], //green
    lost: ['#E43F32', '#00000000'], //red
  },
};

export const keyMetricsDataStub = [
  { label: 'Total Visits', value: '50,000' },
  { label: 'Decision Maker Meetings', value: '1000' },

  { label: 'Proposals Sent', value: '2565' },
  { label: 'Proposals Won', value: '1000' },
  { label: 'Proposals Lost', value: '100' },
  { label: 'Proposals Won', value: '1000' },
  { label: 'Avg. Proposal Revenue', value: '$100' },
  { label: 'Contract Monthly Revenue', value: '$2100' },
  { label: 'Avg. Contract Revenue', value: '15' },
  { label: 'Visits per Propsal', value: '26' },
  { label: 'Visits per Contract', value: '2' },
  { label: 'Sales Person / Interne', value: '100' },
];
