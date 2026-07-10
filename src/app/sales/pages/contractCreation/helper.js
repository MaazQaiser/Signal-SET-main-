import { convertDataToHtml } from 'commonComponents/richText';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import {
  FormKeys as ServicesFormKeys,
  getCurrentDate,
  getDefaultServicesData,
  getServicesData,
  hydrateFormReadyServices,
  isTimeSameOrBefore,
  repeatModes,
  ServicesTimeError,
  serviceTypes,
  slugs,
  visitTypes,
} from 'src/app/components/salesComponents/contractCreation/addServices/helper';
import {
  dispatchOptionEnums,
  FormKeys as OnDemandSystemServiceFormKeys,
  MONTHLY_RATE as ON_DEMAND_MONTHLY_RATE,
  systemServicesConstant,
} from 'src/app/components/salesComponents/contractCreation/onDemandServices/systemService';
import {
  BillingAddressOptions,
  FormKeys,
  FormKeys as PaymentTermsFormKeys,
  PlanTypeEnums,
} from 'src/app/components/salesComponents/contractCreation/paymentTerms/helper';
import {
  getDateDifference,
  isObjectEmpty,
  removeKeysFromObject,
} from 'src/helper/utilityFunctions';
import { proposalTypeEnum, SelectedDateTpeContract, stageStatus } from 'src/utils/constants';
import { convertMMDDYYYYToDayJsDate, formatDayJsDate } from 'src/utils/passTime/time';

export const ActiveStepsKeys = {
  SERVICES: 'services',
  DEVICES: 'devices',
  ON_DEMAND_SERVICES: 'onDemandServices',
  PAYMENT_TERMS: 'paymentTerms',
  DESCRIPTIONS: 'descriptions',
  CONFIGURATION: 'configuration',
  SIGNEES: 'signees',
};

export const BillingAddressSource = {
  LOCATION: 'location',
  COMPANY: 'company',
  OTHER: 'other',
};

export const ActiveSteps = [...Object.values(ActiveStepsKeys)];

const hasFormReadyServices = (services) =>
  Array.isArray(services) &&
  services.length > 0 &&
  services.every((service) => {
    const type = service?.type || service?.serviceType;
    const officerType = service?.officerType;
    return type && officerType?.value != null && officerType?.value !== '' && officerType?.label;
  });

export const defaultSteps = [
  {
    name: 'Services',
    subtext: 'Add services of this proposal',
    value: ActiveStepsKeys.SERVICES,
    status: stageStatus.CURRENT,
  },
  {
    name: 'Devices',
    subtext: 'Choose devices for checkpoints',
    value: ActiveStepsKeys.DEVICES,
    status: stageStatus.PENDING,
  },
  {
    name: 'On Demand',
    subtext: 'Add services of this proposal',
    value: ActiveStepsKeys.ON_DEMAND_SERVICES,
    status: stageStatus.PENDING,
  },
  {
    name: 'Payment Terms',
    subtext: 'Set payment preferences',
    value: ActiveStepsKeys.PAYMENT_TERMS,
    status: stageStatus.PENDING,
  },
  {
    name: 'Description',
    subtext: 'Terms & conditions for proposals',
    value: ActiveStepsKeys.DESCRIPTIONS,
    status: stageStatus.PENDING,
  },
  {
    name: 'Signees',
    subtext: 'Add/choose signees for contract',
    value: ActiveStepsKeys.SIGNEES,
    status: stageStatus.PENDING,
  },
];

const getServicesPayload = (formData) => {
  return {
    name: formData.name,
    timezone: formData.timezone?.id,
    startDate: formatDayJsDate(formData.startDate, 'date'),
    endDate: formatDayJsDate(formData.endDate, 'date'),
    [ActiveStepsKeys.SERVICES]: formData[ActiveStepsKeys.SERVICES]?.map((service) => ({
      ...service,
      officerType: service.officerType?.id,
      lineItem: service?.lineItem?.value,
      [ServicesFormKeys.SERVICE_START_DATE]: formatDayJsDate(
        service?.[ServicesFormKeys.SERVICE_START_DATE],
        'date',
      ),
      instructions: convertDataToHtml(service?.instructions),
      hourlyRate: Number(service?.hourlyRate),
      [ServicesFormKeys.PRICE_PER_HIT]:
        service?.[ServicesFormKeys.PRICE_PER_HIT] ||
        (() => {
          return service.visits.reduce((serviceTotal, visit) => {
            const visitProductTotal = (visit?.[ServicesFormKeys.PRODUCTS] || []).reduce(
              (visitTotal, product) => {
                const rate = parseFloat(product?.[ServicesFormKeys.PRODUCT_RATE]) || 0;
                const quantity = parseInt(product?.[ServicesFormKeys.PRODUCT_QUANTITY]) || 0;
                return visitTotal + rate * quantity;
              },
              0,
            );
            return serviceTotal + visitProductTotal;
          }, 0);
        })(),
      visits: service.visits.map((visit) => ({
        ...visit,
        reqOfficers: Number(visit.reqOfficers),
        startTime: formatDayJsDate(visit?.startTime, 'time'),
        endTime: formatDayJsDate(visit?.endTime, 'time'),
        [ServicesFormKeys.REPEAT_AFTER_TENURE]:
          visit?.[ServicesFormKeys.REPEAT_AFTER_TENURE]?.value || null,
        [ServicesFormKeys.NUMBER_OF_VISITS]:
          visit?.[ServicesFormKeys.REPEAT_MODE] === repeatModes?.EVERY_WEEK
            ? visit?.[ServicesFormKeys.NUMBER_OF_VISITS]
            : 1 || null,
        [ServicesFormKeys.PRODUCTS]: visit?.[ServicesFormKeys.PRODUCTS]?.map((product) => ({
          productId: product?.productId || product?.[ServicesFormKeys?.PRODUCT_NAME]?.id,
          [ServicesFormKeys.PRODUCT_NAME]: product?.[ServicesFormKeys?.PRODUCT_NAME]?.value,
          [ServicesFormKeys.PRODUCT_RATE]: parseFloat(product?.[ServicesFormKeys?.PRODUCT_RATE]),
          [ServicesFormKeys.PRODUCT_QUANTITY]: parseInt(
            product?.[ServicesFormKeys?.PRODUCT_QUANTITY],
          ),
        })),
      })),
      includeVehicle: service?.includeVehicle,
      ...(service?.includeVehicle
        ? {
            noOfVehicles: Number(service?.noOfVehicles),
            vehicleRate: Number(service?.vehicleRate),
          }
        : {}),
    })),
  };
};

