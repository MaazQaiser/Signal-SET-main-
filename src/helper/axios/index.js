import { useEffect, useRef } from 'react';

import isDevBypassAuth from '../../utils/isDevBypassAuth';
import Axios from './_instance';

// eslint-disable-next-line no-undef
let abortController = new AbortController();

const isDesignOnlyMode = () => {
  if (process.env.REACT_APP_DESIGN_ONLY === 'true') {
    return true;
  }

  return isDevBypassAuth();
};

const rejectDesignOnlyRequest = (url, method) => {
  return Promise.reject({
    response: {
      data: {
        statusCode: 503,
        message: `[design-only] ${method.toUpperCase()} ${url} is mocked locally.`,
      },
    },
  });
};

export async function getHttpRequest(url, config = {}) {
  if (isDesignOnlyMode()) {
    return rejectDesignOnlyRequest(url, 'get');
  }

  const requestConfig = {
    signal: abortController.signal,
    ...config,
  };
  return Axios.get(url, requestConfig);
}

export async function postHttpRequest(url, data, config = {}) {
  if (isDesignOnlyMode()) {
    return rejectDesignOnlyRequest(url, 'post');
  }

  const requestConfig = {
    signal: abortController.signal,
    ...config,
  };

  return Axios.post(url, data, requestConfig);
}

export async function putHttpRequest(url, data, config = {}) {
  if (isDesignOnlyMode()) {
    return rejectDesignOnlyRequest(url, 'put');
  }

  const requestConfig = {
    signal: abortController.signal,
    ...config,
  };

  return Axios.put(url, data, requestConfig);
}

export async function patchHttpRequest(url, data, config = {}) {
  if (isDesignOnlyMode()) {
    return rejectDesignOnlyRequest(url, 'patch');
  }

  const requestConfig = {
    signal: abortController.signal,
    ...config,
  };

  return Axios.patch(url, data, requestConfig);
}

export async function deleteHttpRequest(url, config = {}) {
  if (isDesignOnlyMode()) {
    return rejectDesignOnlyRequest(url, 'delete');
  }

  const requestConfig = {
    signal: abortController.signal,
    ...config,
  };

  return Axios.delete(url, requestConfig);
}

export function cancelOngoingHttpRequest() {
  abortController.abort();

  // regenerate AbortSignal for future HTTP calls
  // eslint-disable-next-line no-undef
  abortController = new AbortController();
}

export const useApiControllers = () => {
  const previousApiCallController = useRef(null);

  useEffect(() => {
    return () => {
      if (previousApiCallController.current) {
        previousApiCallController.current.abort();
      }
    };
  }, []);

  const abortPreviousApiCall = () => {
    if (previousApiCallController.current) {
      previousApiCallController.current.abort();
    }
  };

  const getNewApiController = () => {
    abortPreviousApiCall();

    const newApiController = new AbortController();
    previousApiCallController.current = newApiController;

    return newApiController;
  };

  return { getNewApiController };
};
