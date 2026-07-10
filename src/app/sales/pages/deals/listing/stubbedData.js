export const DealsBreakdownByVerticles = {
  colors: ['#146DFF', '#A9DEFF', '#31A150', '#FFA95B', '#E43F32'],
  data: [
    { value: 50, name: 'Hyperstores' },
    { value: 10, name: 'Education' },
    { value: 5, name: 'Healthcare' },
    { value: 15, name: 'Residential' },
    { value: 20, name: 'Others' },
  ],
  stats: {
    total: '1,200',
  },
};

export const TotalDealAmount = {
  colors: ['#146DFF', '#31A150', '#EFF8EF'],
  data: [
    { value: 62, name: 'New Deals' },
    { value: 13, name: 'Negotiation' },
    { value: 25, name: 'Closed Won' },
  ],
  stats: {
    total: '$ 185.8M',
  },
};

export const DealsWonLost = {
  dataLabels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  data: {
    Locations: [0, 3, 5, 7, 9, 11, 20, 15, 20, 17, 14, 10],
  },
  stats: {
    Locations: 2,
  },
  colors: {
    Win: ['#31A150', '#A6C3F0'],
    Lost: ['#E43F32', '#E0ECFF'],
  },
};

export const stubbedDataTable = [
  {
    dealID: 2300,
    dealName: 'Costco - Patrol Routing',
    dealamount: 1000,
    dealOwner: 'John Doe',
    stage: 'Questions',
    associatedFranchise: 'Franchise A',
    location: 'Location A',
    dealAddress: '123 Main St',
    postalCode: '12345',
    city: 'City A',
    state: 'State A',
    industry: 'Industry 1',
  },
  {
    dealID: 2560,
    dealName: 'Costco - Patrol Routing',
    dealamount: 1500,
    dealOwner: 'Jane Smith',
    stage: 'Proposals',
    associatedFranchise: 'Franchise B',
    location: 'Location B',
    dealAddress: '456 Elm St',
    postalCode: '67890',
    city: 'City B',
    state: 'State B',
    industry: 'Industry 2',
  },
  {
    dealID: 2440,
    dealName: 'Costco - Patrol Routing',
    dealamount: 1500,
    dealOwner: 'Jane Smith',
    stage: 'Closed',
    associatedFranchise: 'Franchise B',
    location: 'Location B',
    dealAddress: '456 Elm St',
    postalCode: '67890',
    city: 'City B',
    state: 'State B',
    industry: 'Industry 2',
  },
  {
    dealID: 2320,
    dealName: 'Costco - Patrol Routing',
    dealamount: 1500,
    dealOwner: 'Jane Smith',
    stage: 'Negotiation',
    associatedFranchise: 'Franchise B',
    location: 'Location B',
    dealAddress: '456 Elm St',
    postalCode: '67890',
    city: 'City B',
    state: 'State B',
    industry: 'Industry 2',
  },
  // Add more sample data as needed
];
