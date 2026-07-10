import { Auth0Context, Auth0Provider, initialContext } from '@auth0/auth0-react';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import history from 'src/app/router/utils/history';
import { buildDemoAccessToken } from 'src/utils/auth/demoToken';
import isDevBypassAuth from 'src/utils/isDevBypassAuth';

import { mainDomain } from './helper/utilityFunctions';
import { MULTI_TENANT_AUTH } from './utils/constants/multiTanentAuthInfo';

const DemoAuthProvider = ({ children }) => {
  const value = useMemo(
    () => ({
      ...initialContext,
      isAuthenticated: false,
      isLoading: false,
      error: undefined,
      user: undefined,
      loginWithRedirect: async () => {},
      logout: ({ logoutParams } = {}) => {
        localStorage.removeItem('accessToken');
        window.location.assign(logoutParams?.returnTo || window.location.origin);
      },
      getAccessTokenSilently: async () => buildDemoAccessToken(),
    }),
    [],
  );

  return <Auth0Context.Provider value={value}>{children}</Auth0Context.Provider>;
};

DemoAuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const Auth0ProviderWithNavigate = ({ children }) => {
  if (isDevBypassAuth()) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>;
  }

  const tenant = mainDomain();
  const environmentData = MULTI_TENANT_AUTH[tenant];

  const domain = environmentData?.auth0Domain;
  const clientId = environmentData?.auth0ClientId;
  const redirectUri = process.env.REACT_APP_AUTH0_CALLBACK_URL || `${window.location.origin}/`;
  const audience = environmentData?.auth0Audience;

  const onRedirectCallback = (appState) => {
    history.push(appState?.returnTo || window.location.pathname);
  };

  if (!(domain && clientId && redirectUri && audience)) {
    return null;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

Auth0ProviderWithNavigate.propTypes = {
  children: PropTypes.node,
};

export { Auth0ProviderWithNavigate };
