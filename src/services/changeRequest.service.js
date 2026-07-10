import { postHttpRequest } from 'helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

export const REACT_APP_LOCATIONS_URL = process.env.REACT_APP_SALES;

export const approveChangeRequest = async (id, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/change_requests/${id}/approve`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const rejectChangeRequest = async (id, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/change_requests/${id}/reject`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};
