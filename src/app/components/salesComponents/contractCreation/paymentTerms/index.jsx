import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactComponent as FileUploadIcon } from 'assets/icons/FileUploadOutlined.svg';
import { ReactComponent as InfoIcon } from 'assets/icons/info-blue.svg';
import { ReactComponent as InfoOutlinedIcon } from 'assets/icons/InfoOutlined.svg';
import classNames from 'classnames';
import PhoneNumberWithCountry from 'commonComponents/phoneNumberWithCountry';
// import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import FieldError from 'src/app/components/common/fieldError';
import HolidayRateInputDropdown from 'src/app/components/common/holidayRateInputDropdown';
import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { useCustomAddressHook } from 'src/app/components/hooks/customAddressHook';
import {
  ActiveStepsKeys,
  getViewDisabledContractClass,
  resolvePaymentPlanRows,
} from 'src/app/sales/pages/contractCreation/helper';
import { TrashIcon } from 'src/assets/svg';
import { ReactComponent as AddIcon } from 'src/assets/svg/add-icon.svg';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg';
import { ReactComponent as SuggestRateIcon } from 'src/assets/svg/suggestRate.svg';
import { formatDate, removeKey, removeKeysFromObject } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/hooks/useTenantLabel';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { getPaymentTermOptions } from 'src/services/contact.service';
import { clientSecretFromBE } from 'src/services/deal.service';
import { getHolidayGroupsFromFranchiseService } from 'src/services/deal.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';
import { proposalTypeEnum } from 'src/utils/constants';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater';
import { validateFileUpload } from 'src/utils/formValidator/fileValidator';
import { convertMMDDYYYYToDayJsDate } from 'src/utils/passTime/time';
import { checkAndAddDot } from 'src/utils/string/addDotInEnd';

import SuggestRateDrawer from '../addServices/serviceCard/suggestRateDrawer';
import BillingOccurrenceSelector from './BillingOccurrenceSelector';
import DiscountInputDropdown from './DiscountInputDropdown';
import {
  applyBillingMockDefaults,
  BillingAddressOptions,
  FormKeys,
  getPaymentTermsData,
  getPlanTypeTitles,
  isAddressBookEmpty,
  paymentTermsEmptyState,
  PlanColumns,
  PlanTypeEnums,
} from './helper';
import { useStyles } from './paymentTerms';
import SavedPaymentMethod from './SavedPaymentMethod';
import PaymentForm from './stripe/paymentForm';

// Initialize Stripe ONCE - outside component (skip when key is missing in local dev)
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey, {
      developerTools: {
        assistant: {
          enabled: false,
        },
      },
    })
  : null;

const getBillingFrequencyLabels = (t) => ({
  annually: t('sales.contract.billingYear'),
  semi_annually: t('sales.contract.sixMonths'),
  quarterly: t('sales.contract.billingQuarter'),
  monthly: t('sales.contract.month'),
  bi_monthly: t('sales.contract.everyTwoMonths'),
});

const BILLING_PAYMENTS_COUNT = {
  annually: 1,
  semi_annually: 2,
  quarterly: 4,
  monthly: 12,
  bi_monthly: 24,
};

const FREQUENCY_UNIT_ANNUAL_MULTIPLIER = {
  week: 52,
  month: 12,
};

const calculatePerServiceAmount = (services) => {
  const products = services?.[0]?.visits?.[0]?.products;
  if (!products?.length) return '0.00';
  const total = products.reduce((sum, product) => {
    const rate = parseFloat(product?.productRate) || 0;
    const quantity = parseInt(product?.productQuantity, 10) || 0;
    return sum + rate * quantity;
  }, 0);
  return total.toFixed(2);
};

const calculatePerServiceVisits = (services) => {
  const visit = services?.[0]?.visits?.[0];
  const frequencyValue = parseInt(visit?.repeatFrequencyValue, 10) || 0;
  const frequencyUnit = visit?.repeatFrequencyUnit?.value || visit?.repeatFrequencyUnit;
  const periodsInYear = FREQUENCY_UNIT_ANNUAL_MULTIPLIER[frequencyUnit] || 0;
  if (!frequencyValue || !periodsInYear) return 0;
  return Math.ceil(periodsInYear / frequencyValue);
};

