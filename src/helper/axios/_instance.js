import axios from 'axios';
import debug from 'debug';
import { getTimezone } from 'src/app/obx/pages/schedules/helper';
import { LOGOUT } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { getKeyFromUrlQueryParam, getRegionFromDomain } from 'src/helper/utilityFunctions';
import {
  APP_INSIGHT_USER_AGENT,
  franchiseIdUrlQueryParam,
  franchiseTimeZone,
  rolesEnum,
} from 'src/utils/constants';

import store from '../../redux/store/index';
import isDevBypassAuth from '../../utils/isDevBypassAuth';

// Create separate debug function for separate purposes of debugging
const debugHttpRequestError = debug('signel:error:http:request');
const debugHttpResponse = debug('signel:http:response');
const debugHttpResponseError = debug('signel:error:http:response');

const getFranchiseId = (authState) => {
  try {
    /**
     * check if the URL path is HO and query params contains the key franchiseId
     * then return the key extracted from URL, else return the key from auth redux
     * */
    if (
      authState?.userRole?.slug === rolesEnum.homeOfficer &&
      getKeyFromUrlQueryParam(franchiseIdUrlQueryParam)
    ) {
      return getKeyFromUrlQueryParam(franchiseIdUrlQueryParam) || null;
    }
    return authState.franchiseId || null;
  } catch (e) {
    return authState.franchiseId || null;
  }
};

const getFranchiseTimeZone = (franchiseTimeZone) => {
  try {
    /**
     * check if the URL path is HO and query params contains the key franchiseId
     * then return the key extracted from URL, else return the key from auth redux
     * */
    return getKeyFromUrlQueryParam(franchiseTimeZone) || null;
  } catch (e) {
    return null;
  }
};

const getGlobalCountry = (appState) => {
  return appState?.regionalCountryConfiguration?.selectedCountry?.country?.value || null;
};

const instance = axios.create({
  baseURL: '',
});

// Add a request interceptor on this `instance` of `axios`
instance.interceptors.request.use(
  function (config) {
    // Do something before the request is sent

    // Get access token from Redux store and add it to request headers
    const appState = store.getState();

    const accessToken = appState.auth.accessToken || null;
    const franchiseId = getFranchiseId(appState.auth) || null;
    const tenantId = appState.auth?.tenantId || null;
    const TimeZone =
      appState.auth?.franchiseTimeZone || getFranchiseTimeZone(franchiseTimeZone) || getTimezone();
    const currentLanguage = appState?.auth?.currentLanguage?.code || 'en';
    const globalCountry = getGlobalCountry(appState);

    /**
     * Due to ACL user management service param in Request Header
     * origin = SET
     * So, As the request is being made from SET repo we are adding it in all the APIs
     */
    const origin = 'SET';

    const defaultHeaders = {
      Accept: 'application/json',
      'Cache-Control': 'public, max-age=86400',
      // 'ngrok-skip-browser-warning': '69420', //? Info: only on it to use ngrok
      user_agent: APP_INSIGHT_USER_AGENT,
      region: getRegionFromDomain(),
    };

    if (!config?.skipAuth) {
      if (accessToken !== null) {
        defaultHeaders.Authorization = `Bearer ${accessToken}`;
        defaultHeaders.franchise_id = `${franchiseId}`;
        defaultHeaders.currentLanguage = `${currentLanguage}`;
        defaultHeaders.timezone = `${TimeZone}`;
        defaultHeaders['tenant_id'] = `${tenantId}`;
        defaultHeaders.country = globalCountry;
      }
    }

    config.headers = {
      ...defaultHeaders,
      ...config.headers,
    };

    const userBaseUrl = process.env.REACT_APP_USER;

    // Example: only add param if URL contains "users"
    if (config.url?.includes(userBaseUrl)) {
      // Create a URLSearchParams from existing params
      const params = new URLSearchParams(config.params || {});

      // Add your custom param
      params.set('origin', `${origin}`);

      // Assign back to config.params
      config.params = params;
    }

    // Return the modified request config object for proceeding
    return config;
  },
  function (error) {
    if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      debugHttpRequestError('%o', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      debugHttpRequestError('Error %s', error.message);
    }

    // log a detailed information about the HTTP error
    debugHttpRequestError(error.toJSON());

    // Return the error object for next Promise chain
    return Promise.reject(error);
  },
);

// Add a response interceptor on this `instance` of `axios`
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger

    // Log the HTTP response on console
    debugHttpResponse(`${response.config.method} ${response.config.url} %o`, response.data);

    return response?.data ? response?.data : response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger

    if (axios.isCancel(error)) {
      debugHttpResponseError(error.message);
    } else {
      if (error.response) {
        // Log the HTTP error info
        debugHttpResponseError(
          `${error.config.method} ${error.config.url} %o`,
          error.response.data,
        );

        // Clear the Redux store if response code is 401 (Unauthenticated)
        if (error.response.status === 401) {
          if (!isDevBypassAuth()) {
            history.push(LOGOUT);
          }
        }
      }

      // log a detailed information about the HTTP error
      debugHttpResponseError(error.toJSON());
    }

    // Return the error object for next Promise chain
    return Promise.reject(error);
  },
);

export default instance;
