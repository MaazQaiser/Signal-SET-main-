// Sales Module
export const MODULE_SALES_DASHBOARD = 'sales-view-dashboard';
export const MODULE_COMPANIES_LISTING = 'sales-view-companies';
export const MODULE_COMPANY_DETAILS = 'sales-view-company-details';

export const MODULE_LOCATIONS_LISTING = 'sales-view-locations';
export const MODULE_LOCATION_DETAILS = 'sales-view-location-details';
export const MODULE_LOCATION_SETTINGS = 'sales-view-location-settings';

export const MODULE_LEADS_REVIEWS = 'sales-view-leads-reviews';
export const MODULE_UPDATE_LEADS_REVIEWS = 'sales-update-leads-reviews';

export const MODULE_DEALS_LISTING = 'sales-view-deals';
export const MODULE_DEALS_DETAILS = 'sales-view-deal-details';

export const MODULE_INDUSTRY_VERTICALS_LISTING = 'sales-view-industry-verticals';
export const MODULE_INDUSTRY_VERTICALS_DETAILS = 'sales-view-industry-verticals-details';
export const MODULE_QUESTION_EDIT = 'sales-question-edit';

export const MODULE_CONTRACT_CREATION = 'sales-view-contract-creation';

export const MODULE_USERS_LISTING = 'sales-view-users';

export const MODULE_CONTACTS_LISTING = 'sales-view-contacts';
export const MODULE_CONTACT_DETAILS = 'sales-view-contact-details';
export const MODULE_DASHBOARD_DETAILS = 'sales-view-dashboard-details';

export const MODULE_SALES_SETTINGS = 'sales-view-settings';
export const MODULE_SALES_SETTINGS_EMAIL_CONFIGURATION = 'sales-view-settings-email-configuration';

export const MODULE_SCOUTING_LISTING = 'sales-view-scouting';
export const MODULE_LEADS_MAP = 'sales-view-leads-map';

/**
 * ? ACL Permissions
 */
// Dashboard
export const ACL_DASHBOARD_VIEW = 'dashboard.view';
// Companies
export const ACL_COMPANIES_VIEW = 'companies.view';
export const ACL_COMPANIES_CREATE = 'companies.create';
export const ACL_COMPANIES_UPDATE = 'companies.update';
export const ACL_COMPANIES_DELETE = 'companies.delete';
// Company Reviews
export const ACL_COMPANY_REVIEW_VIEW = 'companies.reviews.view';
export const ACL_COMPANY_REVIEW_UPDATE = 'companies.reviews.update';
// Company Activities
export const ACL_COMPANY_ACTIVITY_VIEW = 'companies.activities.view';
// Company Notes
export const ACL_COMPANY_NOTES_VIEW = 'companies.notes.view';
export const ACL_COMPANY_NOTES_CREATE = 'companies.notes.create';
export const ACL_COMPANY_NOTES_UPDATE = 'companies.notes.update';
export const ACL_COMPANY_NOTES_DELETE = 'companies.notes.delete';
// Company Tasks
export const ACL_COMPANY_TASKS_VIEW = 'companies.tasks.view';
export const ACL_COMPANY_TASKS_CREATE = 'companies.tasks.create';
export const ACL_COMPANY_TASKS_UPDATE = 'companies.tasks.update';
export const ACL_COMPANY_TASKS_DELETE = 'companies.tasks.delete';
// Company Emails
export const ACL_COMPANY_EMAILS_VIEW = 'companies.emails.view';
export const ACL_COMPANY_EMAILS_CREATE = 'companies.emails.create';
export const ACL_COMPANY_EMAILS_UPDATE = 'companies.emails.update';
export const ACL_COMPANY_EMAILS_DELETE = 'companies.emails.delete';
// Company Meetings
export const ACL_COMPANY_MEETINGS_VIEW = 'companies.meetings.view';
export const ACL_COMPANY_MEETINGS_CREATE = 'companies.meetings.create';
export const ACL_COMPANY_MEETINGS_UPDATE = 'companies.meetings.update';
export const ACL_COMPANY_MEETINGS_DELETE = 'companies.meetings.delete';

