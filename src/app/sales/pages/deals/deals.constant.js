/**
 * Question type
 */
export const questionsType = {
  TEXT: 0,
  NUMBER: 1,
  MULTISELECT: 2,
  DATEANDTIME: 3,
  RADIO: 4,
  DATE: 5,
  TIME: 7,
  DROPDOWN: 8,
};

/**
 * Question type IN WORDS
 */
export const questionTypesInWords = {
  MULTISELECT: 'MULTISELECT',
  RADIO: 'RADIO',
  DROPDOWN: 'DROPDOWN',
};

/**
 * Deal filter dropdown options (label translated via t()).
 * Use dealFilterOptions(t) when rendering so "All Deals" etc. translate with language.
 */
export const dealFilterOptions = (t) => [
  { label: t('sales.deals.allDeals'), value: null },
  { label: t('sales.deals.assignedFilter'), value: true },
  { label: t('sales.deals.unassignedFilter'), value: false },
];

/**
 * status constant for location filters
 */
export const locationDrawerTypes = {
  RIGHT: 'right',
  LEFT: 'left',
};

/**
 * status constant for location filters
 */
export const dealStages = {
  QUESTIONS: 'Questions',
  PROPOSAL: 'Proposal',
  PROPOSAL_CREATION: 'Proposal Creation',
  PROPOSAL_DELIVERED: 'Proposal Delivered',
  CLOSED_LOST: 'Closed Lost',
  CLOSED_WON: 'Closed Won',
  NEGOTIATION: 'Negotiation',
  OTHERS: 'otherStageColor',
  TERMINATED: 'Terminated',
};

/**
 * Follow up action type
 */
export const followUpActionTypeConstant = {
  EDIT: 'edit',
  CREATE: 'create',
};

/**
 * status constant for location filters
 */
export const dealTypes = {
  EXISTING: 'existing',
  NEW: 'prospecting',
  OLD: 'old',
  LOST: 'lost',
};

/**
 * status constant for location filters
 */
export const formKeys = {
  REASON: 'reason',
  FOLLOW_UP_DATE: 'followUpDate',
  START_TIME: 'startTime',
  END_TIME: 'endTime',
};
