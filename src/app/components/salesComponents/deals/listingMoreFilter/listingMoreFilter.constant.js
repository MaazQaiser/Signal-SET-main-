/**
 * Stages filter dropdown options in deals filters (translation keys resolved via t())
 */
export const getStagesDealsDropdownOptions = (t) => [
  { id: null, name: t('sales.deals.filtersAll') },
  { id: 0, name: t('sales.deals.proposalCreation') },
  { id: 1, name: t('sales.deals.negotiation') },
  { id: 2, name: t('sales.deals.closedLost') },
  { id: 3, name: t('sales.deals.closedWon') },
  { id: 4, name: t('sales.deals.terminated') },
  { id: 5, name: t('sales.deals.expired') },
];

/**
 * Deal type filter dropdown options in deals filters
 */
export const getDealTypeDropdownOptions = (t) => [
  { id: null, name: t('sales.deals.filtersAll') },
  { id: 0, name: t('sales.deals.filtersDealTypeNew') },
  { id: 1, name: t('sales.deals.filtersDealTypeExisting') },
  { id: 2, name: t('sales.deals.filtersDealTypeOld') },
  { id: 3, name: t('sales.deals.filtersDealTypeLost') },
];

export const strategicStatusOptions = (t) => [
  { id: 'unassigned', name: t('sales.companies.unassigned') },
  { id: 'active', name: t('sales.companies.spActive') },
  { id: 'target', name: t('sales.companies.spTarget') },
  { id: 'not_sp', name: t('sales.companies.notSp') },
];

/**
 * Proposal status filter dropdown options in deals filters
 */
export const getProposalStatusDealsDropdownOptions = (t) => [
  { id: null, name: t('sales.deals.filtersAll') },
  { id: 1, name: t('sales.deals.publishWithoutSign') },
  { id: 2, name: t('sales.deals.publishWithSign') },
  { id: 0, name: t('sales.deals.unpublished') },
];