// Properties
export const ACL_PROPERTIES_VIEW = 'properties.view';
export const ACL_PROPERTIES_CREATE = 'properties.create';
export const ACL_PROPERTIES_UPDATE = 'properties.update';
export const ACL_PROPERTIES_DELETE = 'properties.delete';
// Property Reviews
export const ACL_PROPERTY_REVIEW_VIEW = 'properties.reviews.view';
export const ACL_PROPERTY_REVIEW_UPDATE = 'properties.reviews.update';
// Question Classification
export const ACL_PROPERTY_CLASSIFICATION_QUESTION_VIEW = 'properties.classificationQuestions.view';
export const ACL_PROPERTY_CLASSIFICATION_QUESTION_UPDATE =
  'properties.classificationQuestions.update';
//Tasks
export const ACL_TASKS_VIEW = 'tasks.view';
export const ACL_TASKS_CREATE = 'tasks.create';
export const ACL_TASKS_UPDATE = 'tasks.update';
export const ACL_TASKS_DELETE = 'tasks.delete';
// Property Activities
export const ACL_PROPERTY_ACTIVITIES_VIEW = 'properties.activities.view';
// Property Notes
export const ACL_PROPERTY_NOTES_VIEW = 'properties.notes.view';
export const ACL_PROPERTY_NOTES_CREATE = 'properties.notes.create';
export const ACL_PROPERTY_NOTES_UPDATE = 'properties.notes.update';
export const ACL_PROPERTY_NOTES_DELETE = 'properties.notes.delete';
// Property Tasks
export const ACL_PROPERTY_TASKS_VIEW = 'properties.tasks.view';
export const ACL_PROPERTY_TASKS_CREATE = 'properties.tasks.create';
export const ACL_PROPERTY_TASKS_UPDATE = 'properties.tasks.update';
export const ACL_PROPERTY_TASKS_DELETE = 'properties.tasks.delete';
// Property Emails
export const ACL_PROPERTY_EMAILS_VIEW = 'properties.emails.view';
export const ACL_PROPERTY_EMAILS_CREATE = 'properties.emails.create';
export const ACL_PROPERTY_EMAILS_UPDATE = 'properties.emails.update';
export const ACL_PROPERTY_EMAILS_DELETE = 'properties.emails.delete';
// Property Meetings
export const ACL_PROPERTY_MEETINGS_VIEW = 'properties.meetings.view';
export const ACL_PROPERTY_MEETINGS_CREATE = 'properties.meetings.create';
export const ACL_PROPERTY_MEETINGS_UPDATE = 'properties.meetings.update';
export const ACL_PROPERTY_MEETINGS_DELETE = 'properties.meetings.delete';
// Property FollowUps
export const ACL_PROPERTY_FOLLOWUPS_VIEW = 'properties.followups.view';
export const ACL_PROPERTY_FOLLOWUPS_CREATE = 'properties.followups.create';
export const ACL_PROPERTY_FOLLOWUPS_UPDATE = 'properties.followups.update';
export const ACL_PROPERTY_FOLLOWUPS_DELETE = 'properties.followups.delete';

// Deals
export const ACL_DEALS_VIEW = 'deals.view';
export const ACL_DEALS_CREATE = 'deals.create';
export const ACL_DEALS_UPDATE = 'deals.update';
export const ACL_DEALS_DELETE = 'deals.delete';
// Deal Activities
export const ACL_DEAL_ACTIVITIES_VIEW = 'deals.activities.view';
// Deal Contracts
export const ACL_DEAL_CONTRACTS_VIEW = 'deals.contracts.view';
export const ACL_DEAL_CONTRACTS_CREATE = 'deals.contracts.create';
export const ACL_DEAL_CONTRACTS_UPDATE = 'deals.contracts.update';
export const ACL_DEAL_CONTRACTS_DELETE = 'deals.contracts.delete';
// Deal Notes
export const ACL_DEAL_NOTES_VIEW = 'deals.notes.view';
export const ACL_DEAL_NOTES_CREATE = 'deals.notes.create';
export const ACL_DEAL_NOTES_UPDATE = 'deals.notes.update';
export const ACL_DEAL_NOTES_DELETE = 'deals.notes.delete';
// Deal Tasks
export const ACL_DEAL_TASKS_VIEW = 'deals.tasks.view';
export const ACL_DEAL_TASKS_CREATE = 'deals.tasks.create';
export const ACL_DEAL_TASKS_UPDATE = 'deals.tasks.update';
export const ACL_DEAL_TASKS_DELETE = 'deals.tasks.delete';
// Deal FollowUps
export const ACL_DEAL_FOLLOWUPS_VIEW = 'deals.followUps.view';
export const ACL_DEAL_FOLLOWUPS_CREATE = 'deals.followUps.create';
export const ACL_DEAL_FOLLOWUPS_UPDATE = 'deals.followUps.update';
export const ACL_DEAL_FOLLOWUPS_DELETE = 'deals.followUps.delete';

