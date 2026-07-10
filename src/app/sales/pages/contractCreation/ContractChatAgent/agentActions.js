import { convertDataToHtml, convertToDraft } from 'commonComponents/richText';
import { EditorState } from 'draft-js';
import {
  emptyStateDedicated,
  emptyStatePatrol,
  FormKeys as ServicesFormKeys,
  getDedicatedCalculations,
  getPatrolCalculations,
  officerTypeOptions,
  repeatModes,
  serviceTypes,
  visitTypes,
} from 'src/app/components/salesComponents/contractCreation/addServices/helper';
import { intentTypes } from 'src/app/components/salesComponents/contractCreation/onDemandServices';
import {
  dispatchOptionEnums,
  systemServicesConstant,
} from 'src/app/components/salesComponents/contractCreation/onDemandServices/systemService';
import {
  applyBillingMockDefaults,
  BillingAddressOptions,
  FormKeys as PaymentTermsFormKeys,
  getPaymentTermsData,
  PlanTypeEnums,
} from 'src/app/components/salesComponents/contractCreation/paymentTerms/helper';
import { updateContract } from 'src/services/deal.service.js';
import { joiValidateErrors } from 'src/utils/formValidator/formValidator.requiredCheck.js';
import { convertMMDDYYYYToDayJsDate } from 'src/utils/passTime/time';

import {
  ActiveStepsKeys,
  getEditData,
  getPayload,
  getPaymentTermsHolidayValidationErrors,
  getServicesTimeFieldErrors,
  getValidateFormData,
} from '../helper.js';
import {
  normalizePhoneForValidation,
  resolveAutoBillingAddressFields,
} from './paymentChatHelpers.js';
import { generateServiceName } from './planHelpers.js';
import { parseChatTimeInput } from './timeParser.js';

const DEFAULT_PATROL_VISITS_PER_DAY = 1;
const DEFAULT_BILLING_OWNER_PHONE = '+1 (512) 251-4900';
const US_CANADA_PHONE_REGEX = /^\+1\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const INTERNATIONAL_PHONE_REGEX = /^\+(?:[0-9] ?){6,14}[0-9]$/;

const OPTIONAL_SCHEDULE_FIELD_PATTERN =
  /,visits,\d+,(dutyDays|startTime|endTime)(,|$)|servicesTimeError$/;

const stripOptionalScheduleValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') return errors;

  const filtered = Object.entries(errors).reduce((acc, [key, value]) => {
    if (!OPTIONAL_SCHEDULE_FIELD_PATTERN.test(String(key))) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return Object.keys(filtered).length > 0 ? filtered : null;
};

const ensureValidBillingPhone = (phone) => {
  const normalized = normalizePhoneForValidation(phone);
  const value = String(normalized || '').trim();
  if (US_CANADA_PHONE_REGEX.test(value) || INTERNATIONAL_PHONE_REGEX.test(value)) {
    return value;
  }
  return DEFAULT_BILLING_OWNER_PHONE;
};

const normalizeTimezone = (timezone) => {
  if (!timezone) return null;

  if (typeof timezone === 'string' || typeof timezone === 'number') {
    const value = String(timezone);
    return {
      value,
      label: value,
      id: value,
      name: value,
    };
  }

  if (typeof timezone !== 'object' || Array.isArray(timezone)) {
    return null;
  }

  const rawValue = timezone.id ?? timezone.value ?? timezone.timezone ?? timezone.tz;
  const rawLabel = timezone.name ?? timezone.label ?? timezone.timezone ?? timezone.tz;

  if (rawValue == null && rawLabel == null) {
    return null;
  }

  const value = String(rawValue ?? rawLabel);
  const label = String(rawLabel ?? rawValue);

  return {
    ...timezone,
    value,
    label,
    id: timezone.id ?? value,
    name: timezone.name ?? label,
  };
};

const getBrowserTimezone = () => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timezone) return null;
    return normalizeTimezone(timezone);
  } catch {
    return null;
  }
};

