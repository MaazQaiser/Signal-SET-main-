import { HOLIDAY_RATE_TYPES } from 'src/app/components/common/holidayRateInputDropdown';
import { getDateDifference } from 'src/helper/utilityFunctions';

export const PlanTypeEnums = { MONTHLY: '0', BI_WEEKLY: '1', WEEKLY: '2', EVENT: '3', FLAT: '4' };

export const PlanColumns = ['0', '1', '2', '4'];

export const getPlanTypeTitles = (t) => {
  const titles = {
    [PlanTypeEnums.MONTHLY]: t('sales.contract.monthly'),
    [PlanTypeEnums.BI_WEEKLY]: t('sales.contract.biWeekly'),
    [PlanTypeEnums.WEEKLY]: t('sales.contract.weekly'),
    [PlanTypeEnums.EVENT]: t('sales.contract.event'),
    [PlanTypeEnums.FLAT]: t('sales.contract.flat'),
  };

  return titles;
};

export const BillingAddressOptions = {
  PROPERTY: 'property',
  COMPANY: 'company',
  OTHER: 'other',
};

export const BillingAddressSource = {
  LOCATION: 'location',
  COMPANY: 'company',
  OTHER: 'other',
};

const BillingAddressSourceToOptionMap = {
  [BillingAddressSource.LOCATION]: BillingAddressOptions.PROPERTY,
  [BillingAddressSource.COMPANY]: BillingAddressOptions.COMPANY,
  [BillingAddressSource.OTHER]: BillingAddressOptions.OTHER,
};

export const FormKeys = {
  PLAN: 'plan',
  SELECTED_PLAN: 'selectedPlan',
  TAX_RATE: 'taxRate',
  FLAT_RATE: 'flatRate',
  FUEL_SURCHARGE: 'fuelSurcharge',
  CYCLE_REF_DATE: 'cycleRefDate',
  PAYMENT_METHOD: 'paymentMethod',
  BILLABLE: 'billable',
  PAYABLE: 'payable',
  PAYMENT_DATE: 'paymentDate',
  ANNUAL_RATE_INCREASE: 'annualRateIncrease',
  HOLIDAY_MULTIPLIER: 'holidayMultiplier',
  HOLIDAY_GROUP: 'holidayGroup',
  BILLING_TYPE: 'billingType',
  BILLING_FREQUENCY: 'billingFrequency',
  CONTRACT_TYPE: 'contractType',
  BILLING_OWNER_FIRST_NAME: 'billingOwnerFirstName',
  BILLING_OWNER_LAST_NAME: 'billingOwnerLastName',
  BILLING_OWNER_EMAIL: 'billingOwnerEmail',
  BILLING_OWNER_PHONE: 'billingOwnerPhone',
  ADDRESS: 'address',
  STREET_ADDRESS: 'streetAddress',
  COUNTRY: 'country',
  STATE: 'state',
  CITY: 'city',
  COUNTRY_CODE: 'countryCode',
  POSTAL_CODE: 'postalCode',
  LEAD_ADDRESS: 'leadAddress',
  COMPANY_ADDRESS: 'companyAddress',
  BILLING_ADDRESS: 'billingAddress',
  BILLING_ADDRESS_OPTION: 'billingAddressOption',
  BILLING_ADDRESS_SOURCE: 'billingAddressSource',
  STRIPE_PAYMENT_METHOD: 'stripePaymentMethod',
  BILLING_METHOD: 'billingMethod',
  STRIPE_PAYMENTS: 'stripePayments',
  HOLIDAY_MULTIPLIER_TYPE: 'holidayMultiplierType',
  TAX_EXEMPT: 'taxExempt',
  CUSTOM_DISCOUNT_AMOUNT: 'customDiscountAmount',
  CUSTOM_DISCOUNT_PERCENTAGE: 'customDiscountPercentage',
};

