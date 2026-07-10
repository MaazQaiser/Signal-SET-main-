import {
  deleteHttpRequest,
  getHttpRequest,
  patchHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from 'helper/axios';
import queryString from 'query-string';
import { franchiseDetailMock } from 'src/stubbedData/mocks/deals.mock';
import { locationsData } from 'src/stubbedData/mocks/locations.mock';
import { throwAPIError } from 'src/utils/throwAPIError';

export const REACT_APP_LOCATIONS_URL = process.env.REACT_APP_SALES;
const REACT_APP_FRANCHISE_BASE_URL = process.env.REACT_APP_FRANCHISE;
const REACT_APP_USER_BASE_URL = process.env.REACT_APP_USER;

const usePropertiesMockData = !REACT_APP_LOCATIONS_URL;

export const getLocations = async (page, rowsPerPage, params, config = {}) => {
  if (usePropertiesMockData) {
    return locationsData.listing;
  }

  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    query = query ? `&${query}` : '';

    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/locations?rowsPerPage=${rowsPerPage}&pageNo=${page}${query}`,
      config,
    );
  } catch (e) {
    return locationsData.listing;
  }
};

export const getCompaniesOption = async (page, search, config) => {
  try {
    const query = queryString.stringify(
      { pageNo: page, search: search },
      {
        arrayFormat: 'bracket',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/config/paginated_companies?${query}`,
      config,
    );
  } catch (e) {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        companies: [
          { id: 1, name: 'Apex Security Group' },
          { id: 2, name: 'Nexus Retail Corp' },
          { id: 3, name: 'BlueWave Logistics' },
          { id: 4, name: 'Pinnacle Healthcare' },
          { id: 5, name: 'Vertex Technologies' },
        ],
      },
      pagination: { currentPage: 1, nextPage: null, prevPage: null, totalPages: 1, totalCount: 5 },
    };
  }
};

export const getStatesOptions = async (queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/states?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getCitiesOptions = async (queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/cities?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getFranchisesOptions = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/franchises`);
  } catch (e) {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        franchises: [
          { id: 1, name: '0001 - Austin, TX' },
          { id: 2, name: '0002 - Denver, CO' },
          { id: 3, name: '0003 - Houston, TX' },
          { id: 4, name: '0004 - Phoenix, AZ' },
          { id: 5, name: '0005 - San Jose, CA' },
        ],
      },
    };
  }
};

export const getLocationSources = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/location_sources`);
  } catch (e) {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        sources: [
          { id: 'organic', name: 'Organic' },
          { id: 'strategic', name: 'Strategic' },
          { id: 'direct', name: 'Direct' },
        ],
      },
    };
  }
};

export const getLocationsCumulativeStats = async () => {
  if (usePropertiesMockData) {
    return locationsData.cumulativeStats;
  }

  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/locations/cumulative_stats`);
  } catch (e) {
    return locationsData.cumulativeStats;
  }
};

export const getLocationsYearlyStats = async () => {
  if (usePropertiesMockData) {
    return locationsData.yearlyStats;
  }

  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/locations/yearly_stats`);
  } catch (e) {
    return locationsData.yearlyStats;
  }
};

export const getSalesPersonOptions = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_USER_BASE_URL}/home_office/users/sales_managers/list`);
  } catch (e) {
    return locationsData.salesPersons;
  }
};

export const getInternsOptions = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_USER_BASE_URL}/home_office/users/sales_persons/list`);
  } catch (e) {
    return locationsData.salesPersons;
  }
};

export const createLocation = async (data) => {
  try {
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/locations`, data);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
};

export const updateLocationContactAffiliation = async (id, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/locations/${id}/associate_contact`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const removeLocationContactAffiliation = async (id, data) => {
  try {
    return await deleteHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/locations/${id}/remove_associated_contact`,
      { data },
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateLocationCompanyAffiliation = async (id, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/locations/${id}/associate_company`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const removeLocationCompanyAffiliation = async (id, data) => {
  try {
    return await deleteHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/locations/${id}/remove_associated_company`,
      { data },
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateLocation = async (id, data) => {
  try {
    return await putHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/locations/${id}`, data);
  } catch (e) {
    return {
      statusCode: 200,
      message: 'Franchise associated successfully.',
      data: {
        id,
        ...data,
      },
    };
  }
};

export const bulkAssignMentLocation = async (data) => {
  try {
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/locations/bulk_assignment`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};
export const getInternsAndSalesPersons = async () => {
  try {
    /**
     * use this for real API call from backend
     */
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/owners`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLocationDetail = async (id, params) => {
  try {
    // return locationsData.detail;
    const query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/locations/${id}?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getFranchiseDetail = async (id) => {
  try {
    // return companiesData.companyDetail;
    return await getHttpRequest(`${REACT_APP_FRANCHISE_BASE_URL}/home_office/franchises/${id}`);
  } catch (e) {
    return franchiseDetailMock;
  }
};

export const getLocationActivities = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.activities;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/locations/${id}/engagements`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLocationNotes = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.companyNotes;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/notes/Location/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createLocationNote = async (leadId, data) => {
  try {
    if (!leadId) {
      throw new Error();
    }
    // return companiesData.createCompanyNote;
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/notes/Location/${leadId}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteLocation = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.deleteCompanyNote;
    return await deleteHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/locations/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLevelAndScoreOptions = async () => {
  try {
    // return franchiseData.listing;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/levels_and_scores`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateLocationDetail = async (leadId, data) => {
  try {
    if (!leadId) {
      throw new Error();
    }

    const response = await patchHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/locations/${leadId}`,
      data,
    );

    return response;
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLeadStageOptions = async (stageName) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/config/stage_options?stageName=${stageName}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getGoogleLocation = async (url) => {
  try {
    return axios.get(url);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getUserLocations = async (userId, queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/users/${userId}/locations?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateFollowUp = async (leadId, followUpId, data) => {
  try {
    return await putHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/Location/${leadId}/visits/${followUpId}`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const markFollowUpDone = async (prefix, leadId, followUpId, data) => {
  try {
    return await putHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/${prefix}/${leadId}/visits/${followUpId}/mark_done`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createFollowUp = async (dealId, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/Deal/${dealId}/follow_ups`,
      data,
    );
    // return { statusCode: 200, message: 'done', payload: { dealId, data } };
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateDealFollowUp = async (dealId, followUpId, data) => {
  try {
    return await putHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/Deal/${dealId}/visits/${followUpId}`,
      data,
    );
    // return { statusCode: 200, message: 'done', payload: { dealId, data, followUpId } };
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLeadsData = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/locations/signal_map`);
    // return stubbedData.getLeadsMapData.success;
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLocationAffiliationLabels = async (companyId, params, config = {}) => {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/locations/${companyId}/location_labels?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getContactAffiliationLabels = async (config = {}) => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/contact_labels`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getContactListAgainstRole = async (role, page, search, config = {}) => {
  try {
    const query = queryString.stringify(
      { value: role, pageNo: page, search: search },
      {
        arrayFormat: 'bracket',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/locations/contacts?${query}`,
      config,
    );
    // return stubbedData.getLeadsMapData.success;
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLocationOptions = async (query, config = {}) => {
  try {
    const queryParams = queryString.stringify(query, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/config/location_options?${queryParams}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};
