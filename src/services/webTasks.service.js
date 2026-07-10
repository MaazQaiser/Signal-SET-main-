import queryString from 'query-string';
import {
  deleteHttpRequest,
  getHttpRequest,
  patchHttpRequest,
  postHttpRequest,
} from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

const REACT_APP_LOCATIONS_URL = process.env.REACT_APP_SALES;

const buildQuery = (params = {}) =>
  queryString.stringify(params, {
    arrayFormat: 'bracket',
    skipEmptyString: true,
    skipNull: true,
  });

const buildUrl = (params) => {
  const query = buildQuery(params);
  return query ? `${REACT_APP_LOCATIONS_URL}/web/tasks?${query}` : '/web/tasks';
};

export const getWebTasks = async (params = {}, config = {}) => {
  try {
    return await getHttpRequest(buildUrl(params), config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createWebTask = async (data) => {
  try {
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/tasks`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateWebTask = async (taskId, data) => {
  try {
    return await patchHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/tasks/${taskId}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteWebTask = async (taskId) => {
  try {
    return await deleteHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/tasks/${taskId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};