const resolveTimezone = (contractServicesState, apiData) => {
  const fromRedux = normalizeTimezone(contractServicesState?.timezone);
  if (fromRedux) return fromRedux;

  const fromApi = normalizeTimezone(apiData?.details?.timezone);
  if (fromApi) return fromApi;

  return getBrowserTimezone();
};

const resolveContractDates = (contractServicesState, apiData) => {
  let startDate = contractServicesState?.startDate;
  let endDate = contractServicesState?.endDate;

  if (!startDate && apiData?.details?.startDate) {
    startDate = convertMMDDYYYYToDayJsDate(apiData.details.startDate, false);
  }
  if (!endDate && apiData?.details?.endDate) {
    endDate = convertMMDDYYYYToDayJsDate(apiData.details.endDate, false);
  }

  return { startDate, endDate };
};

const resolveOfficerType = (value) => {
  const match = officerTypeOptions.find((o) => o.id === value);
  if (!match) return null;
  return {
    ...match,
    label: match.name,
    value: match.id,
  };
};

const resolveLineItem = (label, lineItems = []) => {
  const match = lineItems.find(
    (item) =>
      item.label?.toLowerCase() === label?.toLowerCase() ||
      item.value?.toLowerCase() === label?.toLowerCase(),
  );
  if (match) return { ...match };
  return { label, value: label };
};

const buildVisitFromCollected = (serviceData) => {
  const isPatrol = serviceData.serviceType === serviceTypes.PATROL;

  const visit = {
    [ServicesFormKeys.DUTY_DAYS]: serviceData.dutyDays || [],
    [ServicesFormKeys.START_TIME]: parseChatTimeInput(serviceData.startTime),
    [ServicesFormKeys.END_TIME]: parseChatTimeInput(serviceData.endTime),
    [ServicesFormKeys.REPEAT_MODE]: repeatModes.EVERY_WEEK,
    [ServicesFormKeys.VISIT_TYPE]: serviceData.visitType || visitTypes.RANDOM,
    [ServicesFormKeys.PRODUCTS]: [],
  };

  if (isPatrol) {
    visit[ServicesFormKeys.NUMBER_OF_VISITS] =
      serviceData.visitsPerDay ?? serviceData.numberOfVisitsPerDay ?? DEFAULT_PATROL_VISITS_PER_DAY;
  } else {
    visit[ServicesFormKeys.REQ_OFFICERS] = serviceData.reqOfficers ?? null;
    visit[ServicesFormKeys.OFFICER_SERVICE_HRS_WEEK] = serviceData.officerServiceHrsWeek ?? null;
  }

  return visit;
};

