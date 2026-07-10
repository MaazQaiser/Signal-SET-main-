import dayjs from 'dayjs';
import {
  BillingAddressOptions,
  FormKeys as PaymentTermsFormKeys,
} from 'src/app/components/salesComponents/contractCreation/paymentTerms/helper';

export const TAX_RATE_PRESETS = [
  { label: '0% (tax exempt)', value: 0, recommended: true },
  { label: '6%', value: 6 },
  { label: '8.25%', value: 8.25 },
];

export const ANNUAL_RATE_INCREASE_PRESETS = [
  { label: '0% (no increase)', value: 0, recommended: true },
  { label: '3%', value: 3 },
  { label: '5%', value: 5 },
];

export const HOLIDAY_MULTIPLIER_PRESETS = [
  { label: 'Skip / not applicable', value: 'skip', recommended: true },
  { label: '1.5×', value: 1.5 },
  { label: '2×', value: 2 },
];

export const resolveCycleRefDateChoice = (value, context = {}) => {
  if (value === 'first_of_month') {
    return dayjs().startOf('month').format('MM/DD/YYYY');
  }
  if (value === 'fifteenth') {
    return dayjs().date(15).format('MM/DD/YYYY');
  }
  if (value === 'contract_start' && context.contractStartDate) {
    const parsed = dayjs(context.contractStartDate);
    if (parsed.isValid()) {
      return parsed.format('MM/DD/YYYY');
    }
  }
  return value;
};

export const buildCycleRefDatePresets = (context = {}) => {
  const presets = [
    {
      label: `1st of month (${dayjs().startOf('month').format('MM/DD/YYYY')})`,
      value: 'first_of_month',
      recommended: true,
    },
    { label: `15th of month (${dayjs().date(15).format('MM/DD/YYYY')})`, value: 'fifteenth' },
  ];

  if (context.contractStartDate) {
    const parsed = dayjs(context.contractStartDate);
    if (parsed.isValid()) {
      presets.push({
        label: `Contract start (${parsed.format('MM/DD/YYYY')})`,
        value: 'contract_start',
      });
    }
  }

  return presets;
};

const US_CANADA_PHONE_REGEX = /^\+1\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const INTERNATIONAL_PHONE_REGEX = /^\+(?:[0-9] ?){6,14}[0-9]$/;

const isValidChatPhoneNumber = (phone) => {
  const value = String(phone || '').trim();
  if (!value) return false;
  return US_CANADA_PHONE_REGEX.test(value) || INTERNATIONAL_PHONE_REGEX.test(value);
};

export const normalizePhoneForValidation = (phone) => {
  if (phone == null || phone === '') return phone;

  const raw = String(phone).trim();
  if (isValidChatPhoneNumber(raw)) return raw;

  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return raw;
};

export const isValidCycleRefDate = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return false;
  return dayjs(trimmed, ['MM/DD/YYYY', 'M/D/YYYY'], true).isValid();
};

const normalizeAddressBookEntry = (address = {}) => ({
  [PaymentTermsFormKeys.STREET_ADDRESS]: address.streetAddress || address.street_address || '',
  [PaymentTermsFormKeys.COUNTRY]: address.country || '',
  [PaymentTermsFormKeys.STATE]: address.state || '',
  [PaymentTermsFormKeys.CITY]: address.city || '',
  [PaymentTermsFormKeys.COUNTRY_CODE]:
    address.countryCode?.id || address.country?.id || address.countryCode || '',
  [PaymentTermsFormKeys.POSTAL_CODE]: address.postalCode || address.postal_code || '',
});

export const resolveAutoBillingAddressFields = (apiData, base = {}, billingAddressOption) => {
  const leadAddress =
    base[PaymentTermsFormKeys.LEAD_ADDRESS] ||
    (apiData?.paymentTerms?.leadAddress
      ? normalizeAddressBookEntry(apiData.paymentTerms.leadAddress)
      : null) ||
    (apiData?.leadAddress ? normalizeAddressBookEntry(apiData.leadAddress) : null);

  const companyAddress =
    base[PaymentTermsFormKeys.COMPANY_ADDRESS] ||
    (apiData?.paymentTerms?.companyAddress
      ? normalizeAddressBookEntry(apiData.paymentTerms.companyAddress)
      : null) ||
    (apiData?.companyAddress ? normalizeAddressBookEntry(apiData.companyAddress) : null);

  const contactAddress = apiData?.billingContact?.address
    ? normalizeAddressBookEntry(apiData.billingContact.address)
    : null;

  let source = null;
  if (billingAddressOption === BillingAddressOptions.PROPERTY) {
    source = leadAddress || contactAddress;
  } else if (billingAddressOption === BillingAddressOptions.COMPANY) {
    source = companyAddress;
  } else {
    source = leadAddress || companyAddress || contactAddress;
  }

  if (!source && !leadAddress && !companyAddress) {
    return {};
  }

  const activeSource = source || leadAddress || companyAddress || contactAddress;
  const city = activeSource?.[PaymentTermsFormKeys.CITY];
  const state = activeSource?.[PaymentTermsFormKeys.STATE];
  const country = activeSource?.[PaymentTermsFormKeys.COUNTRY];

  return {
    [PaymentTermsFormKeys.LEAD_ADDRESS]: leadAddress || activeSource,
    [PaymentTermsFormKeys.COMPANY_ADDRESS]: companyAddress || activeSource,
    [PaymentTermsFormKeys.ADDRESS]: activeSource?.[PaymentTermsFormKeys.STREET_ADDRESS] || '',
    [PaymentTermsFormKeys.CITY]: city?.id ?? city ?? null,
    [PaymentTermsFormKeys.STATE]: state?.id ?? state ?? null,
    [PaymentTermsFormKeys.COUNTRY]: country?.id ?? country ?? null,
    [PaymentTermsFormKeys.COUNTRY_CODE]:
      activeSource?.[PaymentTermsFormKeys.COUNTRY_CODE] || country?.id || country || null,
    [PaymentTermsFormKeys.POSTAL_CODE]: activeSource?.[PaymentTermsFormKeys.POSTAL_CODE] || '',
  };
};
