import { SALES_DASHBOARD } from '../../app/router/constant/ROUTE';
export const paginationOptions = {
  perPageOptions: [10, 20, 30, 40, 50, 100],
  perPageRows: 10,
  defaultPerPage: 1,
};
export const localStorageKeys = {
  franchiseId: 'franchiseId',
};

export const geoFencingPolygonTypeKeys = {
  zones: 'zoneArea',
  sites: 'siteArea',
  franchise: 'franchiseArea',
  siteLocation: 'siteLocation',
  franchiseLocation: 'franchiseLocation',
  zoneLocation: 'zoneLocation',
};

export const geofenceName = {
  franchiseName: 'franchiseName',
};

export const polygonNameOptions = [geofenceName.franchiseName];
export const polygonlocationTypes = [
  geoFencingPolygonTypeKeys.zoneLocation,
  geoFencingPolygonTypeKeys.franchiseLocation,
  geoFencingPolygonTypeKeys.siteLocation,
];

export const polygonCoordinatesKey = [
  geoFencingPolygonTypeKeys.zones,
  geoFencingPolygonTypeKeys.sites,
  geoFencingPolygonTypeKeys.franchise,
];

export const actionItemTypeKeys = {
  zone: 'zone',
  franchise: 'franchise',
  site: 'site',
};

export const dashboardOptions = {
  ops: 'OPS',
  sale: 'SALES',
};

export const supportedImageFormats = ['image/jpeg', 'image/jpg', 'image/png'];
export const supportedFileFormats = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/mpeg',
  'video/avi',
  'video/mov',
  'video/quicktime',
  'application/pdf',
];

export const pdfFileFormats = ['application/pdf'];

export const videoFileFormats = [
  'video/mp4',
  'video/mpeg',
  'video/avi',
  'video/mov',
  'video/quicktime',
];

export const allowedFileExtensions = [
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.mp4',
  '.avi',
  '.mov',
  '.pdf',
];
export const allowedImageExtensions = ['.png, .jpg, .jpeg, .svg'];

export const ckEditorDefaultToolbarConfigs = ['bold', 'italic', 'numberedList', 'bulletedList'];

export const maxFileSize = 25 * 1024 * 1024;

export const DEFAULT_TIMEZONE = 'America/New_York';

export const rolesEnum = {
  supervisor: 'supervisor',
  officer: 'officer',
  salesManager: 'sales_manager',
  internee: 'internee',
  homeOfficer: 'home_officer',
  franchiseOwner: 'franchise_owner',
  hoAgent: 'ho_agent',
  director: 'director',
  coordinator: 'coordinator',
};

export const rolesEnumWithName = {
  [rolesEnum.supervisor]: {
    slug: rolesEnum.supervisor,
    name: 'Supervisor',
  },
  [rolesEnum.homeOfficer]: { slug: rolesEnum.homeOfficer, name: 'Home Office' },
  [rolesEnum.hoAgent]: { slug: rolesEnum.hoAgent, name: 'Home Office Agent' },
  [rolesEnum.franchiseOwner]: { slug: rolesEnum.franchiseOwner, name: 'Franchise Owner' },
  [rolesEnum.salesManager]: { slug: rolesEnum.salesManager, name: 'Sales Manager' },
  [rolesEnum.director]: { slug: rolesEnum.director, name: 'Director' },
  [rolesEnum.coordinator]: { slug: rolesEnum.coordinator, name: 'Coordinator' },
  // officer: { slug: 'officer', name: 'Officer' },
  // internee: { slug: 'internee', name: 'internee' },
};

export const deviceTypeEnum = {
  nfc: 'NFC',
  beacon: 'Beacon',
  qr: 'QR Code',
  image: 'Image',
  gps: 'GPS',
  qrCode: 'qr',
};