const getDevicesPayload = (formData) => {
  return {
    [ActiveStepsKeys.DEVICES]: formData.map((device) => ({ ...device, price: device.price || 0 })),
  };
};

const convertFileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const getPaymentTermsPayload = async (data, stripeEnabled = false, taxExemptionEnabled = false) => {
  const hasHolidayGroup = data?.holidayGroup?.value != null && data?.holidayGroup?.value !== '';
  const holidayGroupId = hasHolidayGroup ? Number(data.holidayGroup.value) : null;

  const payload = {
    ...data,
    planId: Number.isNaN(Number(data.plan)) ? data?.plan : Number(data.plan),
    paymentMethodId: Number(data?.paymentMethod?.value ?? 1),
    holidayGroupId: Number.isNaN(holidayGroupId) ? null : holidayGroupId,
    holidays: data?.holidayGroup?.holidays,
    paymentDateId: Number(data?.paymentDate?.value ?? 30),
    billingTypeId:
      data?.billingTypeId != null
        ? Number(data.billingTypeId)
        : Number(data?.billingType?.value ?? 1),
    contractType: Number(data?.contractType?.value ?? 1),
    fuelSurcharge: data.fuelSurcharge ? Number(data.fuelSurcharge) : null,
    taxRate: data.taxRate ? Number(data.taxRate) : null,
    flatRate: Number(data.flatRate ?? 0),
    hasDifferentBillingAddress: data.hasDifferentBillingAddress, // Keep for backward compatibility
    billingAddressSource:
      data.billingAddressOption === BillingAddressOptions.PROPERTY
        ? BillingAddressSource.LOCATION
        : data.billingAddressOption === BillingAddressOptions.COMPANY
          ? BillingAddressSource.COMPANY
          : data.billingAddressOption === BillingAddressOptions.OTHER
            ? BillingAddressSource.OTHER
            : data.hasDifferentBillingAddress
              ? BillingAddressSource.OTHER
              : BillingAddressSource.LOCATION,
    billingFrequency: Number(data?.billingFrequency?.value ?? 1),
    ...(taxExemptionEnabled && {
      taxExempt: Boolean(data?.exemptTax),
    }),
    ...(stripeEnabled && {
      customDiscountAmount: data?.customDiscountAmount ? Number(data.customDiscountAmount) : null,
      customDiscountPercentage: data?.customDiscountPercentage
        ? Number(data.customDiscountPercentage)
        : null,
    }),
    address: {
      streetAddress: data.address,
      country: data.country,
      state: data.state,
      city: data.city,
      countryCode: data.countryCode,
      postalCode: data.postalCode,
    },
  };

  if (data.plan !== PlanTypeEnums.FLAT) delete payload.flatRate;

  // if (data.plan === PlanTypeEnums.FLAT) payload.fuelSurcharge = 0;

  delete payload.billingType;
  delete payload.plan;
  delete payload.paymentMethod;
  delete payload.paymentDate;
  delete payload.holidayGroup;
  delete payload.exemptTax;
  delete payload.taxAdjustment;

  if (taxExemptionEnabled) {
    const isTaxExempt = Boolean(data?.exemptTax);
    const taxExemptFile =
      isTaxExempt && data?.taxAdjustment instanceof File ? data.taxAdjustment : null;

    if (taxExemptFile) {
      const base64 = await convertFileToBase64(taxExemptFile);
      payload.taxAdjustment = { value: 0, file: base64 };
    } else {
      payload.taxAdjustment = null;
    }
  }

  return { [ActiveStepsKeys.PAYMENT_TERMS]: payload };
};

const getOnDemandServicesPayload = (formData) => {
  return {
    [ActiveStepsKeys.ON_DEMAND_SERVICES]: formData.map((onDemandService) => ({
      ...onDemandService,
      price: Number(onDemandService.price),
      quantity: Number(onDemandService.quantity),
      dispatchRate: onDemandService?.dispatchRate?.value || null,
    })),
  };
};

const getDescriptionsPayload = (formData) => {
  return {
    [ActiveStepsKeys.DESCRIPTIONS]: { services: convertDataToHtml(formData?.services) },
  };
};

const getConfigurationPayload = (formData) => {
  const signees = formData?.[ActiveStepsKeys.SIGNEES];
  return { [ActiveStepsKeys.CONFIGURATION]: Array.isArray(signees) ? [...signees] : [] };
};

