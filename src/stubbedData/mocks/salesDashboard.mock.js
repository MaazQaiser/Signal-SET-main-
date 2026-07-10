const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export const salesDashboardMock = {
  visitStats: {
    statusCode: 200,
    message: 'Fetched successfully.',
    data: {
      visits: {
        totalVisits: 348,
        labels: ['Follow Up', 'Decision Making', 'Demo', 'Cold Call'],
        values: [140, 88, 72, 48],
        colors: ['#146DFF', '#34C759', '#FF9500', '#FF3B30'],
      },
    },
  },

  contractRevenueStats: {
    statusCode: 200,
    message: 'Fetched successfully.',
    data: {
      contractedRevenue: {
        totalRevenue: 285000,
        contractedRevenuePercentage: 68,
        labels: ['Patrol', 'Dedicated', 'On-Demand'],
        values: [142500, 99750, 42750],
        colors: ['#146DFF', '#34C759', '#FF9500'],
      },
    },
  },

  keyMetricsStats: {
    statusCode: 200,
    message: 'Fetched successfully.',
    data: {
      table: {
        total_visits: 348,
        decision_maker_meetings_count: 88,
        decision_maker_meetings_percentage: 25,
        proposals_sent_count: 54,
        proposals_sent_percentage: 16,
        proposals_won_count: 31,
        proposals_won_percentage: 57,
        proposals_lost_count: 12,
        proposals_lost_percentage: 22,
        avg_proposal_revenue: 9200,
        contract_monthly_revenue: 23750,
        contract_monthly_revenue_percentage: 12,
        avg_contract_revenue: 7660,
        visits_per_propsal: 6,
        visits_per_contract: 11,
        sales_persons_and_interns: 14,
      },
    },
  },

  salesFunnelStats: {
    statusCode: 200,
    message: 'Fetched successfully.',
    data: {
      salesFunnel: {
        dataLabels: months,
        data: {
          visits: [28, 31, 25, 33, 30, 27, 35, 29, 32, 26, 34, 28],
          proposals: [14, 16, 12, 18, 15, 13, 19, 14, 17, 12, 18, 14],
          contracts: [6, 8, 5, 9, 7, 6, 9, 7, 8, 5, 9, 7],
          lost: [3, 4, 2, 4, 3, 3, 4, 3, 3, 2, 4, 3],
        },
        stats: {
          visits: 348,
          proposals: 171,
          contracts: 86,
          lost: 38,
        },
        colors: {
          visits: ['#FF9500', 'rgba(255,149,0,0)'],
          proposals: ['#146DFF', 'rgba(20,109,255,0)'],
          contracts: ['#34C759', 'rgba(52,199,89,0)'],
          lost: ['#FF3B30', 'rgba(255,59,48,0)'],
        },
      },
    },
  },

  members: {
    statusCode: 200,
    message: 'Fetched successfully.',
    data: {
      members: [
        { id: 1, name: 'James Mitchell' },
        { id: 2, name: 'Sara Nguyen' },
        { id: 3, name: 'Carlos Rivera' },
        { id: 4, name: 'Priya Patel' },
        { id: 5, name: 'Tyler Brooks' },
      ],
    },
  },

  salesPersonInsights: {
    statusCode: 200,
    message: 'Fetched successfully.',
    data: {
      salesPersonInsights: {
        dataLabels: [
          { name: 'James Mitchell', amount: 65400, contractsAmount: 65400, proposalsAmount: 81200 },
          { name: 'Sara Nguyen', amount: 58200, contractsAmount: 58200, proposalsAmount: 74200 },
          { name: 'Carlos Rivera', amount: 49800, contractsAmount: 49800, proposalsAmount: 66100 },
          { name: 'Priya Patel', amount: 43100, contractsAmount: 43100, proposalsAmount: 57800 },
          { name: 'Tyler Brooks', amount: 38500, contractsAmount: 38500, proposalsAmount: 51100 },
        ],
        series: {
          visits: [62, 58, 47, 44, 39],
          decisionMakerMeetings: [28, 24, 21, 18, 15],
          proposals: [20, 18, 15, 13, 11],
          contracts: [12, 10, 8, 7, 6],
          lost: [3, 4, 3, 2, 2],
        },
        colors: ['#AF52DE', '#146DFF', '#34C759', '#FF9500', '#FF3B30'],
      },
    },
  },

  decisionMeetings: {
    statusCode: 200,
    message: 'Fetched successfully.',
    data: {
      decisionMakingGraph: {
        dataLabels: months,
        series: {
          decisionMakerMeetings: [7, 8, 6, 9, 8, 7, 10, 8, 9, 6, 9, 8],
          nonDecisionMakerMeetings: [11, 10, 12, 10, 11, 12, 9, 11, 10, 12, 10, 11],
        },
        colors: ['#146DFF', '#FF9500'],
      },
    },
  },

  dashboardFiltersData: {
    statusCode: 200,
    message: 'Fetched successfully.',
    data: {
      filtersData: {
        max_visits: 100,
        max_contracts: 40,
        max_revenue: 200000,
      },
    },
  },

  proposalWon: {
    statusCode: 200,
    message: 'Fetched successfully.',
    data: {
      deals: [
        {
          dealId: 107,
          dealName: 'Delta Airlines Terminal B',
          dealAmount: 31000,
          dealOwner: 'Sara Nguyen',
          stage: { value: 'closed_won', label: 'Closed Won' },
          city: 'Atlanta',
          state: 'Georgia',
          createDate: '2023-12-01T00:00:00.000Z',
        },
        {
          dealId: 104,
          dealName: 'JPMorgan Chase HQ',
          dealAmount: 22500,
          dealOwner: 'James Mitchell',
          stage: { value: 'closed_won', label: 'Closed Won' },
          city: 'New York',
          state: 'New York',
          createDate: '2024-01-10T00:00:00.000Z',
        },
        {
          dealId: 109,
          dealName: 'Microsoft Redmond Campus',
          dealAmount: 27800,
          dealOwner: 'Tyler Brooks',
          stage: { value: 'closed_won', label: 'Closed Won' },
          city: 'Redmond',
          state: 'Washington',
          createDate: '2024-01-05T00:00:00.000Z',
        },
      ],
      pagination: { currentPage: 1, nextPage: null, prevPage: null, totalPages: 1, totalCount: 3 },
    },
  },

  proposalLost: {
    statusCode: 200,
    message: 'Fetched successfully.',
    data: {
      deals: [
        {
          dealId: 110,
          dealName: 'Ford Dearborn Plant',
          dealAmount: 41500,
          dealOwner: null,
          stage: { value: 'closed_lost', label: 'Closed Lost' },
          city: 'Dearborn',
          state: 'Michigan',
          createDate: '2023-11-15T00:00:00.000Z',
        },
      ],
      pagination: { currentPage: 1, nextPage: null, prevPage: null, totalPages: 1, totalCount: 1 },
    },
  },
};