export const TEMPLATE_TYPES = {
  'Equipment Inspection': 'equipmentInspection',
  'Vehicle Inspection': 'vehicleInspection',
  'Tour Reports': 'tourReports',
  'Shift Day End Report': 'shiftDayEndReport',
  'Incident Report': 'incidentReport',
  equipmentInspection: 'Equipment Inspection',
  vehicleInspection: 'Vehicle Inspection',
  tourReports: 'Tour Reports',
  shiftEndReport: 'Shift End Report',
  shiftDayEndReport: 'Shift Day End Report',
  incidentReport: 'Incident Report',
};

export const handleAuthRedirection = (userSlug) => {
  switch (userSlug) {
    case rolesEnum.salesManager:
    case rolesEnum.homeOfficer:
    case rolesEnum.franchiseOwner:
    case rolesEnum.director:
    case rolesEnum.supervisor:
    case rolesEnum.coordinator:
      return SALES_DASHBOARD;

    case rolesEnum.hoAgent:
      return OBX_DISPATCH;

    // Add more cases as needed for other user roles

    default:
      return '/';
  }
};

/**
 * Stepper Stages status
 */
export const stageStatus = {
  COMPLETED: 'completed',
  CURRENT: 'current',
  PENDING: 'pending',
};

/**
 * Toast message settings
 */
export const toastSettings = {
  AUTO_CLOSE: 3000,
};

/**
 * default avatar
 */

export const defaultImage = `https://signalassets.blob.core.windows.net/signal/assets/Avatar.svg`;
export const defaultVehicleImage = `https://signalassets.blob.core.windows.net/signal/assets/vehicle-default.svg`;
export const defaultMapZoom = 10;

export const leadsMapCreateLocationMarker =
  'https://signalassets.blob.core.windows.net/signal/assets/add_location_alt_FILL1_wght400_GRAD0_op.svg';
export const leadsMapLocationsIcons = {
  old: 'https://signalassets.blob.core.windows.net/signal/Flags/greencircle.svg',
  lost: 'https://signalassets.blob.core.windows.net/signal/Flags/redcirlce.svg',
  existing: 'https://signalassets.blob.core.windows.net/signal/Flags/cirlceIcon.svg',
  new: 'https://signalassets.blob.core.windows.net/signal/Flags/blackCircleIcon.svg',
};

export const runSheetIcons = {
  runsheetDispatchIcon: 'https://signalassets.blob.core.windows.net/signal/assets/dispatch_hit.svg',
  existingHitBlueIcon:
    'https://signalassets.blob.core.windows.net/signal/assets/ExistingHitIcon.svg',
  runSheetPatrolGreenIcon: 'https://signalassets.blob.core.windows.net/signal/assets/greenPIN.png',
  addedHitGreenicon: 'https://signalassets.blob.core.windows.net/signal/assets/AddedHitIcon.svg',
  deletedHitRedIcon: 'https://signalassets.blob.core.windows.net/signal/assets/deletedHitIcon.svg',
  runsheetWaveIcon: 'https://signalassets.blob.core.windows.net/signal/assets/RunsheetIcon.svg',
  startEndLocationIconBlack:
    'https://signalassets.blob.core.windows.net/signal/assets/Group_1000003081.svg',
  runsheetMapBluePointerIconForDirectionsServiceRes:
    'https://signalassets.blob.core.windows.net/signal/assets/Union.svg',
  runsheetMissedHitsIcon: 'https://signalassets.blob.core.windows.net/signal/assets/mapicons.svg',
  runsheetCarIcon: 'https://signalassets.blob.core.windows.net/signal/assets/Signal_Car.png',
  runsheetSitePinIcon: 'https://signalassets.blob.core.windows.net/signal/assets/SitePin.svg',
  sitePlaceholder: 'https://signalassets.blob.core.windows.net/signal/assets/Site-Placeholder.png',
  hitGreyIcon: 'https://signalassets.blob.core.windows.net/signal/assets/map_icons.svg',
  runSheetDedicatedOfficer:
    'https://signalassets.blob.core.windows.net/signal/assets/Dedicated_Officer.png',
};