// Contacts
export const ACL_CONTACTS_VIEW = 'contacts.view';
export const ACL_CONTACTS_CREATE = 'contacts.create';
export const ACL_CONTACTS_UPDATE = 'contacts.update';
export const ACL_CONTACTS_DELETE = 'contacts.delete';
// Contacts Reviews
export const ACL_CONTACT_REVIEW_VIEW = 'contacts.reviews.view';
export const ACL_CONTACT_REVIEW_UPDATE = 'contacts.reviews.update';
// Contact Activities
export const ACL_CONTACT_ACTIVITIES_VIEW = 'contacts.activities.view';
// Contact Notes
export const ACL_CONTACT_NOTES_VIEW = 'contacts.notes.view';
export const ACL_CONTACT_NOTES_CREATE = 'contacts.notes.create';
export const ACL_CONTACT_NOTES_UPDATE = 'contacts.notes.update';
export const ACL_CONTACT_NOTES_DELETE = 'contacts.notes.delete';
// Contact Tasks
export const ACL_CONTACT_TASKS_VIEW = 'contacts.tasks.view';
export const ACL_CONTACT_TASKS_CREATE = 'contacts.tasks.create';
export const ACL_CONTACT_TASKS_UPDATE = 'contacts.tasks.update';
export const ACL_CONTACT_TASKS_DELETE = 'contacts.tasks.delete';

// Users
export const ACL_USERS_VIEW = 'users.view';
export const ACL_USERS_CREATE = 'users.create';
export const ACL_USERS_UPDATE = 'users.update';
export const ACL_USERS_DELETE = 'users.delete';
// User Properties
export const ACL_USER_PROPERTY_VIEW = 'users.properties.view';
// User Deals
export const ACL_USER_DEALS_VIEW = 'users.deals.view';
// User History
export const ACL_USER_HISTORY_VIEW = 'users.history.view';
// User History
export const ACL_USER_ROLES_AND_PERMISSIONS_VIEW = 'users.rolesAndPermissions.view';
export const ACL_USER_ROLES_AND_PERMISSIONS_UPDATE = 'users.rolesAndPermissions.update';

// Industry Verticals
export const ACL_INDUSTRY_VERTICALS_VIEW = 'marketVerticals.view';
export const ACL_INDUSTRY_VERTICALS_CREATE = 'marketVerticals.create';
export const ACL_INDUSTRY_VERTICALS_UPDATE = 'marketVerticals.update';
export const ACL_INDUSTRY_VERTICALS_DELETE = 'marketVerticals.delete';
// Market Verticals
export const ACL_MARKET_VERTICALS_QUESTIONS_VIEW = 'marketVerticals.questions.view';
export const ACL_MARKET_VERTICALS_QUESTIONS_CREATE = 'marketVerticals.questions.create';
export const ACL_MARKET_VERTICALS_QUESTIONS_UPDATE = 'marketVerticals.questions.update';
export const ACL_MARKET_VERTICALS_QUESTIONS_DELETE = 'marketVerticals.questions.delete';

// Scouting
export const ACL_SCOUTING_VIEW = 'routes.view';
export const ACL_SCOUTING_CREATE = 'routes.create';
export const ACL_SCOUTING_UPDATE = 'routes.update';
export const ACL_SCOUTING_DELETE = 'routes.delete';

// Map
export const ACL_MAP_VIEW = 'signalMap.view';
export const ACL_MAP_CREATE = 'signalMap.create';
export const ACL_MAP_UPDATE = 'signalMap.update';
export const ACL_MAP_DELETE = 'signalMap.delete';

// Preferrences
export const ACL_PREFERRENCES_VIEW = 'preferrences.view';
export const ACL_PREFERRENCES_CREATE = 'preferrences.create';
export const ACL_PREFERRENCES_UPDATE = 'preferrences.update';
export const ACL_PREFERRENCES_DELETE = 'preferrences.delete';

