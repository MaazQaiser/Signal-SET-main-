import { lazy } from 'react';

import withSuspense from '../../../hoc/withSuspense';
// import userHasRole from '../../utils/auth/userHasRole';
import userHasPermission from '../../../utils/auth/userHasPermission';
import * as HO from '../constant/HOMODULE';
// import userHasRoleAndPermission from '../../utils/auth/userHasRoleAndPermission';
import * as routes from '../constant/ROUTE';

//Dashboard
const Dashboard = lazy(
  () => import(/* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/dashboard/index'),
);
const DashboardWithSuspense = withSuspense(Dashboard);

//Franchise Listing
const FranchiseListing = lazy(
  () =>
    import(/* webpackChunkName: "FranchiseListing" */ '../../homeOffice/pages/franchise/listing'),
);
const FranchiseListingWithSuspense = withSuspense(FranchiseListing);

//Franchise  detail
const FranchiseDetail = lazy(
  () =>
    import(
      /* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/franchise/detail/index'
    ),
);
const FranchiseDetailWithSuspense = withSuspense(FranchiseDetail);

// Franchise Update
const FranchiseUpdate = lazy(
  () =>
    import(
      /* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/franchise/update/index'
    ),
);
const FranchiseUpdateWithSuspense = withSuspense(FranchiseUpdate);

const Settings = lazy(
  () => import(/* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/settings/index'),
);
const SettingsWithSuspense = withSuspense(Settings);

const TemplateCreate = lazy(
  () =>
    import(
      /* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/settings/templates/create'
    ),
);
const TemplateCreateWithSuspense = withSuspense(TemplateCreate);

const TemplateUpdate = lazy(
  () =>
    import(
      /* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/settings/templates/create'
    ),
);
const _TemplateUpdateWithSuspense = withSuspense(TemplateUpdate);

const TemplatePreview = lazy(
  () =>
    import(
      /* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/settings/templates/preview'
    ),
);
const TemplatePreviewWithSuspense = withSuspense(TemplatePreview);

const Users = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../homeOffice/pages/users/listing/index'),
);
const UsersWithSuspense = withSuspense(Users);

const SignalMap = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../homeOffice/pages/signalMap'),
);
const SignalMapWithSuspense = withSuspense(SignalMap);

// HO Web faqs
const HoWebFaqs = lazy(() => import(/* webpackChunkName: "FAQ" */ '../../public/pages/hoWebFaqs'));
const HoWebFaqsWithSuspense = withSuspense(HoWebFaqs);

// Site Details
const SitesDetail = lazy(
  () => import(/* webpackChunkName: "Sites" */ '../../obx/pages/sites/detail/index'),
);
const SitesDetailWithSuspense = withSuspense(SitesDetail);

// Extra Job
const SchedulesCreateExtraDuty = lazy(
  () =>
    import(
      /* webpackChunkName: "Schedules" */ '../../obx/pages/schedules/createExtraDuty/form/index'
    ),
);
const SchedulesCreateExtraDutyWithSuspense = withSuspense(SchedulesCreateExtraDuty);
/**
 * Dynamic Component Selection for rendering based on user role
 */
// function getDashboardElement() {
//   let element = null;
//   // if (userHasRoleAndPermission('300', 'view-dashboard')) {
//   //   element = <AdminDashboardWithSuspense />;
//   // } else if (userHasRoleAndPermission('301', 'view-dashboard')) {
//   //   element = <CandidateDashboardWithSuspense />;
//   // } else if (userHasRoleAndPermission('302', 'view-dashboard')) {
//   //   element = <EmployerDashboardWithSuspense />;
//   // }
//   return <h1>sadsadad</h1>;
// }
// Route configurations for the app
const route = [
  {
    // Franchise Dashboard ROUTE
    path: routes.HO_DASHBOARD,
    exact: true,
    element: <DashboardWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_DASHBOARD)) {
        return next();
      } else {
        return next(routes.SETTING);
      }
    },
  },
  {
    // Franchise Listing ROUTE
    path: routes.HO_FRANCHISE_LISTING,
    exact: true,
    element: <FranchiseListingWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_FRANCHISE_LISTING)) {
        return next();
      } else {
        return next(routes.SETTING);
      }
    },
  },
  {
    // Franchise Update ROUTE
    path: routes.HO_FRANCHISE_UPDATE_ROUTE,
    exact: true,
    element: <FranchiseUpdateWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_FRANCHISE_UPDATE)) {
        return next();
      } else {
        return next(routes.SETTING);
      }
    },
    meta: {
      title: 'franchiseUpdate',
      requiresAuth: true,
    },
  },
  {
    // Franchise Detail ROUTE
    path: routes.HO_FRANCHISE_DETAIL_ROUTE,
    exact: true,
    element: <FranchiseDetailWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_FRANCHISE_DETAIL)) {
        return next();
      } else {
        return next(routes.SETTING);
      }
    },
    meta: {
      title: 'franchiseDetail',
      requiresAuth: true,
    },
  },
  // Site Detail Route
  {
    // Sites ROUTE
    path: routes.HO_SITES_DETAIL_ROUTE,
    exact: true,
    element: <SitesDetailWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_SITES)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'sites',
      requiresAuth: true,
    },
  },
  {
    // Settings ROUTE
    path: routes.HO_SETTINGS,
    exact: true,
    element: <SettingsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_SETTINGS)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'settings',
    },
  },
  {
    // template create ROUTE
    path: routes.HO_TEMPLATE_CREATE,
    exact: true,
    element: <TemplateCreateWithSuspense />,

    meta: {
      title: 'templateCreate',
    },
  },
  {
    // template update ROUTE
    path: routes.HO_TEMPLATE_UPDATE_ROUTE,
    exact: true,
    element: <TemplateCreateWithSuspense />,

    meta: {
      title: 'templateUpdate',
    },
  },
  {
    // template preview ROUTE
    path: routes.HO_TEMPLATE_PREVIEW_ROUTE,
    exact: true,
    element: <TemplatePreviewWithSuspense />,

    meta: {
      title: 'templatePreview',
    },
  },
  {
    // User ROUTE
    path: routes.HO_USER,
    exact: true,
    element: <UsersWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_USERS)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'user',
      requiresAuth: true,
    },
  },
  {
    // Franchise Listing ROUTE
    path: routes.HO_VIEW_SIGNAL_MAP,
    exact: true,
    element: <SignalMapWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_VIEW_FRANCHISE_MAP)) {
        return next();
      } else {
        return next(routes.SETTING);
      }
    },
  },
  {
    // Sites ROUTE
    path: routes.HO_SITES_CREATE_EXTRA_DUTY,
    exact: true,
    element: <SchedulesCreateExtraDutyWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_EXTRA_JOB)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'sites',
      requiresAuth: true,
    },
  },
  {
    // FAQS
    path: routes.HO_WEB_FAQS,
    exact: true,
    element: <HoWebFaqsWithSuspense />,
  },
];
export default route;