export const runsheetDefaultPolyline = { strokeColor: '#146eff', strokeWeight: 3.5 };
export const visitedPolyline = { strokeColor: '#31a150', strokeWeight: 3.5 };

export const placesMap = {
  accounting: 'Accounting',
  airport: 'Airport',
  amusement_park: 'Amusement Park',
  aquarium: 'Aquarium',
  art_gallery: 'Art Gallery',
  atm: 'ATM',
  bakery: 'Bakery',
  bank: 'Bank',
  bar: 'Bar',
  beauty_salon: 'Beauty Salon',
  bicycle_store: 'Bicycle Store',
  book_store: 'Book Store',
  bowling_alley: 'Bowling Alley',
  bus_station: 'Bus Station',
  cafe: 'Cafe',
  campground: 'Campground',
  car_dealer: 'Car Dealer',
  car_rental: 'Car Rental',
  car_repair: 'Car Repair',
  car_wash: 'Car Wash',
  casino: 'Casino',
  cemetery: 'Cemetery',
  church: 'Church',
  city_hall: 'City Hall',
  clothing_store: 'Clothing Store',
  convenience_store: 'Convenience Store',
  courthouse: 'Courthouse',
  dentist: 'Dentist',
  department_store: 'Department Store',
  doctor: 'Doctor',
  drugstore: 'Drugstore',
  electrician: 'Electrician',
  electronics_store: 'Electronics Store',
  embassy: 'Embassy',
  fire_station: 'Fire Station',
  florist: 'Florist',
  funeral_home: 'Funeral Home',
  furniture_store: 'Furniture Store',
  gas_station: 'Gas Station',
  gym: 'Gym',
  hair_care: 'Hair Care',
  hardware_store: 'Hardware Store',
  hindu_temple: 'Hindu Temple',
  home_goods_store: 'Home Goods Store',
  hospital: 'Hospital',
  insurance_agency: 'Insurance Agency',
  jewelry_store: 'Jewelry Store',
  laundry: 'Laundry',
  lawyer: 'Lawyer',
  library: 'Library',
  light_rail_station: 'Light Rail Station',
  liquor_store: 'Liquor Store',
  local_government_office: 'Local Government Office',
  locksmith: 'Locksmith',
  lodging: 'Lodging',
  meal_delivery: 'Meal Delivery',
  meal_takeaway: 'Meal Takeaway',
  mosque: 'Mosque',
  movie_rental: 'Movie Rental',
  movie_theater: 'Movie Theater',
  moving_company: 'Moving Company',
  museum: 'Museum',
  night_club: 'Night Club',
  painter: 'Painter',
  park: 'Park',
  parking: 'Parking',
  pet_store: 'Pet Store',
  pharmacy: 'Pharmacy',
  physiotherapist: 'Physiotherapist',
  plumber: 'Plumber',
  police: 'Police',
  post_office: 'Post Office',
  primary_school: 'Primary School',
  real_estate_agency: 'Real Estate Agency',
  restaurant: 'Restaurant',
  roofing_contractor: 'Roofing Contractor',
  rv_park: 'RV Park',
  school: 'School',
  secondary_school: 'Secondary School',
  shoe_store: 'Shoe Store',
  shopping_mall: 'Shopping Mall',
  spa: 'Spa',
  stadium: 'Stadium',
  storage: 'Storage',
  store: 'Store',
  subway_station: 'Subway Station',
  supermarket: 'Supermarket',
  synagogue: 'Synagogue',
  taxi_stand: 'Taxi Stand',
  tourist_attraction: 'Tourist Attraction',
  train_station: 'Train Station',
  transit_station: 'Transit Station',
  travel_agency: 'Travel Agency',
  university: 'University',
  veterinary_care: 'Veterinary Care',
  zoo: 'Zoo',
};