const PaymentTermsTab = ({
  formData,
  setFormData,
  errorMessages,
  setErrorMessages,
  contractCalculations,
  editData: apiData,
  contractData,
  options,
  setOptions,
  isPublished,
  proposalType = proposalTypeEnum.default,
  stripeEnabled,
  baseRates = {},
  profitability = null,
  franchiseId,
  taxExemptionEnabled,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { symbol, dateFormat } = useSelector(getDisplayConfiguration);

  const { id: dealId } = useParams();

  const {
    servicesPlans: savedServicesPlans = {},
    dispatchPlans: savedDispatchPlans = null,
    visitorManagementPlans = null,
    loadManagementPlans = null,
    lineItems = [],
  } = apiData ?? {};
  const reduxServices = useSelector((state) => state.contractServices?.[ActiveStepsKeys.SERVICES]);
  const services = useMemo(() => {
    if (Array.isArray(reduxServices) && reduxServices.length > 0) return reduxServices;
    return contractData?._demoFormServices || contractData?.services || [];
  }, [reduxServices, contractData?._demoFormServices, contractData?.services]);
  const onDemandServices =
    contractData?.[ActiveStepsKeys.ON_DEMAND_SERVICES] || contractData?.onDemandServices || [];

  const { servicesPlans, dispatchPlans } = useMemo(
    () =>
      resolvePaymentPlanRows({
        services,
        onDemandServices,
        servicesPlans: savedServicesPlans,
        dispatchPlans: savedDispatchPlans,
      }),
    [services, onDemandServices, savedServicesPlans, savedDispatchPlans],
  );
  const contractStartDate = useSelector((state) => state.contractServices.startDate);
  const contractEndDate = useSelector((state) => state.contractServices.endDate);

  const billingStartDate = useMemo(() => {
    if (!stripeEnabled) return '';
    const raw = services?.[0]?.serviceStartDate;
    return raw ? formatDate(raw, dateFormat) : '';
  }, [stripeEnabled, services, dateFormat]);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const [clientSecret, setClientSecret] = useState('');
  const [isLoadingClientSecret, setIsLoadingClientSecret] = useState(false);
  const [activeBillingType, setActiveBillingType] = useState('recurring'); // 'recurring' or 'perService'

  // Store original stripe plan prices from API (before any custom discount)
  const originalStripePlansRef = useRef(null);

  // Set default billingTypeId to 0 (recurring) when stripeEnabled
  useEffect(() => {
    if (stripeEnabled && formData?.billingTypeId == null) {
      setFormData((prev) => ({ ...prev, billingTypeId: 0 }));
    }
  }, [stripeEnabled]);

  const handleBillingTypeTabChange = (type) => {
    setActiveBillingType(type);
    if (stripeEnabled) {
      setFormData((prev) => ({
        ...prev,
        billingTypeId: type === 'recurring' ? 0 : 1,
      }));

      // Re-validate discount against the new tab's context
      if (formData?.discount) {
        const errorKey = `${ActiveStepsKeys.PAYMENT_TERMS},discount`;
        const discountType = formData?.discountType || 'percentage';
        const validationError = runDiscountValidation(
          formData.discount,
          discountType,
          formData?.[FormKeys.PLAN],
          type,
        );
        if (validationError) {
          setErrorMessages((prev) => ({ ...prev, [errorKey]: validationError }));
        } else {
          setErrorMessages((prev) => {
            const next = { ...prev };
            delete next[errorKey];
            return next;
          });
        }
      }
    }
  };

  const { getLabel } = useTenantLabel();
  const [priceRateDrawer, setPriceRateDrawer] = useState(false);
  const [holidayGroups, setHolidayGroups] = useState([]);
  const hasUpdatedHolidayGroup = useRef(false);

  /**
   * get today date and time
   */
  // const today = dayjs();

  const isFuelSurchargeApplicable = useMemo(() => {
    let isApplicable = false;
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      if (service.addFuelSurcharge) {
        isApplicable = true;
        break;
      }
    }
    return isApplicable;
  }, [services]);

  // Raw per-service base amount (number) — used for discount validation and display
  const perServiceBaseAmount = useMemo(() => {
    if (!stripeEnabled) return 0;
    return Number(calculatePerServiceAmount(services));
  }, [stripeEnabled, services]);

  /**
   * Get the max allowed discount amount based on selected plan or all plans.
   * Always uses actualAmount (the original price before any API discount).
   * If a plan is selected, returns that plan's actualAmount.
   * Otherwise (contract creation, no plan selected), returns the max actualAmount among all plans.
   */
  const getMaxDiscountAmount = useCallback((selectedPlan) => {
    const originalPlans = originalStripePlansRef.current;
    if (!originalPlans?.length) return null;

    if (selectedPlan) {
      const plan = originalPlans.find((p) => p.discountType === selectedPlan);
      if (plan) return Number(plan.actualAmount);
    }
    return Math.max(...originalPlans.map((p) => Number(p.actualAmount)));
  }, []);

  /**
   * Unified discount validation. Checks both percentage and amount constraints.
   * Returns an error message string if invalid, or null if valid.
   * @param {string} billingType - 'recurring' or 'perService'
   */
  const runDiscountValidation = useCallback(
    (discountValue, discountType, selectedPlan, billingType = 'recurring') => {
      if (!discountValue || Number(discountValue) <= 0) return null;

      if (String(discountValue).endsWith('.')) {
        return t('sales.contract.discountTrailingDecimal');
      }

      const type = discountType || 'percentage';

      if (type === 'percentage' && Number(discountValue) > 100) {
        return t('sales.contract.discountPercentageExceed');
      }

      if (type === 'amount') {
        const maxAllowed =
          billingType === 'perService' ? perServiceBaseAmount : getMaxDiscountAmount(selectedPlan);
        if (maxAllowed != null && maxAllowed > 0 && Number(discountValue) > maxAllowed) {
          return t('sales.contract.discountAmountExceed', {
            amount: `${symbol}${fomatNumbersWithCommas(maxAllowed)}`,
          });
        }
      }

      return null;
    },
    [getMaxDiscountAmount, perServiceBaseAmount, symbol, t],
  );

  /**
   * Compute displayed stripe plans with custom discount applied.
   * Original plan data is never mutated — this is purely derived state.
   */
  // Whether the user has entered a custom discount value
  const hasCustomDiscount = useMemo(() => {
    const val = formData?.discount;
    return val != null && val !== '' && Number(val) > 0;
  }, [formData?.discount]);

  const displayedStripePlans = useMemo(() => {
    const originalPlans = originalStripePlansRef.current;
    if (!originalPlans?.length) return formData?.[FormKeys.STRIPE_PAYMENTS] || [];

    const discount = Number(formData?.discount);
    const discountType = formData?.discountType || 'percentage';
    const errorKey = `${ActiveStepsKeys.PAYMENT_TERMS},discount`;
    const hasDiscountError = !!errorMessages?.[errorKey];

    // No discount or validation error — restore original API discount
    if (!discount || discount <= 0 || hasDiscountError) {
      return originalPlans.map((plan) => {
        const actual = Number(plan.actualAmount);
        const pct = Number(plan.percentage) || 0;
        // Recompute the API's own discount from actualAmount and percentage
        const restored = pct > 0 ? actual - (actual * pct) / 100 : actual;
        return { ...plan, discountedAmount: Math.max(0, restored) };
      });
    }

    // Calculate from actualAmount (original price), overriding the API's own discount
    return originalPlans.map((plan) => {
      const baseAmount = Number(plan.actualAmount);
      let newAmount;

      if (discountType === 'percentage') {
        newAmount = baseAmount - (baseAmount * discount) / 100;
      } else {
        newAmount = baseAmount - discount;
      }

      return {
        ...plan,
        discountedAmount: Math.max(0, newAmount),
      };
    });
  }, [
    formData?.discount,
    formData?.discountType,
    formData?.[FormKeys.STRIPE_PAYMENTS],
    errorMessages,
  ]);

  const selectedPlanKey = formData?.[FormKeys.PLAN];

  const billingPlanAmount = stripeEnabled
    ? (() => {
        if (!displayedStripePlans?.length) return '0.00';
        const plan = selectedPlanKey
          ? displayedStripePlans.find((p) => p.discountType === selectedPlanKey)
          : displayedStripePlans[0];
        return plan ? fomatNumbersWithCommas(Number(plan.discountedAmount).toFixed(2)) : '0.00';
      })()
    : '0.00';

  const billingFrequencyLabel = stripeEnabled
    ? (() => {
        const labels = getBillingFrequencyLabels(t);
        return selectedPlanKey ? labels[selectedPlanKey] || labels.annually : labels.annually;
      })()
    : '';

  const billingPaymentsCount = stripeEnabled
    ? selectedPlanKey
      ? BILLING_PAYMENTS_COUNT[selectedPlanKey] || BILLING_PAYMENTS_COUNT.annually
      : BILLING_PAYMENTS_COUNT.annually
    : 0;

  const perServiceAmount = useMemo(() => {
    if (!stripeEnabled) return '0.00';
    const baseAmount = perServiceBaseAmount;
    const discount = Number(formData?.discount) || 0;
    const discType = formData?.discountType || 'percentage';
    const errorKey = `${ActiveStepsKeys.PAYMENT_TERMS},discount`;
    const hasDiscountError = !!errorMessages?.[errorKey];

    if (!discount || discount <= 0 || hasDiscountError) {
      return fomatNumbersWithCommas(baseAmount.toFixed(2));
    }

    const discountedAmount =
      discType === 'percentage'
        ? baseAmount - (baseAmount * discount) / 100
        : baseAmount - discount;

    return fomatNumbersWithCommas(Math.max(0, discountedAmount).toFixed(2));
  }, [
    stripeEnabled,
    perServiceBaseAmount,
    formData?.discount,
    formData?.discountType,
    errorMessages,
  ]);

  const perServiceVisits = stripeEnabled ? calculatePerServiceVisits(services) : 0;

  const [isFetchingOptions, setIsFetchingOptions] = useState(false);
  const planTypeTitles = getPlanTypeTitles(t);

  useEffect(() => {
    if (!options && !isPublished) fetchOptions();
  }, [options, isPublished]);

  useEffect(() => {
    if (apiData) {
      const isFormReadyPaymentTerms =
        apiData[FormKeys.PLAN] != null &&
        (apiData[FormKeys.PAYMENT_METHOD]?.value != null ||
          apiData[FormKeys.BILLING_OWNER_FIRST_NAME] != null);

      // Capture original plan prices before any custom discount is applied.
      // If the API data already has a custom discount baked in (edit/navigate-back),
      // strip it so the base prices reflect actualAmount without that discount.
      if (stripeEnabled && apiData?.stripePayments?.length > 0) {
        const hasSavedCustomDiscount =
          apiData?.customDiscountAmount != null || apiData?.customDiscountPercentage != null;
        originalStripePlansRef.current = apiData.stripePayments.map((p) => ({
          ...p,
          ...(hasSavedCustomDiscount && {
            percentage: 0,
            discountedAmount: p.actualAmount,
          }),
        }));
      }

      const formDataSet = isFormReadyPaymentTerms
        ? { ...apiData }
        : getPaymentTermsData(
            { ...apiData, startDate: contractStartDate, endDate: contractEndDate },
            isFuelSurchargeApplicable,
            stripeEnabled,
            taxExemptionEnabled,
          );
      const finalFormData = applyBillingMockDefaults(formDataSet ?? { ...paymentTermsEmptyState });
      hasPopulatedAddress.current = false;
      setFormData(finalFormData);

      // Set billing type tab from API data in edit mode when stripeEnabled
      if (stripeEnabled && apiData?.billingType?.id != null) {
        const apiTypeId = Number(apiData.billingType.id);
        setActiveBillingType(apiTypeId === 1 ? 'perService' : 'recurring');
        setFormData((prev) => ({ ...prev, billingTypeId: apiTypeId }));
      }
      return;
    }

    hasPopulatedAddress.current = false;
    setFormData((prev) => applyBillingMockDefaults(prev ?? { ...paymentTermsEmptyState }));
  }, [apiData]);

  useEffect(() => {
    if (!formData) return;

    const option = formData[FormKeys.BILLING_ADDRESS_OPTION] || BillingAddressOptions.COMPANY;
    const needsAddressDefaults =
      option === BillingAddressOptions.OTHER
        ? !formData[FormKeys.ADDRESS] && !formData[FormKeys.POSTAL_CODE]
        : option === BillingAddressOptions.PROPERTY
          ? isAddressBookEmpty(formData[FormKeys.LEAD_ADDRESS])
          : isAddressBookEmpty(formData[FormKeys.COMPANY_ADDRESS]);

    if (!needsAddressDefaults) return;

    setFormData((prev) => applyBillingMockDefaults(prev ?? { ...paymentTermsEmptyState }));
  }, [
    formData?.[FormKeys.BILLING_ADDRESS_OPTION],
    formData?.[FormKeys.LEAD_ADDRESS],
    formData?.[FormKeys.COMPANY_ADDRESS],
    formData?.[FormKeys.ADDRESS],
    formData?.[FormKeys.POSTAL_CODE],
  ]);

  const hasPopulatedAddress = useRef(false);
  useEffect(() => {
    if (
      formData &&
      formData[FormKeys.BILLING_ADDRESS_OPTION] &&
      !hasPopulatedAddress.current &&
      (formData[FormKeys.LEAD_ADDRESS] || formData[FormKeys.COMPANY_ADDRESS])
    ) {
      const currentOption = formData[FormKeys.BILLING_ADDRESS_OPTION];
      if (currentOption !== BillingAddressOptions.OTHER) {
        const sourceOption = currentOption;
        if (sourceOption === BillingAddressOptions.PROPERTY) {
          const sourceAddress = formData[FormKeys.LEAD_ADDRESS];
          if (sourceAddress) {
            setFormData((prev) => ({
              ...prev,
              [FormKeys.ADDRESS]: sourceAddress?.[FormKeys.STREET_ADDRESS] || '',
              [FormKeys.CITY]:
                sourceAddress?.[FormKeys.CITY]?.id || sourceAddress?.[FormKeys.CITY] || null,
              [FormKeys.STATE]:
                sourceAddress?.[FormKeys.STATE]?.id || sourceAddress?.[FormKeys.STATE] || null,
              [FormKeys.COUNTRY]:
                sourceAddress?.[FormKeys.COUNTRY]?.id || sourceAddress?.[FormKeys.COUNTRY] || null,
              [FormKeys.COUNTRY_CODE]:
                sourceAddress?.[FormKeys.COUNTRY_CODE]?.id ||
                sourceAddress?.[FormKeys.COUNTRY_CODE] ||
                null,
              [FormKeys.POSTAL_CODE]: sourceAddress?.[FormKeys.POSTAL_CODE] || '',
            }));
          }
        } else if (sourceOption === BillingAddressOptions.COMPANY) {
          const sourceAddress = formData[FormKeys.COMPANY_ADDRESS];
          if (sourceAddress) {
            setFormData((prev) => ({
              ...prev,
              [FormKeys.ADDRESS]: sourceAddress?.[FormKeys.STREET_ADDRESS] || '',
              [FormKeys.CITY]:
                sourceAddress?.[FormKeys.CITY]?.id || sourceAddress?.[FormKeys.CITY] || null,
              [FormKeys.STATE]:
                sourceAddress?.[FormKeys.STATE]?.id || sourceAddress?.[FormKeys.STATE] || null,
              [FormKeys.COUNTRY]:
                sourceAddress?.[FormKeys.COUNTRY]?.id || sourceAddress?.[FormKeys.COUNTRY] || null,
              [FormKeys.COUNTRY_CODE]:
                sourceAddress?.[FormKeys.COUNTRY_CODE]?.id ||
                sourceAddress?.[FormKeys.COUNTRY_CODE] ||
                null,
              [FormKeys.POSTAL_CODE]: sourceAddress?.[FormKeys.POSTAL_CODE] || '',
            }));
          }
        }
        hasPopulatedAddress.current = true;
      } else {
        hasPopulatedAddress.current = true;
      }
    }
  }, [
    formData?.[FormKeys.LEAD_ADDRESS],
    formData?.[FormKeys.COMPANY_ADDRESS],
    formData?.[FormKeys.BILLING_ADDRESS_OPTION],
  ]);

  const getError = (key) => {
    return errorMessages?.[`${ActiveStepsKeys.PAYMENT_TERMS},${key}`];
  };

  const displayAddress = useMemo(() => {
    const selectedOption =
      formData?.[FormKeys.BILLING_ADDRESS_OPTION] || BillingAddressOptions.COMPANY;

    if (selectedOption === BillingAddressOptions.PROPERTY) {
      return formData?.[FormKeys.LEAD_ADDRESS];
    } else if (selectedOption === BillingAddressOptions.COMPANY) {
      return formData?.[FormKeys.COMPANY_ADDRESS];
    } else {
      if (
        formData?.[FormKeys.ADDRESS] ||
        formData?.[FormKeys.CITY] ||
        formData?.[FormKeys.STATE] ||
        formData?.[FormKeys.COUNTRY] ||
        formData?.[FormKeys.POSTAL_CODE]
      ) {
        const billingAddress = formData?.[FormKeys.BILLING_ADDRESS];
        return {
          [FormKeys.STREET_ADDRESS]: formData?.[FormKeys.ADDRESS] || '',
          [FormKeys.COUNTRY]:
            billingAddress?.[FormKeys.COUNTRY] ||
            (formData?.[FormKeys.COUNTRY]
              ? typeof formData[FormKeys.COUNTRY] === 'object'
                ? formData[FormKeys.COUNTRY]
                : { id: formData[FormKeys.COUNTRY], name: formData[FormKeys.COUNTRY] }
              : null),
          [FormKeys.STATE]:
            billingAddress?.[FormKeys.STATE] ||
            (formData?.[FormKeys.STATE]
              ? typeof formData[FormKeys.STATE] === 'object'
                ? formData[FormKeys.STATE]
                : { id: formData[FormKeys.STATE], name: formData[FormKeys.STATE] }
              : null),
          [FormKeys.CITY]:
            billingAddress?.[FormKeys.CITY] ||
            (formData?.[FormKeys.CITY]
              ? typeof formData[FormKeys.CITY] === 'object'
                ? formData[FormKeys.CITY]
                : { id: formData[FormKeys.CITY], name: formData[FormKeys.CITY] }
              : null),
          [FormKeys.POSTAL_CODE]: formData?.[FormKeys.POSTAL_CODE] || '',
        };
      }
      return {};
    }
  }, [
    formData?.[FormKeys.BILLING_ADDRESS_OPTION],
    formData?.[FormKeys.LEAD_ADDRESS],
    formData?.[FormKeys.COMPANY_ADDRESS],
    formData?.[FormKeys.BILLING_ADDRESS],
    formData?.[FormKeys.ADDRESS],
    formData?.[FormKeys.CITY],
    formData?.[FormKeys.STATE],
    formData?.[FormKeys.COUNTRY],
    formData?.[FormKeys.POSTAL_CODE],
  ]);

  const populateBillingAddressFromSource = (sourceOption) => {
    if (sourceOption === BillingAddressOptions.OTHER) {
      return;
    }

    setFormData((prev) => {
      let sourceAddress = null;

      if (sourceOption === BillingAddressOptions.PROPERTY) {
        sourceAddress = prev?.[FormKeys.LEAD_ADDRESS];
      } else if (sourceOption === BillingAddressOptions.COMPANY) {
        sourceAddress = prev?.[FormKeys.COMPANY_ADDRESS];
      }

      let billingOwnerUpdate = {};
      if (sourceOption === BillingAddressOptions.PROPERTY) {
        const billingContact = apiData?.billingContact;
        if (billingContact) {
          billingOwnerUpdate = {
            [FormKeys.BILLING_OWNER_FIRST_NAME]: billingContact.firstName,
            [FormKeys.BILLING_OWNER_LAST_NAME]: billingContact.lastName,
            [FormKeys.BILLING_OWNER_EMAIL]: billingContact.email,
            [FormKeys.BILLING_OWNER_PHONE]: billingContact.phoneNumber,
          };
        }
      } else {
        billingOwnerUpdate = {
          [FormKeys.BILLING_OWNER_FIRST_NAME]: '',
          [FormKeys.BILLING_OWNER_LAST_NAME]: '',
          [FormKeys.BILLING_OWNER_EMAIL]: '',
          [FormKeys.BILLING_OWNER_PHONE]: null,
        };
      }

      if (sourceAddress) {
        return {
          ...prev,
          [FormKeys.ADDRESS]: sourceAddress?.[FormKeys.STREET_ADDRESS] || '',
          [FormKeys.CITY]:
            sourceAddress?.[FormKeys.CITY]?.id || sourceAddress?.[FormKeys.CITY] || null,
          [FormKeys.STATE]:
            sourceAddress?.[FormKeys.STATE]?.id || sourceAddress?.[FormKeys.STATE] || null,
          [FormKeys.COUNTRY]:
            sourceAddress?.[FormKeys.COUNTRY]?.id || sourceAddress?.[FormKeys.COUNTRY] || null,
          [FormKeys.COUNTRY_CODE]:
            sourceAddress?.[FormKeys.COUNTRY_CODE]?.id ||
            sourceAddress?.[FormKeys.COUNTRY_CODE] ||
            null,
          [FormKeys.POSTAL_CODE]: sourceAddress?.[FormKeys.POSTAL_CODE] || '',
          ...billingOwnerUpdate,
        };
      }

      return {
        ...prev,
        ...billingOwnerUpdate,
      };
    });
  };

  const handleBillingAddressOptionChange = (event) => {
    const selectedOption = event.target.value;
    updateFormHandler(FormKeys.BILLING_ADDRESS_OPTION, selectedOption);

    setErrorMessages((prev) =>
      removeKeysFromObject(prev, [
        `${ActiveStepsKeys.PAYMENT_TERMS},${FormKeys.ADDRESS}`,
        `${ActiveStepsKeys.PAYMENT_TERMS},${FormKeys.CITY}`,
        `${ActiveStepsKeys.PAYMENT_TERMS},${FormKeys.STATE}`,
        `${ActiveStepsKeys.PAYMENT_TERMS},${FormKeys.COUNTRY}`,
        `${ActiveStepsKeys.PAYMENT_TERMS},${FormKeys.COUNTRY_CODE}`,
        `${ActiveStepsKeys.PAYMENT_TERMS},${FormKeys.POSTAL_CODE}`,
      ]),
    );

    if (selectedOption === BillingAddressOptions.OTHER) {
      setFormData((prev) => ({
        ...prev,
        [FormKeys.ADDRESS]: '',
        [FormKeys.CITY]: null,
        [FormKeys.STATE]: null,
        [FormKeys.COUNTRY]: null,
        [FormKeys.COUNTRY_CODE]: null,
        [FormKeys.POSTAL_CODE]: '',
        [FormKeys.BILLING_OWNER_FIRST_NAME]: '',
        [FormKeys.BILLING_OWNER_LAST_NAME]: '',
        [FormKeys.BILLING_OWNER_EMAIL]: '',
        [FormKeys.BILLING_OWNER_PHONE]: null,
      }));
    } else {
      hasPopulatedAddress.current = false;
      populateBillingAddressFromSource(selectedOption);
    }
  };

  const setAddressErrorMessage = (key) => {
    setErrorMessages((prev) => removeKey(`${ActiveStepsKeys.PAYMENT_TERMS},${key}`, prev));
  };

  const hookDisabled =
    formData?.[FormKeys.BILLING_ADDRESS_OPTION] !== BillingAddressOptions.OTHER
      ? { country: true, state: true, city: true }
      : { city: false, state: false, country: false };

  const { CityHookComponent, StateHookComponent, CountrySelectHookComponent } =
    useCustomAddressHook({
      searchableCity: true,
      searchableCountry: true,
      searchableState: true,
      formData: formData || {},
      setFormData,
      errorMessages: {
        ...errorMessages,
        city: getError(FormKeys.CITY),
        state: getError(FormKeys.STATE),
        country: getError(FormKeys.COUNTRY),
      },
      setErrorMessages: setAddressErrorMessage,
      hookDisabled,
    });

  const fetchOptions = async () => {
    try {
      setIsFetchingOptions(true);
      const options = await getPaymentTermOptions();
      if (options.statusCode === 200) setOptions(options.data);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: 2000,
      });
    } finally {
      setIsFetchingOptions(false);
    }
  };

  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const preventScientificNotation = (event) => {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  };

  const inputChangedHandler = (event) => {
    const { name, type } = event.target;
    let { value } = event.target;

    if (type === 'number' && value < 0) value = 0;

    /**
     * It will only store floating values upto 2 decimel places
     */
    const namesArr = [
      FormKeys.TAX_RATE,
      FormKeys.ANNUAL_RATE_INCREASE,
      FormKeys.HOLIDAY_MULTIPLIER,
      FormKeys.FLAT_RATE,
    ];
    if (namesArr.includes(name)) {
      const decimalLimit = name === FormKeys.TAX_RATE ? 4 : 2;
      const regex = new RegExp(`^(\\d*\\.?\\d{0,${decimalLimit}})$`);
      if (!regex.test(value)) return;
    }

    if (name === 'discount') {
      const discountRegex = /^\d*\.?\d{0,1}$/;
      if (value && !discountRegex.test(value)) return;
      const discountType = formData?.discountType || 'percentage';
      const errorKey = `${ActiveStepsKeys.PAYMENT_TERMS},discount`;

      const validationError = runDiscountValidation(
        value,
        discountType,
        formData?.[FormKeys.PLAN],
        activeBillingType,
      );
      if (validationError) {
        setErrorMessages({ ...errorMessages, [errorKey]: validationError });
      } else if (errorMessages?.[errorKey]) {
        const next = { ...errorMessages };
        delete next[errorKey];
        setErrorMessages(next);
      }

      setFormData((prev) => ({
        ...prev,
        discount: value,
        ...(stripeEnabled && {
          customDiscountPercentage: value && discountType === 'percentage' ? value : null,
          customDiscountAmount: value && discountType === 'amount' ? value : null,
        }),
      }));
      return;
    }

    if (name === 'discountType') {
      const errorKey = `${ActiveStepsKeys.PAYMENT_TERMS},discount`;
      const currentDiscount = formData?.discount;

      const validationError = runDiscountValidation(
        currentDiscount,
        value,
        formData?.[FormKeys.PLAN],
        activeBillingType,
      );
      if (validationError) {
        setErrorMessages({ ...errorMessages, [errorKey]: validationError });
      } else if (errorMessages?.[errorKey]) {
        const next = { ...errorMessages };
        delete next[errorKey];
        setErrorMessages(next);
      }

      setFormData((prev) => ({
        ...prev,
        discountType: value,
        ...(stripeEnabled && {
          customDiscountPercentage: prev.discount && value === 'percentage' ? prev.discount : null,
          customDiscountAmount: prev.discount && value === 'amount' ? prev.discount : null,
        }),
      }));
      return;
    }

    if (value || name === FormKeys.HOLIDAY_GROUP || name === FormKeys.HOLIDAY_MULTIPLIER) {
      const keysToRemove = [];
      if (value && name !== 'discount' && name !== 'discountType') {
        keysToRemove.push(`${ActiveStepsKeys.PAYMENT_TERMS},${name}`);
      }
      if (name === FormKeys.HOLIDAY_GROUP && !value?.value && !value?.id) {
        keysToRemove.push(`${ActiveStepsKeys.PAYMENT_TERMS},${FormKeys.HOLIDAY_MULTIPLIER}`);
      }
      if (name === FormKeys.HOLIDAY_MULTIPLIER) {
        const hasValue =
          value != null && value !== '' && !Number.isNaN(Number(value)) && Number(value) >= 1;
        if (!hasValue) {
          keysToRemove.push(`${ActiveStepsKeys.PAYMENT_TERMS},${FormKeys.HOLIDAY_GROUP}`);
        }
      }
      if (keysToRemove.length > 0 && errorMessages && typeof errorMessages === 'object') {
        const next = { ...errorMessages };
        keysToRemove.forEach((key) => delete next[key]);
        setErrorMessages(next);
      }
    }
    updateFormHandler(name, value);
  };

  const handleSwitch = (event) => {
    const { name, checked } = event.target;
    updateFormHandler(name, checked);
  };

  /**
   * handle date change
   */
  const handleDateChange = (value) => {
    if (value) {
      const {
        // eslint-disable-next-line no-unused-vars
        [`${ActiveStepsKeys.PAYMENT_TERMS},${FormKeys.CYCLE_REF_DATE}`]: key,
        ...rest
      } = errorMessages;
      setErrorMessages(rest);
      const isValidDate = !isNaN(value['$d']);
      if (isValidDate)
        setFormData((prevState) => ({
          ...prevState,
          [FormKeys.CYCLE_REF_DATE]: formatDate(value),
        }));
      else
        setFormData((prevState) => ({
          ...prevState,
          [FormKeys.CYCLE_REF_DATE]: null,
        }));
    }
  };

  const handleSavedPaymentMethod = (savedPaymentMethod) => {
    const {
      // eslint-disable-next-line no-unused-vars
      [`${ActiveStepsKeys.PAYMENT_TERMS},${FormKeys.BILLING_METHOD}`]: key,
      ...rest
    } = errorMessages;
    setErrorMessages(rest);
    setFormData((prev) => ({
      ...prev,
      [FormKeys.BILLING_METHOD]: savedPaymentMethod,
    }));
  };

  const handlePlanChange = (event) => {
    const { value } = event.target;
    const {
      // eslint-disable-next-line no-unused-vars
      [`${ActiveStepsKeys.PAYMENT_TERMS},${FormKeys.PLAN}`]: key,
      ...rest
    } = errorMessages;

    let updatedErrors = rest;

    // Re-validate discount against the newly selected plan's original price
    if (stripeEnabled && formData?.discount) {
      const discountErrorKey = `${ActiveStepsKeys.PAYMENT_TERMS},discount`;
      const discountType = formData?.discountType || 'percentage';
      const validationError = runDiscountValidation(
        formData.discount,
        discountType,
        value,
        activeBillingType,
      );
      if (validationError) {
        updatedErrors = { ...updatedErrors, [discountErrorKey]: validationError };
      } else {
        delete updatedErrors[discountErrorKey];
      }
    }

    setErrorMessages(updatedErrors);
    updateFormHandler(FormKeys.PLAN, value);
  };

  const fetchClientSecret = async () => {
    try {
      setIsLoadingClientSecret(true);

      const response = await clientSecretFromBE(dealId);

      if (response?.statusCode === 200 && response?.data?.clientSecret) {
        const secret = response.data.clientSecret;

        // Validate that it's a SetupIntent client secret (should start with 'seti_')
        if (!secret.startsWith('seti_')) {
          console.error(
            'Invalid client secret format. Expected SetupIntent (seti_...), got:',
            secret,
          );
          setPaymentError(t('sales.contract.invalidPaymentConfiguration'));
          return;
        }

        setClientSecret(secret);
      } else {
        setPaymentError(t('sales.contract.failedToInitializePaymentForm'));
      }
    } catch (err) {
      setPaymentError(t('sales.contract.failedToInitializePaymentForm'));
    } finally {
      setIsLoadingClientSecret(false);
    }
  };

  // Function to handle opening modal for adding payment method
  const handleAddPaymentMethod = () => {
    setIsUpdateMode(false);
    setPaymentError(null);
    setClientSecret(''); // Reset client secret to fetch a new one
    setIsPaymentModalOpen(true);
  };

  // Function to handle opening modal for updating payment method
  const handleUpdatePaymentMethod = () => {
    setIsUpdateMode(true);
    setPaymentError(null);
    setClientSecret(''); // Reset client secret to fetch a new one
    setIsPaymentModalOpen(true);
  };

  useEffect(() => {
    if (isPaymentModalOpen) {
      fetchClientSecret();
    } else {
      // Cleanup: Reset client secret when modal closes to prevent reuse
      setClientSecret('');
    }
  }, [isPaymentModalOpen]);

  // if (!formData) return null;
  const togglePriceDetailDrawer = () => {
    setPriceRateDrawer((a) => !a);
  };

  // const isFlatRateSelected = PlanTypeEnums.FLAT === formData?.[FormKeys.PLAN];

  const getHolidayGroups = async () => {
    try {
      const response = await getHolidayGroupsFromFranchiseService({
        headers: {
          franchise_id: franchiseId,
        },
      });
      if (response?.statusCode === 200) {
        setHolidayGroups(transformArrayForOptions(response?.data, 'name', 'id'));
      }
    } catch (error) {
      // show error in toast if you want
    }
  };

  useEffect(() => {
    getHolidayGroups();
  }, []);

  /**
   * Update formData.holidayGroup when label is null but id exists
   * This runs only once when holidayGroups are fetched
   */
  useEffect(() => {
    if (hasUpdatedHolidayGroup.current) return; // Already updated, skip

    const selected = formData?.[FormKeys.HOLIDAY_GROUP];

    if (selected?.label === null && selected?.id) {
      if (holidayGroups.length > 0) {
        const matchingHolidayGroup = holidayGroups.find((group) => group.id === selected.id);

        if (matchingHolidayGroup) {
          setFormData((prevState) => ({
            ...prevState,
            [FormKeys.HOLIDAY_GROUP]: {
              ...matchingHolidayGroup,
              value: matchingHolidayGroup?.id,
              id: matchingHolidayGroup?.id,
              name: matchingHolidayGroup?.name,
              label: matchingHolidayGroup?.name,
              holidays: matchingHolidayGroup?.holidays,
              holidaysCount: matchingHolidayGroup?.holidays?.length,
            },
          }));
          hasUpdatedHolidayGroup.current = true;
        }
      } else if (holidayGroups.length === 0) {
        // Only set to empty if we've confirmed there are no holiday groups
        setFormData((prevState) => ({
          ...prevState,
          [FormKeys.HOLIDAY_GROUP]: {},
        }));
        hasUpdatedHolidayGroup.current = true;
      }
    }
  }, [holidayGroups]); // Only depend on holidayGroups, not formData

  // if (!formData) return null;

  const hasProfitabilityData =
    Number(profitability?.total) > 0 && Number.isFinite(Number(profitability?.inProfit));
  const profitabilityPercent = hasProfitabilityData
    ? (Number(profitability.inProfit) / Number(profitability.total)) * 100
    : 0;

  return (
    <Box className={classes.paymentStep}>
      {isFetchingOptions && (
        <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />
      )}
      {!stripeEnabled && (
        <Box className={classes.netProfitContainer}>
          <Typography variant="h3" className={classes.stepperHeaddings}>
            {t('sales.contract.selectBillingOccurrence')}
          </Typography>
          <Box className={classes.circularWrapper}>
            <>
              {proposalType === proposalTypeEnum.default && hasProfitabilityData && (
                <Box className={classes.widget}>
                  <Box className={classes.progressContainer}>
                    <CircularProgress
                      variant="determinate"
                      value={profitabilityPercent}
                      size={60}
                      thickness={6}
                      className={classes.progress}
                      sx={{
                        '& .MuiCircularProgress-circle': {
                          strokeLinecap: 'round',
                          color: profitability.color || '#ff9800',
                        },
                      }}
                    />
                  </Box>
                  <Box className={classes.content}>
                    <Typography variant="h1" className={classes.currentValue}>
                      {profitability.inProfit}/{profitability.total}
                    </Typography>
                    <Box className={classes.suggestRateBox}>
                      <Typography
                        variant="info"
                        className={classes.suggestRateText}
                        onClick={togglePriceDetailDrawer}
                      >
                        Services Profitable
                      </Typography>
                      <SuggestRateIcon />
                    </Box>
                  </Box>
                </Box>
              )}
              <Typography variant="body2" className={classes.contractDuration}>
                Contract Duration:{' '}
                {contractStartDate && contractEndDate
                  ? `${formatDate(contractStartDate)} - ${formatDate(contractEndDate)}`
                  : 'Not Selected'}
              </Typography>
            </>
          </Box>
        </Box>
      )}
      <Box className={classNames(classes.paymentStepInner, 'innerScrollBar')}>
        {stripeEnabled ? (
          <Box className={classes.billingFrequencySection}>
            <Box className={classes.stripeBillingContainer}>
              <Box className={classes.stripeBillingHeader}>
                <Typography className={classes.stripeBillingHeading}>
                  {t('sales.contract.billingFrequency')}
                </Typography>
                <Typography className={classes.stripeContractDuration}>
                  Contract Duration:{' '}
                  {contractStartDate && contractEndDate
                    ? `${formatDate(contractStartDate)} - ${formatDate(contractEndDate)}`
                    : 'Not Selected'}
                </Typography>
              </Box>

              <Box className={classes.billingTypeTabsGroup}>
                <button
                  className={classNames(
                    classes.billingTypeTab,
                    activeBillingType === 'recurring' && classes.billingTypeTabActive,
                  )}
                  onClick={() => handleBillingTypeTabChange('recurring')}
                >
                  {t('sales.contract.recurringPlan')}
                </button>
                <button
                  className={classNames(
                    classes.billingTypeTab,
                    activeBillingType === 'perService' && classes.billingTypeTabActive,
                  )}
                  onClick={() => handleBillingTypeTabChange('perService')}
                >
                  {t('sales.contract.perServiceCompletion')}
                </button>
              </Box>

              {activeBillingType === 'recurring' && (
                <>
                  <BillingOccurrenceSelector
                    selectedPlan={formData?.[FormKeys.PLAN]}
                    onPlanChange={handlePlanChange}
                    plans={displayedStripePlans}
                    disabled={false}
                    hasCustomDiscount={hasCustomDiscount}
                    hasDiscountError={!!getError('discount')}
                  />
                  <FieldError error={getError(FormKeys.PLAN) ? 'Please select a plan' : ''} />
                </>
              )}

              {/* Discount & Exempt Tax — shared across both tabs */}
              <Box>
                <Box className={classes.stripeCycleRefDateSection}>
                  <Box className={classes.stripeCycleRefInputWrapper}>
                    <Typography className={classes.stripeCycleRefDateLabel}>
                      {t('sales.contract.discount')}
                    </Typography>
                    <DiscountInputDropdown
                      name="discount"
                      id="discount"
                      value={formData?.discount || ''}
                      dropdownValue={formData?.discountType || 'percentage'}
                      onChange={inputChangedHandler}
                      onDropdownChange={inputChangedHandler}
                      error={!!getError('discount')}
                    />
                  </Box>
                  {taxExemptionEnabled && (
                    <Box className={classes.exemptTaxSection}>
                      <Checkbox
                        id="exemptTax"
                        name="exemptTax"
                        checked={Boolean(formData?.exemptTax)}
                        onChange={handleSwitch}
                        icon={<CheckBoxRegularIcon />}
                        checkedIcon={<CheckBoxCheckedIcon />}
                      />
                      <Typography className={classes.exemptTaxLabel}>
                        {t('sales.contract.exemptTax')}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <FieldError error={getError('discount')} />
              </Box>
              {/* Tax Exempt Upload */}
              {taxExemptionEnabled && formData?.exemptTax && (
                <Box className={classes.taxExemptUploadSection}>
                  <Typography className={classes.taxExemptUploadText}>
                    {t('sales.contract.uploadTaxText')}
                  </Typography>
                  {formData?.taxAdjustment ? (
                    <Box className={classes.taxExemptUploadedFile}>
                      <Typography className={classes.taxExemptFileName}>
                        {formData.taxAdjustment.name}
                      </Typography>
                      <TrashIcon
                        className={classes.taxExemptTrashIcon}
                        onClick={() => updateFormHandler('taxAdjustment', null)}
                      />
                    </Box>
                  ) : (
                    <Box component="label" className={classes.taxExemptUploadButton}>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const validationError = validateFileUpload(file);
                            if (validationError) {
                              setErrorMessages({
                                ...errorMessages,
                                [`${ActiveStepsKeys.PAYMENT_TERMS},taxAdjustment`]: validationError,
                              });
                              e.target.value = '';
                              return;
                            }
                            // eslint-disable-next-line no-unused-vars
                            const {
                              [`${ActiveStepsKeys.PAYMENT_TERMS},taxAdjustment`]: _,
                              ...rest
                            } = errorMessages;
                            setErrorMessages(rest);
                            updateFormHandler('taxAdjustment', file);
                          }
                        }}
                      />
                      <FileUploadIcon />
                      <Typography className={classes.taxExemptUploadButtonText}>
                        {t('sales.contract.uploadDocument')}
                      </Typography>
                    </Box>
                  )}
                  <FieldError error={getError('taxAdjustment')} />
                </Box>
              )}

              {/* Billing Info Section */}
              <Box className={classes.billingInfoSection}>
                <Box className={classes.billingInfoIcon}>
                  <InfoOutlinedIcon />
                </Box>
                <Typography className={classes.billingInfoText}>
                  {activeBillingType === 'recurring' ? (
                    <Trans
                      key={`billing-${selectedPlanKey}`}
                      i18nKey="sales.contract.billingInfoMessage"
                      values={{
                        startDate: billingStartDate || '-',
                        symbol: symbol || '$',
                        amount: billingPlanAmount,
                        frequency: billingFrequencyLabel,
                        payments: billingPaymentsCount,
                      }}
                      components={{
                        bold: <strong className={classes.billingInfoTextBold} />,
                      }}
                    />
                  ) : (
                    <Trans
                      i18nKey="sales.contract.billingInfoPerServiceMessage"
                      values={{
                        symbol: symbol || '$',
                        amount: perServiceAmount,
                        visits: perServiceVisits,
                      }}
                      components={{
                        bold: <strong className={classes.billingInfoTextBold} />,
                      }}
                    />
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            className={classNames(
              classes.paymentOptions,
              getViewDisabledContractClass(isPublished),
            )}
          >
            <Box className={classNames(classes.paymentColOne, classes.paymentPlansCol)}>
              <Box className={classNames(classes.paymentTdSecond, classes.paymentHeader)}>
                <Typography variant="h4">{t('sales.contract.paymentPlans')}</Typography>
              </Box>

              {/*Show Services Total*/}
              {proposalType !== proposalTypeEnum.dispatch && (
                <Box className={classes.paymentTdSecond}>
                  <Typography variant="subtitle1">
                    {t('sales.contract.servicesTotal', { symbol })}
                  </Typography>
                </Box>
              )}
              {/*Show dispatch total*/}
              {/*{proposalType === proposalTypeEnum.dispatch && (*/}
              <Box className={classes.paymentTdSecond}>
                <Typography variant="subtitle1">
                  {t('sales.contract.dispatchTotal', {
                    dispatchTerm: getLabel('terms', 'dispatch'),
                    symbol,
                  })}
                </Typography>
              </Box>
              {/*)}*/}

              {lineItems.map((lineItem, index) => (
                <Box className={classes.paymentTdSecond} key={index}>
                  <Typography variant="subtitle1">{lineItem.name}</Typography>
                </Box>
              ))}
              {visitorManagementPlans && (
                <Box className={classes.paymentTdSecond}>
                  <Typography variant="subtitle1">
                    {t('sales.contract.visitorManagement')}
                  </Typography>
                </Box>
              )}
              {loadManagementPlans && (
                <Box className={classes.paymentTdSecond}>
                  <Typography variant="subtitle1">{t('sales.contract.loadManagement')}</Typography>
                </Box>
              )}
              {isFuelSurchargeApplicable && (
                <Box className={classNames(classes.paymentTd, classes.inlineField)}>
                  <Typography className={classes.inlineLables} variant="subtitle1">
                    {t('sales.contract.fuelSurcharge')}
                  </Typography>
                  <TextField
                    id={FormKeys.FUEL_SURCHARGE}
                    name={FormKeys.FUEL_SURCHARGE}
                    fullWidth
                    type="number"
                    onWheel={(e) => e.target.blur()} // disables scroll on input
                    onChange={inputChangedHandler}
                    onKeyDown={preventScientificNotation}
                    value={formData?.[FormKeys.FUEL_SURCHARGE]}
                    placeholder={t('sales.contract.addPercentage')}
                    className={classes.inputHight}
                    error={!!getError(FormKeys.FUEL_SURCHARGE)}
                    InputProps={{
                      inputProps: {
                        min: 0,
                      },
                    }}
                    disabled={!isFuelSurchargeApplicable}
                  />
                </Box>
              )}
              <Box className={classNames(classes.paymentTd, classes.inlineField)}>
                <Typography variant="subtitle1">
                  {t('sales.contract.taxRate')} <RequiredAsterik />
                </Typography>
                <TextField
                  id={FormKeys.TAX_RATE}
                  name={FormKeys.TAX_RATE}
                  fullWidth
                  type="number"
                  onWheel={(e) => e.target.blur()} // disables scroll on input
                  onChange={inputChangedHandler}
                  onKeyDown={preventScientificNotation}
                  value={formData?.[FormKeys.TAX_RATE]}
                  placeholder={t('sales.contract.addPercentage')}
                  className={classes.inputHight}
                  error={!!getError(FormKeys.TAX_RATE)}
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
                />
              </Box>
              <Box className={classNames(classes.paymentTdSecond, classes.paymentFooter)}>
                <Typography variant="h4">{t('sales.contract.total', { symbol })}</Typography>
              </Box>
            </Box>
            <Box className={classes.paymentOptionsSecond}>
              <RadioGroup
                row
                aria-labelledby="demo-radio-buttons-group-label"
                name={FormKeys.PLAN}
                value={formData?.[FormKeys.PLAN] || PlanTypeEnums.WEEKLY}
                onChange={inputChangedHandler}
              >
                {PlanColumns.map((planTypeValue) => {
                  const isCurrentPlanSelected = formData?.[FormKeys.PLAN] === planTypeValue;
                  const isEventSelected = PlanTypeEnums.EVENT === formData?.[FormKeys.PLAN];
                  const isFlatRatePlan = planTypeValue === PlanTypeEnums.FLAT;
                  const isWeeklyPlan = planTypeValue === PlanTypeEnums.WEEKLY;
                  const shouldDisable = !apiData?.availablePlans?.includes(Number(planTypeValue));

                  return (
                    <Box
                      key={planTypeValue}
                      className={classNames(
                        classes.paymentColTwo,
                        classes.monthlyCol,
                        shouldDisable && classes.disabledColumn,
                      )}
                    >
                      {isWeeklyPlan ? (
                        <Box
                          className={classNames(
                            // classes.paymentTdHeader,
                            classes.radioHeader,
                          )}
                        >
                          <Box
                            className={classNames(
                              classes.checkBoxPoint,
                              classes.weekEvent,
                              isCurrentPlanSelected || isEventSelected ? classes.boxBorder : '',
                            )}
                          >
                            <Box
                              className={classNames(
                                classes.paymentTdHeader,
                                classes.PaymentHeaderDivider,
                                isCurrentPlanSelected &&
                                  classNames(classes.activeRadio, classes.activeRadioBox),
                              )}
                            >
                              <FormControlLabel
                                value={planTypeValue}
                                control={<Radio disableRipple />}
                                label={planTypeTitles[planTypeValue]}
                                disabled={shouldDisable}
                              />
                            </Box>
                            <Box
                              className={classNames(
                                classes.paymentTdHeader,
                                classes.PaymentHeaderDivider,
                                isEventSelected &&
                                  classNames(classes.activeRadio, classes.activeRadioBox),
                              )}
                            >
                              <FormControlLabel
                                value={PlanTypeEnums.EVENT}
                                control={<Radio disableRipple />}
                                label={planTypeTitles[PlanTypeEnums.EVENT]}
                              />
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          className={classNames(
                            classes.paymentTdHeader,
                            classes.radioHeader,
                            isCurrentPlanSelected &&
                              classNames(classes.activeRadio, classes.activeRadioBox),
                          )}
                        >
                          <Box className={classes.checkBoxPoint}>
                            <FormControlLabel
                              value={planTypeValue}
                              control={<Radio disableRipple />}
                              label={planTypeTitles[planTypeValue]}
                              disabled={shouldDisable}
                            />
                          </Box>

                          {isFlatRatePlan && (
                            <TextField
                              id={FormKeys.FLAT_RATE}
                              name={FormKeys.FLAT_RATE}
                              fullWidth
                              type="number"
                              onWheel={(e) => e.target.blur()} // disables scroll on input
                              onChange={inputChangedHandler}
                              onKeyDown={preventScientificNotation}
                              value={formData?.[FormKeys.FLAT_RATE]}
                              placeholder={t('sales.contract.flatRatemonth')}
                              className={classes.inputHightFull}
                              error={!!getError(FormKeys.FLAT_RATE)}
                              // helperText={getError(FormKeys.FLAT_RATE)}
                              InputProps={{
                                inputProps: {
                                  min: 0,
                                },
                              }}
                              disabled={formData?.[FormKeys.PLAN] !== PlanTypeEnums.FLAT}
                            />
                          )}
                        </Box>
                      )}
                      <Box
                        className={
                          (isCurrentPlanSelected || (isEventSelected && isWeeklyPlan)) &&
                          classes.activeRadio
                        }
                      >
                        {proposalType !== proposalTypeEnum.dispatch && (
                          <Box className={classNames(classes.paymentTdSecond)}>
                            <Typography variant="body1">
                              {isFlatRatePlan
                                ? t('sales.contract.includedInFlatRate')
                                : fomatNumbersWithCommas(servicesPlans?.[planTypeValue])}
                            </Typography>
                          </Box>
                        )}
                        {/*{proposalType === proposalTypeEnum.dispatch && (*/}
                        <Box className={classNames(classes.paymentTdSecond)}>
                          <Typography variant="body1">
                            {isFlatRatePlan
                              ? t('sales.contract.includedInFlatRate')
                              : fomatNumbersWithCommas(dispatchPlans?.[planTypeValue])}
                          </Typography>
                        </Box>
                        {/*)}*/}
                        {lineItems.map((lineItem, index) => (
                          <Box className={classes.paymentTdSecond} key={index}>
                            <Typography variant="body1">
                              {isFlatRatePlan
                                ? t('sales.contract.includedInFlatRate')
                                : fomatNumbersWithCommas(
                                    lineItem?.[
                                      isEventSelected && isWeeklyPlan
                                        ? PlanTypeEnums.EVENT
                                        : planTypeValue
                                    ],
                                  )}
                            </Typography>
                          </Box>
                        ))}
                        {visitorManagementPlans && (
                          <Box className={classes.paymentTdSecond}>
                            <Typography variant="body1">
                              {isFlatRatePlan
                                ? t('sales.contract.includedInFlatRate')
                                : fomatNumbersWithCommas(
                                    visitorManagementPlans?.[
                                      isEventSelected && isWeeklyPlan
                                        ? PlanTypeEnums.EVENT
                                        : planTypeValue
                                    ],
                                  )}
                            </Typography>
                          </Box>
                        )}
                        {loadManagementPlans && (
                          <Box className={classes.paymentTdSecond}>
                            <Typography variant="body1">
                              {isFlatRatePlan
                                ? t('sales.contract.includedInFlatRate')
                                : fomatNumbersWithCommas(
                                    loadManagementPlans?.[
                                      isEventSelected && isWeeklyPlan
                                        ? PlanTypeEnums.EVENT
                                        : planTypeValue
                                    ],
                                  )}
                            </Typography>
                          </Box>
                        )}
                        {isFuelSurchargeApplicable && (
                          <Box className={classes.paymentTdSecond}>
                            <Typography variant="body1">
                              {fomatNumbersWithCommas(
                                contractCalculations?.[
                                  isEventSelected && isWeeklyPlan
                                    ? PlanTypeEnums.EVENT
                                    : planTypeValue
                                ]?.fuelSurchargeAmount,
                              )}
                              {/* {!isFlatRatePlan
                                ? t('sales.contract.includedInFlatRate')
                                : fomatNumbersWithCommas(
                                    contractCalculations?.[
                                      isEventSelected && isWeeklyPlan
                                        ? PlanTypeEnums.EVENT
                                        : planTypeValue
                                    ]?.fuelSurchargeAmount,
                                  )} */}
                            </Typography>
                          </Box>
                        )}
                        <Box className={classes.paymentTdSecond}>
                          <Typography variant="body1">
                            {fomatNumbersWithCommas(
                              contractCalculations?.[
                                isEventSelected && isWeeklyPlan
                                  ? PlanTypeEnums.EVENT
                                  : planTypeValue
                              ]?.taxAmount,
                            )}
                          </Typography>
                        </Box>
                        <Box className={classNames(classes.paymentTdSecond, classes.paymentFooter)}>
                          <Typography variant="body1">
                            {fomatNumbersWithCommas(
                              contractCalculations?.[
                                isEventSelected && isWeeklyPlan
                                  ? PlanTypeEnums.EVENT
                                  : planTypeValue
                              ]?.total,
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </RadioGroup>
            </Box>
          </Box>
        )}

        <Box>
          <Typography variant="h3" className={classes.stepperHeadding}>
            {t('sales.contract.definePaymentTerms')}
          </Typography>
          <Box
            className={classNames(
              classes.paymentsDropdowns,
              getViewDisabledContractClass(isPublished),
            )}
          >
            {!stripeEnabled && (
              <Box className={classes.fourDropdown}>
                <Box className={classes.halfDropdown}>
                  <InputLabel htmlFor={FormKeys.CYCLE_REF_DATE}>
                    {t('sales.contract.cycleReferenceDate')} <RequiredAsterik />
                  </InputLabel>
                  <Box className={classes.duelTime}>
                    <ResponsiveDatePickers
                      value={
                        formData?.[FormKeys.CYCLE_REF_DATE]
                          ? convertMMDDYYYYToDayJsDate(formData[FormKeys.CYCLE_REF_DATE])
                          : null
                      }
                      onChange={(value) => handleDateChange(value)}
                      placeholder={t('sales.contract.selectCycleReferenceDate')}
                      format={dateFormat}
                      inputFormat={dateFormat}
                      error={!!getError(FormKeys.CYCLE_REF_DATE)}
                      // minDate={dayjs(contractStartDate) || today}
                      // maxDate={contractendDate && dayjs(contractendDate)}
                    />
                  </Box>
                  <Box>
                    <div className={classes.invalidFeedback}>
                      {!!getError(FormKeys.CYCLE_REF_DATE) &&
                        t('sales.contract.cycleRefDateRequired')}
                    </div>
                  </Box>
                </Box>
                <Box className={classes.halfDropdown}>
                  <InputLabel htmlFor={FormKeys.PAYMENT_DATE}>
                    {t('sales.contract.paymentTerms')} <RequiredAsterik />
                  </InputLabel>
                  <CustomDropDown
                    name={FormKeys.PAYMENT_DATE}
                    id={FormKeys.PAYMENT_DATE}
                    placeHolder={t('sales.contract.selectDeadLine')}
                    options={transformArrayForOptions(options?.dueBufferDays, 'title', 'id')}
                    selectedValues={formData?.[FormKeys.PAYMENT_DATE] || {}}
                    handleChange={inputChangedHandler}
                    className={classes.dropHeader}
                    placeHolderClassName={classes.placeHolderSize}
                    bordered
                    error={!!getError(FormKeys.PAYMENT_DATE)}
                    isError={getError(FormKeys.PAYMENT_DATE)}
                  />
                  <Box>
                    <div className={classes.invalidFeedback}>
                      {!!getError(FormKeys.PAYMENT_DATE) &&
                        t('sales.contract.paymentTermsRequired')}
                    </div>
                  </Box>
                </Box>

                <Box className={classes.halfDropdown}>
                  <InputLabel htmlFor={FormKeys.PAYMENT_METHOD}>
                    {t('sales.contract.paymentMethod')} <RequiredAsterik />
                  </InputLabel>
                  <CustomDropDown
                    name={FormKeys.PAYMENT_METHOD}
                    id={FormKeys.PAYMENT_METHOD}
                    placeHolder={t('sales.contract.selectPaymentMethod')}
                    options={transformArrayForOptions(options?.paymentMethods, 'title', 'id')}
                    selectedValues={formData?.[FormKeys.PAYMENT_METHOD] || {}}
                    handleChange={inputChangedHandler}
                    className={classes.dropHeader}
                    bordered
                    placeHolderClassName={classes.placeHolderSize}
                    error={!!getError(FormKeys.PAYMENT_METHOD)}
                    isError={getError(FormKeys.PAYMENT_METHOD)}
                  />
                  <Box>
                    <div className={classes.invalidFeedback}>
                      {!!getError(FormKeys.PAYMENT_METHOD) &&
                        t('sales.contract.paymentMethodRequired')}
                    </div>
                  </Box>
                </Box>
                <Box className={classes.halfDropdown}>
                  <InputLabel>
                    {t('sales.contract.officerBreaks', {
                      officerTermCap: getLabel('roles', 'officer'),
                      guardTermCap: getLabel('terms', 'guard'),
                    })}
                  </InputLabel>
                  {console.log({ asd: formData?.[FormKeys.BILLABLE] })}
                  <Box className={classes.checkBoxCol}>
                    <Box className={classes.checkBoxArea}>
                      <Checkbox
                        id={FormKeys.BILLABLE}
                        name={FormKeys.BILLABLE}
                        checked={Boolean(formData?.[FormKeys.BILLABLE])}
                        onChange={handleSwitch}
                        icon={<CheckBoxRegularIcon />}
                        checkedIcon={<CheckBoxCheckedIcon />}
                        className={classes.checkBoxCustom}
                      />
                      <Typography variant="body2" className={classes?.previewQuestionOptionText}>
                        {`${t('sales.contract.billable')}`}
                      </Typography>
                    </Box>
                    <Box className={classes.checkBoxArea}>
                      <Checkbox
                        id={FormKeys.PAYABLE}
                        name={FormKeys.PAYABLE}
                        checked={Boolean(formData?.[FormKeys.PAYABLE])}
                        onChange={handleSwitch}
                        icon={<CheckBoxRegularIcon />}
                        checkedIcon={<CheckBoxCheckedIcon />}
                        className={classes.checkBoxCustom}
                      />
                      <Typography variant="body2" className={classes?.previewQuestionOptionText}>
                        {`${t('sales.contract.payable')}`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            <Box className={classes.fourDropdown}>
              <Box className={classes.halfDropdown}>
                <InputLabel htmlFor={FormKeys.ANNUAL_RATE_INCREASE}>
                  {t('sales.contract.annualRateIncrease')} <RequiredAsterik />
                </InputLabel>
                <TextField
                  id={FormKeys.ANNUAL_RATE_INCREASE}
                  name={FormKeys.ANNUAL_RATE_INCREASE}
                  fullWidth
                  type="number"
                  onWheel={(e) => e.target.blur()} // disables scroll on input
                  onChange={inputChangedHandler}
                  onKeyDown={preventScientificNotation}
                  value={formData?.[FormKeys.ANNUAL_RATE_INCREASE]}
                  placeholder={t('sales.contract.addPercentage')}
                  className={classes.dropHeaders}
                  error={!!getError(FormKeys.ANNUAL_RATE_INCREASE)}
                  helperText={
                    getError(FormKeys.ANNUAL_RATE_INCREASE) &&
                    checkAndAddDot(getError(FormKeys.ANNUAL_RATE_INCREASE))
                  }
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
                />
              </Box>
              {/** Git */}
              {!stripeEnabled && (
                <>
                  <Box className={classes.halfDropdown}>
                    <InputLabel htmlFor={FormKeys.HOLIDAY_MULTIPLIER}>
                      {t('sales.contract.holidayMultiplier')}
                      {formData?.[FormKeys.HOLIDAY_GROUP]?.value != null && <RequiredAsterik />}
                    </InputLabel>
                    {/* <TextField
                      id={FormKeys.HOLIDAY_MULTIPLIER}
                      name={FormKeys.HOLIDAY_MULTIPLIER}
                      fullWidth
                      type="number"
                      onWheel={(e) => e.target.blur()} // disables scroll on input
                      onChange={inputChangedHandler}
                      onKeyDown={preventScientificNotation}
                      value={formData?.holidayMultiplier?.toString()}
                      placeholder={t('sales.contract.addHolidayMultiplier')}
                      className={classes.dropHeaders}
                      error={getError(FormKeys.HOLIDAY_MULTIPLIER)}
                      helperText={
                        getError(FormKeys.HOLIDAY_MULTIPLIER) &&
                        checkAndAddDot(getError(FormKeys.HOLIDAY_MULTIPLIER))
                      }
                      InputProps={{
                        inputProps: {
                          min: 0,
                        },
                      }}
                    /> */}
                    <HolidayRateInputDropdown
                      name={FormKeys.HOLIDAY_MULTIPLIER}
                      id={FormKeys.HOLIDAY_MULTIPLIER}
                      placeholder={t('sales.contract.holidayMultiplier')}
                      value={formData?.holidayMultiplier}
                      dropdownValue={formData?.holidayMultiplierType || 'multiplier'}
                      onChange={inputChangedHandler}
                      onDropdownChange={inputChangedHandler}
                      className={classes?.textFiledFilter}
                    />
                    <FieldError error={getError(FormKeys.HOLIDAY_MULTIPLIER)} />
                  </Box>
                  {/* Holiday Group */}
                  <Box className={classes.halfDropdown}>
                    <InputLabel htmlFor={FormKeys.HOLIDAY_GROUP}>
                      {t('sales.contract.holidayGroup')}
                      {formData?.[FormKeys.HOLIDAY_MULTIPLIER] != null &&
                        formData?.[FormKeys.HOLIDAY_MULTIPLIER] !== '' &&
                        Number(formData?.[FormKeys.HOLIDAY_MULTIPLIER]) >= 1 && <RequiredAsterik />}
                    </InputLabel>
                    <CustomDropDown
                      name={FormKeys.HOLIDAY_GROUP}
                      id={FormKeys.HOLIDAY_GROUP}
                      placeHolder={t('sales.contract.selectHolidayGroup')}
                      options={holidayGroups || []}
                      selectedValues={formData?.[FormKeys.HOLIDAY_GROUP] || {}}
                      handleChange={inputChangedHandler}
                      className={classes.dropHeader}
                      bordered
                      placeHolderClassName={classes.placeHolderSize}
                      error={!!getError(FormKeys.HOLIDAY_GROUP)}
                      isError={getError(FormKeys.HOLIDAY_GROUP)}
                    />
                    <Box>
                      <div className={classes.invalidFeedback}>
                        {!!getError(FormKeys.HOLIDAY_GROUP) &&
                          t('sales.contract.holidayGroupRequired')}
                      </div>
                    </Box>
                    <Box className={classes.holidayGroupCount}>
                      <Typography className={classes.holidayGroupCountText}>
                        {`${formData?.[FormKeys.HOLIDAY_GROUP]?.holidaysCount || 0} ${t('sales.contract.holidays')}`}
                      </Typography>
                      <Tooltip
                        arrow
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, -14],
                                },
                              },
                            ],
                            sx: { cursor: 'pointer' },
                          },
                        }}
                        title={formData?.[FormKeys.HOLIDAY_GROUP]?.holidays?.join(', ')}
                        placement="top"
                      >
                        <InfoIcon className={classes.alertIcon} color={'blue'} />
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box className={classes.halfDropdown}>
                    <InputLabel htmlFor={FormKeys.BILLING_TYPE}>
                      {t('sales.contract.billingType')} <RequiredAsterik />
                    </InputLabel>
                    <CustomDropDown
                      name={FormKeys.BILLING_TYPE}
                      id={FormKeys.BILLING_TYPE}
                      placeHolder={t('sales.contract.selectBillingType')}
                      options={transformArrayForOptions(options?.billingTypes, 'title', 'key')}
                      selectedValues={formData?.[FormKeys.BILLING_TYPE] || {}}
                      handleChange={inputChangedHandler}
                      className={classes.dropHeader}
                      bordered
                      placeHolderClassName={classes.placeHolderSize}
                      error={!!getError(FormKeys.BILLING_TYPE)}
                      isError={getError(FormKeys.BILLING_TYPE)}
                    />
                    <Box>
                      <div className={classes.invalidFeedback}>
                        {!!getError(FormKeys.BILLING_TYPE) &&
                          t('sales.contract.billingTypeRequired')}
                      </div>
                    </Box>
                  </Box>
                  <Box className={classes.halfDropdown}>
                    <InputLabel htmlFor={FormKeys.CONTRACT_TYPE}>
                      {t('sales.contract.contractType')} <RequiredAsterik />
                    </InputLabel>
                    <CustomDropDown
                      name={FormKeys.CONTRACT_TYPE}
                      id={FormKeys.CONTRACT_TYPE}
                      placeHolder={t('sales.contract.selectContractType')}
                      options={transformArrayForOptions(options?.contractTypes, 'title', 'key')}
                      selectedValues={formData?.[FormKeys.CONTRACT_TYPE] || {}}
                      handleChange={inputChangedHandler}
                      className={classes.dropHeader}
                      bordered
                      placeHolderClassName={classes.placeHolderSize}
                      error={!!getError(FormKeys.CONTRACT_TYPE)}
                      isError={getError(FormKeys.CONTRACT_TYPE)}
                    />
                    <Box>
                      <div className={classes.invalidFeedback}>
                        {!!getError(FormKeys.CONTRACT_TYPE) &&
                          t('sales.contract.contractTypeRequired')}
                      </div>
                    </Box>
                  </Box>
                  <Box className={classes.halfDropdown}>
                    <InputLabel htmlFor={FormKeys.BILLING_FREQUENCY}>
                      {t('sales.contract.selectBillingFrequency')} <RequiredAsterik />
                    </InputLabel>
                    <CustomDropDown
                      name={FormKeys.BILLING_FREQUENCY}
                      id={FormKeys.BILLING_FREQUENCY}
                      placeHolder={t('sales.contract.selectBillingFrequency')}
                      options={transformArrayForOptions(
                        options?.billingFrequencies,
                        'title',
                        'key',
                      )}
                      selectedValues={formData?.[FormKeys.BILLING_FREQUENCY] || {}}
                      handleChange={inputChangedHandler}
                      className={classes.dropHeader}
                      bordered
                      placeHolderClassName={classes.placeHolderSize}
                      error={!!getError(FormKeys.BILLING_FREQUENCY)}
                      isError={getError(FormKeys.BILLING_FREQUENCY)}
                    />
                    <Box>
                      <div className={classes.invalidFeedback}>
                        {!!getError(FormKeys.BILLING_FREQUENCY) &&
                          t('sales.contract.billingFrequencyRequired')}
                      </div>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
        {/* Billing Information */}
        <Box className={classes.contractsBillingInfo}>
          <Typography variant="h3" className={classes.stepperHeadding}>
            {t('sales.contract.billingInfo')}
          </Typography>
          <Box className={classes.radioOption}>
            <RadioGroup
              row
              value={formData?.[FormKeys.BILLING_ADDRESS_OPTION] || BillingAddressOptions.COMPANY}
              onChange={handleBillingAddressOptionChange}
            >
              <FormControlLabel
                value={BillingAddressOptions.PROPERTY}
                control={<Radio disableRipple />}
                label={t('sales.contract.propertyAddress')}
              />
              <FormControlLabel
                value={BillingAddressOptions.COMPANY}
                control={<Radio disableRipple />}
                label={t('sales.contract.companyAddress')}
              />
              <FormControlLabel
                value={BillingAddressOptions.OTHER}
                control={<Radio disableRipple />}
                label={t('sales.contract.other')}
              />
            </RadioGroup>
          </Box>
          <Box
            className={classNames(
              classes.paymentsDropdowns,
              getViewDisabledContractClass(isPublished),
            )}
          >
            <Box className={classes.fourDropdown}>
              <Box className={classes.halfDropdown}>
                <InputLabel htmlFor={FormKeys.BILLING_OWNER_FIRST_NAME}>
                  {t('sales.contract.billingFirstName')} <RequiredAsterik />
                </InputLabel>
                <TextField
                  id={FormKeys.BILLING_OWNER_FIRST_NAME}
                  name={FormKeys.BILLING_OWNER_FIRST_NAME}
                  fullWidth
                  type="text"
                  onChange={inputChangedHandler}
                  value={formData?.[FormKeys.BILLING_OWNER_FIRST_NAME]}
                  placeholder={t('sales.contract.billingAddFirstName')}
                  className={classes.dropHeaders}
                  error={getError(FormKeys.BILLING_OWNER_FIRST_NAME)}
                  helperText={
                    getError(FormKeys.BILLING_OWNER_FIRST_NAME) &&
                    checkAndAddDot(getError(FormKeys.BILLING_OWNER_FIRST_NAME))
                  }
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
                />
              </Box>

              <Box className={classes.halfDropdown}>
                <InputLabel htmlFor={FormKeys.BILLING_OWNER_LAST_NAME}>
                  {t('sales.contract.billingLastName')} <RequiredAsterik />
                </InputLabel>
                <TextField
                  id={FormKeys.BILLING_OWNER_LAST_NAME}
                  name={FormKeys.BILLING_OWNER_LAST_NAME}
                  fullWidth
                  type="text"
                  onChange={inputChangedHandler}
                  value={formData?.[FormKeys.BILLING_OWNER_LAST_NAME]}
                  placeholder={t('sales.contract.billingAddLastName')}
                  className={classes.dropHeaders}
                  error={getError(FormKeys.BILLING_OWNER_LAST_NAME)}
                  helperText={
                    getError(FormKeys.BILLING_OWNER_LAST_NAME) &&
                    checkAndAddDot(getError(FormKeys.BILLING_OWNER_LAST_NAME))
                  }
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
                />
              </Box>

              <Box className={classes.halfDropdown}>
                <InputLabel htmlFor={FormKeys.BILLING_OWNER_EMAIL}>
                  {t('sales.contract.billingEmail')} <RequiredAsterik />
                </InputLabel>
                <TextField
                  id={FormKeys.BILLING_OWNER_EMAIL}
                  name={FormKeys.BILLING_OWNER_EMAIL}
                  fullWidth
                  type="text"
                  onChange={inputChangedHandler}
                  value={formData?.[FormKeys.BILLING_OWNER_EMAIL]}
                  placeholder={t('sales.contract.billingAddEmail')}
                  className={classes.dropHeaders}
                  error={getError(FormKeys.BILLING_OWNER_EMAIL)}
                  helperText={
                    getError(FormKeys.BILLING_OWNER_EMAIL) &&
                    checkAndAddDot(getError(FormKeys.BILLING_OWNER_EMAIL))
                  }
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
                />
              </Box>

              <Box className={classes.halfDropdown}>
                <InputLabel htmlFor={FormKeys.BILLING_OWNER_PHONE}>
                  {t('sales.contract.billingPhoneNo')} <RequiredAsterik />
                </InputLabel>
                {/*<TextField*/}
                {/*  id={FormKeys.BILLING_OWNER_PHONE}*/}
                {/*  name={FormKeys.BILLING_OWNER_PHONE}*/}
                {/*  fullWidth*/}
                {/*  type="text"*/}
                {/*  onChange={inputChangedHandler}*/}
                {/*  value={formData?.[FormKeys.BILLING_OWNER_PHONE]}*/}
                {/*  placeholder={t('sales.contract.billingAddPhoneNo')}*/}
                {/*  className={classes.dropHeaders}*/}
                {/*  error={getError(FormKeys.BILLING_OWNER_PHONE)}*/}
                {/*  helperText={*/}
                {/*    getError(FormKeys.BILLING_OWNER_PHONE) &&*/}
                {/*    checkAndAddDot(getError(FormKeys.BILLING_OWNER_PHONE))*/}
                {/*  }*/}
                {/*  InputProps={{*/}
                {/*    inputProps: {*/}
                {/*      min: 0,*/}
                {/*    },*/}
                {/*  }}*/}
                {/*/>*/}
                <PhoneNumberWithCountry
                  value={formData?.[FormKeys.BILLING_OWNER_PHONE] || ''}
                  onChange={(value) =>
                    inputChangedHandler({
                      target: { name: FormKeys.BILLING_OWNER_PHONE, value: value ? value : '' },
                    })
                  }
                  name={FormKeys.BILLING_OWNER_PHONE}
                  isError={!!getError(FormKeys.BILLING_OWNER_PHONE)}
                  international={true}
                  error={getError(FormKeys.BILLING_OWNER_PHONE)}
                  className={classes.countryPhnNumber}
                />
              </Box>
            </Box>
            {stripeEnabled && !formData?.[FormKeys.BILLING_METHOD]?.id && (
              <Box>
                <Button
                  className={classes.addPaymentDetailButton}
                  variant="secondaryGrey"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={handleAddPaymentMethod}
                  disabled={
                    !formData?.[FormKeys.BILLING_OWNER_FIRST_NAME]?.length ||
                    !formData?.[FormKeys.BILLING_OWNER_LAST_NAME]?.length ||
                    !formData?.[FormKeys.BILLING_OWNER_EMAIL]?.length ||
                    !formData?.[FormKeys.BILLING_OWNER_PHONE]?.length
                  }
                >
                  {t('sales.contract.addPaymentDetail')}
                </Button>
                <FieldError
                  error={getError(FormKeys.BILLING_METHOD)}
                  helperText={
                    getError(FormKeys.BILLING_METHOD) &&
                    checkAndAddDot(getError(FormKeys.BILLING_METHOD))
                  }
                />
              </Box>
            )}

            {/* Display saved payment method */}
            {formData?.[FormKeys.BILLING_METHOD]?.id && (
              <>
                <SavedPaymentMethod
                  paymentMethod={formData[FormKeys.BILLING_METHOD]}
                  onRemove={() => {
                    setFormData((prev) => ({
                      ...prev,
                      [FormKeys.BILLING_METHOD]: null,
                    }));
                    toast.success(t('sales.contract.paymentMethodRemovedSuccessfully'));
                  }}
                />
                <Button
                  className={classes.addPaymentDetailButton}
                  variant="secondaryGrey"
                  fullWidth
                  onClick={handleUpdatePaymentMethod}
                  startIcon={<AddIcon />}
                  disabled={
                    !formData?.[FormKeys.BILLING_OWNER_FIRST_NAME]?.length ||
                    !formData?.[FormKeys.BILLING_OWNER_LAST_NAME]?.length ||
                    !formData?.[FormKeys.BILLING_OWNER_EMAIL]?.length ||
                    !formData?.[FormKeys.BILLING_OWNER_PHONE]?.length
                  }
                >
                  {t('sales.contract.updatePaymentDetail')}
                </Button>
              </>
            )}

            {formData?.[FormKeys.BILLING_ADDRESS_OPTION] !== BillingAddressOptions.OTHER && (
              <Box className={classes.contractsBillingInfoUpdate}>
                <Box className={classes.threeDropdown}>
                  <Box className={classes.thirdQiardDropdpwn}>
                    <InputLabel htmlFor="addressLine">{t('sales.contract.address')}</InputLabel>
                    <TextField
                      fullWidth
                      placeholder={t('sales.contract.address')}
                      value={displayAddress?.[FormKeys.STREET_ADDRESS] || ''}
                      className={classes.dropHigh}
                      disabled={true}
                    />
                  </Box>
                  <Box className={classes.halfDropdown}>
                    <InputLabel htmlFor="country">
                      {t('form.input.textField.country.label')}
                    </InputLabel>
                    <TextField
                      fullWidth
                      value={displayAddress?.[FormKeys.COUNTRY]?.name || ''}
                      className={classes.dropHigh}
                      disabled={true}
                    />
                  </Box>
                  <Box className={classes.halfDropdown}>
                    <InputLabel htmlFor="city">{t('sales.locations.state')}</InputLabel>
                    <TextField
                      fullWidth
                      value={displayAddress?.[FormKeys.STATE]?.name || ''}
                      className={classes.dropHigh}
                      disabled={true}
                    />
                  </Box>
                </Box>
                <Box className={classes.twoDropdown}>
                  <Box className={`${classes.halfDropdown} ${classes.fiftyWidth}`}>
                    <InputLabel htmlFor="state">{t('sales.locations.city')}</InputLabel>
                    <TextField
                      fullWidth
                      value={displayAddress?.[FormKeys.CITY]?.name || ''}
                      className={classes.dropHigh}
                      disabled={true}
                    />
                  </Box>
                  <Box className={`${classes.halfDropdown} ${classes.fiftyWidth}`}>
                    <InputLabel htmlFor="postalCode">{t('sales.contract.postalCode')}</InputLabel>
                    <TextField
                      type="string"
                      fullWidth
                      value={displayAddress?.[FormKeys.POSTAL_CODE] || ''}
                      className={classes.dropHigh}
                      disabled={true}
                    />
                  </Box>
                </Box>
              </Box>
            )}
            {/*Address Fields*/}
          </Box>
        </Box>
        {formData?.[FormKeys.BILLING_ADDRESS_OPTION] === BillingAddressOptions.OTHER && (
          <Box className={classes.contractsBillingInfoUpdate}>
            <Box className={classes.threeDropdown}>
              <Box className={classes.thirdQiardDropdpwn}>
                <InputLabel htmlFor="addressLine">
                  {t('sales.contract.address')}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  name={FormKeys.ADDRESS}
                  id={FormKeys.ADDRESS}
                  fullWidth
                  placeholder={t('sales.contract.address')}
                  error={getError(FormKeys.ADDRESS)}
                  onChange={inputChangedHandler}
                  value={formData?.[FormKeys.ADDRESS] || ''}
                  className={classes.dropHigh}
                  helperText={
                    getError(FormKeys.ADDRESS) && checkAndAddDot(getError(FormKeys.ADDRESS))
                  }
                />
              </Box>
              <Box className={classes.halfDropdown}>
                <InputLabel htmlFor="country">
                  {t('form.input.textField.country.label')}
                  <RequiredAsterik />
                </InputLabel>
                <CountrySelectHookComponent />
              </Box>

              <Box className={classes.halfDropdown}>
                <InputLabel htmlFor="city">
                  {t('sales.locations.state')} <RequiredAsterik />
                </InputLabel>
                <StateHookComponent />
              </Box>
            </Box>
            <Box className={classes.twoDropdown}>
              <Box className={`${classes.halfDropdown} ${classes.fiftyWidth}`}>
                <InputLabel htmlFor="state">
                  {t('sales.locations.city')} <RequiredAsterik />
                </InputLabel>
                <CityHookComponent />
              </Box>
              <Box className={`${classes.halfDropdown} ${classes.fiftyWidth}`}>
                <InputLabel htmlFor="postalCode">
                  {t('sales.contract.postalCode')}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  name={FormKeys.POSTAL_CODE}
                  id={FormKeys.POSTAL_CODE}
                  type="string"
                  fullWidth
                  placeholder="68010"
                  error={getError(FormKeys.POSTAL_CODE)}
                  helperText={
                    getError(FormKeys.POSTAL_CODE) && checkAndAddDot(getError(FormKeys.POSTAL_CODE))
                  }
                  onChange={inputChangedHandler}
                  value={formData?.[FormKeys.POSTAL_CODE] || ''}
                  className={classes.dropHigh}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Payment Method Modal */}
      {isPaymentModalOpen && (
        <Dialog
          open={isPaymentModalOpen}
          // onClose={() => setIsPaymentModalOpen(false)}
          maxWidth="sm"
          fullWidth
          className={classes.paymentModal}
        >
          <DialogTitle>
            <Typography variant="h3" className={classes.paymentModalTitle}>
              {isUpdateMode
                ? t('sales.contract.updatePaymentMethod')
                : t('sales.contract.addPaymentMethod')}
            </Typography>
          </DialogTitle>
          <DialogContent className={classes.paymentModalContent}>
            {paymentError && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography color="error">{paymentError}</Typography>
              </Box>
            )}
            {isLoadingClientSecret ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <LoaderComponent size={40} color={'primary'} label={t('sales.loading')} />
              </Box>
            ) : clientSecret && stripePromise ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#146DFF',
                      colorBackground: '#ffffff',
                      colorText: '#262527',
                      colorDanger: '#E43F32',
                      colorTextSecondary: '#444446',
                      fontFamily: 'Inter, sans-serif',
                      spacingUnit: '4px',
                      borderRadius: '8px',
                      spacing: '12px',
                    },
                    rules: {
                      '.Tab': {
                        border: '1px solid #e6e6e7',
                        borderRadius: '8px',
                        padding: '12px 20px',
                        backgroundColor: '#ffffff',
                        color: '#444446',
                        fontSize: '14px',
                        fontWeight: '400',
                        lineHeight: '20px',
                        marginTop: '8px',
                      },
                      '.Tab:hover': {
                        backgroundColor: '#E5F6FF',
                        color: '#262527',
                        borderColor: '#146DFF',
                      },
                      '.Tab:focus': {
                        outline: 'none',
                        backgroundColor: '#E5F6FF',
                        borderColor: '#146DFF',
                        border: 'none',
                      },
                      '.Tab--selected': {
                        backgroundColor: '#E5F6FF',
                        borderColor: '#146DFF',
                        color: '#146DFF',
                        fontWeight: '600',
                        border: 'none',
                      },
                      '.TabList': {
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '12px',
                        padding: '12px 0',
                      },
                      '.TabPanel': {
                        padding: '24px 0 0 0',
                      },
                    },
                  },
                }}
              >
                <PaymentForm
                  dealId={dealId}
                  contractId={apiData?.id || ''}
                  userName={`${formData?.[FormKeys.BILLING_OWNER_FIRST_NAME] || ''} ${formData?.[FormKeys.BILLING_OWNER_LAST_NAME] || ''}`}
                  userEmail={formData?.[FormKeys.BILLING_OWNER_EMAIL] || ''}
                  userCountry={displayAddress?.[FormKeys.COUNTRY]?.name || ''}
                  onSuccess={(_paymentMethodId, response) => {
                    if (response?.message) toast.success(response?.message);
                    setIsPaymentModalOpen(false);
                    setPaymentError(null);
                    setIsUpdateMode(false);
                  }}
                  savedPaymentMethod={(savedPaymentMethod) => {
                    handleSavedPaymentMethod(savedPaymentMethod);
                  }}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    setPaymentError(error);
                  }}
                />
              </Elements>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography>{t('sales.contract.unableToLoadPaymentForm')}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions className={classes.paymentModalActions}>
            <Button variant="secondaryGrey" onClick={() => setIsPaymentModalOpen(false)}>
              {t('sales.contract.cancel')}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {priceRateDrawer && (
        <>
          {/* Suggest Rate Drawer */}
          <SuggestRateDrawer
            open={priceRateDrawer}
            onClose={togglePriceDetailDrawer}
            // services={[service]}
            // serviceIndex={index}
            baseRates={baseRates}
          />
        </>
      )}
    </Box>
  );
};

PaymentTermsTab.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  editData: PropTypes.object,
  apiData: PropTypes.object,
  contractData: PropTypes.object,
  services: PropTypes.array,
  contractCalculations: PropTypes.array,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
  options: PropTypes.object,
  setOptions: PropTypes.func,
  isPublished: PropTypes.bool,
  proposalType: PropTypes.string,
  stripeEnabled: PropTypes.string,
  baseRates: PropTypes.object,
  profitability: PropTypes.object,
  franchiseId: PropTypes.string,
  taxExemptionEnabled: PropTypes.bool,
};

PaymentTermsTab.defaultProps = {
  formData: {},
};

export default PaymentTermsTab;
