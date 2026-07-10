import { toast } from 'react-toastify';
import { toastSettings } from 'src/utils/constants';
import { throwAPIError } from 'src/utils/throwAPIError';

import { getHttpRequest, postHttpRequest } from '../helper/axios';
import { isObjectEmpty } from '../helper/utilityFunctions';

// eslint-disable-next-line no-undef
export const authServiceEndPoint = process.env.REACT_APP_USER;

// Login API
export const authLogin = async () => {
  try {
    // const data = await postHttpRequest(`${authServiceEndPoint}/auth/login`, postData);
  } catch (e) {
    toast.error('Something went wrong!', {
      position: 'top-right',
      autoClose: toastSettings.AUTO_CLOSE,
    });
  }
};

export const forgetPassword = async (postData) => {
  try {
    if (!postData.user.email) {
      throw new Error();
    }
    return await postHttpRequest(`${authServiceEndPoint}/auth/forgot_password`, postData);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updatePassword = async (postData) => {
  try {
    if (isObjectEmpty(postData)) {
      throw new Error();
    }

    return await postHttpRequest(`${authServiceEndPoint}/auth/change_password`, postData);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getUserLoginPermission = async () => {
  try {
    const data = await getHttpRequest(`${authServiceEndPoint}/permissions`);
    return data;
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getUserData = async () => {
  try {
    return await getHttpRequest(`${authServiceEndPoint}/configs/user_data`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const logoutCall = async () => {
  try {
    return await postHttpRequest(`${authServiceEndPoint}/auth/logout`);
  } catch (error) {
    return throwAPIError(e);
  }
};

export const getLanguageConfigs = async () => {
  try {
    return await getHttpRequest(`${authServiceEndPoint}/configs/tenant_labels`);
  } catch (error) {
    return throwAPIError(e);
  }
};
