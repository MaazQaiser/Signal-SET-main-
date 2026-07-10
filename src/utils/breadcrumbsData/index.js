import { ReactComponent as ReportsIcon } from 'assets/svg/report.svg';
import { mainDomain } from 'src/helper/utilityFunctions';

import {
  AttendanceIcon,
  CompanyNavbarIcon,
  ContactNavIcon,
  DashboardIcon,
  DealsIconNavbar,
  DispatchNavbarIcon,
  FranchiseIcon,
  IndustryVerticalsIcon,
  Invoices,
  LocationIconSideBar,
  LucidUsertIcon,
  MapIcon,
  NotificationIcon,
  PayrolBlacklIcon,
  Runsheet,
  Schedules,
  ScoutingNavIcon,
  SettingIcon,
  Sites,
  TasksIcon,
  VehiclesIcon,
  Zones,
} from '../../assets/svg/index';
import { MULTI_TENANT_AUTH } from '../constants/multiTanentAuthInfo';

const tenant = MULTI_TENANT_AUTH[mainDomain()];

export const breadCrumbItems = (t) => [
  // Home Office Sales Routes
  {
    title: `${t('sideNavBar.linkText.dashboard')}`,
    icon: <DashboardIcon />,
    key: 'dashboard',
  },
  //invoices
  {
    title: `${t('sideNavBar.linkText.invoices')}`,
    icon: <Invoices />,
    key: 'invoices',
  },

  // franchises
  {
    title: `${t('sideNavBar.linkText.franchises')}`,
    icon: <FranchiseIcon />,
    key: 'franchises',
  },
  {
    title: `${t('sideNavBar.linkText.dispatch')}`,
    icon: <DispatchNavbarIcon />,
    key: 'dispatch',
  },

  // Dashboard OBX Routes
  {
    title: `${t('sideNavBar.linkText.zones')}`,
    icon: <Zones />,
    key: 'zones',
  },
  // franchiseMap Routes
  {
    title: `${t('sideNavBar.linkText.franchiseMap')}`,
    icon: <MapIcon />,
    key: '',
  },
  // sites Routes
  {
    title: `${t('sideNavBar.linkText.sites')}`,
    icon: <Sites color="currentColor" />,
    key: 'sites',
  },
  // schedules Routes
  {
    title: `${t('sideNavBar.linkText.schedules')}`,
    icon: <Schedules />,
    key: 'schedules',
  },
  // runSheets Routes
  {
    title: `${t('sideNavBar.linkText.runSheets')}`,
    icon: <Runsheet />,
    key: 'runsheet',
  },
  // Dispatch Routes
  {
    title: `${t('sideNavBar.linkText.dispatch')}`,
    icon: <DispatchNavbarIcon />,
    key: 'dispatch',
  },
  // reports Routes
  //   {
  //     title: `${t('sideNavBar.linkText.reports')}`,
  //     icon: <Report  />,
  //     key: '',
  //   },
  // users Routes
  {
    title: `${t('sideNavBar.linkText.users')}`,
    icon: <LucidUsertIcon />,
    key: 'users',
  },
  // analytics Routes
  //   {
  //     title: `${t('sideNavBar.linkText.analytics')}`,
  //     icon: <Analytics  />,
  //     key: '',
  //   },
  // leaderBoard Routes
  //   {
  //     title: `${t('sideNavBar.linkText.leaderBoard')}`,
  //     icon: <LeaderBoardIcon  />,
  //     key: '',
  //   },
  // devices Routes
  //   {
  //     title: `${t('sideNavBar.linkText.devices')}`,
  //     icon: <Devices  />,
  //     key: '',
  //   },
  // vehicles Routes
  {
    title: `${t('sideNavBar.linkText.vehicles')}`,
    icon: <VehiclesIcon />,
    key: 'vehicles',
  },
  // OBX setting Routes
  //   {
  //     title: `${t('sideNavBar.linkText.obxSetting')}`,
  //     icon: <SettingIcon  />,
  //     key: '',
  //   },
  // SALES Routes Dashboard
  //   {
  //     title: `${t('sideNavBar.linkText.obxDashboard')}`,
  //     icon: <DashboardIcon  />,
  //     key: '',
  //   },
  // SALES Company
  {
    title: `${t('sideNavBar.linkText.companies')}`,
    icon: <CompanyNavbarIcon color="#6A6A70" />,
    key: 'companies',
  },
  // SALES Location
  {
    title: `${t('sideNavBar.linkText.locations')}`,
    icon: <LocationIconSideBar color="#6A6A70" />,
    key: 'locations',
  },
  {
    title: `${t('sideNavBar.linkText.leadsMap', {
      mapTerm: tenant.name,
    })}`,
    icon: <MapIcon />,
    key: 'leads-map',
  },
  {
    title: `${t('sideNavBar.linkText.franchiseMap')}`,
    icon: <MapIcon />,
    key: 'franchiseMap',
  },
  // SALES Location
  {
    title: `${t('sideNavBar.linkText.deals')}`,
    icon: <DealsIconNavbar color="#6A6A70" />,
    key: 'deals',
  },
  // HO Settings
  {
    title: `${t('sideNavBar.linkText.settings')}`,
    icon: <SettingIcon />,
    key: 'settings',
  },
  // Industry Verticles
  {
    title: `${t('sideNavBar.linkText.marketVerticals')}`,
    icon: <IndustryVerticalsIcon />,
    key: 'marketVerticals',
  },
  // HO Settings
  {
    title: `${t('sideNavBar.linkText.profile')}`,
    icon: <LucidUsertIcon />,
    key: 'profile',
  },
  //leave request
  {
    title: `${t('sideNavBar.linkText.leaveRequest')}`,
    icon: <AttendanceIcon />,
    key: 'leaveRequests',
  },
  //Reports
  {
    title: `${t('sideNavBar.linkText.reports')}`,
    icon: <ReportsIcon />,
    key: 'reports',
  },
  // Sale Contacts
  {
    title: `${t('sideNavBar.linkText.contacts')}`,
    icon: <ContactNavIcon />,
    key: 'contacts',
  },
  // Tasks
  {
    title: `${t('sideNavBar.linkText.tasks')}`,
    icon: <TasksIcon />,
    key: 'tasks',
  },
  {
    title: `${t('sideNavBar.linkText.scoutingRoute')}`,
    icon: <ScoutingNavIcon />,
    key: 'scouting',
  },
  // Notification
  {
    title: `${t('sideNavBar.linkText.notificationsRoute')}`,
    icon: <NotificationIcon />,
    key: 'notifications',
  },
  {
    title: `${t('sideNavBar.linkText.payroll')}`,
    icon: <PayrolBlacklIcon />,
    key: 'payroll',
  },
];

export const findBreadCrumb = (key, t) => {
  const items = breadCrumbItems(t);

  return items.find((o) => o.key === key);
};