//settings
export const ACL_SETTINGS_VIEW = 'settings.view';
export const ACL_SETTINGS_PREFERENCES_VIEW = 'settings.preferences.view';
export const ACL_SETTINGS_PREFERENCES_CREATE = 'settings.preferences.create';
export const ACL_SETTINGS_PREFERENCES_UPDATE = 'settings.preferences.update';
export const ACL_SETTINGS_PREFERENCES_DELETE = 'settings.preferences.delete';

export const ACL_SETTINGS_PREFERENCES_THRESHOLD_VALUES_VIEW =
  'settings.preferences.thresholdValues.view';
export const ACL_SETTINGS_PREFERENCES_NOTIFICATIONS_VIEW =
  'settings.preferences.notifications.view';
export const ACL_SETTINGS_PREFERENCES_BREAK_RULES_VIEW = 'settings.preferences.breakRules.view';
export const ACL_SETTINGS_PREFERENCES_SYSTEM_DEFAULT_VIEW =
  'settings.preferences.systemDefault.view';
export const ACL_SETTINGS_PREFERENCES_EXTRA_SERVICES_CHARGES_VIEW =
  'settings.preferences.extraServicesCharges.view';
export const ACL_SETTINGS_PREFERENCES_RUNSHEET_SETTINGS_VIEW =
  'settings.preferences.runsheetSettings.view';
export const ACL_SETTINGS_PREFERENCES_INVOICE_SETTINGS_VIEW =
  'settings.preferences.invoiceSettings.view';
export const ACL_SETTINGS_REPORT_TEMPLATES_VIEW = 'settings.reportTemplates.view';
export const ACL_SETTINGS_MAPPING_PREFERENCE_VIEW = 'settings.mappingPreference.view';
export const ACL_SETTINGS_MAPPING_PREFERENCE_DEALS_VIEW = 'settings.mappingPreference.deasl.view';
export const ACL_SETTINGS_MAPPING_PREFERENCE_LOCATIONS_DATA_VIEW =
  'settings.mappingPreference.locationsData.view';
export const ACL_SETTINGS_MAPPING_PREFERENCE_USER_GROUPS_VIEW = 'settings.userGroups.view';
export const ACL_SETTINGS_ROLES_PERMISSIONS_VIEW = 'settings.rolesAndPermissions.view';
export const ACL_SETTINGS_ROLES_PERMISSIONS_UPDDATE = 'settings.rolesAndPermissions.update';
export const ACL_SETTINGS_EMAIL_CONFIGURATIONS_VIEW = 'settings.emailConfigurations.view';
export const ACL_SETTINGS_EMAIL_CONFIGURATIONS_CREATE = 'settings.emailConfigurations.create';
export const ACL_SETTINGS_EMAIL_CONFIGURATIONS_DELETE = 'settings.emailConfigurations.delete';

export const ACL_SETTINGS_PRICING_CONFIGURATIONS_VIEW = 'settings.pricingConfigurations.view';
export const ACL_SETTINGS_PRICING_CONFIGURATIONS_UPDDATE = 'settings.pricingConfigurations.update';

export const ACL_SETTINGS_PRODUCTS_VIEW = 'settings.productsConfigurations.view';
export const ACL_SETTINGS_PRODUCTS_UPDDATE = 'settings.productsConfigurations.update';
export const ACL_SETTINGS_PRODUCTS_CREATE = 'settings.productsConfigurations.create';
export const ACL_SETTINGS_PRODUCTS_DELETE = 'settings.productsConfigurations.delete';

export const ACL_SETTINGS_DISCOUNTS_VIEW = 'settings.discountsConfigurations.view';
export const ACL_SETTINGS_DISCOUNTS_UPDDATE = 'settings.discountsConfigurations.update';

export const ACL_SETTINGS_REGIONAL_CONFIGURATIONS_VIEW = 'settings.regionalConfigurations.view';
export const ACL_SETTINGS_REGIONAL_CONFIGURATIONS_CREATE = 'settings.regionalConfigurations.create';
export const ACL_SETTINGS_REGIONAL_CONFIGURATIONS_UPDATE = 'settings.regionalConfigurations.update';
export const ACL_SETTINGS_REGIONAL_CONFIGURATIONS_DELETE = 'settings.regionalConfigurations.delete';