export const paymentTermsEmptyState = {
  [FormKeys.PLAN]: PlanTypeEnums.WEEKLY.toString(),
  [FormKeys.TAX_RATE]: null,
  [FormKeys.FLAT_RATE]: null,
  [FormKeys.PAYMENT_METHOD]: null,
  [FormKeys.CYCLE_REF_DATE]: null,
  [FormKeys.PAYMENT_DATE]: null,
  [FormKeys.ANNUAL_RATE_INCREASE]: null,
  [FormKeys.HOLIDAY_MULTIPLIER]: null,
  [FormKeys.HOLIDAY_GROUP]: null,
  [FormKeys.BILLING_TYPE]: null,
  [FormKeys.CONTRACT_TYPE]: null,
  [FormKeys.BILLING_OWNER_FIRST_NAME]: null,
  [FormKeys.BILLING_OWNER_LAST_NAME]: null,
  [FormKeys.BILLING_OWNER_EMAIL]: null,
  [FormKeys.BILLING_OWNER_PHONE]: null,
  [FormKeys.HAS_DIFFERENT_BILLING_ADDRESS]: false,
  [FormKeys.BILLABLE]: false,
  [FormKeys.PAYABLE]: false,
  [FormKeys.ADDRESS]: null,
  [FormKeys.COUNTRY]: null,
  [FormKeys.STATE]: null,
  [FormKeys.CITY]: null,
  [FormKeys.COUNTRY_CODE]: null,
  [FormKeys.POSTAL_CODE]: null,
  [FormKeys.BILLING_ADDRESS_OPTION]: BillingAddressOptions.COMPANY,
  [FormKeys.TAX_EXEMPT]: false,
  [FormKeys.CUSTOM_DISCOUNT_AMOUNT]: null,
  [FormKeys.CUSTOM_DISCOUNT_PERCENTAGE]: null,
};

export const getMockBillingAddressBook = () => ({
  [FormKeys.STREET_ADDRESS]: '4500 Owen Tech Blvd',
  [FormKeys.COUNTRY]: { id: 1, name: 'United States' },
  [FormKeys.STATE]: { id: 'TX', name: 'Texas' },
  [FormKeys.CITY]: { id: 1, name: 'Austin' },
  [FormKeys.COUNTRY_CODE]: 1,
  [FormKeys.POSTAL_CODE]: '78728',
});

export const isAddressBookEmpty = (addr) => {
  if (!addr || typeof addr !== 'object') return true;
  const street = addr[FormKeys.STREET_ADDRESS] || addr.streetAddress || '';
  const postal = addr[FormKeys.POSTAL_CODE] || addr.postalCode || '';
  return !String(street).trim() && !String(postal).trim();
};

/** Demo defaults for billing owner + address when API/chat data is incomplete. */
export const applyBillingMockDefaults = (input = {}) => {
  const next = { ...(input || {}) };
  const mockBook = getMockBillingAddressBook();

  if (!next[FormKeys.BILLING_OWNER_FIRST_NAME]) {
    next[FormKeys.BILLING_OWNER_FIRST_NAME] = 'John';
  }
  if (!next[FormKeys.BILLING_OWNER_LAST_NAME]) {
    next[FormKeys.BILLING_OWNER_LAST_NAME] = 'Hargrave';
  }
  if (!next[FormKeys.BILLING_OWNER_EMAIL]) {
    next[FormKeys.BILLING_OWNER_EMAIL] = 'john.hargrave@affinityliving.com';
  }
  if (!next[FormKeys.BILLING_OWNER_PHONE]) {
    next[FormKeys.BILLING_OWNER_PHONE] = '+1 (512) 251-4900';
  }

  if (isAddressBookEmpty(next[FormKeys.LEAD_ADDRESS])) {
    next[FormKeys.LEAD_ADDRESS] = { ...mockBook };
  }
  if (isAddressBookEmpty(next[FormKeys.COMPANY_ADDRESS])) {
    next[FormKeys.COMPANY_ADDRESS] = { ...mockBook };
  }

  if (!next[FormKeys.ADDRESS]) {
    next[FormKeys.ADDRESS] = mockBook[FormKeys.STREET_ADDRESS];
  }
  if (!next[FormKeys.CITY]) {
    next[FormKeys.CITY] = mockBook[FormKeys.CITY]?.id ?? mockBook[FormKeys.CITY];
  }
  if (!next[FormKeys.STATE]) {
    next[FormKeys.STATE] = mockBook[FormKeys.STATE]?.id ?? mockBook[FormKeys.STATE];
  }
  if (!next[FormKeys.COUNTRY]) {
    next[FormKeys.COUNTRY] = mockBook[FormKeys.COUNTRY]?.id ?? mockBook[FormKeys.COUNTRY];
  }
  if (!next[FormKeys.COUNTRY_CODE]) {
    next[FormKeys.COUNTRY_CODE] = '+1';
  }
  if (!next[FormKeys.POSTAL_CODE]) {
    next[FormKeys.POSTAL_CODE] = mockBook[FormKeys.POSTAL_CODE];
  }

  if (!next[FormKeys.BILLING_ADDRESS_OPTION]) {
    next[FormKeys.BILLING_ADDRESS_OPTION] = BillingAddressOptions.COMPANY;
  }

  const option = next[FormKeys.BILLING_ADDRESS_OPTION];
  if (
    option === BillingAddressOptions.COMPANY &&
    isAddressBookEmpty(next[FormKeys.COMPANY_ADDRESS])
  ) {
    next[FormKeys.COMPANY_ADDRESS] = { ...mockBook };
  }
  if (
    option === BillingAddressOptions.PROPERTY &&
    isAddressBookEmpty(next[FormKeys.LEAD_ADDRESS])
  ) {
    next[FormKeys.LEAD_ADDRESS] = { ...mockBook };
  }

  return next;
};

