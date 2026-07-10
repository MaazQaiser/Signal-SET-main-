import queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

import {
  deleteHttpRequest,
  getHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from '../helper/axios';
import { config } from '../stubbedData/mocks/settings.mock';

export const settings = process.env.REACT_APP_FRANCHISE;

const USERS_SERVICE = process.env.REACT_APP_USER;

const LEADS_SERVICE = process.env.REACT_APP_SALES;
export const visitor_service = process.env.REACT_APP_VISITORS;
// Get Type API
export async function getTypes(franchiseId, queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${visitor_service}/franchises/${franchiseId}/visitor_types/?${query}`,
      config,
    );
    // return createStubbedData(page, perPage);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function createType(franchiseId, postData) {
  try {
    return await postHttpRequest(
      `${visitor_service}/franchises/${franchiseId}/visitor_types`,
      postData,
    );
    // return stubbedData['typesStubbedData'].create.success;
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function updateType(franchiseId, id, postData) {
  try {
    return await putHttpRequest(
      `${visitor_service}/franchises/${franchiseId}/visitor_types/${id}`,
      postData,
    );
    // return stubbedData['typesStubbedData'].update.success;
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getTypeById(franchiseId, id) {
  try {
    return await getHttpRequest(`${visitor_service}/franchises/${franchiseId}/visitor_types/${id}`);
    // return stubbedData['typesStubbedData'].getOne.success;
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getSettingsAttributesList(franchiseId, type) {
  try {
    const query = queryString.stringify(type, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${visitor_service}/franchises/${franchiseId}/visitor_types/default_settings?${query}`,
    );
    // return stubbedData['formSettingsListByType'].list.success;
  } catch (e) {
    return throwAPIError(e);
  }
}

/**
 * @returns {Object}
 */
export const fetchConfigList = async () => {
  try {
    const data = await getHttpRequest(
      `${LEADS_SERVICE}/shared/config/country_options?allCountries=true`,
    );

    // return new Promise((res, rej) => {
    //   setTimeout(() => {
    //     res(config?.success?.data);
    //   }, 1500);
    // });
    return data?.data;
  } catch (e) {
    // Local / demo: real `LEADS_SERVICE` is often unreachable; stub avoids a noisy toast and empty country state.
    return config?.success?.data;
  }
};

export const getTimezoneOptions = async () => {
  try {
    return await getHttpRequest(`${LEADS_SERVICE}/shared/config/timezones`);
  } catch (e) {
    return {
      statusCode: 200,
      message: 'success',
      data: { timezones: config.success.data.timezones },
    };
  }
};

