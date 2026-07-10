/**
 * status constant for location filters
 */
export const locationStages = {
  NEEDS_ASSESSMENT: 'Needs Assessment',
  OPEN_LOCATION: 'Open Location',
  QUALIFIED: 'Qualified',
  NEED_ASSESSMENT: 'NEED ASSESSMENT',
  NEGOTIATION: 'Negotiation',
  CURRENT_CUSTOMER: 'Current Customer',
  LOST_PROPOSAL: 'Lost Proposal',
  LOST_CUSTOMER: 'Lost Customer',
  NURTURE: 'Nurture',
  OTHERS: 'otherStageColor',
  APPROVED: 'Approved',
  DISCOVERY: 'Discovery',
};

export const locationTypes = {
  NEW: 'prospecting',
  EXISTING: 'existing',
  OLD: 'old',
  LOST: 'lost',
};

/**
 * constant for location score options
 */
export const locationScoreFilterOptions = (t) => [
  { name: t('sales.locations.all'), id: null },
  { name: '0-10', id: '0-10' },
  { name: '10-20', id: '10-20' },
  { name: '20-30', id: '20-30' },
  { name: '30-40', id: '30-40' },
  { name: '40-50', id: '40-50' },
  { name: '50-60', id: '50-60' },
  { name: '60-70', id: '60-70' },
  { name: '80-90', id: '80-90' },
  { name: '90-100', id: '90-100' },
];
