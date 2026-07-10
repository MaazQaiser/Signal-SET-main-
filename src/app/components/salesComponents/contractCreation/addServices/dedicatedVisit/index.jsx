import { Box, InputLabel, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import DaysSelection from 'src/app/components/common/daysSelection';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { ActiveStepsKeys, getNestedErrorKey } from 'src/app/sales/pages/contractCreation/helper';
import { ReactComponent as SuggestRateIcon } from 'src/assets/svg/suggestRate.svg';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/hooks/useTenantLabel';
import {
  removeContractErrorKey,
  updateServiceVisit,
} from 'src/redux/store/slices/contractServices';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { toTwoDecimalPrecision } from 'src/utils/currencyFormater/index.js';
import capitalize from 'src/utils/string/capitalize.jsx';

import { useStyles } from '../addServices';
import { FormKeys, getVisitHoursPerWeekFromVisit } from '../helper';
import SelectTimer from '../selectTimer';
import SuggestRateDrawer from '../serviceCard/suggestRateDrawer';

const MAX_REQ_OFFICERS = 50;

const DedicatedVisit = ({ index, baseRates, inputChangedHandler, getError, days }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { symbol } = useSelector(getDisplayConfiguration);
  const visitIndex = 0;

  const dispatch = useDispatch();

  const { getLabel } = useTenantLabel();

  const service = useSelector((state) => state.contractServices[ActiveStepsKeys.SERVICES][index]);
  const errorMessages = useSelector((state) => state.contractServices?.errorMessages);

  const [priceRateDrawer, setPriceRateDrawer] = useState(false);

  const serviceType = service[FormKeys.TYPE];

  const visit = service?.[FormKeys.VISITS][0] || {};

  const scheduleKeyRef = useRef('');

  const computedHoursPerWeek = useMemo(
    () => getVisitHoursPerWeekFromVisit(visit),
    [visit?.[FormKeys.START_TIME], visit?.[FormKeys.END_TIME], visit?.[FormKeys.DUTY_DAYS]],
  );

  const totalHoursPerWeek = useMemo(() => {
    const hrs = Number(visit[FormKeys.OFFICER_SERVICE_HRS_WEEK]) || 0;
    const officers = Number(visit[FormKeys.REQ_OFFICERS]) || 0;
    return Math.round(hrs * officers * 100) / 100;
  }, [visit?.[FormKeys.OFFICER_SERVICE_HRS_WEEK], visit?.[FormKeys.REQ_OFFICERS]]);

  // Calculate disabled days based on service start date
  // const disabledDays = useMemo(() => {
  //   const serviceStartDate = stripeEnabled && service[FormKeys.SERVICE_START_DATE];

  //   if (!serviceStartDate) {
  //     // If no service start date is selected, don't disable any days
  //     return [];
  //   }

  //   // Get the day of the week from the service start date (0 = Sunday, 1 = Monday, etc.)
  //   const selectedDayOfWeek = serviceStartDate.day();

  //   // Return all days except the selected day of week
  //   return days.filter((day) => day.value !== selectedDayOfWeek).map((day) => day.value);
  // }, [service, days]);

  const removeNestedErrorKey = (index, nestedKeyName, nestedIndex, keyName) => {
    const errorKey = getNestedErrorKey({
      activeStep: ActiveStepsKeys.SERVICES,
      index,
      nestedFormDataKey: nestedKeyName,
      nestedIndex,
      key: keyName,
    });

    dispatch(removeContractErrorKey(errorKey));
  };

  const handleVisitChange = (customEvent) => {
    const { name } = customEvent;

    let { value } = customEvent;

    if (name === FormKeys.REQ_OFFICERS && value > MAX_REQ_OFFICERS) value = MAX_REQ_OFFICERS;

    if (
      name === FormKeys.OFFICER_SERVICE_HRS_WEEK &&
      value !== '' &&
      value != null &&
      !String(value).match(/^(\d*\.{0,1}\d{0,2}$)/)
    ) {
      return;
    }

    removeNestedErrorKey(index, FormKeys.VISITS, visitIndex, name);

    dispatch(updateServiceVisit({ name, value, visitIndex, index, baseRates }));
  };

  useEffect(() => {
    const scheduleKey = [
      visit?.[FormKeys.START_TIME],
      visit?.[FormKeys.END_TIME],
      visit?.[FormKeys.DUTY_DAYS]?.join(','),
    ].join('|');

    if (scheduleKey === scheduleKeyRef.current || computedHoursPerWeek == null) {
      return;
    }

    scheduleKeyRef.current = scheduleKey;
    dispatch(
      updateServiceVisit({
        name: FormKeys.OFFICER_SERVICE_HRS_WEEK,
        value: computedHoursPerWeek,
        visitIndex,
        index,
        baseRates,
      }),
    );
  }, [
    baseRates,
    computedHoursPerWeek,
    dispatch,
    index,
    visit?.[FormKeys.DUTY_DAYS],
    visit?.[FormKeys.END_TIME],
    visit?.[FormKeys.START_TIME],
    visitIndex,
  ]);

  const getNestedError = (key) => {
    return errorMessages[
      getNestedErrorKey({
        activeStep: ActiveStepsKeys.SERVICES,
        index,
        nestedFormDataKey: FormKeys.VISITS,
        nestedIndex: visitIndex,
        key,
      })
    ];
  };

  const togglePriceDetailDrawer = () => {
    setPriceRateDrawer((a) => !a);
  };

  return (
    <>
      <Box className={classes.ofcRequired}>
        <Box className={classes.marginBottomColumWidth} mb={2}>
          <InputLabel htmlFor={FormKeys.REQ_OFFICERS}>
            {t('sales.contract.officersRequired', {
              officerTermCap: capitalize(getLabel('roles', 'officer') || 'Officer'),
              guardTermCap: capitalize(getLabel('terms', 'guard') || 'Guard'),
            })}{' '}
            <RequiredAsterik />
          </InputLabel>
          <TextField
            name={FormKeys.REQ_OFFICERS}
            id={FormKeys.REQ_OFFICERS}
            fullWidth
            placeholder={t('sales.contract.reqOfficerPlaceHolder')}
            value={visit[FormKeys.REQ_OFFICERS]}
            onChange={(event) => {
              const newValue = event.target.value.replace(/[^\d]/g, ''); // Remove any non-digit characters

              handleVisitChange({ name: FormKeys.REQ_OFFICERS, value: newValue }, index);
            }}
            type="number"
            onWheel={(e) => e.target.blur()} // disables scroll on input
            className={classes.inputField}
            error={!!getNestedError(FormKeys.REQ_OFFICERS)}
            helperText={getNestedError(FormKeys.REQ_OFFICERS)}
            InputProps={{
              inputProps: {
                max: 50,
                min: 1,
                step: 1, // Specify step as 1 to disallow decimal points
              },
            }}
          />
        </Box>
      </Box>
      <Box className={classes.hourlyRateContainer}>
        <InputLabel htmlFor={FormKeys.OFFICER_SERVICE_HRS_WEEK} className={classes.hourlyRateLabel}>
          <Box className={classes.hourlyRateText}>
            {t('sales.contract.officerServiceHrsWeek')} <RequiredAsterik />
          </Box>
          <Typography variant="info" className={classes.totalHrsWeekText}>
            {t('sales.contract.totalHrsWeek', { total: totalHoursPerWeek || 0 })}
          </Typography>
        </InputLabel>
        <TextField
          name={FormKeys.OFFICER_SERVICE_HRS_WEEK}
          id={FormKeys.OFFICER_SERVICE_HRS_WEEK}
          fullWidth
          placeholder={t('sales.contract.reqOfficerPlaceHolder')}
          value={visit[FormKeys.OFFICER_SERVICE_HRS_WEEK] ?? ''}
          onChange={(event) => {
            const newValue = event.target.value.replace(/[^\d.]/g, '');
            handleVisitChange({ name: FormKeys.OFFICER_SERVICE_HRS_WEEK, value: newValue });
          }}
          type="text"
          inputMode="decimal"
          onWheel={(e) => e.target.blur()}
          className={classes.inputField}
          error={!!getNestedError(FormKeys.OFFICER_SERVICE_HRS_WEEK)}
          helperText={getNestedError(FormKeys.OFFICER_SERVICE_HRS_WEEK)}
          InputProps={{
            inputProps: {
              min: 0,
            },
          }}
        />
      </Box>
      <Box className={classes.marginBottomDropDown}>
        <InputLabel htmlFor={FormKeys.DUTY_DAYS}>{t('sales.contract.dutydays')}</InputLabel>

        <Box className={classes.DaysWrap}>
          <DaysSelection
            data={days}
            selectedDays={visit[FormKeys.DUTY_DAYS]}
            handleChange={(event) =>
              handleVisitChange({ name: FormKeys.DUTY_DAYS, value: event.target.value }, index)
            }
            name={FormKeys.DUTY_DAYS}
            styledClass={classes.dutyDays}
            truncateTo={3}
            // disabled={disabledDays}
          />
        </Box>
        <Typography variant="info" className={classes.errorMessage}>
          {getNestedError(FormKeys.DUTY_DAYS)}
        </Typography>
      </Box>
      <SelectTimer
        index={index}
        visit={visit}
        visitIndex={visitIndex}
        serviceType={serviceType}
        errorMessages={errorMessages}
        baseRates={baseRates}
        getNestedError={getNestedError}
        showRequired={false}
      />
      <Box className={classes.hourlyRateContainer}>
        <InputLabel htmlFor={FormKeys.HOURLY_RATE} className={classes.hourlyRateLabel}>
          <Box className={classes.hourlyRateText}>
            {t('sales.contract.hourlyRateInDollars', { symbol })} <RequiredAsterik />
          </Box>
          {!isObjectEmpty(service?.suggestedValues?.dedicated) && (
            <Box onClick={togglePriceDetailDrawer} className={classes.suggestRateBox}>
              <Typography variant="info" className={classes.suggestRateText}>
                {t('sales.contract.suggestedRate')}{' '}
                {service?.suggestedValues?.dedicated?.suggestedValue != null
                  ? toTwoDecimalPrecision(service.suggestedValues.dedicated.suggestedValue).toFixed(
                      2,
                    )
                  : ''}
                ,{' '}
                {service?.suggestedValues?.dedicated?.suggestedMargin != null
                  ? toTwoDecimalPrecision(
                      service.suggestedValues.dedicated.suggestedMargin,
                    ).toFixed(2)
                  : ''}
              </Typography>
              <SuggestRateIcon />
            </Box>
          )}
        </InputLabel>
        <TextField
          name={FormKeys.HOURLY_RATE}
          id={FormKeys.HOURLY_RATE}
          fullWidth
          value={service[FormKeys.HOURLY_RATE]}
          onChange={(event) => inputChangedHandler(event)(index)}
          placeholder={`${symbol}20`}
          type="number"
          onWheel={(e) => e.target.blur()} // disables scroll on input
          className={classes.inputField}
          error={!!getError(index, FormKeys.HOURLY_RATE)}
          helperText={getError(index, FormKeys.HOURLY_RATE)}
          InputProps={{
            inputProps: {
              min: 0,
            },
          }}
        />
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
            clickedOn="hourlyRate"
          />
        </>
      )}
    </>
  );
};

DedicatedVisit.propTypes = {
  index: PropTypes.number,
  inputChangedHandler: PropTypes.func,
  baseRates: PropTypes.object,
  getError: PropTypes.func,
  days: PropTypes.any,
  // stripeEnabled: PropTypes.bool,
};

export default DedicatedVisit;
