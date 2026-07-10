import { convertToDraft } from 'commonComponents/richText';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import weekday from 'dayjs/plugin/weekday';
import { EditorState } from 'draft-js';
import i18n from 'src/utils/i18next';
import { convertHHMMAToDayJsDate, convertMMDDYYYYToDayJsDate } from 'src/utils/passTime/time';

dayjs.extend(weekday);
// Set Monday as the first day of the week
dayjs.extend(weekday, { weekStart: 1 });
dayjs.extend(isSameOrBefore);

/**
 * Contract Service Types
 */
export const serviceTypes = {
  PATROL: 'patrol',
  DEDICATED: 'dedicated',
  DISPATCH: 'dispatch',
};

/**
 * Patrol Service Visit Types
 */
export const visitTypes = {
  FIXED: 'fixed',
  RANDOM: 'random',
};

/**
 * Repeat Mode Types
 */
export const repeatModes = {
  EVERY_WEEK: 'every',
  REPEAT_AFTER: 'after',
};

/**
 * Slugs.
 */
export const slugs = {
  ARMED_OFFICER: 'armed_officer',
  PATROL_OFFICER: 'patrol_officer',
  DEDICATED_OFFICER: 'dedicated_officer',
  VISITOR_MANAGEMENT: 'visitor_management',
  LOAD_MANAGEMENT: 'load_management',
};

/**
 * Contract Form Keys
 */
export const FormKeys = {
  NAME: 'name',
  TYPE: 'type',
  OFFICER_TYPE: 'officerType',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  START_TIME: 'startTime',
  ADD_FUEL_SURCHARGE: 'addFuelSurcharge',
  INCLUDE_VEHICLE: 'includeVehicle',
  END_TIME: 'endTime',
  VISIT_TYPE: 'visitType',
  NUMBER_OF_VISITS: 'numberOfVisits',
  REPEAT_MODE: 'repeatMode',
  REPEAT_AFTER_FREQUENCY: 'repeatFrequencyValue',
  REPEAT_AFTER_TENURE: 'repeatFrequencyUnit',
  REQ_OFFICERS: 'reqOfficers',
  OFFICER_SERVICE_HRS_WEEK: 'officerServiceHrsWeek',
  TIMEZONE: 'timezone',
  VISITS: 'visits',
  PRICE_PER_HIT: 'pricePerHit',
  HOURLY_RATE: 'hourlyRate',
  VEHICLE_RATE: 'vehicleRate',
  NO_OF_VEHICLES: 'noOfVehicles',
  DUTY_DAYS: 'dutyDays',
  INSTRUCTIONS: 'instructions',
  VISITOR_MANAGEMENT: 'visitorManagement',
  LOAD_MANAGEMENT: 'loadManagement',
  TOTAL: 'total',
  ESTIMATED_PROFIT: 'estimatedProfit',
  HOURS: 'hours',
  CALCULATIONS: 'calculations',
  TOTAL_VISITS: 'totalVisits',
  TOTAL_DUTY_DAYS: 'totalDutyDays',
  RENEWAL_DATE: 'renewalDate',
  SELECTED_DATE_TYPE: 'selectedDateType',
  RENEWAL_REMINDER_DAYS: 'renewalReminderDays',
  AUTO_RENEWAL: 'autoRenewal',
  LINE_ITEM: 'lineItem',
  EFFECTIVE_DATE: 'effectiveDate',
  PROPOSAL_TYPE: 'proposalType',
  SERVICE_START_DATE: 'serviceStartDate',
  PRODUCTS: 'products',
  PRODUCT_NAME: 'productName',
  PRODUCT_RATE: 'productRate',
  PRODUCT_QUANTITY: 'productQuantity',
  TIME_ON_PROPERTY: 'timeOnProperty',
  VISITS_PER_WEEK: 'visitsPerWeek',
};

export const ServicesTimeError = 'servicesTimeError';

export const emptyStateServiceName = { index: null, value: '', isError: false };

