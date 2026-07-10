import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { ReactComponent as DedicatedServiceFillIcon } from 'assets/svg/DedicatedServiceFillIcon.svg';
import { ReactComponent as DedicatedServiceIcon } from 'assets/svg/DedicatedServiceIcon.svg';
import { ReactComponent as PatrolServiceFillIcon } from 'assets/svg/PatrolServiceFillIcon.svg';
import { ReactComponent as PatrolServicesIcon } from 'assets/svg/PatrolServicesIcon.svg';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDatePickers from 'src/app/components/common/datePicker/index.jsx';
import FieldError from 'src/app/components/common/fieldError';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import RichTextEditor from 'src/app/components/common/richText';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import {
  ActiveStepsKeys,
  getErrorKey,
  getPayload,
  getServicesTimeFieldErrors,
  getValidateFormData,
  getViewDisabledContractClass,
  showError,
} from 'src/app/sales/pages/contractCreation/helper';
import { DeleteAlterIcon } from 'src/assets/svg';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg';
import { ReactComponent as SuggestRateIcon } from 'src/assets/svg/suggestRate.svg';
import { useApiControllers } from 'src/helper/axios/index.js';
import { isObjectEmpty } from 'src/helper/utilityFunctions.js';
import { useLabels } from 'src/hooks/updateObjectLabelsHook.jsx';
import { useTenantLabel } from 'src/hooks/useTenantLabel.jsx';
// import { getUniqueOrderedDaysOfWeekBetweenDates } from 'src/helper/utilityFunctions';
import {
  deleteErrorMessageAtIndex,
  deleteService,
  removeContractErrorKey,
  setContractErrorMessages,
  updateServiceCardData,
} from 'src/redux/store/slices/contractServices';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { checkMinimumServiceRate } from 'src/services/deal.service.js';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';
import { daysOfWeekWithVal } from 'src/utils/constants';
import { fomatNumbersWithCommas, toTwoDecimalPrecision } from 'src/utils/currencyFormater/index.js';
import { joiValidateErrors } from 'src/utils/formValidator/formValidator.requiredCheck.js';
import { convertMMDDYYYYToDayJsDate } from 'src/utils/passTime/time.jsx';
import capitalize from 'src/utils/string/capitalize.jsx';

import { useStyles } from '../addServices.js';
import DedicatedVisit from '../dedicatedVisit/index.jsx';
import {
  filterGoOfficerTypeOptions,
  FormKeys,
  officerTypeOptions,
  serviceTypes,
  visitTypes,
} from '../helper.js';
import PatrolVisits from '../patrolVisits/index.jsx';
import SuggestRateDrawer from './suggestRateDrawer';

