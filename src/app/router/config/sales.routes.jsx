import { lazy } from 'react';

import withSuspense from '../../../hoc/withSuspense';
// import userHasRole from '../../utils/auth/userHasRole';
import userHasPermission from '../../../utils/auth/userHasPermission';
// import userHasRoleAndPermission from '../../utils/auth/userHasRoleAndPermission';
import * as routes from '../constant/ROUTE';
import * as SALES from '../constant/SALESMODULE';

// Sales Dashboard
const SalesDashboard = lazy(
  () => import(/* webpackChunkName: "SuperAdminDashboard" */ 'salesPages/dashboard/index'),
);
const SalesDashboardWithSuspense = withSuspense(SalesDashboard);

//Companies
const Companies = lazy(() => import('salesPages/companies/listing/index'));
const CompaniesWithSuspense = withSuspense(Companies);

const CompaniesReviews = lazy(() => import('salesPages/companies/reviewListing/index'));
const CompaniesReviewsWithSuspense = withSuspense(CompaniesReviews);

const CompanyDetails = lazy(() => import('salesPages/companies/detail/index'));
const CompanyDetailsWithSuspense = withSuspense(CompanyDetails);

const Locations = lazy(() => import('salesPages/locations/listing/index'));
const LocationsWithSuspense = withSuspense(Locations);

const LocationsReviews = lazy(() => import('salesPages/locations/reviewListing/index'));
const LocationsReviewsWithSuspense = withSuspense(LocationsReviews);

const LocationDetails = lazy(() => import('salesPages/locations/detail/index'));
const LocationDetailsWithSuspense = withSuspense(LocationDetails);

const Deals = lazy(() => import('salesPages/deals/listing/index'));
const DealsWithSuspense = withSuspense(Deals);

const DealDetails = lazy(() => import('salesPages/deals/detail/index'));
const DealDetailsWithSuspense = withSuspense(DealDetails);

const DealContractDetails = lazy(() => import('salesPages/deals/detail/contract/details/index'));
const DealContractDetailsWithSuspense = withSuspense(DealContractDetails);

const QuestionBankCreate = lazy(() => import('salesPages/questionBank/create'));
const QuestionBankWithSuspense = withSuspense(QuestionBankCreate);

const IndustryVerticalsListing = lazy(() => import('salesPages/industryVerticals/listing/index'));
const IndustryVerticalsListingWithSuspense = withSuspense(IndustryVerticalsListing);

const IndustryVerticalDetail = lazy(() => import('salesPages/industryVerticals/detail/index'));
const IndustryVerticalsDetailWithSuspense = withSuspense(IndustryVerticalDetail);

const ContractCreation = lazy(() => import('salesPages/contractCreation/index'));
const ContractCreationWithSuspense = withSuspense(ContractCreation);

const Users = lazy(() => import('salesPages/users/listing/index'));
const UsersWithSuspense = withSuspense(Users);

const UserDetail = lazy(() => import('salesPages/users/detail/index'));
const UserDetailWithSuspense = withSuspense(UserDetail);

const DashboardDetail = lazy(() => import('salesPages/dashboard/detail/index'));
const DashboardDetailWithSuspense = withSuspense(DashboardDetail);

const ProposalWonPage = lazy(
  () => import('salesPages/dashboard/dashboardListing/proposalWon/index'),
);
const ProposalWonPageWithSuspense = withSuspense(ProposalWonPage);

const SalesPersonInsightPage = lazy(
  () => import('salesPages/dashboard/dashboardListing/salesPersonInsights/index'),
);
const SalesPersonInsightPagePageWithSuspense = withSuspense(SalesPersonInsightPage);

const DecisionMakingPage = lazy(
  () => import('salesPages/dashboard/dashboardListing/decisionMeetingGraph/index'),
);
const DecisionMakingPagePageWithSuspense = withSuspense(DecisionMakingPage);

const ProposalLostPage = lazy(
  () => import('salesPages/dashboard/dashboardListing/proposalLost/index'),
);
const ProposalLostPageWithSuspense = withSuspense(ProposalLostPage);

const Contacts = lazy(() => import('salesPages/contacts/listing/index'));
const ContactsWithSuspense = withSuspense(Contacts);

const ContactsReviews = lazy(() => import('salesPages/contacts/reviewListing/index'));
const ContactsReviewsWithSuspense = withSuspense(ContactsReviews);

const ContactDetails = lazy(() => import('salesPages/contacts/detail/index'));
const ContactDetailsWithSuspense = withSuspense(ContactDetails);

const SalesSettings = lazy(() => import('../../common/pages/settings/index'));
const SalesSettingsWithSuspense = withSuspense(SalesSettings);

const DesignTokens = lazy(() => import('../../common/pages/settings/design'));
const DesignTokensWithSuspense = withSuspense(DesignTokens);

const ComponentShowcase = lazy(() => import('../../common/pages/componentShowcase/index.jsx'));
const ComponentShowcaseWithSuspense = withSuspense(ComponentShowcase);