const buildServiceFromCollected = (
  serviceData,
  index,
  { baseRates, lineItems, contractStartDate },
) => {
  const isPatrol = serviceData.serviceType === serviceTypes.PATROL;
  const base = isPatrol ? { ...emptyStatePatrol } : { ...emptyStateDedicated };

  const visit = buildVisitFromCollected(serviceData);

  const defaultOfficerType = isPatrol ? 'patrol_officer' : 'dedicated_officer';
  const defaultLineItem = lineItems?.[0]?.label || lineItems?.[0]?.value;

  const service = {
    ...base,
    [ServicesFormKeys.NAME]: generateServiceName(serviceData) || `Service ${index + 1}`,
    [ServicesFormKeys.TYPE]: serviceData.serviceType,
    [ServicesFormKeys.OFFICER_TYPE]: resolveOfficerType(
      serviceData.officerType || defaultOfficerType,
    ),
    [ServicesFormKeys.LINE_ITEM]: resolveLineItem(
      serviceData.lineItem || defaultLineItem,
      lineItems,
    ),
    [ServicesFormKeys.VISITS]: [visit],
    [ServicesFormKeys.INCLUDE_VEHICLE]: serviceData.includeVehicle === 'yes',
    [ServicesFormKeys.INSTRUCTIONS]:
      typeof serviceData.instructions === 'string' && serviceData.instructions.trim()
        ? convertToDraft(serviceData.instructions)
        : serviceData.instructions &&
            typeof serviceData.instructions.getCurrentContent === 'function'
          ? serviceData.instructions
          : EditorState.createEmpty(),
    [ServicesFormKeys.SERVICE_START_DATE]: contractStartDate || null,
  };

  if (isPatrol) {
    service[ServicesFormKeys.PRICE_PER_HIT] = serviceData.pricePerHit;
    service[ServicesFormKeys.TIME_ON_PROPERTY] = serviceData.timeOnProperty;
    service[ServicesFormKeys.VISITS_PER_WEEK] = serviceData.visitsPerWeek ?? null;
  } else {
    service[ServicesFormKeys.HOURLY_RATE] = serviceData.hourlyRate;
  }

  if (serviceData.includeVehicle === 'yes') {
    service[ServicesFormKeys.NO_OF_VEHICLES] = serviceData.noOfVehicles;
    service[ServicesFormKeys.VEHICLE_RATE] = serviceData.vehicleRate;
  }

  service[ServicesFormKeys.CALCULATIONS] = isPatrol
    ? getPatrolCalculations({ service, baseRates })
    : getDedicatedCalculations({ service, baseRates });

  return service;
};

export const buildServicesFormData = (collected, contractServicesState, options = {}) => {
  const { baseRates = {}, lineItems = [], apiData } = options;
  const { startDate, endDate } = resolveContractDates(contractServicesState, apiData);
  const timezone = resolveTimezone(contractServicesState, apiData);

  const services = (collected.services || []).map((serviceData, index) =>
    buildServiceFromCollected(serviceData, index, {
      baseRates,
      lineItems,
      contractStartDate: startDate,
    }),
  );

  return {
    ...contractServicesState,
    name: contractServicesState?.name || options.contractName || apiData?.details?.name,
    timezone,
    startDate,
    endDate,
    [ActiveStepsKeys.SERVICES]: services,
  };
};

export const buildDefaultDevicesFromPreferences = (franchisePreferences) => {
  const devices = franchisePreferences?.devices || [];
  return devices.map((device) => ({
    obxId: device.id,
    name: device.key,
    slug: device.slug,
    quantity: 0,
    price: device.rateValue ?? 0,
    image: device.image,
  }));
};

const normalizeDeviceFormRow = (device) => ({
  obxId: device.obxId,
  name: device.name,
  slug: device.slug,
  quantity: Number(device.quantity) || 0,
  price: device.price || 0,
  image: device.image,
});

export const buildDevicesFormData = (collected, apiData, franchisePreferences) => {
  if (collected.devices?.length) {
    return collected.devices.map(normalizeDeviceFormRow);
  }

  if (Array.isArray(apiData?._demoFormDevices) && apiData._demoFormDevices.length) {
    return apiData._demoFormDevices.map(normalizeDeviceFormRow);
  }

  if (Array.isArray(apiData?.devices) && apiData.devices.length) {
    return apiData.devices.map(normalizeDeviceFormRow);
  }

  return buildDefaultDevicesFromPreferences(franchisePreferences);
};

