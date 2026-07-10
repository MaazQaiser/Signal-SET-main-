import { Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { ReactComponent as CheckIcon } from 'assets/svg/StepperCheckBox.svg';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { convertDataToHtml } from 'src/app/components/common/richText';
import AddServicesTab from 'src/app/components/salesComponents/contractCreation/addServices';
import ConfigurationTab, {
  MIN_SIGNEES,
} from 'src/app/components/salesComponents/contractCreation/configuration';
import DescriptionTab from 'src/app/components/salesComponents/contractCreation/description/index.jsx';
import DevicesTab from 'src/app/components/salesComponents/contractCreation/devices';
import OnDemandServicesTab from 'src/app/components/salesComponents/contractCreation/onDemandServices';
import PaymentTermsTab from 'src/app/components/salesComponents/contractCreation/paymentTerms';
import {
  // FormKeys as paymentTermsFormKeys,
  // getPlanTypeTitles,
  PlanTypeEnums,
} from 'src/app/components/salesComponents/contractCreation/paymentTerms/helper.js';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import {
  setApiServicesData,
  setContractErrorMessages,
  syncServicesFormData,
} from 'src/redux/store/slices/contractServices';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import {
  getContractPDF,
  getFranchisePreferences,
  getProductsFromBE,
  updateContract,
} from 'src/services/deal.service.js';
import { filterActiveData } from 'src/utils/array/removeDestroyItems.js';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { stageStatus, toastSettings } from 'src/utils/constants/index.js';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater/index.js';
import { openFile } from 'src/utils/files/index.js';
import { joiValidateErrors } from 'src/utils/formValidator/formValidator.requiredCheck.js';
import capitalize from 'src/utils/string/capitalize.jsx';

import ContractChatAgent from './ContractChatAgent/index.jsx';
import { useStyles } from './contractCreation.js';

const getBillingCycles = (t) => [
  { label: t('sales.contract.weekly'), value: PlanTypeEnums.WEEKLY },
  { label: t('sales.contract.biWeekly'), value: PlanTypeEnums.BI_WEEKLY },
  { label: t('sales.contract.monthly'), value: PlanTypeEnums.MONTHLY },
];

import {
  // ActiveSteps,
  ActiveStepsKeys,
  defaultSteps,
  getContractCalculations,
  getEditData,
  getOnDemandTotal,
  getPayload,
  getPaymentTermsHolidayValidationErrors,
  getPlanId,
  getServicesTimeFieldErrors,
  // getTotalPrice,
  getValidateFormData,
  useBaseRates,
} from './helper.js';

const getActiveFormComponent = ({ key, ...props }) => {
  const components = {
    [ActiveStepsKeys.SERVICES]: <AddServicesTab key={key} {...props} />,
    [ActiveStepsKeys.DEVICES]: <DevicesTab key={key} {...props} />,
    [ActiveStepsKeys.ON_DEMAND_SERVICES]: <OnDemandServicesTab key={key} {...props} />,
    [ActiveStepsKeys.PAYMENT_TERMS]: <PaymentTermsTab key={key} {...props} />,
    [ActiveStepsKeys.DESCRIPTIONS]: <DescriptionTab key={key} {...props} />,
    [ActiveStepsKeys.SIGNEES]: <ConfigurationTab key={key} {...props} />,
  };
  return components[key];
};

const ContractCreation = ({
  data,
  setData,
  dealId,
  franchiseId,
  handleContractCompleted,
  fetchContractDetails,
  enableOccurences,
  stripeEnabled,
  taxExemptionEnabled,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const location = useLocation();

  const steps = useMemo(() => {
    if (!data?.steps) return data?.steps;
    return data.steps.map((step) => {
      const fallback = defaultSteps.find((defaultStep) => defaultStep.value === step.value);
      return {
        ...step,
        subtext: step.subtext ?? fallback?.subtext,
      };
    });
  }, [data?.steps]);
  const NA = t('commonText.nA');
  const { symbol, currencyCode } = useSelector(getDisplayConfiguration);

  const contractName = useMemo(
    () => capitalize(data?.details?.name, true) || NA,
    [data?.details?.name, NA],
  );

  const isPublished = useMemo(() => data?.details?.isPublished, [data?.details?.isPublished]);

  const formDataServices = useSelector((state) => state.contractServices);
  const errorMessages = formDataServices?.errorMessages;
  const tenantInfo = useSelector((state) => state.auth.tenantInfo);

  const dispatch = useDispatch();

  const currentStep = useMemo(
    () => steps?.findIndex((step) => step?.status === stageStatus.CURRENT),
    [steps],
  );

  const stepKeys = useMemo(() => data?.steps?.map((o) => o?.value) || [], [data?.steps]);

  const [activeStep, setActiveStep] = useState(null);

  const activeTabKey = stepKeys[activeStep];

  // Memoized boolean flags
  const stepFlags = useMemo(
    () => ({
      isServicesStep: activeTabKey === ActiveStepsKeys.SERVICES,
      isDevicesStep: activeTabKey === ActiveStepsKeys.DEVICES,
      isConfigurationStep: activeTabKey === ActiveStepsKeys.SIGNEES,
      isPaymentTermStep: activeTabKey === ActiveStepsKeys.PAYMENT_TERMS,
      isOnDemandStep: activeTabKey === ActiveStepsKeys.ON_DEMAND_SERVICES,
    }),
    [activeTabKey],
  );

  const [formData, setFormData] = useState();
  // const [contractCalculations, setContractCalculations] = useState([]);
  const [oneTimePayment, setOneTimePayment] = useState(0);

  const [onDemandTotal, setOnDemandTotal] = useState(0);

  const [paymentTermsOptions, setPaymentTermsOptions] = useState(null);
  const [franchisePreferences, setFranchisePreferences] = useState();
  const [lineItems, setLineItems] = useState();
  const [isFetchingFranchisePreferences, setIsFetchingFranchisePreferences] = useState(false);
  const [isUpdatingContractDetails, setIsUpdatingContractDetails] = useState(false);
  const [isFetchingPDFLink, setIsFetchingPDFLink] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewAttachmentUrl, setPreviewAttachmentUrl] = useState('');

  const [hasRedirectRefError, setHasRedirectRefError] = useState(false);

  const [products, setProducts] = useState([]);
  const [chatServicesSync, setChatServicesSync] = useState({ active: false, count: 0 });
  const skipApiServicesSyncRef = useRef(false);

  const baseRates = useBaseRates(franchisePreferences);

  const initialCall = useRef(true);

  const planId = useMemo(() => getPlanId(data, formData), [data, formData]);

  const [selectedPlanType, setSelectedPlanType] = useState({});

  const setErrorMessages = (errors) => {
    dispatch(setContractErrorMessages(errors));
  };
  useEffect(() => {
    if (data && enableOccurences && initialCall.current) getProducts();
  }, [data]);

  // TODO: Splitting the useEffect
  // useEffect(() => {
  //   if (data && activeStep === null) setActiveStep(currentStep >= 0 ? currentStep : 0);
  //   if (!oneTimePayment && !stepFlags.isDevicesStep)
  //     setOneTimePayment(data?.details?.devicesAmount);
  //   if (baseRates && data) {
  //     dispatch(setApiServicesData({ apiData: data, baseRates, lineItems }));
  //   }
  // }, [data, baseRates, activeStep, lineItems]);

  useEffect(() => {
    if (data && activeStep === null) {
      setActiveStep(currentStep >= 0 ? currentStep : 0);
    }
  }, [data, currentStep, activeStep]);

  useEffect(() => {
    if (data?.details?.devicesAmount && !oneTimePayment && !stepFlags.isDevicesStep) {
      setOneTimePayment(data.details.devicesAmount);
    }
  }, [data?.details?.devicesAmount, oneTimePayment, stepFlags.isDevicesStep]);

  // Use refs to prevent unnecessary API calls
  const prevDataRef = useRef();
  const prevBaseRatesRef = useRef();
  useEffect(() => {
    if (skipApiServicesSyncRef.current) {
      skipApiServicesSyncRef.current = false;
      prevDataRef.current = data;
      return;
    }

    if (
      baseRates &&
      data &&
      (prevDataRef.current !== data || prevBaseRatesRef.current !== baseRates)
    ) {
      dispatch(
        setApiServicesData({
          apiData: data,
          baseRates,
          lineItems,
          tenantInfo,
          productsOptions: products,
          enableOccurences,
        }),
      );
      prevDataRef.current = data;
      prevBaseRatesRef.current = baseRates;
    }
  }, [baseRates, data, dispatch, enableOccurences, lineItems, products, tenantInfo]);

  const handleChatServicesBackfillStart = useCallback(({ count = 1 } = {}) => {
    setChatServicesSync({ active: true, count: Math.max(count, 1) });
  }, []);

  const handleChatServicesBackfillComplete = useCallback(() => {
    window.setTimeout(() => {
      setChatServicesSync({ active: false, count: 0 });
    }, 500);
  }, []);

  const handleChatPaymentTermsSaved = useCallback(() => {
    setChatServicesSync({ active: false, count: 0 });
    const paymentStepIndex = stepKeys.indexOf(ActiveStepsKeys.PAYMENT_TERMS);
    if (paymentStepIndex >= 0) {
      setFormData(null);
      setActiveStep(paymentStepIndex);
    }
  }, [stepKeys]);

  const handleChatFlowComplete = useCallback(() => {
    setChatServicesSync({ active: false, count: 0 });
    const configStepIndex = stepKeys.indexOf(ActiveStepsKeys.SIGNEES);
    if (configStepIndex >= 0) {
      setFormData(null);
      setActiveStep(configStepIndex);
    }
  }, [stepKeys]);

  const syncServicesToRedux = useCallback(
    (formData) => {
      skipApiServicesSyncRef.current = true;
      dispatch(syncServicesFormData({ formData }));
    },
    [dispatch],
  );

  const getProducts = async () => {
    try {
      initialCall.current = false;
      const response = await getProductsFromBE();
      if (response.statusCode === 200) {
        const products = transformArrayForOptions(
          response?.data?.products || [],
          'name',
          'name',
          'name',
        );
        setProducts(
          products.map((product) => ({
            ...product,
            label: product.name,
          })),
        );
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: 2000,
      });
    } finally {
      //
    }
  };

  useEffect(() => {
    // if stripeEnabled then fetch products
  }, [data]);

  useEffect(() => {
    if (location?.state?.cycltRefError && !hasRedirectRefError && data) {
      setHasRedirectRefError(true);
      setActiveStep(3);
    }
  }, [location, data]);

  // const servicesTotal = useMemo(
  //   () =>
  //     formDataServices?.services?.reduce(
  //       (acc, service) => acc + service?.calculations?.total || 0,
  //       0,
  //     ),
  //   [formDataServices?.services],
  // );

  // Memoized onDemandTotal calculation
  const calculatedOnDemandTotal = useMemo(
    () => getOnDemandTotal(data?.[ActiveStepsKeys.ON_DEMAND_SERVICES]),
    [data?.[ActiveStepsKeys.ON_DEMAND_SERVICES]],
  );

  // OPTIMIZED: OnDemand total effect
  useEffect(() => {
    if (calculatedOnDemandTotal !== onDemandTotal) {
      setOnDemandTotal(calculatedOnDemandTotal);
    }
  }, [calculatedOnDemandTotal, onDemandTotal]);

  // Fix the contract calculations effect:
  const paymentTermsData = useMemo(() => {
    const saved = data?.[ActiveStepsKeys.PAYMENT_TERMS];
    if (stepFlags.isPaymentTermStep) {
      return formData ?? saved;
    }
    return saved;
  }, [stepFlags.isPaymentTermStep, formData, data?.[ActiveStepsKeys.PAYMENT_TERMS]]);

  const onDemandServicesData = useMemo(() => {
    return stepFlags.isOnDemandStep
      ? formData || data?.[ActiveStepsKeys.ON_DEMAND_SERVICES]
      : data?.[ActiveStepsKeys.ON_DEMAND_SERVICES];
  }, [stepFlags.isOnDemandStep, formData, data?.[ActiveStepsKeys.ON_DEMAND_SERVICES]]);

  // useEffect(() => {
  //   if (data) {
  //     setContractCalculations(
  //       getContractCalculations({
  //         paymentTerms: stepFlags.isPaymentTermStep
  //           ? formData
  //           : data?.[ActiveStepsKeys.PAYMENT_TERMS],
  //         services: formDataServices?.services,
  //         servicesTotal,
  //         onDemandTotal,
  //         onDemandServices: stepFlags.isOnDemandStep
  //           ? formData
  //             ? formData
  //             : data?.[ActiveStepsKeys.ON_DEMAND_SERVICES]
  //           : data?.[ActiveStepsKeys.ON_DEMAND_SERVICES],
  //       }),
  //     );
  //   }
  // }, [
  //   data,
  //   formDataServices?.services,
  //   servicesTotal,
  //   onDemandTotal,
  //   formData?.[paymentTermsFormKeys.FUEL_SURCHARGE],
  //   formData?.[paymentTermsFormKeys.TAX_RATE],
  //   formData?.[paymentTermsFormKeys.FLAT_RATE],
  // ]);

  // OPTIMIZED: Selected plan type effect
  const contractCalculations = useMemo(() => {
    const servicesForCalculations =
      formDataServices?.services?.length > 0
        ? formDataServices.services
        : data?._demoFormServices || data?.services || [];

    return getContractCalculations({
      paymentTerms: paymentTermsData,
      services: servicesForCalculations,
      onDemandServices: onDemandServicesData,
    });
  }, [paymentTermsData, onDemandServicesData, formDataServices?.services, data?._demoFormServices, data?.services]);

  const billingCycles = useMemo(() => getBillingCycles(t), [t]);

  useEffect(() => {
    let planType;
    if (planId && !enableOccurences) {
      planType = billingCycles.find((cycle) => cycle.value === planId);
    }
    if (!planId || isObjectEmpty(planType)) {
      planType = billingCycles.find((cycle) => cycle.value === PlanTypeEnums.WEEKLY);
    }
    setSelectedPlanType(planType);
  }, [planId, billingCycles, data?.details?.stripeEnabled]);

  /**
   * Fetch timezone options
   */
  const fetchFranchisePreferences = async () => {
    try {
      setIsFetchingFranchisePreferences(true);
      const response = await getFranchisePreferences(franchiseId);
      if (response.statusCode === 200) {
        setFranchisePreferences(response?.data?.preferences);
        setLineItems(
          transformArrayForOptions(response?.data?.preferences?.lineItems || [], 'label', 'value'),
        );
      }
    } catch (error) {
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsFetchingFranchisePreferences(false);
    }
  };

  // useEffect(() => {
  //   if (franchiseId && !isPublished) fetchFranchisePreferences();
  // }, [franchiseId]);

  // Fix franchise preferences effect:
  useEffect(() => {
    if (franchiseId && !isPublished && !franchisePreferences) {
      fetchFranchisePreferences();
    }
  }, [franchiseId, isPublished, franchisePreferences]);

  // PDF link fetcher
  const openPreviewDialog = (attachmentUrl) => {
    setPreviewAttachmentUrl(attachmentUrl);
    setIsPreviewDialogOpen(true);
  };

  const closePreviewDialog = () => {
    setIsPreviewDialogOpen(false);
    setPreviewAttachmentUrl('');
  };

  const fetchPDLLink = async () => {
    if (isFetchingPDFLink) return;

    try {
      setIsFetchingPDFLink(true);
      const response = await getContractPDF(dealId);
      if (response.statusCode === 200 && response?.data?.attachment) {
        openPreviewDialog(response.data.attachment);
      } else if (response.statusCode === 200) {
        toast.info(
          'Proposal preview is being prepared. Please try again in a moment.',
          {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          },
        );
      }
    } catch (error) {
      const message =
        error?.message ||
        (typeof error === 'object' ? 'Unable to load proposal preview.' : String(error));
      toast.error(message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsFetchingPDFLink(false);
    }
  };

  const handlePreviewClick = () => {
    fetchPDLLink();
  };

  const goToNextStep = () => {
    const isLastStep = activeStep === steps?.length - 1;
    if (isLastStep || stepFlags.isConfigurationStep) {
      handleContractCompleted();
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setFormData(null);
  };

  const handleNext = async () => {
    if (isPublished) {
      goToNextStep();
      return;
    }

    const isValidationRequired = activeTabKey !== ActiveStepsKeys.DEVICES;

    if (stepFlags.isConfigurationStep) {
      // if value exist from backend but delete from frontend then check _destroy check
      const filteredData = filterActiveData(formData?.[activeTabKey]);
      // return if assignees are less than 2
      if (filteredData.length < MIN_SIGNEES) {
        toast.error(t(`sales.contract.minRequiredSignees`), {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        return;
      }
    }

    let errors = null;
    let servicesTimeFieldErrors = null;
    if (isValidationRequired) {
      const dataToValidate = getValidateFormData(
        stepFlags.isServicesStep ? formDataServices : formData,
        activeTabKey,
        data,
        enableOccurences,
        stripeEnabled,
      );
      console.log({ dataToValidate });

      errors = await joiValidateErrors({
        data: dataToValidate,
        t,
      });
      if (stepFlags.isPaymentTermStep) {
        const holidayErrors = getPaymentTermsHolidayValidationErrors(
          dataToValidate?.[ActiveStepsKeys.PAYMENT_TERMS],
          t,
          data?.details?.stripeEnabled,
        );
        if (holidayErrors) {
          errors = { ...(errors || {}), ...holidayErrors };
        }
      }
      if (stepFlags.isServicesStep)
        servicesTimeFieldErrors = getServicesTimeFieldErrors(formDataServices.services, t);
    }

    if (errors || servicesTimeFieldErrors) {
      /**
       * validation for other steps
       */
      setErrorMessages({
        ...(errors && errors),
        ...(servicesTimeFieldErrors && servicesTimeFieldErrors),
      });
      return;
    }

    try {
      setIsUpdatingContractDetails(true);
      const payload = await getPayload(
        stepFlags.isServicesStep ? formDataServices : formData,
        activeTabKey,
        data,
        stripeEnabled,
        taxExemptionEnabled,
      );

      if (stepFlags.isServicesStep && formDataServices?.services) {
        payload._demoFormServices = formDataServices.services;
        payload._demoSavedStep = ActiveStepsKeys.SERVICES;
        syncServicesToRedux(formDataServices);
      }

      if (stepFlags.isPaymentTermStep && formData) {
        payload._demoPaymentTermsForm = formData;
        payload._demoSavedStep = ActiveStepsKeys.PAYMENT_TERMS;
      }

      if (stepFlags.isDevicesStep && Array.isArray(formData)) {
        payload._demoFormDevices = formData;
        payload._demoSavedStep = ActiveStepsKeys.DEVICES;
      }

      if (stepFlags.isOnDemandStep) {
        payload._demoSavedStep = ActiveStepsKeys.ON_DEMAND_SERVICES;
      }

      if (activeTabKey === ActiveStepsKeys.DESCRIPTIONS && formData) {
        payload._demoDescriptionsForm = {
          services:
            typeof formData.services === 'string'
              ? formData.services
              : convertDataToHtml(formData.services),
        };
        payload._demoSavedStep = ActiveStepsKeys.DESCRIPTIONS;
      }

      if (stepFlags.isConfigurationStep && formData?.[ActiveStepsKeys.SIGNEES]) {
        payload._demoSigneesForm = formData[ActiveStepsKeys.SIGNEES];
        payload._demoSavedStep = ActiveStepsKeys.SIGNEES;
      }

      const response = await updateContract(dealId, payload);
      if (response.statusCode === 200) {
        setData(response?.data?.contract);
        goToNextStep();
      }
    } catch (error) {
      /**
       * if cycle reference date is not between start and enddate of contract
       * switch payment terms step
       */
      if (error?.errorObj?.cycle_ref_date_error) {
        setActiveStep(3);
      }
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsUpdatingContractDetails(false);
    }
  };

  const handleDropdownChange = (event) => {
    const { value } = event.target;
    setSelectedPlanType(value);
  };

  const getButtonText = () => {
    if (activeStep === steps?.length - 1) return t('sales.contract.finish');

    if (isPublished) return t('sales.contract.next');

    return t('sales.contract.saveAndNext');
  };

  const shouldDisableNextButton =
    !isObjectEmpty(errorMessages) ||
    (isFetchingFranchisePreferences &&
      [ActiveStepsKeys.SERVICES, ActiveStepsKeys.DEVICES].includes(activeTabKey));

  return (
    <>
      <Box
        className={`${classes.stepperWrapper} ${steps?.length === 4 ? classes.reduceStepperWrapper : ''}`}
      >
        {(isUpdatingContractDetails || isFetchingPDFLink) && (
          <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />
        )}
        <Stepper activeStep={activeStep}>
          {steps?.map((stepper, index) => {
            const labelProps = {
              onClick: () => {
                if (steps[index].status === stageStatus.PENDING) return;
                if (activeStep === index) return;
                setFormData(null);
                setErrorMessages({});
                setActiveStep(index);
              },
            };

            const stepClassName = activeStep === index ? classes.activeStepWrapper : '';

            return (
              <Step key={stepper.name} className={stepClassName}>
                <Tooltip
                  title={stepper.subtext || stepper.name}
                  arrow
                  disableHoverListener={!stepper.subtext}
                >
                  <StepLabel {...labelProps}>
                    <Box className={classes.stepperHead}>
                      <Box className={classes.steperName}>
                        <Typography variant="subtitle2">{`${index + 1}. ${stepper.name}`}</Typography>
                        {stepper.status === stageStatus.COMPLETED && (
                          <CheckIcon className={classes.stepperIcon} />
                        )}
                      </Box>
                      {stepper.subtext ? (
                        <Box className={classes.stepperText}>
                          <Typography variant="caption">{stepper.subtext}</Typography>
                        </Box>
                      ) : null}
                    </Box>
                  </StepLabel>
                </Tooltip>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps?.length ? (
          <Box>
            <Typography>{t('sales.contract.stepsCompleted')}</Typography>
          </Box>
        ) : (
          <Box className={classes.stepContentWrapper}>
            <Box className={`${classes.stepTabContent}`}>
              {getActiveFormComponent({
                key: activeTabKey,
                formData,
                setFormData,
                isPublished,
                contractName,
                errorMessages,
                setErrorMessages,
                oneTimePayment,
                setOneTimePayment,
                setOnDemandTotal,
                contractCalculations,
                selectedPlanType,
                billingCycles,
                onBillingCycleChange: handleDropdownChange,
                editData: getEditData(data?.[activeTabKey], activeTabKey, data),
                preferences: franchisePreferences,
                isFetchingPreferences: isFetchingFranchisePreferences,
                options: paymentTermsOptions,
                setOptions: setPaymentTermsOptions,
                baseRates,
                fetchContractDetails,
                lineItems: lineItems,
                proposalType: data?.details?.proposalType,
                stripeEnabled,
                enableOccurences,
                products: products,
                profitability: data?.profitability,
                franchiseId,
                apiData: data,
                contractData: data,
                taxExemptionEnabled,
                chatServicesSync,
              })}
            </Box>
            <Box className={classes.stepFooter}>
              {!enableOccurences && (
                <Box>
                  <Typography variant="subtitle1">
                    {currencyCode}{' '}
                    {`${fomatNumbersWithCommas(contractCalculations[selectedPlanType?.value]?.total)} ${!enableOccurences ? selectedPlanType?.label : `/ ${t('sales.contract.interval')}`}`}
                  </Typography>
                  <Typography variant="overline" className={classes.overlineText}>
                    {oneTimePayment && !stepFlags.isServicesStep
                      ? `+ ${symbol}${fomatNumbersWithCommas(oneTimePayment)} ${t('sales.contract.inFirstInvoice')}`
                      : null}
                  </Typography>
                </Box>
              )}
              <Box className={classes.stepFooterButton}>
                {activeStep === steps?.length - 1 && (
                  <Button
                    variant="secondaryGrey"
                    disabled={activeStep === 0}
                    onClick={handlePreviewClick}
                  >
                    {t('sales.contract.preview')}
                  </Button>
                )}
                <Button variant="primary" onClick={handleNext} disabled={shouldDisableNextButton}>
                  {getButtonText()}
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      <ContractChatAgent
        data={data}
        setData={setData}
        dealId={dealId}
        franchiseId={franchiseId}
        stripeEnabled={stripeEnabled}
        taxExemptionEnabled={taxExemptionEnabled}
        enableOccurences={enableOccurences}
        baseRates={baseRates}
        lineItems={lineItems}
        franchisePreferences={franchisePreferences}
        isPublished={isPublished}
        onServicesBackfillStart={handleChatServicesBackfillStart}
        onServicesBackfillComplete={handleChatServicesBackfillComplete}
        onPaymentTermsSaved={handleChatPaymentTermsSaved}
        onChatFlowComplete={handleChatFlowComplete}
        onReviewProposal={handlePreviewClick}
        onSignContract={handleContractCompleted}
        syncServicesToRedux={syncServicesToRedux}
      />
      <Dialog
        open={isPreviewDialogOpen}
        onClose={closePreviewDialog}
        maxWidth="lg"
        fullWidth
        aria-labelledby="proposal-preview-dialog-title"
      >
        <DialogTitle id="proposal-preview-dialog-title">{t('sales.contract.preview')}</DialogTitle>
        <DialogContent dividers>
          {previewAttachmentUrl ? (
            <Box
              component="iframe"
              src={previewAttachmentUrl}
              title={t('sales.contract.contractPdf')}
              sx={{ width: '100%', height: '70vh', border: 0 }}
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button variant="secondaryGrey" onClick={closePreviewDialog}>
            {t('sales.contract.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={() => openFile(t('sales.contract.contractPdf'), previewAttachmentUrl)}
            disabled={!previewAttachmentUrl}
          >
            {t('sales.contract.previewPDF')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ContractCreation.propTypes = {
  data: PropTypes.object,
  setData: PropTypes.func,
  dealId: PropTypes.number,
  franchiseId: PropTypes.number,
  handleContractCompleted: PropTypes.func,
  fetchContractDetails: PropTypes.func,
  enableOccurences: PropTypes.bool,
  stripeEnabled: PropTypes.bool,
  taxExemptionEnabled: PropTypes.bool,
};

export default ContractCreation;
