import dayjs from 'dayjs';

export const keyMetricEmptyState = {
  total_visits: 0,
  decision_maker_meetings_count: 0,
  decision_maker_meetings_percentage: 0,
  proposals_sent_count: 0,
  proposals_sent_percentage: 0,
  proposals_won_count: 0,
  proposals_won_percentage: 0,
  proposals_lost_count: 0,
  proposals_lost_percentage: 0,
  avg_proposal_revenue: 0,
  contract_monthly_revenue: 0,
  contract_monthly_revenue_percentage: 0,
  avg_contract_revenue: 0,
  visits_per_propsal: 0,
  visits_per_contract: 0,
  sales_persons_and_interns: 0,
};

export const emptyState = {
  country: '',
  countryCode: '',
  states: [],
  userIds: [],
  selectedDates: [dayjs().subtract(30, 'day'), dayjs()],
};

export const filtersEmptyState = {
  contractsRange: [null, null],
  minContracts: null,
  maxContracts: null,
  visitsRange: [null, null],
  minVisits: null,
  maxVisits: null,
  revenueRange: [null, null],
  minRevenue: null,
  maxRevenue: null,
  limit: null,
  userIds: [],
  selectedDates: [dayjs().subtract(30, 'day'), dayjs()],
  states: [],
  country: '',
};

export const pageType = {
  dashboard: 'dashboard',
  page: 'page',
};

export const decisionMakingEmptyState = {
  meetings: [null, null],
  limit: null,
  userIds: [],
  selectedDates: [dayjs().subtract(30, 'day'), dayjs()],
};

export const graphTypesForExport = {
  // ["overall_stats", "sales_insights_individuals_stats", "decision_meeting_stats"]
  overallStats: 'overall_stats',
  salesInsightsStats: 'sales_insights_individuals_stats',
  decisionMeetingStats: 'decision_meeting_stats',
};
