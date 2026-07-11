import devTenants from './tenants.development';
import prodTenants from './tenants.production';
import stagingTenants from './tenants.staging';
import uatTenants from './tenants.uat';

const ENV_CONFIG_MAP = {
  development: devTenants,
  localhost: devTenants,
  staging: stagingTenants,
  uat: uatTenants,
  production: prodTenants,
};

const resolveTenantEnvironment = () => {
  const explicitEnv = process.env.REACT_APP_NODE_ENV;
  if (explicitEnv && ENV_CONFIG_MAP[explicitEnv]) {
    return explicitEnv;
  }

  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }

  return explicitEnv || process.env.NODE_ENV || 'development';
};

export const MULTI_TENANT_CONFIGURATIONS =
  ENV_CONFIG_MAP[resolveTenantEnvironment()] || prodTenants;
