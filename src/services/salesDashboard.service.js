import { getHttpRequest } from 'helper/axios';
import queryString from 'query-string';
import { salesDashboardMock } from 'src/stubbedData/mocks/salesDashboard.mock';

export const REACT_APP_LOCATIONS_URL = process.env.REACT_APP_SALES;

export const getVisitStats = async (params, config = {}) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/dashboard/visits_stats?${query}`,
      config,
    );
  } catch (e) {
    return salesDashboardMock.visitStats;
  }
};

export const getSalesPersonInsight = async (params, config = {}) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/dashboard/sales_persons_insights?${query}`,
      config,
    );
  } catch (e) {
    return salesDashboardMock.salesPersonInsights;
  }
};

export const getDecisionMakerMeetings = async (params, config = {}) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/dashboard/decision_meetings_stats?${query}`,
      config,
    );
  } catch (e) {
    return salesDashboardMock.decisionMeetings;
  }
};

export const getContractRevenueStats = async (params, config = {}) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/dashboard/contract_revenue_stats?${query}`,
      config,
    );
  } catch (e) {
    return salesDashboardMock.contractRevenueStats;
  }
};

export const getSalesFunnelStats = async (params, config = {}) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/dashboard/sales_funnel_stats?${query}`,
      config,
    );
  } catch (e) {
    return salesDashboardMock.salesFunnelStats;
  }
};

export const getKeyMetricsStats = async (params, config = {}) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/dashboard/key_metrics_stats?${query}`,
      config,
    );
  } catch (e) {
    return salesDashboardMock.keyMetricsStats;
  }
};

export const getMembers = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/dashboard/members`);
  } catch (e) {
    return salesDashboardMock.members;
  }
};

export const getDashboardFiltersData = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/dashboard/filters_data`);
  } catch (e) {
    return salesDashboardMock.dashboardFiltersData;
  }
};

export const exportDashboardGraphs = async (params) => {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/dashboard/export?${query}`);
  } catch (e) {
    return { statusCode: 200, message: 'Export report will be sent to your email.' };
  }
};