const Scouting = lazy(() => import('salesPages/scouting/listing/index'));
const ScoutingsWithSuspense = withSuspense(Scouting);

const LeadsMap = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../sales/pages/leadsMap'),
);
const LeadsMapWithSuspense = withSuspense(LeadsMap);

const SalesWebFaqs = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../public/pages/salesWebFaqs'),
);
const SalesWebFaqsWithSuspense = withSuspense(SalesWebFaqs);

const Profile = lazy(
  () => import(/* webpackChunkName: "SuperAdminDashboard" */ '../../obx/pages/profile/index'),
);

const ProfileWithSuspense = withSuspense(Profile);

const Notifications = lazy(
  () => import(/* webpackChunkName: "Notifications" */ '../../obx/pages/notifications/index'),
);

const NotificationsWithSuspense = withSuspense(Notifications);

//  Tasks Module
const TasksPage = lazy(
  () => import(/* webpackChunkName: "Tasks" */ 'salesPages/Tasks/listing/index'),
);
const TasksWithSuspense = withSuspense(TasksPage);

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
    // DASHBOARD ROUTE
    path: routes.SALES_DASHBOARD,
    exact: true,
    element: <SalesDashboardWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_DASHBOARD_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'dashboard',
      requiresAuth: true,
    },
  },
  {
    // COMPANIES LISTING ROUTE
    path: routes.SALES_COMPANIES,
    exact: true,
    element: <CompaniesWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_COMPANIES_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'companies',
      requiresAuth: true,
    },
  },
  {
    // COMPANY REVIEW ROUTE
    path: routes.SALES_COMPANIES_REVIEWS,
    exact: true,
    element: <CompaniesReviewsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_COMPANY_REVIEW_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'companiesReviews',
      requiresAuth: true,
    },
  },
  {
    // COMPANY DETAIL ROUTE
    path: routes.SALES_COMPANY_DETAIL,
    exact: true,
    element: <CompanyDetailsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_COMPANIES_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'companyDetails',
      requiresAuth: true,
    },
  },
  {
    // LOCATION LISTING ROUTE
    path: routes.SALES_LOCATIONS,
    exact: true,
    element: <LocationsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_PROPERTIES_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'locations',
      requiresAuth: true,
    },
  },
  {
    // TASKS ROUTE
    path: routes.SALES_TASKS,
    exact: true,
    element: (
      <TasksWithSuspense
        permissionSet={{
          createTaskPermission: SALES.ACL_TASKS_CREATE,
          updateTaskPermission: SALES.ACL_TASKS_UPDATE,
          deleteTaskPermission: SALES.ACL_TASKS_DELETE,
        }}
      />
    ),
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_TASKS_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'tasks',
      requiresAuth: true,
    },
  },
  {
    // PROPERTY REVIEW ROUTE
    path: routes.SALES_LOCATIONS_REVIEWS,
    exact: true,
    element: <LocationsReviewsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_PROPERTY_REVIEW_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'reviewLocations',
      requiresAuth: true,
    },
  },
  {
    // LOCATION DETAIL ROUTE
    path: routes.SALES_LOCATION_DETAIL,
    exact: true,
    element: <LocationDetailsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_PROPERTIES_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'locationDetails',
      requiresAuth: true,
    },
  },
  {
    // Question bank create route
    path: routes.SALES_QUESTION_BANK_CREATE,
    exact: true,
    element: <QuestionBankWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_MARKET_VERTICALS_QUESTIONS_CREATE)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'questionBankCreate',
      requiresAuth: true,
    },
  },
  {
    // Question bank Edit route
    path: routes.SALES_QUESTION_BANK_EDIT,
    exact: true,
    element: <QuestionBankWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_MARKET_VERTICALS_QUESTIONS_UPDATE)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'questionBankEdit',
      requiresAuth: true,
    },
  },
  {
    // CONTRACT DETAIL ROUTE
    path: routes.SALES_DEAL_DETAIL_CONTRACT_DETAIL,
    exact: true,
    element: <DealContractDetailsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_DEAL_CONTRACTS_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'deals',
      requiresAuth: true,
    },
  },
  {
    // DEALS LISTING ROUTE
    path: routes.SALES_DEALS,
    exact: true,
    element: <DealsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_DEALS_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'deals',
      requiresAuth: true,
    },
  },
  {
    // DEAL DETAIL ROUTE
    path: routes.SALES_DEAL_DETAIL,
    exact: true,
    element: <DealDetailsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_DEALS_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'dealDetails',
      requiresAuth: true,
    },
  },
  {
    // CONTRACT CREATE ROUTE
    path: routes.SALES_CONTRACT_CREATION,
    exact: true,
    element: <ContractCreationWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_DEAL_CONTRACTS_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'contractCreation',
      requiresAuth: true,
    },
  },
  {
    // CONTACTS LISTING ROUTE
    path: routes.SALES_CONTACTS,
    exact: true,
    element: <ContactsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_CONTACTS_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'contacts',
      requiresAuth: true,
    },
  },
  {
    // CONTACTS REVIEW ROUTE
    path: routes.SALES_CONTACTS_REVIEWS,
    exact: true,
    element: <ContactsReviewsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_CONTACT_REVIEW_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'reviewContacts',
      requiresAuth: true,
    },
  },
  {
    // CONTACT DETAIL ROUTE
    path: routes.SALES_CONTACT_DETAIL_ROUTE,
    exact: true,
    element: <ContactDetailsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_CONTACTS_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'contactDetail',
      requiresAuth: true,
    },
  },
  {
    path: routes.PROFILE,
    exact: true,
    element: <ProfileWithSuspense />,
    meta: {
      title: 'profile',
      requiresAuth: true,
    },
  },
  {
    path: routes.NOTIFICATIONS,
    exact: true,
    element: <NotificationsWithSuspense />,
    meta: {
      title: 'profile',
      requiresAuth: true,
    },
  },
  {
    // Industry Verticals Listing
    path: routes.SALES_INDUSTRY_VERTICALS,
    exact: true,
    element: <IndustryVerticalsListingWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_INDUSTRY_VERTICALS_VIEW)) {
        return next();
      } else {
        return next(routes.SETTING);
      }
    },
    meta: {
      title: 'industryVerticals',
      requiresAuth: true,
    },
  },
  {
    // Industry Verticals Deatil
    path: routes.SALES_INDUSTRY_VERTICALS_DETAIL,
    exact: true,
    element: <IndustryVerticalsDetailWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_INDUSTRY_VERTICALS_VIEW)) {
        return next();
      } else {
        return next(routes.SETTING);
      }
    },
    meta: {
      title: 'industryVerticalsDetail',
      requiresAuth: true,
    },
  },
  {
    // USERS LISTING ROUTE
    path: routes.SALES_USERS,
    exact: true,
    element: <UsersWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_USERS_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'users',
      requiresAuth: true,
    },
  },
  {
    // LEAD MAP ROUTE
    path: routes.SALES_LEADS_MAP,
    exact: true,
    element: <LeadsMapWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_MAP_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'leadsMap',
      requiresAuth: true,
    },
  },
  {
    path: routes.COMMON_SETTING_DESIGN,
    exact: true,
    element: <DesignTokensWithSuspense />,
    meta: {
      title: 'designTokens',
      requiresAuth: true,
    },
  },
  {
    path: routes.APP_COMPONENT,
    exact: true,
    element: <ComponentShowcaseWithSuspense />,
    meta: {
      title: 'componentShowcase',
      requiresAuth: true,
    },
  },
  {
    // SETTINGS ROUTE
    path: routes.COMMON_SETTING,
    exact: true,
    element: <SalesSettingsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_SETTINGS_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'settings',
      requiresAuth: true,
    },
  },
  {
    // USER DETAIL ROUTE
    path: routes.SALES_USER_DETAIL_ROUTE,
    exact: true,
    element: <UserDetailWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_USERS_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'users',
      requiresAuth: true,
    },
  },
  {
    // DASHBOARD DETAIL ROUTE
    path: routes.SALES_DASHBOARD_DETAILS_ROUTE,
    exact: true,
    element: <DashboardDetailWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_DASHBOARD_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'dashboard',
      requiresAuth: true,
    },
  },
  {
    // PROPOSAL WON DETAIL ROUTE
    path: routes.SALES_DASHBOARD_PROPOSAL_WON,
    exact: true,
    element: <ProposalWonPageWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_DASHBOARD_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'proposalWon',
      requiresAuth: true,
    },
  },
  {
    // PROPOSAL WON DETAIL ROUTE
    path: routes.SALES_DASHBOARD_SALES_PERSON_INSIGHTS,
    exact: true,
    element: <SalesPersonInsightPagePageWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_DASHBOARD_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'salesPersonInsight',
      requiresAuth: true,
    },
  },
  {
    // PROPOSAL WON DETAIL ROUTE
    path: routes.SALES_DASHBOARD_DECISION_MAKING,
    exact: true,
    element: <DecisionMakingPagePageWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_DASHBOARD_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'decisionMaking',
      requiresAuth: true,
    },
  },
  {
    // PROPOSAL LOST DETAIL ROUTE
    path: routes.SALES_DASHBOARD_PROPOSAL_LOST,
    exact: true,
    element: <ProposalLostPageWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_DASHBOARD_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'proposalLost',
      requiresAuth: true,
    },
  },
  {
    // Scouting
    path: routes.SALES_SCOUTING,
    exact: true,
    element: <ScoutingsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.ACL_SCOUTING_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'scouting',
      requiresAuth: true,
    },
  },
  {
    // FAQS
    path: routes.SALES_WEB_FAQS,
    exact: true,
    element: <SalesWebFaqsWithSuspense />,
  },
];

export default route;
