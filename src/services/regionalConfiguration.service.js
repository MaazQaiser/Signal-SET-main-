import {
  deleteHttpRequest,
  getHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

const SALES_SERVICE = process.env.REACT_APP_SALES;

export async function getRegionalConfigurations() {
  try {
    return await getHttpRequest(`${SALES_SERVICE}/shared/config/regional_options`);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getRegionalConfigurationOptions() {
  try {
    return await getHttpRequest(`${SALES_SERVICE}/shared/config/country_configuration_options`);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getAllRegionalConfigurations() {
  try {
    return await getHttpRequest(`${SALES_SERVICE}/web/country_configurations`);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function createRegionalConfiguration(payload) {
  try {
    return await postHttpRequest(`${SALES_SERVICE}/web/country_configurations`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function updateRegionalConfiguration(id, payload) {
  try {
    return await putHttpRequest(`${SALES_SERVICE}/web/country_configurations/${id}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function deleteRegionalConfiguration(id) {
  try {
    return await deleteHttpRequest(`${SALES_SERVICE}/web/country_configurations/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
}