export const buildPaymentTermsFormData = (
  collected,
  apiData,
  {
    stripeEnabled = false,
    taxExemptionEnabled = false,
    currentUser = null,
    holidayGroups = [],
  } = {},
) => {
  const existing = apiData?.[ActiveStepsKeys.PAYMENT_TERMS];
  const isFuelSurchargeApplicable = apiData?.details?.isFuelSurchargeApplicable;
  const isFullPaymentTermsRecord =
    existing &&
    (existing.paymentMethod ||
      existing.plan ||
      existing.address ||
      existing.leadAddress ||
      existing.companyAddress);
  const base = isFullPaymentTermsRecord
    ? getPaymentTermsData(existing, isFuelSurchargeApplicable, stripeEnabled, taxExemptionEnabled)
    : {
        ...(apiData?._demoPaymentTermsForm ?? {}),
      };

  const chat = collected.paymentTerms || {};
  const billingAddressOptionMap = {
    company: BillingAddressOptions.COMPANY,
    property: BillingAddressOptions.PROPERTY,
    other: BillingAddressOptions.OTHER,
  };

  const toDropdownValue = (value, fallbackLabel) => {
    if (value && typeof value === 'object' && value.value != null && value.value !== '') {
      return value;
    }
    if (value == null || value === '') return null;
    return { value: String(value), label: fallbackLabel || String(value) };
  };

  const normalizeHolidayGroupOption = (group) => {
    if (!group || typeof group !== 'object') return null;
    const id = group.id ?? group.value;
    const name = group.name ?? group.label;
    if (id == null && !name) return null;
    return {
      ...group,
      value: group.value ?? id,
      id: group.id ?? id,
      label: group.label ?? name ?? String(id),
      name: group.name ?? name ?? String(id),
      holidays: group.holidays || [],
      holidaysCount: group.holidaysCount ?? group.holidays?.length ?? 0,
    };
  };

  const resolveHolidayGroup = (holidayGroupInput, fallbackHolidayGroup) => {
    const normalizedFallback = normalizeHolidayGroupOption(fallbackHolidayGroup);
    const normalizedGroups = Array.isArray(holidayGroups)
      ? holidayGroups.map(normalizeHolidayGroupOption).filter(Boolean)
      : [];

    if (holidayGroupInput && typeof holidayGroupInput === 'object') {
      return normalizeHolidayGroupOption(holidayGroupInput);
    }

    const typedValue = String(holidayGroupInput || '').trim();
    if (!typedValue) {
      return normalizedFallback || normalizedGroups[0] || null;
    }

    const fallbackLabel = String(
      normalizedFallback?.label || normalizedFallback?.name || '',
    ).trim();
    if (fallbackLabel && fallbackLabel.toLowerCase() === typedValue.toLowerCase()) {
      return normalizedFallback;
    }

    const fromGroupName = normalizedGroups.find(
      (group) =>
        String(group?.label || group?.name || '')
          .trim()
          .toLowerCase() === typedValue.toLowerCase(),
    );
    if (fromGroupName) {
      return fromGroupName;
    }

    const fromGroupId = normalizedGroups.find(
      (group) => String(group?.id ?? group?.value ?? '').trim() === typedValue,
    );
    if (fromGroupId) {
      return fromGroupId;
    }

    const numericId = Number(typedValue);
    if (!Number.isNaN(numericId)) {
      const byNumericId = normalizedGroups.find(
        (group) => Number(group.id ?? group.value) === numericId,
      );
      if (byNumericId) {
        return byNumericId;
      }
      return {
        value: String(numericId),
        id: numericId,
        label: normalizedFallback?.label || typedValue,
        name: normalizedFallback?.name || typedValue,
        holidays: normalizedFallback?.holidays || [],
        holidaysCount:
          normalizedFallback?.holidaysCount ?? normalizedFallback?.holidays?.length ?? 0,
      };
    }

    return normalizedFallback || normalizedGroups[0] || null;
  };

  const paymentDateOption = [
    { label: 'Due on receipt', value: '0' },
    { label: 'Net 15', value: '15' },
    { label: 'Net 30', value: '30' },
  ].find((option) => String(option.value) === String(chat.paymentDate));

  const paymentMethodOption = [
    { label: 'Check', value: '1' },
    { label: 'ACH / Bank Transfer', value: '2' },
    { label: 'Credit Card', value: '3' },
  ].find((option) => String(option.value) === String(chat.paymentMethod));

  const billingTypeOption = [
    { label: 'Recurring', value: '1' },
    { label: 'Per service completion', value: '2' },
  ].find((option) => String(option.value) === String(chat.billingType));

  const contractTypeOption = [
    { label: 'Standard', value: '1' },
    { label: 'Master agreement', value: '2' },
  ].find((option) => String(option.value) === String(chat.contractType));

  const userFullName =
    currentUser?.name ||
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
    apiData?.details?.createdBy ||
    '';
  const [fallbackFirstNameRaw, ...fallbackLastNameParts] = String(userFullName).trim().split(/\s+/);
  const fallbackFirstName = fallbackFirstNameRaw || 'Billing';
  const fallbackLastName = fallbackLastNameParts.join(' ') || 'Owner';

  const billingContact = apiData?.billingContact;
  let billingOwnerFirstName =
    chat.billingOwnerFirstName ?? base[PaymentTermsFormKeys.BILLING_OWNER_FIRST_NAME];
  let billingOwnerLastName =
    chat.billingOwnerLastName ?? base[PaymentTermsFormKeys.BILLING_OWNER_LAST_NAME];
  let billingOwnerEmail = chat.billingOwnerEmail ?? base[PaymentTermsFormKeys.BILLING_OWNER_EMAIL];
  let billingOwnerPhone = chat.billingOwnerPhone ?? base[PaymentTermsFormKeys.BILLING_OWNER_PHONE];

  if (billingContact) {
    billingOwnerFirstName = billingContact.firstName ?? billingOwnerFirstName;
    billingOwnerLastName = billingContact.lastName ?? billingOwnerLastName;
    billingOwnerEmail = billingContact.email ?? billingOwnerEmail;
    billingOwnerPhone = billingContact.phoneNumber ?? billingOwnerPhone;
  }

  billingOwnerFirstName = billingOwnerFirstName || fallbackFirstName;
  billingOwnerLastName = billingOwnerLastName || fallbackLastName;

  billingOwnerPhone = ensureValidBillingPhone(billingOwnerPhone);

  const billingAddressOption =
    billingAddressOptionMap[chat.billingAddressOption] ??
    base[PaymentTermsFormKeys.BILLING_ADDRESS_OPTION] ??
    (billingContact ? BillingAddressOptions.PROPERTY : BillingAddressOptions.COMPANY);

  const autoAddressFields = resolveAutoBillingAddressFields(apiData, base, billingAddressOption);

  return applyBillingMockDefaults({
    ...base,
    ...autoAddressFields,
    [PaymentTermsFormKeys.PLAN]:
      chat.plan ?? base[PaymentTermsFormKeys.PLAN] ?? PlanTypeEnums.WEEKLY,
    [PaymentTermsFormKeys.TAX_RATE]:
      chat.taxRate != null && chat.taxRate !== ''
        ? Number(chat.taxRate)
        : (base[PaymentTermsFormKeys.TAX_RATE] ?? 0),
    [PaymentTermsFormKeys.HOLIDAY_MULTIPLIER]:
      chat.holidayMultiplier === 'skip' ||
      chat.holidayMultiplier === '' ||
      chat.holidayMultiplier == null
        ? null
        : Number(chat.holidayMultiplier ?? base[PaymentTermsFormKeys.HOLIDAY_MULTIPLIER]),
    [PaymentTermsFormKeys.HOLIDAY_GROUP]: resolveHolidayGroup(
      chat.holidayGroup,
      base[PaymentTermsFormKeys.HOLIDAY_GROUP],
    ),
    [PaymentTermsFormKeys.CYCLE_REF_DATE]:
      chat.cycleRefDate ?? base[PaymentTermsFormKeys.CYCLE_REF_DATE],
    [PaymentTermsFormKeys.PAYMENT_DATE]:
      paymentDateOption ||
      base[PaymentTermsFormKeys.PAYMENT_DATE] ||
      toDropdownValue('30', 'Net 30'),
    [PaymentTermsFormKeys.PAYMENT_METHOD]:
      paymentMethodOption ||
      (base[PaymentTermsFormKeys.PAYMENT_METHOD]?.value != null &&
      base[PaymentTermsFormKeys.PAYMENT_METHOD]?.value !== ''
        ? base[PaymentTermsFormKeys.PAYMENT_METHOD]
        : null) ||
      toDropdownValue('1', 'Check'),
    [PaymentTermsFormKeys.ANNUAL_RATE_INCREASE]:
      chat.annualRateIncrease != null && chat.annualRateIncrease !== ''
        ? Number(chat.annualRateIncrease)
        : (base[PaymentTermsFormKeys.ANNUAL_RATE_INCREASE] ?? 0),
    [PaymentTermsFormKeys.BILLING_TYPE]:
      billingTypeOption ||
      base[PaymentTermsFormKeys.BILLING_TYPE] ||
      toDropdownValue('1', 'Recurring'),
    [PaymentTermsFormKeys.CONTRACT_TYPE]:
      contractTypeOption ||
      base[PaymentTermsFormKeys.CONTRACT_TYPE] ||
      toDropdownValue('1', 'Standard'),
    [PaymentTermsFormKeys.BILLING_FREQUENCY]:
      base[PaymentTermsFormKeys.BILLING_FREQUENCY] || toDropdownValue('1', 'Weekly'),
    [PaymentTermsFormKeys.BILLING_OWNER_FIRST_NAME]: billingOwnerFirstName,
    [PaymentTermsFormKeys.BILLING_OWNER_LAST_NAME]: billingOwnerLastName,
    [PaymentTermsFormKeys.BILLING_OWNER_EMAIL]: billingOwnerEmail,
    [PaymentTermsFormKeys.BILLING_OWNER_PHONE]: billingOwnerPhone,
    [PaymentTermsFormKeys.BILLING_ADDRESS_OPTION]: billingAddressOption,
    [PaymentTermsFormKeys.ADDRESS]:
      chat.address ??
      autoAddressFields[PaymentTermsFormKeys.ADDRESS] ??
      base[PaymentTermsFormKeys.ADDRESS],
    [PaymentTermsFormKeys.CITY]:
      chat.city ?? autoAddressFields[PaymentTermsFormKeys.CITY] ?? base[PaymentTermsFormKeys.CITY],
    [PaymentTermsFormKeys.STATE]:
      chat.state ??
      autoAddressFields[PaymentTermsFormKeys.STATE] ??
      base[PaymentTermsFormKeys.STATE],
    [PaymentTermsFormKeys.COUNTRY]:
      chat.country ??
      autoAddressFields[PaymentTermsFormKeys.COUNTRY] ??
      base[PaymentTermsFormKeys.COUNTRY],
    [PaymentTermsFormKeys.COUNTRY_CODE]:
      autoAddressFields[PaymentTermsFormKeys.COUNTRY_CODE] ??
      base[PaymentTermsFormKeys.COUNTRY_CODE],
    [PaymentTermsFormKeys.POSTAL_CODE]:
      chat.postalCode ??
      autoAddressFields[PaymentTermsFormKeys.POSTAL_CODE] ??
      base[PaymentTermsFormKeys.POSTAL_CODE],
  });
};