const emptyState = {
  [FormKeys.NAME]: 'Service',
  [FormKeys.OFFICER_TYPE]: null,
  [FormKeys.LINE_ITEM]: null,
  [FormKeys.VISITS]: [
    {
      [FormKeys.START_TIME]: null,
      [FormKeys.END_TIME]: null,
      [FormKeys.DUTY_DAYS]: [],
      [FormKeys.REPEAT_MODE]: repeatModes.EVERY_WEEK,
    },
  ],
  [FormKeys.ADD_FUEL_SURCHARGE]: false,
  [FormKeys.INCLUDE_VEHICLE]: false,
  [FormKeys.INSTRUCTIONS]: EditorState.createEmpty(),
};

export const emptyStatePatrolVisit = {
  ...emptyState[FormKeys.VISITS][0],
  [FormKeys.NUMBER_OF_VISITS]: 1,
  [FormKeys.VISIT_TYPE]: visitTypes.FIXED,
  [FormKeys.DUTY_DAYS]: [1, 2, 3, 4, 5],
  [FormKeys.REPEAT_AFTER_FREQUENCY]: '',
  [FormKeys.REPEAT_AFTER_TENURE]: {
    label: i18n.t('sales.contract.EmptyPatrolMonth'),
    value: 'month',
  },
  [FormKeys.PRODUCTS]: [],
};

export const emptyStatePatrol = {
  ...emptyState,
  [FormKeys.VISITS]: [{ ...emptyStatePatrolVisit }],
  [FormKeys.TYPE]: serviceTypes.PATROL,
  [FormKeys.PRICE_PER_HIT]: 25,
  [FormKeys.VISITS_PER_WEEK]: 1,
};

export const emptyStateDedicated = {
  ...emptyState,
  [FormKeys.VISITS]: [
    {
      ...emptyState[FormKeys.VISITS][0],
      [FormKeys.REQ_OFFICERS]: null,
      [FormKeys.OFFICER_SERVICE_HRS_WEEK]: null,
    },
  ],
  [FormKeys.TYPE]: serviceTypes.DEDICATED,
  [FormKeys.HOURLY_RATE]: 25,
  [FormKeys.VISITOR_MANAGEMENT]: false,
  [FormKeys.LOAD_MANAGEMENT]: false,
};

export const getCurrentDate = () => dayjs();

export const isTimeSameOrBefore = (time1, time2) => time1?.isSameOrBefore(time2, 'minute');

/** One visit window in minutes; rolls end to next calendar day when it crosses midnight (e.g. 11pm–1am). */
const getVisitDurationMinutes = (visit) => {
  const { startTime, endTime } = visit || {};
  if (!startTime || !endTime) return null;

  let currentDate = dayjs();
  const sTime = convertHHMMAToDayJsDate(startTime);
  const eTime = convertHHMMAToDayJsDate(endTime);

  const start = currentDate.set('hour', sTime?.hour()).set('minute', sTime?.minute());
  let end = currentDate.set('hour', eTime?.hour()).set('minute', eTime?.minute());

  if (isTimeSameOrBefore(end, start)) end = end.add('1', 'd');

  return end.diff(start, 'minute');
};

const PlanTypeEnums = { MONTHLY: '0', BI_WEEKLY: '1', WEEKLY: '2' };

const PlanMultiplier = {
  [PlanTypeEnums.MONTHLY]: 4.35,
  [PlanTypeEnums.BI_WEEKLY]: 2,
  [PlanTypeEnums.WEEKLY]: 1,
};

/** Resolves API string id or dropdown `{ value }` to a `baseRates` key slug. */
const getOfficerTypeSlugForBaseRate = (officerType) => {
  if (officerType == null || officerType === '') return undefined;
  if (typeof officerType === 'object' && officerType.value != null && officerType.value !== '') {
    return officerType.value;
  }
  if (typeof officerType === 'string') return officerType;
  return undefined;
};

const calculateMinutesPerWeek = (visit) => {
  const { dutyDays } = visit;
  if (!dutyDays?.length) return null;

  const minutesPerDay = getVisitDurationMinutes(visit);
  if (minutesPerDay == null) return null;

  return minutesPerDay * dutyDays.length;
};

export const getVisitHoursPerWeekFromVisit = (visit) => {
  const minutesPerWeek = calculateMinutesPerWeek(visit);
  if (minutesPerWeek == null) return null;
  return Math.round((minutesPerWeek / 60) * 100) / 100;
};

