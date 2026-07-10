import queryString from 'query-string';
import {
  deleteHttpRequest,
  getHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

export const SALES_BASE_URL = process.env.REACT_APP_SALES;

export const FRANCHISE_BASE_URL = process.env.REACT_APP_FRANCHISE;

export const getGoogleHolidays = async (payload) => {
  try {
    const query = queryString.stringify(payload, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${SALES_BASE_URL}/web/holiday_groups/holiday_options?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createHolidayGroup = async (data) => {
  try {
    return await postHttpRequest(`${SALES_BASE_URL}/web/holiday_groups`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateHolidayGroup = async (id, data) => {
  try {
    if (!id) return;
    return await putHttpRequest(`${SALES_BASE_URL}/web/holiday_groups/${id}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};
//search
export const getHolidayGroups = async (payload) => {
  try {
    const query = queryString.stringify(payload, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${FRANCHISE_BASE_URL}/holiday_groups?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getHolidayGroupById = async (id) => {
  try {
    return await getHttpRequest(`${FRANCHISE_BASE_URL}/holiday_groups/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteHolidayGroupById = async (id) => {
  try {
    return await deleteHttpRequest(`${SALES_BASE_URL}/web/holiday_groups/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};