export const getPayload = async (
  formData,
  key,
  apiData,
  stripeEnabled = false,
  taxExemptionEnabled = false,
) => {
  let payload = {};
  switch (key) {
    case ActiveStepsKeys.SERVICES:
      payload = getServicesPayload(formData);
      break;
    case ActiveStepsKeys.DEVICES:
      payload = getDevicesPayload(formData);
      break;
    case ActiveStepsKeys.PAYMENT_TERMS:
      payload = await getPaymentTermsPayload(formData, stripeEnabled, taxExemptionEnabled);
      break;
    case ActiveStepsKeys.ON_DEMAND_SERVICES:
      payload = getOnDemandServicesPayload(formData, apiData);
      break;
    case ActiveStepsKeys.DESCRIPTIONS:
      payload = getDescriptionsPayload(formData);
      break;
    case ActiveStepsKeys.SIGNEES:
      payload = getConfigurationPayload(formData);
      break;
  }
  return payload;
};

export const getServicesApiData = (
  apiData,
  baseRates,
  lineItems,
  tenantInfo = null,
  _productsOptions = [],
  enableOccurences = false,
) => {
  const details = apiData?.details;

  const doesServicesExist = hasFormReadyServices(apiData?.[ActiveStepsKeys.SERVICES]);

  const selectedDateType =
    details?.selectedDateType === SelectedDateTpeContract.oneTime ? 'endDate' : 'renewalDate';

  const startEndDates = details?.startDate
    ? {
        startDate: convertMMDDYYYYToDayJsDate(details?.startDate, false),
        endDate: convertMMDDYYYYToDayJsDate(details?.endDate, false),
      }
    : {};

  const actualContractDates =
    details?.actualContractDates && details?.actualContractDates?.start
      ? {
          startDate: convertMMDDYYYYToDayJsDate(
            dayjs(details?.actualContractDates?.start).format('YYYY/MM/DD'),
            false,
          ),
          endDate: convertMMDDYYYYToDayJsDate(
            dayjs(details?.actualContractDates?.end).format('YYYY/MM/DD'),
            false,
          ),
        }
      : {};

  const apiTimezone = apiData?.details?.timezone;
  const timezone =
    apiTimezone?.id || apiTimezone?.value
      ? {
          value: String(apiTimezone.id ?? apiTimezone.value),
          label: apiTimezone.name ?? apiTimezone.label ?? '',
        }
      : null;

  const services = apiData?.[ActiveStepsKeys.SERVICES];
  const hasServicesArray = Array.isArray(services) && services.length > 0;

  if (!hasServicesArray) {
    return {
      ...startEndDates,
      timezone,
      [ActiveStepsKeys.SERVICES]: [
        getDefaultServicesData(0, tenantInfo, enableOccurences, details?.startDate),
      ],
      selectedDateType,
      renewalReminderDays: selectedDateType === 'renewalDate' ? details?.renewalReminderDays : null,
      autoRenewal: selectedDateType === 'renewalDate' ? details?.autoRenewal : null,
      type: details?.type,
      actualContractDates,
      proposalType: details?.proposalType,
    };
  }

  const normalizedServices = doesServicesExist
    ? hydrateFormReadyServices(services)
    : getServicesData(
        services,
        baseRates,
        lineItems,
        _productsOptions,
        enableOccurences,
        details?.startDate,
      );

  return {
    ...(details?.startDate
      ? {
          startDate: convertMMDDYYYYToDayJsDate(details?.startDate, false),
          endDate: convertMMDDYYYYToDayJsDate(details?.endDate, false),
        }
      : {}),
    timezone,
    [ActiveStepsKeys.SERVICES]: normalizedServices,
    selectedDateType,
    renewalReminderDays: selectedDateType === 'renewalDate' ? details.renewalReminderDays : null,
    autoRenewal: selectedDateType === 'renewalDate' ? details?.autoRenewal : null,
    type: details?.type,
    actualContractDates,
    proposalType: details?.proposalType,
  };
};

const getConfigurationEditData = (formData, details = {}) => {
  const { phoneNumber, fax, email, licenseNumber } = details;
  return {
    phoneNumber,
    fax,
    email,
    licenseNumber,
    [ActiveStepsKeys.SIGNEES]: formData,
  };
};

export const getEditData = (formData, key, apiData) => {
  const details = apiData?.details;

  if (key === ActiveStepsKeys.SIGNEES) return getConfigurationEditData(formData, details);

  if (key === ActiveStepsKeys.PAYMENT_TERMS && apiData?._demoPaymentTermsForm) {
    const paymentTermsMeta = apiData?.paymentTerms ?? {};
    return {
      servicesPlans: paymentTermsMeta.servicesPlans || {},
      dispatchPlans: paymentTermsMeta.dispatchPlans || null,
      visitorManagementPlans: paymentTermsMeta.visitorManagementPlans || null,
      loadManagementPlans: paymentTermsMeta.loadManagementPlans || null,
      lineItems: paymentTermsMeta.lineItems || [],
      availablePlans: paymentTermsMeta.availablePlans || [0, 1, 2, 4],
      billingContact: apiData?.billingContact ?? paymentTermsMeta.billingContact ?? null,
      ...apiData._demoPaymentTermsForm,
    };
  }

  if (key === ActiveStepsKeys.DEVICES && Array.isArray(apiData?._demoFormDevices)) {
    return apiData._demoFormDevices;
  }

  if (key === ActiveStepsKeys.DESCRIPTIONS && apiData?._demoDescriptionsForm) {
    return apiData._demoDescriptionsForm;
  }

  if (key === ActiveStepsKeys.SIGNEES && Array.isArray(apiData?._demoSigneesForm)) {
    return getConfigurationEditData(apiData._demoSigneesForm, details);
  }

  return formData;
};

