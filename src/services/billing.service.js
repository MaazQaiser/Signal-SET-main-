import _queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

import { _postHttpRequest, getHttpRequest, putHttpRequest } from '../helper/axios';

export const FRANCHISE_SERVICE = process.env.REACT_APP_FRANCHISE;

// Get Billing Details on Site ID
export async function getBillingDetail(id) {
  try {
    return await getHttpRequest(`${FRANCHISE_SERVICE}/sites/${id}/billing_detail`);
  } catch (e) {
    return throwAPIError(e);
  }
}

// Update Billing Details
export const updateBillingDetails = async (id, data) => {
  try {
    if (!id) {
      throw new Error();
    }
    return await putHttpRequest(`${FRANCHISE_SERVICE}/billing_details/${id}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};