export const buildOnDemandFormData = (collected, apiData) => {
  const existing = [...(apiData?.[ActiveStepsKeys.ON_DEMAND_SERVICES] || [])];
  const chat = collected.onDemandServices || {};

  const updated = existing.map((service) => {
    if (service.title !== systemServicesConstant.DISPATCH_REQUEST) return service;

    const dispatchOption = chat.dispatchOption;
    const dispatchRateOption = [
      { label: 'Flat Rate', value: dispatchOptionEnums.flatRate },
      { label: 'Charge Per Alarm', value: dispatchOptionEnums.chargePerAlarm },
      { label: 'Non-Billable', value: dispatchOptionEnums.nonBillable },
    ].find((o) => o.value === dispatchOption);

    return {
      ...service,
      dispatchRate: dispatchRateOption || service.dispatchRate,
      price: chat.price ?? service.price,
      peakHoursPrice: chat.peakHoursPrice ?? service.peakHoursPrice,
      ...(dispatchOption === dispatchOptionEnums.flatRate && chat.dispatchRate != null
        ? { price: chat.dispatchRate }
        : {}),
    };
  });

  const customServices = (chat.customServices || []).map((custom) => ({
    title: custom.title,
    price: Number(custom.price),
    quantity: Number(custom.quantity),
    rate: 0,
    intent: intentTypes.CUSTOM,
  }));

  return [...updated, ...customServices];
};