const emptyStateBaseRates = {
  [slugs.ARMED_OFFICER]: 0,
  [slugs.PATROL_OFFICER]: 0,
  [slugs.DEDICATED_OFFICER]: 0,
  [slugs.VISITOR_MANAGEMENT]: 0,
  [slugs.LOAD_MANAGEMENT]: 0,
};

export const useBaseRates = (preferences) => {
  const [baseRates, setBaseRates] = useState({ ...emptyStateBaseRates });
  useEffect(() => {
    if (preferences) calculateBaseRates();
  }, [preferences]);

  const calculateBaseRates = () => {
    let newBaseRates = {
      ...emptyStateBaseRates,
    };
    preferences?.generalServices?.forEach((preference) => {
      newBaseRates[preference.slug] = preference.rateValue;
    });
    preferences?.extraServices?.forEach((preference) => {
      newBaseRates[preference.slug] = preference.rateValue;
    });

    setBaseRates({ ...baseRates, ...newBaseRates });
  };

  return baseRates;
};

const getValidateServices = (formData, enableOccurences) => {
  const shouldValidateDates = formData?.startDate || formData?.endDate;
  return {
    timezone: formData.timezone,
    ...(shouldValidateDates
      ? {
          startDate: formatDayJsDate(formData?.startDate, 'date'),
          endDate: formatDayJsDate(formData?.endDate, 'date'),
        }
      : {}),
    [ActiveStepsKeys.SERVICES]: formData[ActiveStepsKeys.SERVICES].map((service) => {
      const updatedService = { ...service };
      if (!enableOccurences) {
        delete updatedService[ServicesFormKeys.SERVICE_START_DATE];
      }
      const visits = updatedService.visits.map((visit) => {
        const updatedVisit = {
          ...visit,
          startTime: formatDayJsDate(visit.startTime || null, 'time'),
          endTime: formatDayJsDate(visit.endTime || null, 'time'),
          ...(visit[ServicesFormKeys.REPEAT_MODE] === repeatModes.REPEAT_AFTER
            ? {
                [ServicesFormKeys.REPEAT_AFTER_TENURE]:
                  visit?.[ServicesFormKeys.REPEAT_AFTER_TENURE]?.value || null,
              }
            : {}),
          // ...(visit[ServicesFormKeys.REPEAT_MODE] === repeatModes.REPEAT_AFTER
          //   ? {
          //       [ServicesFormKeys.PRODUCTS]: visit?.[ServicesFormKeys.PRODUCTS]?.map((product) => ({
          //         ...product,
          //         [ServicesFormKeys.PRODUCT_NAME]: product?.[ServicesFormKeys?.PRODUCT_NAME]?.value,
          //       })),
          //     }
          //   : {}),
        };

        if (enableOccurences) {
          updatedVisit[ServicesFormKeys.NUMBER_OF_VISITS] = 1;
          updatedVisit[ServicesFormKeys.REPEAT_AFTER_FREQUENCY] =
            updatedVisit[ServicesFormKeys.REPEAT_AFTER_FREQUENCY]?.toString();
        }

        if (updatedVisit.visitType === visitTypes.FIXED) delete updatedVisit.endTime;

        if (visit[ServicesFormKeys.REPEAT_MODE] === repeatModes.EVERY_WEEK) {
          delete updatedVisit?.[ServicesFormKeys?.REPEAT_AFTER_FREQUENCY];
          delete updatedVisit?.[ServicesFormKeys?.REPEAT_AFTER_TENURE];
        }

        if (!enableOccurences) {
          delete updatedVisit?.[ServicesFormKeys?.PRODUCTS];
        }

        return updatedVisit;
      });

      return {
        ...updatedService,
        officerType: !isObjectEmpty(updatedService.officerType)
          ? { ...updatedService.officerType }
          : null,
        lineItem: updatedService?.lineItem?.value || null,
        ...(enableOccurences ? { pricePerHit: 1 } : {}),
        ...(enableOccurences || updatedService?.[ServicesFormKeys.SERVICE_START_DATE]
          ? {
              [ServicesFormKeys.SERVICE_START_DATE]: formatDayJsDate(
                updatedService?.[ServicesFormKeys.SERVICE_START_DATE],
                'date',
              ),
            }
          : {}),
        visits,
        ...(updatedService?.type === serviceTypes.DEDICATED && updatedService?.includeVehicle
          ? {
              noOfVehicles: updatedService?.noOfVehicles,
              vehicleRate: updatedService?.vehicleRate,
            }
          : {}),
      };
    }),
  };
};

const getValidateConfiguration = ({ phoneNumber, email, fax, licenseNumber }) => {
  return {
    ...(phoneNumber && { phoneNumber }),
    ...(email && { email }),
    ...(fax && { fax }),
    ...(licenseNumber && { licenseNumber }),
  };
};

