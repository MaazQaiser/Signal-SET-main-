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

export const MULTI_TENANT_CONFIGURATIONS =
  ENV_CONFIG_MAP[process.env.REACT_APP_NODE_ENV] || devTenants;