export const buildDefaultDescriptionText = (apiData) => {
  const existing = apiData?.descriptions?.services || apiData?._demoDescriptionsForm?.services;
  if (typeof existing === 'string' && existing.trim()) {
    return existing;
  }

  const contractName = apiData?.details?.name || 'this proposal';
  return `<p>Security services for ${contractName} as outlined in this proposal, including personnel, scheduling, and billing terms agreed upon herein. Standard terms and conditions apply.</p>`;
};

export const buildDescriptionsFormData = (collected, apiData) => {
  const text = collected.descriptions?.services || buildDefaultDescriptionText(apiData);
  const existing = apiData?.descriptions;

  return {
    services: text ? convertToDraft(text) : existing?.services || EditorState.createEmpty(),
  };
};

export const buildSalesRepSignee = (currentUser) => ({
  name: currentUser?.name || 'Demo User',
  title: 'Sales Rep',
  email: currentUser?.email || '',
});

export const buildSigneesFormData = (collected, apiData, context = {}) => {
  const editData = getEditData(
    apiData?.[ActiveStepsKeys.SIGNEES],
    ActiveStepsKeys.SIGNEES,
    apiData,
  );

  let signees = collected.signees?.length ? [...collected.signees] : [];
  const salesRep = buildSalesRepSignee(context.currentUser);

  if (!signees.length) {
    signees = [salesRep];
  } else if (signees[0]?.title !== 'Sales Rep') {
    signees = [salesRep, ...signees.filter((signee) => signee.email !== salesRep.email)];
  }

  return {
    ...editData,
    [ActiveStepsKeys.SIGNEES]: signees,
  };
};