const getValidatePaymentTerms = (formData, isStripeEnabled = false) => {
  let paymentTerms = {
    ...formData,
    paymentMethod:
      formData?.paymentMethod?.value != null ? JSON.stringify(formData.paymentMethod.value) : '',
    holidayGroup:
      formData?.holidayGroup?.value != null ? JSON.stringify(formData.holidayGroup.value) : '',
    paymentDate:
      formData?.paymentDate?.value != null
        ? JSON.stringify(Number(formData.paymentDate.value))
        : '',
    billingType:
      formData?.billingType?.value != null ? JSON.stringify(formData.billingType.value) : '',
    contractType:
      formData?.contractType?.value != null ? JSON.stringify(formData.contractType.value) : '',
  };

  if (paymentTerms.plan !== PlanTypeEnums.FLAT)
    paymentTerms = removeKeysFromObject(paymentTerms, ['flatRate']);

  if (paymentTerms.plan === PlanTypeEnums.FLAT)
    paymentTerms = removeKeysFromObject(paymentTerms, ['fuelSurcharge']);

  if (isStripeEnabled) {
    const isPerServiceCompletion = Number(paymentTerms?.billingTypeId) === 1;
    if (isPerServiceCompletion) {
      paymentTerms = removeKeysFromObject(paymentTerms, [FormKeys.PLAN]);
    } else if (!paymentTerms?.[FormKeys.PLAN]) {
      paymentTerms[FormKeys.PLAN] = '';
    }
  }

  // Only remove address fields if billing_address_source is not "other"
  const getBillingSource = (billingAddressOption) => {
    if (!billingAddressOption) return null;
    if (billingAddressOption === BillingAddressOptions.PROPERTY)
      return BillingAddressSource.LOCATION;
    if (billingAddressOption === BillingAddressOptions.COMPANY) return BillingAddressSource.COMPANY;
    if (billingAddressOption === BillingAddressOptions.OTHER) return BillingAddressSource.OTHER;
    // If already in backend format, return as is
    if (
      billingAddressOption === BillingAddressSource.LOCATION ||
      billingAddressOption === BillingAddressSource.COMPANY ||
      billingAddressOption === BillingAddressSource.OTHER
    ) {
      return billingAddressOption;
    }
    return null;
  };

  const billingSource =
    getBillingSource(paymentTerms.billingAddressOption) ||
    (paymentTerms.hasDifferentBillingAddress
      ? BillingAddressSource.OTHER
      : BillingAddressSource.LOCATION);
  if (billingSource !== BillingAddressSource.OTHER)
    paymentTerms = removeKeysFromObject(paymentTerms, [
      FormKeys.ADDRESS,
      FormKeys.CITY,
      FormKeys.STATE,
      FormKeys.COUNTRY,
      FormKeys.COUNTRY_CODE,
      FormKeys.POSTAL_CODE,
    ]);

  if (isStripeEnabled) {
    paymentTerms[FormKeys.BILLING_METHOD] = formData?.[FormKeys.BILLING_METHOD]?.id
      ? formData?.[FormKeys.BILLING_METHOD]?.id?.toString()
      : null;
  }

  if (isStripeEnabled) {
    // here write this function to remove the keys from the object
    paymentTerms = removeKeysFromObject(paymentTerms, [
      FormKeys.PAYMENT_METHOD,
      FormKeys.HOLIDAY_GROUP,
      FormKeys.BILLING_TYPE,
      FormKeys.CONTRACT_TYPE,
      FormKeys.PAYMENT_DATE,
      FormKeys.CYCLE_REF_DATE,
      // FormKeys.ANNUAL_RATE_INCREASE,
      FormKeys.HOLIDAY_MULTIPLIER,
    ]);
  }
  return {
    [ActiveStepsKeys.PAYMENT_TERMS]: paymentTerms,
  };
};

const getValidatePayloadOnDemandServices = (formData, apiData) => {
  const onDemandServices = formData?.map((service) => {
    if (service?.title === systemServicesConstant.DISPATCH_REQUEST) {
      let dispatchRateValue = service?.dispatchRate?.value;
      if (dispatchRateValue === dispatchOptionEnums.nonBillable)
        service = removeKeysFromObject(service, [
          OnDemandSystemServiceFormKeys.price,
          OnDemandSystemServiceFormKeys.peakHoursPrice,
        ]);
      if (dispatchRateValue === dispatchOptionEnums.flatRate)
        service = removeKeysFromObject(service, [OnDemandSystemServiceFormKeys.peakHoursPrice]);
      if (apiData?.details?.proposalType === proposalTypeEnum.dispatch && !dispatchRateValue) {
        dispatchRateValue = '';
      }
      if (!service?.peakHoursPrice)
        service = removeKeysFromObject(service, [OnDemandSystemServiceFormKeys.peakHoursPrice]);
      return {
        ...service,
        dispatchRate: dispatchRateValue,
      };
    }
    return { ...service };
  });
  return {
    [ActiveStepsKeys.ON_DEMAND_SERVICES]: onDemandServices,
  };
};

export const getValidateFormData = (
  formData,
  activeTabKey,
  apiData,
  enableOccurences,
  stripeEnabled,
) => {
  if (activeTabKey === ActiveStepsKeys.SERVICES)
    return { ...getValidateServices(formData, enableOccurences) };
  if (activeTabKey === ActiveStepsKeys.ON_DEMAND_SERVICES)
    return getValidatePayloadOnDemandServices(formData, apiData);
  if (activeTabKey === ActiveStepsKeys.SIGNEES) return getValidateConfiguration(formData);
  if (activeTabKey === ActiveStepsKeys.PAYMENT_TERMS)
    return getValidatePaymentTerms(formData, stripeEnabled);

  return { [activeTabKey]: formData };
};

export const getPaymentTermsHolidayValidationErrors = (_paymentTermsData, _t, _isStripeEnabled) => {
  // Holiday group/multiplier pairing is optional in chat-driven and manual flows.
  return null;
};