export const fetchSettingsPreferences = async () => {
  try {
    return await getHttpRequest(`${settings}/preferences`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const fetchSettingsPreferencesConfig = async () => {
  try {
    return await getHttpRequest(`${settings}/preferences/preferences_config`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export async function updateSettings(postData) {
  try {
    return await putHttpRequest(`${settings}/preferences/update`, postData);
    // return stubbedData['typesStubbedData'].update.success;
  } catch (e) {
    return throwAPIError(e);
  }
}

export const updatePermissions = async (payload, id) => {
  try {
    return await putHttpRequest(`${USERS_SERVICE}/roles/${id}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const resetPrivileges = async (id) => {
  try {
    return await putHttpRequest(`${USERS_SERVICE}/roles/${id}/reset_privileges`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const resetUserRolePrivileges = async (id) => {
  try {
    return await putHttpRequest(`${USERS_SERVICE}/users/${id}/update_privileges?reset=true`, {
      user: {},
    });
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createNewRole = async (payload) => {
  try {
    return await postHttpRequest(`${USERS_SERVICE}/roles`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getRolesForSettings = async () => {
  try {
    const _data = {
      data: [
        {
          id: 1184,
          name: 'Sales Manager',
          slug: 'sales_manager',
          privileges: {
            dashboard: { view: true },
            companies: {
              create: true,
              view: true,
              update: true,
              reviews: { view: true },
              activities: { view: true },
              notes: { create: true, view: true, update: true, delete: true },
              tasks: { create: true, view: true, update: true, delete: true },
            },
            properties: {
              create: true,
              view: true,
              update: true,
              reviews: { view: true },
              activities: { view: true },
              notes: { create: true, view: true, update: true, delete: true },
              tasks: { create: true, view: true, update: true, delete: true },
              classificationQuestions: { view: true, update: true },
              emails: { create: true, view: true, update: true, delete: true },
              meetings: { create: true, view: true, update: true, delete: true },
            },
            deals: {
              create: true,
              view: true,
              update: true,
              activities: { view: true },
              contracts: { create: true, view: true, update: true, delete: true },
              notes: { create: true, view: true, update: true, delete: true },
              tasks: { create: true, view: true, update: true, delete: true },
            },
            contacts: {
              create: true,
              view: true,
              update: true,
              delete: true,
              activities: { view: true },
              notes: { create: true, view: true, update: true, delete: true },
              tasks: { create: true, view: true, update: true, delete: true },
              reviews: { view: true },
            },
            signalMap: { view: true },
            users: {
              view: true,
              properties: { view: true },
              deals: { view: true },
              history: { view: true },
            },
            marketVerticals: {
              create: true,
              view: true,
              update: true,
              delete: true,
            },
            routes: { view: true },
            settings: {
              create: true,
              view: true,
              update: true,
              delete: true,
              preferences: {
                create: true,
                view: true,
                update: true,
                delete: true,
                systemDefault: {
                  create: true,
                  view: true,
                  update: true,
                  delete: true,
                },
                holidayGroups: {
                  create: true,
                  view: true,
                  update: true,
                  delete: true,
                },
              },
              emailConfigurations: {
                create: true,
                view: true,
                update: true,
                delete: true,
              },
              rolesAndPermissions: {
                create: true,
                view: true,
                update: true,
                delete: true,
              },
            },
          },
          createdAt: '04/25/2025',
          updatedAt: '04/25/2025',
        },
        {
          id: 1183,
          name: 'Sales Person',
          slug: 'sales_person',
          privileges: {
            dashboard: { view: true },
            companies: {
              create: true,
              view: true,
              update: true,
              reviews: { view: true },
              activities: { view: true },
              notes: { create: true, view: true, update: true, delete: true },
              tasks: { create: true, view: true, update: true, delete: true },
            },
            properties: {
              create: true,
              view: true,
              update: true,
              reviews: { view: true },
              activities: { view: true },
              notes: { create: true, view: true, update: true, delete: true },
              tasks: { create: true, view: true, update: true, delete: true },
              classificationQuestions: { view: true, update: true },
              emails: { create: true, view: true, update: true, delete: true },
              meetings: { create: true, view: true, update: true, delete: true },
            },
            deals: {
              create: true,
              view: true,
              update: true,
              activities: { view: true },
              contracts: { create: true, view: true, update: true, delete: true },
              notes: { create: true, view: true, update: true, delete: true },
              tasks: { create: true, view: true, update: true, delete: true },
            },
            contacts: {
              create: true,
              view: true,
              update: true,
              delete: true,
              activities: { view: true },
              notes: { create: true, view: true, update: true, delete: true },
              tasks: { create: true, view: true, update: true, delete: true },
              reviews: { view: true },
            },
            signalMap: { view: true },
            users: {
              view: true,
              properties: { view: true },
              deals: { view: true },
              history: { view: true },
            },
            marketVerticals: {
              create: true,
              view: true,
              update: true,
              delete: true,
            },
            routes: { view: true },
            settings: {
              create: true,
              view: true,
              update: true,
              delete: true,
              preferences: {
                create: true,
                view: true,
                update: true,
                delete: true,
                systemDefault: {
                  create: true,
                  view: true,
                  update: true,
                  delete: true,
                },
                holidayGroups: {
                  create: true,
                  view: true,
                  update: true,
                  delete: true,
                },
              },
              emailConfigurations: {
                create: true,
                view: true,
                update: true,
                delete: true,
              },
              rolesAndPermissions: {
                create: true,
                view: true,
                update: true,
                delete: true,
              },
            },
          },
          createdAt: '04/25/2025',
          updatedAt: '04/25/2025',
        },
      ],
      message: 'The record has been fetched successfully!',
      statusCode: 200,
    };
    // return _data;
    return await getHttpRequest(`${USERS_SERVICE}/roles`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDiscountSettings = async () => {
  try {
    return await getHttpRequest(`${LEADS_SERVICE}/web/billing_discount`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const saveDiscountSettings = async (payload) => {
  try {
    return await putHttpRequest(`${LEADS_SERVICE}/web/billing_discount`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

//Product Services

export const getPaginatedProducts = async (queryParams, config = {}) => {
  const query = queryString.stringify(queryParams, {
    arrayFormat: 'index',
    skipEmptyString: true,
    skipNull: true,
  });
  try {
    return await getHttpRequest(`${LEADS_SERVICE}/web/products?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const addProduct = async (payload) => {
  try {
    return await postHttpRequest(`${LEADS_SERVICE}/web/products`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteProduct = async (productId) => {
  try {
    return await deleteHttpRequest(`${LEADS_SERVICE}/web/products/${productId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateProduct = async (productId, payload) => {
  try {
    return await putHttpRequest(`${LEADS_SERVICE}/web/products/${productId}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};