const emptyStateCalculation = {
  [FormKeys.TOTAL]: 0,
  [FormKeys.ESTIMATED_PROFIT]: 0,
};

export const getDedicatedCalculations = ({ service, baseRates }) => {
  if (!service || !baseRates)
    return Object.values(PlanTypeEnums).reduce((acc, planTypeValue) => {
      acc[planTypeValue] = {
        [FormKeys.TOTAL]: 0,
        [FormKeys.ESTIMATED_PROFIT]: 0,
        [FormKeys.HOURS]: 0,
      };
      return acc;
    }, {});

  // if (!service || !baseRates) return { ...emptyStateCalculation, [FormKeys.HOURS]: 0 };

  const visit = service[FormKeys.VISITS][0];
  const minutesPerWeek = calculateMinutesPerWeek(visit);
  const officerSlug = getOfficerTypeSlugForBaseRate(service[FormKeys.OFFICER_TYPE]);
  const baseRate = (officerSlug && baseRates[officerSlug]) || 0;

  const calculatedHoursPerWeek = minutesPerWeek != null ? minutesPerWeek / 60 : null;
  const hoursPerWeek =
    visit[FormKeys.OFFICER_SERVICE_HRS_WEEK] != null &&
    visit[FormKeys.OFFICER_SERVICE_HRS_WEEK] !== ''
      ? Number(visit[FormKeys.OFFICER_SERVICE_HRS_WEEK])
      : calculatedHoursPerWeek;

  if (hoursPerWeek == null || !visit[FormKeys.REQ_OFFICERS]) {
    return Object.values(PlanTypeEnums).reduce((acc, planTypeValue) => {
      acc[planTypeValue] = {
        [FormKeys.TOTAL]: 0,
        [FormKeys.ESTIMATED_PROFIT]: 0,
        [FormKeys.HOURS]: 0,
      };
      return acc;
    }, {});
  }

  const totalHoursPerWeek = hoursPerWeek * visit[FormKeys.REQ_OFFICERS];
  const ratePerWeek = totalHoursPerWeek * service[FormKeys.HOURLY_RATE];
  const defaultRatePerWeek = totalHoursPerWeek * baseRate;
  const estimatedProfit = ratePerWeek - defaultRatePerWeek;

  // Calculate dedicated vehicle rate
  // const dedicatedVehicleRate =
  //   hoursPerWeek * service[FormKeys.NO_OF_VEHICLES] * service[FormKeys.VEHICLE_RATE] || 0;
  let dedicatedVehicleRate = 0;
  if (
    service?.type === serviceTypes.DEDICATED &&
    service?.visits?.[0].dutyDays?.length &&
    service.includeVehicle &&
    service.vehicleRate &&
    service.noOfVehicles
  ) {
    const minutesPerVisit = getVisitDurationMinutes(service?.visits?.[0]);
    const serviceHours = minutesPerVisit != null ? minutesPerVisit / 60 : 0;
    if (serviceHours) {
      const perDayVehicleExpense =
        Number(serviceHours) * parseFloat(service.vehicleRate) * parseInt(service.noOfVehicles, 10);

      const amountPerWeek = perDayVehicleExpense * service?.visits?.[0].dutyDays.length;

      // Scale weekly expense by current plan multiplier
      dedicatedVehicleRate += amountPerWeek * PlanMultiplier[PlanTypeEnums.WEEKLY];
    }
  }

  const total = ratePerWeek + dedicatedVehicleRate;

  // Generate scaled totals for each plan type
  const calculations = {};

  Object.values(PlanTypeEnums).forEach((planTypeValue) => {
    let planTotal = total > 0 ? total * PlanMultiplier[planTypeValue] : 0;
    let planProfit = total > 0 ? estimatedProfit * PlanMultiplier[planTypeValue] : 0;
    let planHours = total > 0 ? totalHoursPerWeek * PlanMultiplier[planTypeValue] : 0;

    // If flat plan → use same weekly value (no scaling)
    if (planTypeValue === PlanTypeEnums.FLAT) {
      planTotal = total > 0 ? total : 0;
      planProfit = total > 0 ? estimatedProfit : 0;
      planHours = total > 0 ? totalHoursPerWeek : 0;
    }

    calculations[planTypeValue] = {
      [FormKeys.TOTAL]: planTotal?.toFixed(2),
      [FormKeys.ESTIMATED_PROFIT]: planProfit,
      [FormKeys.HOURS]: planHours,
    };
  });

  return calculations;
};