export const buildFormDataForStep = (stepKey, collected, context) => {
  const {
    apiData,
    contractServicesState,
    baseRates,
    lineItems,
    franchisePreferences,
    contractName,
  } = context;

  switch (stepKey) {
    case ActiveStepsKeys.SERVICES:
      return buildServicesFormData(collected, contractServicesState, {
        baseRates,
        lineItems,
        contractName,
        apiData,
      });
    case ActiveStepsKeys.DEVICES:
      return buildDevicesFormData(collected, apiData, franchisePreferences);
    case ActiveStepsKeys.PAYMENT_TERMS:
      return buildPaymentTermsFormData(collected, apiData, context);
    case ActiveStepsKeys.ON_DEMAND_SERVICES:
      return buildOnDemandFormData(collected, apiData);
    case ActiveStepsKeys.DESCRIPTIONS:
      return buildDescriptionsFormData(collected, apiData);
    case ActiveStepsKeys.SIGNEES:
      return buildSigneesFormData(collected, apiData, context);
    default:
      return null;
  }
};

export const validateStepData = async (stepKey, formData, context) => {
  const { apiData, enableOccurences, stripeEnabled, t } = context;

  if (stepKey === ActiveStepsKeys.DEVICES || stepKey === ActiveStepsKeys.DESCRIPTIONS) {
    return null;
  }

  const dataToValidate = getValidateFormData(
    formData,
    stepKey,
    apiData,
    enableOccurences,
    stripeEnabled,
  );

  let errors = await joiValidateErrors({ data: dataToValidate, t });

  if (stepKey === ActiveStepsKeys.PAYMENT_TERMS) {
    const holidayErrors = getPaymentTermsHolidayValidationErrors(
      dataToValidate?.[ActiveStepsKeys.PAYMENT_TERMS],
      t,
      apiData?.details?.stripeEnabled,
    );
    if (holidayErrors) {
      errors = { ...(errors || {}), ...holidayErrors };
    }
  }

  if (stepKey === ActiveStepsKeys.SERVICES) {
    if (!formData?.timezone || typeof formData.timezone !== 'object') {
      return {
        timezone: 'Contract timezone is missing. Please set it on the contract before saving.',
      };
    }

    const timeErrors = getServicesTimeFieldErrors(formData.services, t);
    if (timeErrors) {
      errors = { ...(errors || {}), ...timeErrors };
    }

    errors = stripOptionalScheduleValidationErrors(errors);
  }

  return errors;
};