export const getPaymentTermsData = (
  data,
  isFuelSurchargeApplicable,
  stripeEnabled = false,
  taxExemptionEnabled = false,
) => {
  const paymentDate = { value: data?.paymentDate?.id, label: data?.paymentDate?.name };
  const paymentMethod = { value: data?.paymentMethod?.id, label: data?.paymentMethod?.name };
  const billingType = { value: data?.billingType?.id, label: data?.billingType?.name };
  const contractType = { value: data?.contractType?.id, label: data?.contractType?.name };
  const billingFrequency = {
    value: data?.billingFrequency?.id,
    label: data?.billingFrequency?.name,
  };

  let plan;
  if (stripeEnabled) {
    plan =
      data?.[FormKeys.STRIPE_PAYMENTS]?.find((p) => p.discountType === data?.plan?.name?.toString())
        ?.discountType || '';
  } else {
    plan = data?.plan?.id?.toString()
      ? data?.plan?.id?.toString()
      : data?.startDate
        ? getDateDifference(data?.startDate, data?.endDate) < 7
          ? PlanTypeEnums.EVENT
          : PlanTypeEnums.WEEKLY
        : PlanTypeEnums.WEEKLY;
  }
  const holidayGroup = {
    value: data?.holidayGroup?.id,
    id: data?.holidayGroup?.id,
    name: data?.holidayGroup?.name,
    label: data?.holidayGroup?.name,
    holidays: data?.holidayGroup?.holidays,
    holidaysCount: data?.holidayGroup?.holidays?.length,
  };
  const billingAddress = {
    streetAddress: data.address.streetAddress,
    country: data.address.country,
    state: data.address.state,
    city: data.address.city,
    countryCode: data.address.country,
    postalCode: data.address.postalCode,
  };

  const leadAddress = {
    streetAddress: data?.leadAddress.streetAddress || '',
    country: data?.leadAddress.country || '',
    state: data?.leadAddress?.state || '',
    city: data?.leadAddress?.city || '',
    countryCode: data?.leadAddress?.country?.id || '',
    postalCode: data?.leadAddress?.postalCode || '',
  };

  const companyAddress = {
    streetAddress: data?.companyAddress?.streetAddress || '',
    country: data?.companyAddress?.country || '',
    state: data?.companyAddress?.state || '',
    city: data?.companyAddress?.city || '',
    countryCode: data?.companyAddress?.country?.id || '',
    postalCode: data?.companyAddress?.postalCode || '',
  };

  let payload = {};

  if (isFuelSurchargeApplicable) payload[FormKeys.FUEL_SURCHARGE] = data[FormKeys.FUEL_SURCHARGE];

  payload = {
    ...payload,
    [FormKeys.PLAN]: plan,
    [FormKeys.TAX_RATE]: data[FormKeys.TAX_RATE],
    [FormKeys.FLAT_RATE]: data[FormKeys.FLAT_RATE],
    [FormKeys.PAYMENT_METHOD]: paymentMethod,
    [FormKeys.HOLIDAY_GROUP]: holidayGroup,
    [FormKeys.CYCLE_REF_DATE]: data[FormKeys.CYCLE_REF_DATE],
    [FormKeys.PAYMENT_DATE]: paymentDate,
    [FormKeys.BILLABLE]: data[FormKeys.BILLABLE] || false,
    [FormKeys.PAYABLE]: data[FormKeys.PAYABLE] || false,
    [FormKeys.ANNUAL_RATE_INCREASE]: data[FormKeys.ANNUAL_RATE_INCREASE],
    [FormKeys.HOLIDAY_MULTIPLIER]: data[FormKeys.HOLIDAY_MULTIPLIER],
    [FormKeys.HOLIDAY_MULTIPLIER_TYPE]: data[FormKeys.HOLIDAY_MULTIPLIER_TYPE],
    [FormKeys.BILLING_TYPE]: billingType,
    [FormKeys.CONTRACT_TYPE]: contractType,
    [FormKeys.BILLING_OWNER_FIRST_NAME]: data[FormKeys.BILLING_OWNER_FIRST_NAME],
    [FormKeys.BILLING_OWNER_LAST_NAME]: data[FormKeys.BILLING_OWNER_LAST_NAME],
    [FormKeys.BILLING_OWNER_EMAIL]: data[FormKeys.BILLING_OWNER_EMAIL],
    [FormKeys.BILLING_OWNER_PHONE]: data[FormKeys.BILLING_OWNER_PHONE],
    [FormKeys.LEAD_ADDRESS]: leadAddress,
    [FormKeys.COMPANY_ADDRESS]: companyAddress,
    [FormKeys.BILLING_ADDRESS]: billingAddress,
    [FormKeys.BILLING_FREQUENCY]: billingFrequency,
    [FormKeys.STRIPE_PAYMENTS]: data[FormKeys.STRIPE_PAYMENTS],
    [FormKeys.BILLING_METHOD]: data[FormKeys.BILLING_METHOD],
    [FormKeys.BILLING_ADDRESS_OPTION]:
      BillingAddressSourceToOptionMap[data[FormKeys.BILLING_ADDRESS_SOURCE]] ??
      BillingAddressOptions.COMPANY,
    [FormKeys.ADDRESS]: data.address?.streetAddress || data.address?.street_address || '',
    [FormKeys.COUNTRY]: data.address?.country?.id || null,
    [FormKeys.STATE]: data.address?.state?.id || null,
    [FormKeys.CITY]: data.address?.city?.id || null,
    [FormKeys.COUNTRY_CODE]: data.address?.country?.id || null,
    [FormKeys.POSTAL_CODE]: data.address?.postalCode || data.address?.postal_code || '',
    [FormKeys.HOLIDAY_MULTIPLIER_TYPE]:
      data[FormKeys.HOLIDAY_MULTIPLIER_TYPE] || HOLIDAY_RATE_TYPES.MULTIPLIER_RATE,
    ...(taxExemptionEnabled && {
      exemptTax: data?.taxExempt || false,
      ...(data?.taxAdjustment?.fileName && {
        taxAdjustment: { name: data.taxAdjustment.fileName },
      }),
    }),
    ...(stripeEnabled && {
      customDiscountAmount: data?.customDiscountAmount ?? null,
      customDiscountPercentage: data?.customDiscountPercentage ?? null,
      ...(data?.customDiscountAmount != null && {
        discount: data.customDiscountAmount,
        discountType: 'amount',
      }),
      ...(data?.customDiscountPercentage != null &&
        !data?.customDiscountAmount && {
          discount: data.customDiscountPercentage,
          discountType: 'percentage',
        }),
    }),
  };

  return payload;
};