export const getPatrolCalculations = ({ service, baseRates }) => {
  if (!service || !baseRates)
    return Object.values(PlanTypeEnums).reduce((acc, planTypeValue) => {
      acc[planTypeValue] = {
        ...emptyStateCalculation,
        [FormKeys.TOTAL_DUTY_DAYS]: {},
        [FormKeys.TOTAL_VISITS]: 0,
      };
      return acc;
    }, {});

  const totalDutyDays = {};
  const totalVisits = service?.[FormKeys.VISITS]?.reduce((acc, visit) => {
    visit[FormKeys.DUTY_DAYS].forEach((visitDutyDay) => {
      if (totalDutyDays[visitDutyDay]) {
        totalDutyDays[visitDutyDay] += Number(visit[FormKeys.NUMBER_OF_VISITS]);
      } else {
        totalDutyDays[visitDutyDay] = Number(visit[FormKeys.NUMBER_OF_VISITS]);
      }
    });
    return acc + visit[FormKeys.NUMBER_OF_VISITS] * visit[FormKeys.DUTY_DAYS].length;
  }, 0);

  const officerSlug = getOfficerTypeSlugForBaseRate(service[FormKeys.OFFICER_TYPE]);
  const baseRate = (officerSlug && baseRates[officerSlug]) || 0;

  const totalPrice = totalVisits * service[FormKeys.PRICE_PER_HIT];
  const defaultTotalPrice = totalVisits * baseRate;
  const estimatedProfit = totalPrice - defaultTotalPrice;

  // 🔹 Generate scaled totals for each plan type
  const calculations = {};

  Object.values(PlanTypeEnums).forEach((planTypeValue) => {
    const multiplier = PlanMultiplier[planTypeValue] || 1;

    const planTotal = totalPrice > 0 ? totalPrice * multiplier : 0;
    const planProfit = totalPrice > 0 ? estimatedProfit * multiplier : 0;

    calculations[planTypeValue] = {
      [FormKeys.TOTAL]: planTotal,
      [FormKeys.ESTIMATED_PROFIT]: planProfit,
      [FormKeys.TOTAL_DUTY_DAYS]: totalDutyDays,
      [FormKeys.TOTAL_VISITS]: totalVisits,
    };
  });

  return calculations;
};

export const officerTypeOptions = [
  {
    id: 'armed_officer',
    name: 'Armed Officer',
  },
  { id: 'patrol_officer', name: 'Patrol Officer', [FormKeys.TYPE]: serviceTypes.PATROL },
  { id: 'dedicated_officer', name: 'Dedicated Officer', [FormKeys.TYPE]: serviceTypes.DEDICATED },
];

export const filterGoOfficerTypeOptions = [
  { id: 'patrol_officer', name: 'Patrol Officer', [FormKeys.TYPE]: serviceTypes.PATROL },
];

const FALLBACK_OFFICER_TYPE = {
  id: slugs.ARMED_OFFICER,
  name: 'Armed Officer',
  label: 'Armed Officer',
  value: slugs.ARMED_OFFICER,
};

const resolveOfficerTypeForForm = (rawOfficerType, serviceType) => {
  if (rawOfficerType?.value != null && rawOfficerType?.label) {
    return {
      ...rawOfficerType,
      label: rawOfficerType.label,
      value: String(rawOfficerType.value),
    };
  }

  const rawId = typeof rawOfficerType === 'object' ? rawOfficerType?.id : rawOfficerType;
  const rawName = typeof rawOfficerType === 'object' ? rawOfficerType?.name : null;

  let officerType = officerTypeOptions.find(
    (option) => option.id === rawId || option.id === String(rawId),
  );

  if (!officerType && rawName) {
    officerType = officerTypeOptions.find(
      (option) => option.name?.toLowerCase() === rawName?.toLowerCase(),
    );
  }

  if (!officerType && serviceType === serviceTypes.PATROL) {
    officerType = officerTypeOptions.find((option) => option.id === slugs.PATROL_OFFICER);
  }

  if (!officerType && serviceType === serviceTypes.DEDICATED) {
    officerType = officerTypeOptions.find((option) => option.id === slugs.DEDICATED_OFFICER);
  }

  officerType = officerType || officerTypeOptions[0] || FALLBACK_OFFICER_TYPE;

  return {
    ...officerType,
    label: officerType?.name || FALLBACK_OFFICER_TYPE.label,
    value: officerType?.id || FALLBACK_OFFICER_TYPE.value,
  };
};