const toErrorMessage = (error) => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  if (error?.message) return String(error.message);
  try {
    return JSON.stringify(error);
  } catch {
    return 'Something went wrong. Please try again.';
  }
};

export const submitStep = async (stepKey, collected, context) => {
  const { dealId, setData, stripeEnabled, taxExemptionEnabled } = context;

  try {
    const formData = buildFormDataForStep(stepKey, collected, context);
    const errors = await validateStepData(stepKey, formData, context);

    if (errors && Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      throw new Error(
        typeof firstError === 'string'
          ? firstError
          : 'Validation failed. Please check your answers.',
      );
    }

    const payload = await getPayload(
      formData,
      stepKey,
      context.apiData,
      stripeEnabled,
      taxExemptionEnabled,
    );

    if (stepKey === ActiveStepsKeys.SERVICES && formData?.services) {
      payload._demoFormServices = formData.services;
      payload._demoSavedStep = ActiveStepsKeys.SERVICES;
    }

    if (stepKey === ActiveStepsKeys.PAYMENT_TERMS) {
      payload._demoPaymentTermsForm = formData;
      payload._demoSavedStep = ActiveStepsKeys.PAYMENT_TERMS;
    }

    if (stepKey === ActiveStepsKeys.DEVICES && Array.isArray(formData)) {
      payload._demoFormDevices = formData;
      payload._demoSavedStep = ActiveStepsKeys.DEVICES;
    }

    if (stepKey === ActiveStepsKeys.ON_DEMAND_SERVICES) {
      payload._demoSavedStep = ActiveStepsKeys.ON_DEMAND_SERVICES;
    }

    if (stepKey === ActiveStepsKeys.DESCRIPTIONS && formData?.services) {
      payload._demoDescriptionsForm = {
        services: convertDataToHtml(formData.services),
      };
      payload._demoSavedStep = ActiveStepsKeys.DESCRIPTIONS;
    }

    if (stepKey === ActiveStepsKeys.SIGNEES && formData?.[ActiveStepsKeys.SIGNEES]) {
      payload._demoSigneesForm = formData[ActiveStepsKeys.SIGNEES];
      payload._demoSavedStep = ActiveStepsKeys.SIGNEES;
    }

    const response = await updateContract(dealId, payload);

    if (response?.statusCode === 200) {
      if (stepKey === ActiveStepsKeys.SERVICES && context.syncServicesToRedux) {
        context.syncServicesToRedux(formData);
      }
      setData(response?.data?.contract);
      return { response, formData };
    }

    throw new Error(response?.message || 'Failed to save contract step.');
  } catch (error) {
    if (error?.message?.includes('Invalid time')) {
      throw new Error('Please enter valid start and end times (e.g. 9:00 AM and 5:00 PM).');
    }
    throw new Error(toErrorMessage(error));
  }
};

export const buildDeviceListFromPreferences = (franchisePreferences) => {
  const devices = franchisePreferences?.devices || [];
  return devices.map((device) => ({
    obxId: device.id,
    name: device.key,
    slug: device.slug,
    price: device.rateValue,
    image: device.image,
  }));
};
