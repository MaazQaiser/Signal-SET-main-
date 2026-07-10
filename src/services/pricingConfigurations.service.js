import queryString from 'query-string';
import { getHttpRequest, postHttpRequest } from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

export const settings = process.env.REACT_APP_SALES;

export async function getPricingConfig(queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${settings}/web/pricing_configurations?${query}`, config);
    // return stubbedData['typesStubbedData'].update.success;
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function updatePricingConfig(payload, config = {}) {
  try {
    return await postHttpRequest(`${settings}/web/pricing_configurations/save`, payload, config);
    // return stubbedData['typesStubbedData'].update.success;
  } catch (e) {
    return throwAPIError(e);
  }
}