export const colorCodesLocation = {
  new: {
    key: 'new',
    value: '#262527',
  },
  old: {
    key: 'old',
    value: '#31A150',
  },
  lost: {
    key: 'lost',
    value: '#E43F32',
  },
  existing: {
    key: 'existing',
    value: '#146DFF',
  },
};

export const CONST_CREATE_RUNSHEET = 'createRunsheet';
export const CONST_SPLIT_RUNSHEET = 'splitRunSheet';
export const CONST_RE_ORDER_HITS = 'Re-Order Hits';
export const CONST_RUNSHEET_SELECT_HITS = 'Select Hits';
export const CONST_SPLIT_RUNSHEET_ASSIGN_OFFICER = 'Assign';

export const daysOfWeekWithVal = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 0 },
];

export const googleMapStyles = [
  {
    featureType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.country',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'administrative.locality',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road.highway',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'landscape',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'poi.park',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'water',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'administrative.province',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }],
  },
];

export const VisitorStatusEnum = {
  banned: 'Banned',
  allowed: 'Allowed',
};
export const BanUnban = {
  ban: 'ban',
  unBan: 'unBan',
};

export const LoaderBanUnban = {
  ban: 'ban',
  unBan: 'unBan',
};

export const LoaderStatusEnum = {
  banned: 'Banned',
  allowed: 'Allowed',
};

export const visitorLoadCategory = {
  visitor: 'visitor',
  truckLoad: 'truckLoad',
};

export const MAX_3_DIGIT_VALUE = 999;
export const MAX_4_DIGIT_VALUE = 9999;
export const MAX_5_DIGIT_VALUE = 99999;

export const enumStatusReport = {
  notSubmitted: 'notSubmitted',
  submitted: 'submitted',
  accepted: 'accepted',
  rejected: 'rejected',
};

export const officerUnavailabilityReason = {
  OFFLINE: 'offline',
  ASSIGNED: 'assigned',
};