const ServiceCard = ({
  index,
  totalServices,
  baseRates,
  isPublished,
  lineItems,
  enableOccurences,
  stripeEnabled,
  products,
  selectedPlanType,
  apiData,
}) => {
  const classes = useStyles();

  const { getLabel } = useTenantLabel();

  const tenantInfo = useSelector((state) => state.auth.tenantInfo);

  const { t } = useTranslation();
  const { symbol, dateFormat } = useSelector(getDisplayConfiguration);

  const { id: dealId } = useParams();

  const { getNewApiController } = useApiControllers();

  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);

  const [priceRateDrawer, setPriceRateDrawer] = useState(false);

  const dispatch = useDispatch();

  // Refs for debouncing and preventing unnecessary API calls
  const apiCallTimeoutRef = useRef();
  // const prevServiceRef = useRef();

  const errorMessages = useSelector((state) => state.contractServices?.errorMessages);

  const formDataServices = useSelector((state) => state.contractServices);

  const services = useSelector((state) => state.contractServices?.[ActiveStepsKeys.SERVICES]);

  const service = useMemo(() => services[index], [services, index]);

  const startDate = useSelector((state) => state.contractServices?.startDate);
  const endDate = useSelector((state) => state.contractServices?.endDate);

  // Memoized computed values
  const serviceCalculations = useMemo(
    () => service?.[FormKeys.CALCULATIONS],
    [service?.[FormKeys.CALCULATIONS]],
  );

  const serviceType = useMemo(() => service?.[FormKeys.TYPE], [service?.[FormKeys.TYPE]]);

  /**
   * common function to update services
   */
  const updateServicesHandler = useCallback(
    (name, value, index) => {
      dispatch(
        updateServiceCardData({
          name,
          value,
          index,
          baseRates,
          stripeEnabled: enableOccurences,
          contractStartDate: startDate,
        }),
      );
    },
    [updateServiceCardData, dispatch, baseRates, enableOccurences, startDate],
  );

  /**
   * if service type is changed we need to remove all the errors from the index
   * */
  const removeServicesErrorKey = useCallback(
    (index) => {
      dispatch(deleteErrorMessageAtIndex(index));
    },
    [dispatch],
  );

  const removeServiceFieldErrorKey = useCallback(
    (index, keyName) => {
      const errorKey = getErrorKey({ activeStep: ActiveStepsKeys.SERVICES, index, key: keyName });
      dispatch(removeContractErrorKey(errorKey));
    },
    [dispatch],
  );

  const hasUserInteracted = useRef(false);
  const [showValidation, setShowValidation] = useState(false);

  const markFieldInteraction = useCallback(() => {
    hasUserInteracted.current = true;
    setShowValidation(true);
  }, []);

  useEffect(() => {
    hasUserInteracted.current = false;
    setShowValidation(false);
  }, [serviceType]);

  const servicesInputChangedHandler = useCallback(
    (event) => (index) => {
      let { name, value } = event.target;

      if (name === FormKeys.TYPE) {
        hasUserInteracted.current = false;
        setShowValidation(false);
      } else {
        markFieldInteraction();
      }

      if (value) {
        name === FormKeys.TYPE
          ? removeServicesErrorKey(index, name)
          : removeServiceFieldErrorKey(index, name);
      }

      if (
        (name === FormKeys.HOURLY_RATE ||
          name === FormKeys.PRICE_PER_HIT ||
          name === FormKeys.VEHICLE_RATE) &&
        !value.match(/^(\d*\.{0,1}\d{0,2}$)/)
      ) {
        return;
      }

      if (name === FormKeys.NO_OF_VEHICLES) {
        value = value.replace(/[^\d]/g, '');
      }

      updateServicesHandler(name, value, index);
    },
    [
      removeServicesErrorKey,
      removeServiceFieldErrorKey,
      updateServicesHandler,
      markFieldInteraction,
    ],
  );

  const handleSwitch = useCallback(
    (event, index) => {
      markFieldInteraction();
      const { name, checked } = event.target;
      updateServicesHandler(name, checked, index);
    },
    [updateServicesHandler, markFieldInteraction],
  );

  const handleDeleteService = useCallback(() => {
    setShowDeleteServiceModal(false);
    dispatch(deleteService({ deleteServiceIndex: index }));
    //remove all errors if service is deleted
    dispatch(deleteErrorMessageAtIndex(index));
  }, [dispatch, index]);

  const getError = useCallback(
    (index, key) => {
      return showError({
        activeStep: ActiveStepsKeys.SERVICES,
        index,
        key,
        errorMessages,
      });
    },
    [errorMessages],
  );

  const getDisplayError = useCallback(
    (index, key) => (showValidation ? getError(index, key) : undefined),
    [showValidation, getError],
  );

  const setErrorMessages = useCallback(
    (errors) => {
      dispatch(setContractErrorMessages(errors));
    },
    [dispatch],
  );

  // ✅ Call hook at the top level
  let labeledOfficerTypes = [];
  if (enableOccurences) {
    labeledOfficerTypes = useLabels(
      filterGoOfficerTypeOptions,
      'tenantConfigs.tenantLabels.terms',
      'id',
    );
  } else {
    labeledOfficerTypes = useLabels(officerTypeOptions, 'tenantConfigs.tenantLabels.terms', 'id');
  }

  const filteredOfficerTypeOptions = useMemo(() => {
    let officers = labeledOfficerTypes?.filter(
      (officerType) => !officerType[FormKeys.TYPE] || officerType[FormKeys.TYPE] === serviceType,
    );

    return transformArrayForOptions(officers, 'name', 'id');
  }, [labeledOfficerTypes, serviceType]);

  const selectedOfficerType = useMemo(() => {
    return {
      ...service?.[FormKeys.OFFICER_TYPE],
      name: getLabel('terms', service?.[FormKeys.OFFICER_TYPE]?.id),
      label: getLabel('terms', service?.[FormKeys.OFFICER_TYPE]?.id),
    };
  }, [service]);

  useEffect(() => {
    if (!service?.[FormKeys.OFFICER_TYPE] && filteredOfficerTypeOptions?.[0]?.value) {
      updateServicesHandler(FormKeys.OFFICER_TYPE, filteredOfficerTypeOptions[0], index);
    }
  }, [filteredOfficerTypeOptions]);

  useEffect(() => {
    if (
      serviceType === serviceTypes.PATROL &&
      !enableOccurences &&
      (service?.[FormKeys.PRICE_PER_HIT] == null || service?.[FormKeys.PRICE_PER_HIT] === '')
    ) {
      updateServicesHandler(FormKeys.PRICE_PER_HIT, 25, index);
    }
  }, [serviceType, enableOccurences, service?.[FormKeys.PRICE_PER_HIT]]);

  useEffect(() => {
    if (
      serviceType === serviceTypes.DEDICATED &&
      (service?.[FormKeys.HOURLY_RATE] == null || service?.[FormKeys.HOURLY_RATE] === '')
    ) {
      updateServicesHandler(FormKeys.HOURLY_RATE, 25, index);
    }
  }, [serviceType, service?.[FormKeys.HOURLY_RATE]]);

  // const daysBetweenDates = useMemo(() => {
  //   return startDate && endDate
  //     ? getUniqueOrderedDaysOfWeekBetweenDates(startDate, endDate)
  //     : daysOfWeekWithVal;
  // }, [startDate, endDate]);
  const daysBetweenDates = useMemo(() => {
    return startDate && endDate ? daysOfWeekWithVal : daysOfWeekWithVal;
  }, [startDate, endDate]);

  const togglePriceDetailDrawer = () => {
    setPriceRateDrawer((a) => !a);
  };

  const validateRates = useCallback(
    (service, response) => {
      let errors = {};
      const errorKeyBase = `${ActiveStepsKeys.SERVICES},${index}`;
      const { type: serviceType, hourlyRate, vehicleRate, pricePerHit } = service;

      const problemText = t('sales.contract.unableToCalculateRate');

      if (serviceType === serviceTypes.DEDICATED) {
        // If suggested rate came from BE is null
        if (!response?.dedicated?.suggestedValue) {
          errors[`${errorKeyBase},hourlyRate`] = problemText;
        }

        if (hourlyRate < response?.dedicated?.suggestedValue) {
          errors[`${errorKeyBase},hourlyRate`] = t('sales.contract.hourlyRateNotProfitable');
        }

        if (service?.includeVehicle && !response?.dedicatedVehicle?.suggestedValue) {
          errors[`${errorKeyBase},hourlyRate`] = problemText;
        }

        if (service?.includeVehicle && vehicleRate < response?.dedicatedVehicle?.suggestedValue) {
          errors[`${errorKeyBase},vehicleRate`] = t('sales.contract.vehicleRateNotProfitable');
        }
      }

      if (serviceType === serviceTypes.PATROL) {
        if (!response?.patrol?.suggestedValue) {
          errors[`${errorKeyBase},pricePerHit`] = problemText;
        }

        if (pricePerHit < response?.patrol?.suggestedValue) {
          errors[`${errorKeyBase},pricePerHit`] = t('sales.contract.pricePerHitNotProfitable');
        }
      }

      if (Object.keys(errors).length > 0) {
        setErrorMessages(errors);
      }

      return null;
    },
    [index, setErrorMessages],
  );

  const addWaitingForRateError = useCallback(
    (service) => {
      let errors = {};
      const errorKeyBase = `${ActiveStepsKeys.SERVICES},${index}`;
      const { type: serviceType, hourlyRate, vehicleRate, pricePerHit } = service;

      if (serviceType === serviceTypes.DEDICATED) {
        if (hourlyRate) {
          errors[`${errorKeyBase},hourlyRate`] = t('sales.contract.waitingForRates');
        }

        if (service?.includeVehicle && vehicleRate) {
          errors[`${errorKeyBase},vehicleRate`] = t('sales.contract.waitingForRates');
        }
      }

      if (serviceType === serviceTypes.PATROL && pricePerHit && !enableOccurences) {
        errors[`${errorKeyBase},pricePerHit`] = t('sales.contract.waitingForRates');
      }

      if (Object.keys(errors).length > 0) {
        setErrorMessages(errors);
      }

      return null;
    },
    [index, setErrorMessages],
  );

  const getSuggestedRate = useCallback(
    async (service) => {
      const apiController = getNewApiController();

      addWaitingForRateError(service);

      try {
        const payload = await getPayload({ services: [service] }, ActiveStepsKeys.SERVICES, {});

        const response = await checkMinimumServiceRate(dealId, payload?.services[0], {
          signal: apiController.signal,
        });

        removeServicesErrorKey(index);

        if (response?.statusCode === 200) {
          // show suggested rate
          updateServicesHandler('suggestedValues', response?.data, index);
          // set timeOnProperty on form from response (supports both camelCase and snake_case)
          if (service?.type === serviceTypes.PATROL) {
            const patrolData = response?.data?.patrol ?? response?.data;
            const timeOnProperty =
              patrolData?.[FormKeys.TIME_ON_PROPERTY] ?? patrolData?.time_on_property;
            if (timeOnProperty != null) {
              updateServicesHandler(FormKeys.TIME_ON_PROPERTY, timeOnProperty, index);
            }
          }
          // validateRates(service, response?.data);
        }
      } catch (error) {
        if (!apiController.signal.aborted) {
          // setLoading(false);
        }
      }
    },
    [dealId, index, updateServicesHandler, addWaitingForRateError, validateRates], // ✅ dependencies
  );

  const clickedOutsideService = useCallback(async () => {
    // Debounce the API call
    if (apiCallTimeoutRef.current) {
      clearTimeout(apiCallTimeoutRef.current);
    }

    apiCallTimeoutRef.current = setTimeout(async () => {
      let errors = null;
      let servicesTimeFieldErrors = null;
      const dataToValidate = getValidateFormData(
        { services: services },
        ActiveStepsKeys.SERVICES,
        apiData,
        enableOccurences,
        stripeEnabled,
      );

      // console.log('dataToValidate', dataToValidate);

      errors = await joiValidateErrors({
        data: dataToValidate,
        t,
      });
      servicesTimeFieldErrors = getServicesTimeFieldErrors(formDataServices.services, t);

      // console.log('errors', errors);
      // console.log('servicesTimeFieldErrors', servicesTimeFieldErrors);

      if (errors || servicesTimeFieldErrors) {
        setErrorMessages({
          ...(errors && errors),
          ...(servicesTimeFieldErrors && servicesTimeFieldErrors),
        });

        const showSuggestedrate =
          Array.isArray(service?.visits) &&
          service.visits.length > 0 &&
          service.visits.every((v) =>
            v.visitType === visitTypes.FIXED ? !!v.startTime : !!v.startTime && !!v.endTime,
          );

        if (!showSuggestedrate) {
          return;
        }
      }

      getSuggestedRate(service);
    }, 900); // 900ms debounce
  }, [services, formDataServices, t, setErrorMessages, getSuggestedRate, service]);

  // Memoized validation check
  const allHasValues = useMemo(() => {
    return (
      !!service?.[FormKeys.TYPE] &&
      !!service?.[FormKeys.OFFICER_TYPE] &&
      !!service?.[FormKeys.VISITS]
    );
  }, [service?.[FormKeys.TYPE], service?.[FormKeys.OFFICER_TYPE], service?.[FormKeys.VISITS]]);

  // Effect for triggering API calls when service values change
  useEffect(() => {
    if (!hasUserInteracted.current) return;

    if (allHasValues) {
      clickedOutsideService();
    }

    return () => {
      if (apiCallTimeoutRef.current) {
        clearTimeout(apiCallTimeoutRef.current);
      }
    };
  }, [
    allHasValues,
    // clickedOutsideService,
    service?.[FormKeys.TYPE],
    service?.[FormKeys.OFFICER_TYPE],
    service?.[FormKeys.VISITS],
    service?.[FormKeys.INCLUDE_VEHICLE],
    service?.[FormKeys.NO_OF_VEHICLES],
    service?.[FormKeys.VEHICLE_RATE],
    service?.[FormKeys.PRICE_PER_HIT],
    service?.[FormKeys.TIME_ON_PROPERTY],
  ]);

  return (
    <Box
      key={index}
      className={classNames(classes.serviceBox, 'innerScrollBar')}
      // onBlur={() => {
      //   // console.log('We are focusing out from service card');
      //   if (allHasValues) clickedOutsideService();
      // }}
    >
      <Box className={classNames(classes.serviceHeader, getViewDisabledContractClass(isPublished))}>
        <Box className={classes.serviceRename}>
          <>
            <Box className={classes.serviceNameField}>
              <TextField
                name={FormKeys.NAME}
                id={FormKeys.NAME}
                type="text"
                className={classes.inputField}
                fullWidth
                value={service[FormKeys.NAME]}
                onChange={(event) => {
                  servicesInputChangedHandler(event)(index);
                }}
                error={!!getError(index, FormKeys.NAME)}
                inputProps={{ maxLength: 25 }}
                placeholder={`${t('sales.contract.service')} ${index + 1}`}
              />
            </Box>
            <FieldError
              error={getError(index, FormKeys.NAME) && t('sales.contract.serviceNameError')}
              positionClass={classes.invalidFeedbackTime}
            />
          </>
        </Box>
        {!enableOccurences && (
          <Typography variant="body1" className={classes.servicePrice}>
            {symbol}
            {fomatNumbersWithCommas(
              serviceCalculations[selectedPlanType?.value]?.[FormKeys.TOTAL],
            )}{' '}
            / {!enableOccurences ? selectedPlanType?.label : t('sales.contract.interval')}
          </Typography>
        )}
      </Box>
      <Box className={classNames(classes.servicesInnerBox, 'innerScrollBar')}>
        <Box
          className={classNames(
            classes.selectServiceRadio,
            getViewDisabledContractClass(isPublished),
          )}
        >
          <FormControl>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name={FormKeys.TYPE}
              value={serviceType}
              onChange={(event) => servicesInputChangedHandler(event)(index)}
            >
              {tenantInfo?.services?.dedicated && (
                <FormControlLabel
                  value={serviceTypes.DEDICATED}
                  control={<Radio />}
                  label={
                    <>
                      <ListItemIcon>
                        {serviceType === serviceTypes.DEDICATED ? (
                          <DedicatedServiceFillIcon />
                        ) : (
                          <DedicatedServiceIcon />
                        )}
                      </ListItemIcon>

                      <ListItemText
                        primary={t('sales.contract.dedicatedService', {
                          dedicatedTermCap: capitalize(
                            getLabel('terms', 'dedicated') || 'Dedicated',
                          ),
                        })}
                      />
                    </>
                  }
                  classes={{
                    root: serviceType === serviceTypes.DEDICATED ? classes.activeRadio : '',
                  }}
                />
              )}
              {tenantInfo?.services?.patrol && (
                <FormControlLabel
                  value={serviceTypes.PATROL}
                  control={<Radio />}
                  label={
                    <>
                      <ListItemIcon>
                        {serviceType === serviceTypes.PATROL ? (
                          <PatrolServiceFillIcon />
                        ) : (
                          <PatrolServicesIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={t('sales.contract.patrolService', {
                          patrolTermCap: capitalize(getLabel('terms', 'patrol') || 'Patrol'),
                        })}
                      />
                    </>
                  }
                  classes={{
                    root: serviceType === serviceTypes.PATROL ? classes.activeRadio : '',
                  }}
                />
              )}
            </RadioGroup>
          </FormControl>
        </Box>
        <Box
          className={classNames(
            classes.serviceToggleArea,
            getViewDisabledContractClass(isPublished),
          )}
        >
          <Box className={classes.patrolTab}>
            <Box className={classes.serviceInnerWrap}>
              <Box className={classes.officerTypeBox}>
                <Box className={classes.marginBottomDropDown}>
                  <InputLabel htmlFor={FormKeys.OFFICER_TYPE}>
                    {t('sales.contract.resourceType')} <RequiredAsterik />
                  </InputLabel>
                  <CustomDropDown
                    name={FormKeys.OFFICER_TYPE}
                    id={FormKeys.OFFICER_TYPE}
                    placeHolder={t('sales.contract.resourceType')}
                    options={filteredOfficerTypeOptions}
                    selectedValues={selectedOfficerType || service[FormKeys.OFFICER_TYPE] || {}}
                    handleChange={(event) => servicesInputChangedHandler(event)(index)}
                    className={classes.dropHeader}
                    bordered
                    isError={!!getDisplayError(index, FormKeys.OFFICER_TYPE)}
                  />
                </Box>
                <FieldError
                  error={
                    !!getDisplayError(index, FormKeys.OFFICER_TYPE) &&
                    t('sales.contract.resourceTypeRequired')
                  }
                  positionClass={classes.invalidFeedback}
                />
              </Box>
              {!enableOccurences && serviceType === serviceTypes.PATROL && (
                <Box className={classes.officerTypeBox}>
                  <Box className={classNames(classes.marginBottomDropDown, classes.dropdownArea)}>
                    <InputLabel htmlFor={FormKeys.LINE_ITEM}>
                      {t('sales.contract.invoiceLineItem')} <RequiredAsterik />
                    </InputLabel>
                    <CustomDropDown
                      name={FormKeys.LINE_ITEM}
                      id={FormKeys.LINE_ITEM}
                      placeHolder={t('sales.contract.selectLineItem')}
                      options={lineItems}
                      selectedValues={service[FormKeys.LINE_ITEM] || {}}
                      handleChange={(event) => servicesInputChangedHandler(event)(index)}
                      className={classes.dropHeader}
                      bordered
                      isError={!!getDisplayError(index, FormKeys.LINE_ITEM)}
                    />
                  </Box>
                  <FieldError
                    error={
                      !!getDisplayError(index, FormKeys.LINE_ITEM) &&
                      t('sales.contract.lineItemRequired')
                    }
                    positionClass={classes.invalidFeedback}
                  />
                </Box>
              )}
              {/* Add Field to get service start date */}
              {enableOccurences && (
                <Box className={classes.officerTypeBox}>
                  <Box className={classNames(classes.marginBottomDropDown, classes.dropdownArea)}>
                    <InputLabel htmlFor={FormKeys.SERVICE_START_DATE}>
                      {t('sales.contract.serviceStartDate')} <RequiredAsterik />
                    </InputLabel>
                    <ResponsiveDatePickers
                      name={FormKeys.SERVICE_START_DATE}
                      id={FormKeys.SERVICE_START_DATE}
                      placeHolder={t('sales.contract.selectServiceStartDate')}
                      value={service[FormKeys.SERVICE_START_DATE] || {}} // Change here to an array
                      onChange={(value) =>
                        servicesInputChangedHandler({
                          target: { name: FormKeys.SERVICE_START_DATE, value: value },
                        })(index)
                      }
                      minDate={startDate || dayjs()}
                      maxDate={
                        enableOccurences
                          ? convertMMDDYYYYToDayJsDate(
                              startDate
                                ? dayjs(startDate).add(1, 'month')
                                : dayjs().add(1, 'month'),
                            )
                          : null
                      }
                      className={classes.dropHeader}
                      disabled={!tenantInfo?.services?.changeAbleServiceStartDate}
                      format={dateFormat}
                      inputFormat={dateFormat}
                      bordered
                      error={!!getError(index, FormKeys.SERVICE_START_DATE)}
                    />
                  </Box>
                  <Box>
                    <div className={classes.invalidFeedback}>
                      {!!getError(index, FormKeys.SERVICE_START_DATE) &&
                        getError(index, FormKeys.SERVICE_START_DATE)}
                    </div>
                  </Box>
                </Box>
              )}

              {serviceType === serviceTypes.DEDICATED && (
                <DedicatedVisit
                  index={index}
                  key={index}
                  inputChangedHandler={servicesInputChangedHandler}
                  baseRates={baseRates}
                  getError={getError}
                  days={daysBetweenDates}
                />
              )}
              {serviceType === serviceTypes.PATROL && (
                <PatrolVisits
                  index={index}
                  key={index}
                  inputChangedHandler={servicesInputChangedHandler}
                  baseRates={baseRates}
                  getError={getDisplayError}
                  days={daysBetweenDates}
                  enableOccurences={enableOccurences}
                  products={products}
                  selectedPanType={selectedPlanType}
                  isPublished={isPublished}
                  onFieldInteraction={markFieldInteraction}
                />
              )}

              {!enableOccurences && (
                <Box className={classes.checkBoxAreaTwo}>
                  <Checkbox
                    checked={service[FormKeys.ADD_FUEL_SURCHARGE]}
                    id={FormKeys.ADD_FUEL_SURCHARGE}
                    name={FormKeys.ADD_FUEL_SURCHARGE}
                    onChange={(event) => handleSwitch(event, index)}
                    icon={<CheckBoxRegularIcon />}
                    checkedIcon={<CheckBoxCheckedIcon />}
                    className={classes.checkBoxCustom}
                  />
                  <Typography variant="body2" className={classes?.previewQuestionOptionText}>
                    {`${t('sales.deals.includeFuelSurcharge')}`}
                  </Typography>
                </Box>
              )}
              {service?.[FormKeys.TYPE] === serviceTypes.DEDICATED && (
                <Box className={classes.checkBoxAreaTwo}>
                  <Checkbox
                    checked={service[FormKeys.INCLUDE_VEHICLE]}
                    id={FormKeys.INCLUDE_VEHICLE}
                    name={FormKeys.INCLUDE_VEHICLE}
                    onChange={(event) => handleSwitch(event, index)}
                    icon={<CheckBoxRegularIcon />}
                    checkedIcon={<CheckBoxCheckedIcon />}
                    className={classes.checkBoxCustom}
                  />
                  <Typography variant="body2" className={classes?.previewQuestionOptionText}>
                    {`${t('sales.deals.includeVehicle')}`}
                  </Typography>
                </Box>
              )}
              {service[FormKeys.INCLUDE_VEHICLE] && (
                <>
                  <Box className={classes.hourlyRateContainer}>
                    <InputLabel
                      htmlFor={FormKeys.NO_OF_VEHICLES}
                      className={classes.hourlyRateLabel}
                    >
                      <Box className={classes.hourlyRateText}>
                        {t('sales.contract.noOfVehicles')} <RequiredAsterik />
                      </Box>
                    </InputLabel>
                    <TextField
                      name={FormKeys.NO_OF_VEHICLES}
                      id={FormKeys.NO_OF_VEHICLES}
                      fullWidth
                      value={service[FormKeys.NO_OF_VEHICLES]}
                      onChange={(event) => servicesInputChangedHandler(event)(index)}
                      placeholder="1"
                      type="number"
                      onWheel={(e) => e.target.blur()} // disables scroll on input
                      className={classes.inputField}
                      error={!!getError(index, FormKeys.NO_OF_VEHICLES)}
                      helperText={getError(index, FormKeys.NO_OF_VEHICLES)}
                      InputProps={{
                        inputProps: {
                          min: 0,
                          step: 1, // Specify step as 1 to disallow decimal points
                        },
                      }}
                    />
                  </Box>
                  <Box className={classes.hourlyRateContainer}>
                    <InputLabel htmlFor={FormKeys.VEHICLE_RATE} className={classes.hourlyRateLabel}>
                      <Box className={classes.hourlyRateText}>
                        {t('sales.contract.vehicleyRateInDollars', { symbol })} <RequiredAsterik />
                      </Box>
                      {!isObjectEmpty(service?.suggestedValues?.dedicatedVehicle) && (
                        <Box onClick={togglePriceDetailDrawer} className={classes.suggestRateBox}>
                          <Typography variant="info" className={classes.suggestRateText}>
                            {t('sales.contract.suggestedRate')}{' '}
                            {service?.suggestedValues?.dedicatedVehicle?.suggestedValue != null
                              ? toTwoDecimalPrecision(
                                  service.suggestedValues.dedicatedVehicle.suggestedValue,
                                ).toFixed(2)
                              : ''}
                            ,{' '}
                            {service?.suggestedValues?.dedicatedVehicle?.suggestedMargin != null
                              ? toTwoDecimalPrecision(
                                  service.suggestedValues.dedicatedVehicle.suggestedMargin,
                                ).toFixed(2)
                              : ''}
                          </Typography>
                          <SuggestRateIcon />
                        </Box>
                      )}
                    </InputLabel>
                    <TextField
                      name={FormKeys.VEHICLE_RATE}
                      id={FormKeys.VEHICLE_RATE}
                      fullWidth
                      value={service[FormKeys.VEHICLE_RATE]}
                      onChange={(event) => servicesInputChangedHandler(event)(index)}
                      placeholder={`${symbol}20`}
                      type="number"
                      onWheel={(e) => e.target.blur()} // disables scroll on input
                      className={classes.inputField}
                      error={!!getError(index, FormKeys.VEHICLE_RATE)}
                      helperText={getError(index, FormKeys.VEHICLE_RATE)}
                      InputProps={{
                        inputProps: {
                          min: 0,
                        },
                      }}
                    />
                  </Box>
                </>
              )}
              <Box className={classes.instructionArea}>
                <Typography className={classes.boldheading} variant="h5">
                  {t('sales.contract.instructions')}
                </Typography>
                {serviceType === serviceTypes.PATROL && (
                  <Typography variant="body2" className={classes.serviceBoxtext}>
                    {t('sales.contract.instructionsSubtitle')}
                  </Typography>
                )}
                <Box>
                  <RichTextEditor
                    handleChange={(event) => {
                      const {
                        target: { value },
                      } = event;

                      servicesInputChangedHandler({
                        target: { name: FormKeys.INSTRUCTIONS, value },
                      })(index);
                    }}
                    name={FormKeys.INSTRUCTIONS}
                    placeholder={t('sales.contract.addInstructions')}
                    value={service[FormKeys.INSTRUCTIONS]}
                    className={classes.descriptionTextArea}
                    textLimit={2000}
                  />
                </Box>
              </Box>
              {serviceType === serviceTypes.DEDICATED && (
                <Box className={classes.additionalServices}>
                  <Typography className={classes.boldheading} variant="body2">
                    {t('sales.contract.additionalServices')}
                  </Typography>
                  <Box className={classes.inlineCheckBox}>
                    <Typography className={classes.footerlable} variant="body2">
                      {`${t('sales.contract.visitorManagement')}`}
                    </Typography>
                    <Switch
                      checked={service[FormKeys.VISITOR_MANAGEMENT]}
                      name={FormKeys.VISITOR_MANAGEMENT}
                      onChange={(event) => handleSwitch(event, index)}
                      inputProps={{ 'aria-label': 'ant design' }}
                    />
                  </Box>
                  <Box className={classes.inlineCheckBox}>
                    <Typography className={classes.footerlable} variant="body2">
                      {`${t('sales.contract.loadManagement')}`}
                    </Typography>
                    <Switch
                      checked={service[FormKeys.LOAD_MANAGEMENT]}
                      name={FormKeys.LOAD_MANAGEMENT}
                      onChange={(event) => handleSwitch(event, index)}
                      inputProps={{ 'aria-label': 'ant design' }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {totalServices > 1 && (
          <Box
            className={classNames(classes.footerButton, getViewDisabledContractClass(isPublished))}
          >
            <>
              <Button
                variant="destructiveSecondary"
                className={classes.delService}
                disableRipple
                onClick={() => setShowDeleteServiceModal(true)}
              >
                {t('sales.contract.deleteService')}
              </Button>

              <Box className={classes.sweetAlertWrapper}>
                <SweetAlertModal
                  type="warning" // 'success', 'error', 'warning', 'info', etc.
                  title={t('sales.contract.deleteService!')}
                  text={t('sales.contract.deleteServiceText')}
                  confirmButtonText={t('sales.contract.deleteService')}
                  cancelButtonText={t('sales.contract.cancel')}
                  show={showDeleteServiceModal}
                  icon={<DeleteAlterIcon />}
                  handleConfirmButton={handleDeleteService}
                  handleCancelButton={() => setShowDeleteServiceModal(false)}
                  reverseButtons={true}
                />
              </Box>
            </>
          </Box>
        )}
      </Box>

      {priceRateDrawer && (
        <>
          {/* Suggest Rate Drawer */}
          <SuggestRateDrawer
            open={priceRateDrawer}
            onClose={togglePriceDetailDrawer}
            services={[service]}
            serviceIndex={index}
            baseRates={baseRates}
            clickedOn="vehicleRate"
          />
        </>
      )}
    </Box>
  );
};

ServiceCard.propTypes = {
  index: PropTypes.number,
  service: PropTypes.object,
  totalServices: PropTypes.number,
  serviceType: PropTypes.string,
  errorMessages: PropTypes.object,
  baseRates: PropTypes.object,
  isPublished: PropTypes.bool,
  lineItems: PropTypes.array,
  enableOccurences: PropTypes.bool,
  products: PropTypes.array,
  selectedPlanType: PropTypes.object,
  apiData: PropTypes.object,
  stripeEnabled: PropTypes.bool,
};

export default memo(ServiceCard);