export const getViewDisabledContractClass = (isPublished) =>
  isPublished ? 'viewDisabledContract' : '';

/**
 * @param {number} minutes
 * @param {function} t - i18n t() from useTranslation
 * @returns {string} localized duration (e.g. "30 mins", "1 hour and 15 mins")
 */
export const formatMinutes = (minutes, t) => {
  if (!t) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return mins === 1 ? `${mins} min` : `${mins} mins`;
    if (mins === 0) return hours === 1 ? `${hours} hour` : `${hours} hours`;
    const hourString = hours === 1 ? `${hours} hour` : `${hours} hours`;
    const minString = mins === 1 ? `${mins} min` : `${mins} mins`;
    return `${hourString} and ${minString}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return mins === 1
      ? t('sales.contract.durationMin', { count: mins })
      : t('sales.contract.durationMins', { count: mins });
  }
  if (mins === 0) {
    return hours === 1
      ? t('sales.contract.durationHour', { count: hours })
      : t('sales.contract.durationHours', { count: hours });
  }
  const hourPart =
    hours === 1
      ? t('sales.contract.durationHour', { count: hours })
      : t('sales.contract.durationHours', { count: hours });
  const minPart =
    mins === 1
      ? t('sales.contract.durationMin', { count: mins })
      : t('sales.contract.durationMins', { count: mins });
  return t('sales.contract.durationHoursAndMinutes', { hourPart, minPart });
};

/**
 * @param {Array} services
 * @param {function} t - i18n t() from useTranslation (optional; if omitted, English messages are used)
 */
export const getServicesTimeFieldErrors = (services, t) => {
  const errors = {};
  const currentDate = getCurrentDate();

  services.forEach((service, serviceIndex) => {
    service.visits.forEach((visit, visitIndex) => {
      const sTime = visit[ServicesFormKeys.START_TIME];
      const eTime = visit[ServicesFormKeys.END_TIME];

      if (
        !sTime ||
        !eTime ||
        !dayjs.isDayjs(sTime) ||
        !dayjs.isDayjs(eTime) ||
        !sTime.isValid() ||
        !eTime.isValid()
      ) {
        return;
      }

      const start = currentDate.set('hour', sTime.hour()).set('minute', sTime.minute());
      let end = currentDate.set('hour', eTime.hour()).set('minute', eTime.minute());

      if (isTimeSameOrBefore(end, start)) end = end.add('1', 'd');

      const minutesDiff = end.diff(start, 'minute');

      if (
        service[ServicesFormKeys.TYPE] === serviceTypes.PATROL &&
        visit[ServicesFormKeys.VISIT_TYPE] === visitTypes.FIXED
      ) {
        return;
      }

      if (service[ServicesFormKeys.TYPE] === serviceTypes.DEDICATED && minutesDiff < 30) {
        const key = `${ActiveStepsKeys.SERVICES},${serviceIndex},${ServicesFormKeys.VISITS},${visitIndex},${ServicesTimeError}`;
        errors[key] = t
          ? t('sales.contract.timeDurationMin30')
          : 'Start time and end time duration should be at least 30 mins';
        return;
      }

      const minVisitTimeRange = Number(visit[ServicesFormKeys.NUMBER_OF_VISITS]) * 15;

      if (
        service[ServicesFormKeys.TYPE] === serviceTypes.PATROL &&
        minutesDiff < minVisitTimeRange
      ) {
        const key = `${ActiveStepsKeys.SERVICES},${serviceIndex},${ServicesFormKeys.VISITS},${visitIndex},${ServicesTimeError}`;
        const duration = formatMinutes(minVisitTimeRange, t);
        errors[key] = t
          ? t('sales.contract.timeDurationMinDuration', { duration })
          : `Start time and end time duration should be at least ${formatMinutes(minVisitTimeRange)}`;
        return;
      }
    });
  });
  return Object.keys(errors).length ? errors : null;
};

export const getErrorKey = ({ activeStep, index, key }) => {
  return `${activeStep},${index},${key}`;
};

export const showError = ({ activeStep, index, key, errorMessages }) => {
  return errorMessages?.[`${getErrorKey({ activeStep, index, key })}`];
};
export const getNestedErrorKey = ({ activeStep, index, nestedFormDataKey, nestedIndex, key }) => {
  return `${activeStep},${index},${nestedFormDataKey},${nestedIndex},${key}`;
};

export const showNestedError = ({
  activeStep,
  index,
  nestedFormDataKey,
  nestedIndex,
  key,
  errorMessages,
}) => {
  return errorMessages?.[
    `${getNestedErrorKey({ activeStep, index, nestedFormDataKey, nestedIndex, key })}`
  ];
};

const normalizeContractPlanId = (raw) => {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'object') {
    const id = raw?.id;
    if (id === null || id === undefined || id === '') return null;
    return Number.isInteger(id) ? String(id) : String(id);
  }
  return Number.isInteger(raw) ? String(raw) : String(raw);
};

const isPaymentTermsFormData = (fd) =>
  Boolean(
    fd &&
    typeof fd === 'object' &&
    !Array.isArray(fd) &&
    Object.prototype.hasOwnProperty.call(fd, FormKeys.PLAN),
  );

export const getPlanId = (apiData, formData) => {
  /**
   * If StartDate does not exist that means dates are to be decided later
   * so we create a default plan of weekly payments
   * */
  const daysDifference = apiData?.details?.startDate
    ? getDateDifference(apiData?.details?.startDate, apiData?.details?.endDate)
    : 7;

  if (isPaymentTermsFormData(formData)) {
    const fromForm = normalizeContractPlanId(formData[FormKeys.PLAN]);
    if (fromForm !== null && fromForm !== '') {
      return fromForm;
    }
  }

  let apiPlanId = normalizeContractPlanId(apiData?.details?.plan);

  if (!apiPlanId) {
    return daysDifference < 7 ? PlanTypeEnums.EVENT : PlanTypeEnums.WEEKLY;
  }

  return apiPlanId;
};

export const getOnDemandTotal = (onDemandServices) => {
  if (!Array.isArray(onDemandServices)) return 0;
  return onDemandServices.reduce((acc, service) => {
    if (service.rate === ON_DEMAND_MONTHLY_RATE && !service._destroy) {
      if (service?.title === systemServicesConstant.DISPATCH_REQUEST) {
        // return service?.dispatchRate?.value === 'chargePerAlarm' ||
        //   service?.dispatchRate?.value === 'nonBillable'
        //   ? 0
        //   : acc + Number(service.price) * Number(service.quantity);
        return service?.dispatchRate?.value === dispatchOptionEnums.flatRate
          ? acc + Number(service.price) * Number(1)
          : acc;
      }

      return acc + Number(service.price) * Number(service.quantity);
    }
    return acc;
  }, 0);
};

export const PlanMultiplier = {
  [PlanTypeEnums.MONTHLY]: 4.35,
  [PlanTypeEnums.BI_WEEKLY]: 2,
  [PlanTypeEnums.WEEKLY]: 1,
  [PlanTypeEnums.EVENT]: 1,
  [PlanTypeEnums.FLAT]: 1,
};

export const PlanDivider = {
  [PlanTypeEnums.MONTHLY]: 1,
  [PlanTypeEnums.BI_WEEKLY]: 2,
  [PlanTypeEnums.WEEKLY]: 4.35,
  [PlanTypeEnums.EVENT]: 1,
  [PlanTypeEnums.FLAT]: 1,
};

export const getServicePlanTotal = (service, planTypeValue) => {
  const planCalc = service?.calculations?.[planTypeValue];
  const byPlan = Number(planCalc?.total ?? planCalc);
  if (Number.isFinite(byPlan) && byPlan > 0) return byPlan;

  const weeklyCalc = service?.calculations?.[PlanTypeEnums.WEEKLY];
  const weekly = Number(weeklyCalc?.total ?? weeklyCalc);
  if (Number.isFinite(weekly) && weekly > 0) {
    return weekly * (PlanMultiplier[planTypeValue] || 1);
  }

  const legacy = Number(service?.calculations?.total);
  if (Number.isFinite(legacy) && legacy > 0) {
    return legacy * (PlanMultiplier[planTypeValue] || 1);
  }

  return 0;
};

export const getServicesPlansFromServices = (services = []) => {
  const plans = {};
  Object.values(PlanTypeEnums).forEach((planTypeValue) => {
    plans[planTypeValue] = (Array.isArray(services) ? services : []).reduce(
      (acc, service) => acc + getServicePlanTotal(service, planTypeValue),
      0,
    );
  });
  return plans;
};

export const getDispatchPlansFromOnDemand = (onDemandServices = []) => {
  const onDemandServicesList = Array.isArray(onDemandServices) ? onDemandServices : [];
  const dispatchServiceTotal = onDemandServicesList.reduce((acc, service) => {
    if (service?.title === systemServicesConstant.DISPATCH_REQUEST) {
      return service?.dispatchRate?.value === dispatchOptionEnums.flatRate
        ? acc + Number(service.price) * Number(service.quantity)
        : acc;
    }
    return acc;
  }, 0);

  const plans = {};
  Object.values(PlanTypeEnums).forEach((planTypeValue) => {
    plans[planTypeValue] = dispatchServiceTotal * (PlanMultiplier[planTypeValue] || 1);
  });
  return plans;
};

const hasPositivePlanValues = (plans = {}) =>
  Object.values(plans).some((value) => Number(value) > 0);

export const resolvePaymentPlanRows = ({
  services = [],
  onDemandServices = [],
  servicesPlans = {},
  dispatchPlans = null,
}) => {
  const computedServicesPlans = getServicesPlansFromServices(services);
  const computedDispatchPlans = getDispatchPlansFromOnDemand(onDemandServices);

  return {
    servicesPlans: hasPositivePlanValues(computedServicesPlans)
      ? computedServicesPlans
      : servicesPlans,
    dispatchPlans: hasPositivePlanValues(computedDispatchPlans)
      ? computedDispatchPlans
      : dispatchPlans,
  };
};

/**
 * Calculates contract totals for different plan types (weekly, monthly, flat, etc.)
 * by including services, on-demand services, fuel surcharge, and tax.
 *
 * @param {Object} params
 * @param {Object} params.paymentTerms - Contains tax rate, flat rate, and fuel surcharge.
 * @param {Array} params.services - List of recurring services with calculations.
 * @param {number} params.servicesTotal - Weekly total of recurring services.
 * @param {Array} params.onDemandServices - List of one-time/on-demand services.
 *
 * @returns {Object} calculations - Breakdown of fuel surcharge, tax, and total for each plan type.
 *
 * Example:
 * --------
 * const result = getContractCalculations({
 *   paymentTerms: {
 *     TAX_RATE: 10,       // 10% tax
 *     FLAT_RATE: 2000,    // Flat plan cost
 *     FUEL_SURCHARGE: 5,  // 5% fuel surcharge
 *   },
 *   services: [
 *     {
 *       addFuelSurcharge: true,
 *       calculations: { total: 1000 } // Weekly service total
 *     },
 *   ],
 *   servicesTotal: 1000, // Weekly total of recurring services
 *   onDemandServices: [
 *     { title: 'Dispatch Request', price: 100, quantity: 2, dispatchRate: { value: 'flatRate' } },
 *     { title: 'Cleaning', price: 50, quantity: 1, rate: 'MONTHLY', _destroy: false }
 *   ]
 * });
 *
 * console.log(result);
 *  {
 *    WEEKLY: { fuelSurchargeAmount: 50, taxAmount: 105, total: 1155 },
 *    MONTHLY: { ... },
 *    FLAT: { ... }
 *  }
 */
export const getContractCalculations = ({
  paymentTerms,
  services,
  // servicesTotal,
  // onDemandTotal,
  onDemandServices,
  // stripeEnabled,
}) => {
  // Extract relevant payment term values
  const taxRate = paymentTerms?.[PaymentTermsFormKeys.TAX_RATE];

  const flatRate = paymentTerms?.[PaymentTermsFormKeys.FLAT_RATE];

  const fuelSurcharge = paymentTerms?.[PaymentTermsFormKeys.FUEL_SURCHARGE];

  const calculations = {};
  const onDemandServicesList = Array.isArray(onDemandServices) ? onDemandServices : [];

  // Loop through each plan type (e.g., WEEKLY, MONTHLY, FLAT)
  Object.values(PlanTypeEnums).forEach((planTypeValue) => {
    let fuelSurchargeAmount = 0;

    const servicesPlanTotal = (Array.isArray(services) ? services : []).reduce(
      (acc, service) => acc + getServicePlanTotal(service, planTypeValue),
      0,
    );

    // 🔹 1. Calculate fuel surcharge for services that have "addFuelSurcharge" enabled
    if (fuelSurcharge) {
      if (planTypeValue === PlanTypeEnums.FLAT) {
        fuelSurchargeAmount = (Number(fuelSurcharge) / 100) * Number(flatRate);
      } else {
        services?.forEach((service) => {
          if (service.addFuelSurcharge) {
            fuelSurchargeAmount +=
              (Number(fuelSurcharge) / 100) *
              Number(service.calculations?.[planTypeValue]?.total || 0);
            // PlanMultiplier[planTypeValue]; // No need to multiply by plan multiplier as it is already included in the service total
          }
        });
      }
    }

    // 🔹 3. Services total for this billing plan
    const servicesTotalForPlan = servicesPlanTotal;

    // 🔹 4. Dispatch service total (special handling: only flat-rate dispatch requests are counted)
    const dispatchServiceTotal = onDemandServicesList.reduce((acc, service) => {
      if (service?.title === systemServicesConstant.DISPATCH_REQUEST) {
        return service?.dispatchRate?.value === dispatchOptionEnums.flatRate
          ? acc + Number(service.price) * Number(service.quantity)
          : acc;
      }
      return acc;
    }, 0);

    // 🔹 5. Other on-demand seservicesPlanTotalrvices total (monthly services that aren’t destroyed)
    const otherOnDemandServicesTotal = onDemandServicesList.reduce((acc, service) => {
      if (
        service?.title !== systemServicesConstant.DISPATCH_REQUEST &&
        service.rate === ON_DEMAND_MONTHLY_RATE &&
        !service._destroy
      ) {
        return acc + Number(service.price) * Number(service.quantity);
      }
      return acc;
    }, 0);

    // 🔹 6. Scale dispatch services (dispatch is weekly-based)
    const dispatchPlanTotal = dispatchServiceTotal * PlanMultiplier[planTypeValue];

    // 🔹 7. Scale on-demand services (onDemand is monthly → convert to weekly/annual/etc.)
    const onDemandPlanTotal = otherOnDemandServicesTotal / PlanDivider[planTypeValue];

    // 🔹 8. Add everything together
    let totalAfterFuelSurcharge =
      servicesTotalForPlan + dispatchPlanTotal + onDemandPlanTotal + fuelSurchargeAmount;

    // If flat plan → ignore breakdown and just use flat rate
    if (planTypeValue === PlanTypeEnums.FLAT)
      totalAfterFuelSurcharge = Number(flatRate) + fuelSurchargeAmount;

    // 🔹 9. Apply tax if applicable
    const taxAmount = Number(taxRate) ? (Number(taxRate) / 100) * totalAfterFuelSurcharge : 0;

    // 🔹 10. Final total
    const total = totalAfterFuelSurcharge + taxAmount;

    // 🔹 11. Store results for this plan type
    calculations[planTypeValue] = {
      fuelSurchargeAmount,
      // vehicleExpenseTotal: 0,
      taxAmount,
      total,
    };
  });

  return calculations;
};

export const getTotalPrice = ({
  planId,
  contractCalculations,
  // stripeEnabled = false,
  // formData = null,
}) => {
  // if (stripeEnabled && formData) {
  //   const selectedPlan = formData?.[PaymentTermsFormKeys.PLAN];
  //   // If selectedPlan is an object (from Stripe options), use its discountedAmount
  //   if (typeof selectedPlan === 'object' && selectedPlan !== null) {
  //     return selectedPlan.discountedAmount || 0;
  //   }
  //   return 0;
  // }

  planId = Number.isInteger(planId) ? planId.toString() : planId;

  return Number(contractCalculations?.[planId]?.total || 0);
};
