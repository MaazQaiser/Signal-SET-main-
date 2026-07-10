import {
  setAccessControlPermissions,
  setAccessToken,
  setCurrentLanguage,
  setDashboardActive,
  setFranchiseId,
  setTenantId,
  setTenantInfo,
  setUserAccessList,
  setUserRole,
} from 'src/redux/store/slices/auth';
import {
  setConfigurations,
  setSelectedCountry,
} from 'src/redux/store/slices/regionalCountryConfiguration';
import { setTenantLanguageData } from 'src/redux/store/slices/tenantConfigs';
import { setInfoData } from 'src/redux/store/slices/user';
import { salesModuleAccessList } from 'src/stubbedData/moduleAccessList';
import {
  dashboardOptions,
  handleAuthRedirection,
  rolesEnum,
  rolesEnumWithName,
} from 'src/utils/constants';

import { buildDemoAccessToken } from './demoToken';

const DEMO_REGIONAL_CONFIG = {
  id: 1,
  default: true,
  country: { label: 'United States', value: 'US' },
  currency: { symbol: '$', abbr: 'USD', label: 'USD' },
  dateFormat: { label: 'MM/DD/YYYY' },
  distanceUnit: { label: 'Miles' },
  timeFormat: { label: '12h' },
  timePrecision: { format: 'hh:mm', label: 'Minutes' },
};

/** Local dev only */
export const DEMO_CREDENTIALS = {
  email: 'demo@signal.local',
  password: 'demo123',
};

export const DEFAULT_TENANT_SERVICES = {
  dedicated: true,
  patrol: true,
  dispatch: true,
  changeAbleServiceStartDate: true,
  repeatModeEnabled: true,
};

export const DEFAULT_TENANT_LABELS = {
  terms: {
    dedicated: 'Dedicated',
    patrol: 'Patrol',
    dispatch: 'Dispatch',
    guard: 'Guard',
    patrol_officer: 'Patrol Officer',
    dedicated_officer: 'Dedicated Officer',
    armed_officer: 'Armed Officer',
    contractStartTime: 'Start Time',
    contractEndTime: 'End Time',
  },
  roles: {
    officer: 'Officer',
  },
};

export const validateDemoLogin = (email, password) => {
  const normalizedEmail = email?.trim().toLowerCase() ?? '';
  const normalizedPassword = password?.trim() ?? '';

  return (
    normalizedEmail === DEMO_CREDENTIALS.email && normalizedPassword === DEMO_CREDENTIALS.password
  );
};

export { buildDemoAccessToken };

export const bootstrapDemoSession = async ({ dispatch, history, i18n, tenantInfo }) => {
  const token = buildDemoAccessToken();
  const role = rolesEnumWithName[rolesEnum.salesManager];

  localStorage.setItem('accessToken', token);

  dispatch(setAccessToken(token));
  dispatch(setUserRole(role));
  dispatch(setFranchiseId('demo-franchise'));
  dispatch(setTenantId('demo-tenant'));
  dispatch(
    setTenantInfo({
      loader: tenantInfo?.loader,
      logo: tenantInfo?.logo,
      images: { logo1: tenantInfo?.logo },
      sliderData: tenantInfo?.sliderData,
      services: DEFAULT_TENANT_SERVICES,
    }),
  );
  dispatch(setUserAccessList(salesModuleAccessList));
  dispatch(setAccessControlPermissions({}));
  dispatch(setTenantLanguageData(DEFAULT_TENANT_LABELS));
  dispatch(setCurrentLanguage({ code: 'en', name: 'English' }));
  dispatch(
    setInfoData({
      id: 'demo-user',
      name: 'Demo User',
      email: DEMO_CREDENTIALS.email,
      assignedRoles: [rolesEnum.salesManager],
      franchiseId: 'demo-franchise',
      tenantId: 'demo-tenant',
    }),
  );
  dispatch(setDashboardActive(dashboardOptions.sale));
  dispatch(setConfigurations([DEMO_REGIONAL_CONFIG]));
  dispatch(setSelectedCountry(DEMO_REGIONAL_CONFIG));

  if (i18n) {
    i18n.changeLanguage('en');
  }

  const { persistor } = await import('src/redux/store/index');
  await persistor.flush();
  history.replace(handleAuthRedirection(role.slug));
};