const normalizeInstructionsForForm = (instructions) => {
  if (instructions && typeof instructions.getCurrentContent === 'function') {
    return instructions;
  }

  if (typeof instructions === 'string') {
    return instructions.trim() ? convertToDraft(instructions) : EditorState.createEmpty();
  }

  return EditorState.createEmpty();
};

const normalizeVisitTimeForForm = (value) => {
  if (value == null || value === '') return null;
  if (dayjs.isDayjs(value)) return value;
  if (typeof value === 'string') return convertHHMMAToDayJsDate(value);
  return null;
};

export const hydrateFormReadyServices = (services = []) =>
  services.map((service) => ({
    ...service,
    [FormKeys.INSTRUCTIONS]: normalizeInstructionsForForm(service[FormKeys.INSTRUCTIONS]),
    [FormKeys.VISITS]: (service[FormKeys.VISITS] || []).map((visit) => ({
      ...visit,
      [FormKeys.START_TIME]: normalizeVisitTimeForForm(visit[FormKeys.START_TIME]),
      [FormKeys.END_TIME]: normalizeVisitTimeForForm(visit[FormKeys.END_TIME]),
    })),
  }));

export const getServicesData = (
  data,
  baseRates,
  lineItems,
  productsOptions = [],
  enableOccurences = false,
  startDate = null,
) => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(Boolean).map((service) => {
    const newService = { ...service };

    newService[FormKeys.OFFICER_TYPE] = resolveOfficerTypeForForm(
      newService[FormKeys.OFFICER_TYPE],
      newService[FormKeys.TYPE],
    );
    const selectedLineItem = Array.isArray(lineItems)
      ? lineItems.find(
          (o) =>
            o?.value === service?.lineItem ||
            o?.value === service?.lineItem?.value ||
            o?.label === service?.lineItem?.label,
        )
      : null;

    newService[FormKeys.LINE_ITEM] =
      newService[FormKeys.LINE_ITEM]?.value != null
        ? { ...newService[FormKeys.LINE_ITEM] }
        : selectedLineItem
          ? { ...selectedLineItem }
          : null;
    if (newService[FormKeys.TYPE] === serviceTypes.PATROL) {
      delete newService[FormKeys.REQ_OFFICERS];
      delete newService[FormKeys.HOURLY_RATE];
    } else {
      delete newService[FormKeys.PRICE_PER_HIT];
      delete newService[FormKeys.NUMBER_OF_VISITS];
      delete newService[FormKeys.TIME_ON_PROPERTY];
    }
    newService[FormKeys.SERVICE_START_DATE] = newService[FormKeys.SERVICE_START_DATE]
      ? convertMMDDYYYYToDayJsDate(newService[FormKeys.SERVICE_START_DATE])
      : enableOccurences
        ? null
        : convertMMDDYYYYToDayJsDate(startDate);
    newService[FormKeys.VISITS] = (
      Array.isArray(newService[FormKeys.VISITS]) ? newService[FormKeys.VISITS] : []
    ).map((visit) => ({
      ...visit,

      ...(Array.isArray(visit?.products) &&
        visit.products.length && {
          products: visit.products.map((product) => {
            const productName = product?.productName;
            const matchedProduct = Array.isArray(productsOptions)
              ? productsOptions.find((o) => o?.name === productName)
              : null;

            return {
              ...product,
              productId: matchedProduct?.id || product.productId,
              productName: matchedProduct
                ? {
                    id: matchedProduct.id,
                    name: matchedProduct.name,
                    label: matchedProduct.label || matchedProduct.name,
                    value: matchedProduct.value || matchedProduct.name,
                  }
                : {
                    label: productName,
                    value: productName,
                  },
            };
          }),
        }),

      startTime: normalizeVisitTimeForForm(visit.startTime),
      endTime: normalizeVisitTimeForForm(visit.endTime),
      ...(visit[FormKeys.REPEAT_MODE] === repeatModes.REPEAT_AFTER && {
        [FormKeys.REPEAT_AFTER_FREQUENCY]: visit[FormKeys.REPEAT_AFTER_FREQUENCY],
        [FormKeys.REPEAT_AFTER_TENURE]: visit[FormKeys.REPEAT_AFTER_TENURE],
      }),
    }));
    delete newService.id;
    newService[FormKeys.INSTRUCTIONS] = normalizeInstructionsForForm(
      newService[FormKeys.INSTRUCTIONS],
    );
    if (newService[FormKeys.TYPE] === serviceTypes.PATROL) {
      newService[FormKeys.TIME_ON_PROPERTY] = newService[FormKeys.TIME_ON_PROPERTY] || null;
    }
    newService[FormKeys.CALCULATIONS] =
      newService[FormKeys.TYPE] === serviceTypes.DEDICATED
        ? getDedicatedCalculations({ service: newService, baseRates })
        : getPatrolCalculations({ service: newService, baseRates });

    return newService;
  });
};