export const resetAvailabilityData = [
  {
    id: 1,
    day: 'Monday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
  {
    id: 2,
    day: 'Tuesday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
  {
    id: 3,
    day: 'Wednesday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
  {
    id: 4,
    day: 'Thursday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
  {
    id: 5,
    day: 'Friday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
  {
    id: 6,
    day: 'Saturday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
  {
    id: 7,
    day: 'Sunday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
];

export const contractStatusEnum = {
  ACTIVE: 'active',
  TERMINATED: 'terminated',
  EXPIRED: 'expired',
};

/**
 * Attachment settings
 */
export const attachmentSettings = {
  ACCEPT: '.pdf, .doc, .docx, jpg, .jpeg, .png, .gif, .mp4, .mov, .m4v',
  FILE_SIZE_LIMIT: 20, //mb
};

export const DUTY_TYPES = {
  dedicated: 'Dedicated',
  patrol: 'Patrol',
  hybrid: 'Hybrid',
  extra: 'Extra',
  dispatch: 'Dispatch',
};

export const _statusEnum = {
  onTime: 'On-time',
  lateStarted: 'Late',
  present: 'Present',
  onLeave: 'On-Leave',
  absent: 'absent',
  dedicated: 'Dedicated',
  earlyLeft: 'Early Left',
  dispatch: 'Dispatch',
  completed: 'Completed',
  extra: 'Extra',
  escalated: 'Escalated',
  leaveApproved: 'Leave Approved',
  missedCheckpoint: 'Missed Checkpoint',
  missedReport: 'Missed Report',
  overTime: 'Over Time',
  notStarted: 'Not Started',
  breakStarted: 'Break Started',
  breakEnded: 'Break Ended',
  shiftStarted: 'Shift Started',
  shiftEnded: 'Shift Ended',
  petrol: 'Petrol',
  leaveApplied: 'Leave Applied',
};

export const enumResponseType = {
  text: 0,
  number: 1,
  multiselect: 2,
  datetime: 3,
  radio: 4,
  date: 5,
  imageVideo: 6,
  time: 7,
  dropdown: 8,
  attachments: 9,
  webCam: 10,
  description: 11,
  phone: 12,
};

export const enumDynamicForm = {
  dynamicFormField: 'dynamicFormField',
};

export const dataReportCheckPointShiftSummary = {
  title: 'Checkpoint Summary Report',
  reportId: 'Data',
  jsonReturn: true,
};

export const dataReportShiftSummary = {
  title: 'Shift Summary Report',
  reportId: 'Data',
  jsonReturn: true,
};

export const siteReportSummary = {
  title: 'Site Summary Report',
  reportId: 'Data',
};

export const dataShiftTourReports = {
  title: 'Shift Tour Reports',
  reportId: 'Data',
};

export const runsheetDayEndReport = {
  title: 'Runsheet Summary Report',
  reportId: 'Data',
};

export const franchiseIdUrlQueryParam = 'franchiseId';
export const franchiseTimeZone = 'tz';

export const timeZoneKeyUrlQueryParam = 'tz';

export const franchiseIdSource = {
  url: 'url',
  redux: 'redux',
};

export const PaymentTerms = [
  {
    value: 'Due upon receipt',
    label: 'Due Upon Receipt',
    dueDays: 0,
  },
  {
    value: 'NET07',
    label: 'NET07',
    dueDays: 7,
  },
  {
    value: 'NET10',
    label: 'NET10',
    dueDays: 10,
  },
  {
    value: 'NET14',
    label: 'NET14',
    dueDays: 14,
  },
  {
    value: 'NET15',
    label: 'NET15',
    dueDays: 15,
  },
  {
    value: 'NET30',
    label: 'NET30',
    dueDays: 30,
  },
];

export const billingFrequency = [
  { id: 1, label: 'Monthly', value: 'monthly' },
  { id: 2, label: 'Bi Weekly', value: 'bi_weekly' },
  { id: 3, label: 'Weekly', value: 'weekly' },
  { id: 4, label: 'Semi Monthly', value: 'semi_monthly' },
  // { id: 5, label: 'Event', value: 'event' },
  // { id: 6, label: 'Flat', value: 'flat' },
];

export const billingFrequencyType = [
  { id: 1, label: 'Pre Bill', value: 'pre_bill' },
  { id: 2, label: 'Post Bill', value: 'post_bill' },
];

// Function to convert camelCase to snake_case
export const toSnakeCase = (str) => {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
};

export const SelectedDateTpeContract = {
  oneTime: 'one_time',
  onGoing: 'ongoing',
};

export const directionServiceErrors = {
  invalidRequest: 'INVALID_REQUEST',
  zeroResults: 'ZERO_RESULTS',
};

export const frequencyBillingEnum = {
  monthly: {
    label: 'Monthly',
    value: 'monthly',
    color: 'success',
    statusClass: 'monthly',
    icon: '',
  },
  semi_monthly: {
    statusClass: 'semi_monthly',
    label: 'Semi Monthly',
    value: 'semi_monthly',
    color: 'primary',
    icon: '',
  },
  bi_weekly: {
    label: 'Bi Weekly',
    value: 'bi_weekly',
    color: 'primary',
    icon: '',
    statusClass: 'bi_weekly',
  },
  weekly: {
    label: 'Weekly',
    value: 'weekly',
    color: 'primary',
    icon: '',
    statusClass: 'weekly',
  },
};

export const contractTypeEnum = {
  default: 'default',
  addendum: 'addendum',
  clone: 'clone',
};

export const proposalTypeEnum = {
  default: 'default',
  dispatch: 'dispatch',
};

export const taskableTypes = {
  company: 'Company',
  location: 'Location',
  deal: 'Deal',
  contact: 'Contact',
};

export const canadianAreaCodes = [
  '368',
  '587',
  '403',
  '825',
  '780',
  '250',
  '672',
  '604',
  '778',
  '236',
  '431',
  '204',
  '584',
  '428',
  '506',
  '879',
  '709',
  '867',
  '782',
  '902',
  '867',
  '249',
  '647',
  '519',
  '343',
  '742',
  '382',
  '807',
  '548',
  '753',
  '683',
  '437',
  '365',
  '226',
  '613',
  '416',
  '289',
  '705',
  '905',
  '782',
  '902',
  '873',
  '468',
  '354',
  '819',
  '263',
  '579',
  '581',
  '438',
  '367',
  '514',
  '418',
  '450',
  '474',
  '639',
  '306',
  '867',
];

export const organizationLevelsObject = { franchise: 'Franchise', HO: 'Home Office' };

export const rolableTypeEnum = {
  supervisor: 'supervisor',
  officer: 'officer',
  salesPerson: 'sales_person',
  internee: 'internee',
  homeOfficer: 'HomeOfficer',
  franchise: 'Franchise',
  hoAgent: 'ho_agent',
  advanced_officer: 'AdvancedOfficer',
};

export const organizationLevels = [
  { label: 'Franchise Level', value: 'Franchise' },
  { label: 'Home Office Level', value: 'HomeOfficer' },
];

export const accessControlList = {
  dashboard: { view: false },
  companies: {
    create: false,
    view: false,
    update: false,
    reviews: { view: false, update: false },
    activities: { view: false },
    notes: { create: false, view: false, update: false, delete: false },
    tasks: { create: false, view: false, update: false, delete: false },
  },
  properties: {
    create: false,
    view: false,
    update: false,
    reviews: { view: false, update: false },
    activities: { view: false },
    notes: { create: false, view: false, update: false, delete: false },
    tasks: { create: false, view: false, update: false, delete: false },
    classificationQuestions: { view: false, update: false },
    emails: { create: false, view: false, update: false, delete: false },
    meetings: { create: false, view: false, update: false, delete: false },
    followups: { create: false, view: false, update: false, delete: false },
  },
  deals: {
    create: false,
    view: false,
    update: false,
    contracts: { create: false, view: false, update: false, delete: false },
    followups: { create: false, view: false, update: false, delete: false },
    activities: { view: false },
    notes: { create: false, view: false, update: false, delete: false },
    tasks: { create: false, view: false, update: false, delete: false },
  },
  contacts: {
    create: false,
    view: false,
    update: false,
    delete: false,
    activities: { view: false },
    notes: { create: false, view: false, update: false, delete: false },
    tasks: { create: false, view: false, update: false, delete: false },
    reviews: { view: false, update: false },
  },
  signalMap: { view: false },
  users: {
    view: false,
    properties: { view: false },
    deals: { view: false },
    history: { view: false },
    rolesAndPermissions: { view: false, update: false },
  },
  marketVerticals: {
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  routes: { view: false },
  mobileExperience: { view: false },
  settings: {
    create: false,
    view: false,
    update: false,
    delete: false,
    preferences: {
      create: false,
      view: false,
      update: false,
      delete: false,
      systemDefault: {
        create: false,
        view: false,
        update: false,
        delete: false,
      },
      holidayGroups: {
        create: false,
        view: false,
        update: false,
        delete: false,
      },
    },
    emailConfigurations: {
      create: false,
      view: false,
      update: false,
      delete: false,
    },
    rolesAndPermissions: {
      create: false,
      view: false,
      update: false,
      delete: false,
    },
    regionalConfigurations: {
      create: false,
      view: false,
      update: false,
      delete: false,
    },
  },
};

export const APP_INSIGHT_USER_AGENT = 'swa-set';
export const TRUNCATE_LENGTH = 50;
export const REGION = ['eu', 'au'];

export const REGIONAL_CONFIGURATION_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
};
