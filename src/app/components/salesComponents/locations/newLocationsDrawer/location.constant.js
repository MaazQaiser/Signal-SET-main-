/**
 * ENUM for location source options
 */
export const locationSourceOptions = [
  { value: 'direct', label: 'Direct' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'organic', label: 'Organic' },
  { value: 'referred', label: 'Referred' },
];

/**
 * new constant for Assign to options with hash approach
 */
export const assignToOptionsHash = {
  home_officer: { label: 'Home Office', value: 'home_office' },
  franchise_owner: { label: 'Franchise Owner', value: 'franchise_owner' },
  director: { label: 'Director', value: 'director' },
  supervisor: { label: 'Supervisor', value: 'supervisor' },
  coordinator: { label: 'Coordinator', value: 'coordinator' },
  sales_manager: { label: 'Sales Manager', value: 'sales_manager' },
  sales_person: { label: 'Sales Person', value: 'sales_person' },
};

export const locationAffiliationValues = {
  corporate: 'corporate',
  owned_remote: 'owned_remote',
  occupied_primary: 'occupied_primary',
  tenant: 'tenant',
  managed: 'managed',
  shared: 'shared',
  headquarters: 'headquarters',
  owned: 'owned',
  regional_office: 'regional_office',
};
/**
 * constant for Assign to options
 */
export const locationAffiliationOptions = (t) => [
  // { label: 'Corporate', value: locationAffiliationValues.corporate },
  // { label: 'Owned Remotely', value: locationAffiliationValues.owned_remote },
  // { label: 'Occupied Primary', value: locationAffiliationValues.occupied_primary },
  { label: t('sales.locations.tenant'), value: locationAffiliationValues.tenant },
  { label: t('sales.locations.managed'), value: locationAffiliationValues.managed },
  { label: t('sales.locations.shared'), value: locationAffiliationValues.shared },
  { label: t('sales.locations.head_quarters'), value: locationAffiliationValues.headquarters },
  { label: t('sales.locations.owned'), value: locationAffiliationValues.owned },
  { label: t('sales.locations.regional_office'), value: locationAffiliationValues.regional_office },
];

/**
 * constant for Assign to enums
 */
export const assignToEnums = {
  HOME_OFFICE: 'home_office',
  FRANCHISE_OWNER: 'franchise_owner',
  SALES_MANAGER: 'sales_manager',
  SALES_PERSON: 'sales_person',
  DIRECTOR: 'director',
  SUPERVISOR: 'supervisor',
  COORDINATOR: 'coordinator',
};

/**
 * Location filter dropdown options (label translated via t()).
 * Use getLocationFilterOptions(t) when rendering so "All Properties" etc. translate with language.
 */
export const getLocationFilterOptions = (t) => [
  { label: t('sales.locations.allLocations'), value: null },
  { label: t('sales.deals.assignedFilter'), value: true },
  { label: t('sales.deals.unassignedFilter'), value: false },
];

/** @deprecated Use getLocationFilterOptions(t) for i18n. */
export const locationFilterOptions = [
  { label: 'All Properties', value: null },
  { label: 'Assigned', value: true },
  { label: 'Unassigned', value: false },
];

export const locationReviewFilterOptions = [
  { label: 'All Properties', value: null },
  { label: 'New Leads Request', value: true },
  { label: 'Change Review', value: false },
];

/**
 * status constant for location filters
 */
export const locationFilterStatus = {
  APPROVED: 2,
  PENDING: 0,
  REJECTED: 1,
};

export const locationStatusFilterOptions = (t) => [
  { label: t('sales.locations.approved'), value: locationFilterStatus.APPROVED, id: 'approved' },
  { label: t('sales.locations.rejected'), value: locationFilterStatus.REJECTED, id: 'rejected' },
];

/**
 * enum constant for location's status
 */
export const locationStatuses = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
};

/**
 * status constant for location filters
 */
export const LocationDropDownEventConstant = {
  STATE: 'state',
  CITY: 'city',
  ID: 'id',
  OBJECT: 'object',
  STRING: 'string',
};
export const locationVariableTypes = {
  OBJECT: 'object',
};

/**
 * status constant for location filters
 */
export const locationSortingTypes = {
  ASC: 'asc',
};

/**
 * status constant for location filters
 */
export const locationDrawerTypes = {
  RIGHT: 'right',
};

/**
 * location type filter dropdown options in location filters
 */
export const locationTypeDropdownOptions = (t) => [
  {
    id: null,
    name: t('sales.locations.all'),
  },
  {
    id: 0,
    name: t('sales.locations.new'),
  },
  {
    id: 1,
    name: t('sales.locations.existing'),
  },
  {
    id: 2,
    name: t('sales.locations.old'),
  },
  {
    id: 3,
    name: t('sales.locations.lost'),
  },
];

/**
 * stage filter dropdown options in location filters
 */
export const stagesDropdownOptions = (t) => [
  {
    id: null,
    name: t('sales.locations.all'),
  },
  {
    id: 0,
    name: t('sales.locations.approved'),
  },
  {
    id: 1,
    name: t('sales.locations.discovery'),
  },
  {
    id: 3,
    name: t('sales.locations.qualified'),
  },
  {
    id: 4,
    name: t('sales.locations.needs_assessment'),
  },
  {
    id: 5,
    name: t('sales.locations.negotiation'),
  },
  {
    id: 6,
    name: t('sales.locations.current_customer'),
  },
  {
    id: 7,
    name: t('sales.locations.lost_proposal'),
  },
  {
    id: 8,
    name: t('sales.locations.lost_customer'),
  },
  {
    id: 9,
    name: t('sales.locations.nurture'),
  },
];

/**
 * sites filter dropdown options in location filters
 */
export const sitesDropdownOptions = (t) => [
  {
    id: null,
    name: t('sales.locations.all'),
  },
  {
    id: 'visited',
    name: t('sales.locations.visited'),
  },
  {
    id: 'unvisited',
    name: t('sales.locations.unvisited'),
  },
  {
    id: 'follow_up',
    name: t('sales.locations.follow_up'),
  },
];

export const TENANCY_STATUS = {
  single: {
    label: 'Single',
    value: 'Single',
  },
  multi: {
    label: 'Multi',
    value: 'Multi',
  },
};

export const TENANCY_STATUS_OPTIONS = Object.values(TENANCY_STATUS);
