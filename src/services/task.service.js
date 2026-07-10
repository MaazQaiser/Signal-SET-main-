import queryString from 'query-string';
import {
  deleteHttpRequest,
  getHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

const REACT_APP_LOCATIONS_URL = process.env.REACT_APP_SALES;

export const getTasks = async ({ params, taskableId, taskableType, config = {} }) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/tasks/${taskableType}/${taskableId}?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createTask = async (taskableType, taskableId, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/tasks/${taskableType}/${taskableId}`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateTask = async (taskableType, taskableId, data, taskId) => {
  try {
    return await putHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/tasks/${taskableType}/${taskableId}/task/${taskId}`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteTask = async (taskableType, taskableId, taskId) => {
  try {
    return await deleteHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/tasks/${taskableType}/${taskableId}/task/${taskId}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const changeTaskStatus = async (taskableType, taskableId, taskId, status) => {
  try {
    return await putHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/tasks/${taskableType}/${taskableId}/task/${taskId}`,
      status,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getTaskTypeAndPriority = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/task_options`);
  } catch (e) {
    return throwAPIError(e);
  }
};