export const getDefaultServicesData = (
  length,
  tenantInfo = null,
  enableOccurences = false,
  contractStartDate = null,
) => {
  // Determine default service type based on tenant configuration
  // If dedicated service is available for tenant, use it as default
  // Otherwise, use patrol as default
  const shouldUseDedicated = tenantInfo?.services?.dedicated;
  const defaultServiceState = shouldUseDedicated ? emptyStateDedicated : emptyStatePatrol;

  // Set repeat mode based on enableOccurences flag
  const repeatMode = enableOccurences ? repeatModes.REPEAT_AFTER : repeatModes.EVERY_WEEK;

  return {
    ...defaultServiceState,
    [FormKeys.OFFICER_TYPE]: shouldUseDedicated
      ? {
          id: slugs.DEDICATED_OFFICER,
          name: 'Dedicated Officer',
          label: 'Dedicated Officer',
          value: slugs.DEDICATED_OFFICER,
        }
      : {
          id: slugs.PATROL_OFFICER,
          name: 'Patrol Officer',
          label: 'Patrol Officer',
          value: slugs.PATROL_OFFICER,
        },
    [FormKeys.SERVICE_START_DATE]: tenantInfo?.services?.changeAbleServiceStartDate
      ? null
      : convertMMDDYYYYToDayJsDate(contractStartDate),
    [FormKeys.VISITS]: defaultServiceState[FormKeys.VISITS].map((visit) => ({
      ...visit,
      [FormKeys.REPEAT_MODE]: repeatMode,
      [FormKeys.NUMBER_OF_VISITS]: enableOccurences ? 1 : visit[FormKeys.NUMBER_OF_VISITS],
    })),
    [FormKeys.CALCULATIONS]: shouldUseDedicated
      ? {
          [FormKeys.ESTIMATED_PROFIT]: 0,
          [FormKeys.TOTAL]: 0,
          [FormKeys.HOURS]: 0,
        }
      : {
          [FormKeys.ESTIMATED_PROFIT]: 0,
          [FormKeys.TOTAL]: 0,
          [FormKeys.TOTAL_DUTY_DAYS]: {},
          [FormKeys.TOTAL_VISITS]: 0,
        },
    [FormKeys.NAME]: ``,
  };
};

export const getServiceNamePlaceholder = (length) =>
  `${emptyStatePatrol[FormKeys.NAME]} #${length + 1}`;

export const getServicesCalculations = (services, baseRates) => {
  return services?.map((service) => {
    const result =
      service[FormKeys.TYPE] === serviceTypes.DEDICATED
        ? getDedicatedCalculations({
            service,
            baseRates,
          })
        : getPatrolCalculations({ service, baseRates });
    return result;
  });
};
