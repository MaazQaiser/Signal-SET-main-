import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';
import { ReactComponent as VisitIcon } from 'assets/svg/VisitIcon.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown/index.jsx';
import DaysSelection from 'src/app/components/common/daysSelection';
import FieldError from 'src/app/components/common/fieldError/index.jsx';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import ResponsiveTimePickers from 'src/app/components/common/timePicker/index.jsx';
import { ActiveStepsKeys, getNestedErrorKey } from 'src/app/sales/pages/contractCreation/helper.js';
import { DeleteIcon } from 'src/assets/svg/index.jsx';
import { ReactComponent as SuggestRateIcon } from 'src/assets/svg/suggestRate.svg';
import { isObjectEmpty } from 'src/helper/utilityFunctions.js';
import {
  addNewServiceVisit,
  deleteServiceVisit,
  removeContractErrorKey,
  removeContractErrorKeysByPrefix,
  updateServiceVisit,
} from 'src/redux/store/slices/contractServices/index.jsx';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { toTwoDecimalPrecision } from 'src/utils/currencyFormater/index.js';
import { convertHHMMAToDayJsDate } from 'src/utils/passTime/time.jsx';

import AddProducts from '../addProducts/index.jsx';
import { useStyles } from '../addServices.js';
import { FormKeys, repeatModes, visitTypes } from '../helper.js';
import SuggestRateDrawer from '../serviceCard/suggestRateDrawer/index.jsx';

const MAX_NUMBER_OF_VISITS = 50;

const repeatAfterTenureOptions = (t) => [
  { label: t('sales.contract.week'), value: 'week' },
  { label: t('sales.contract.month'), value: 'month' },
];

const PatrolVisits = ({
  index,
  inputChangedHandler,
  baseRates,
  getError,
  days,
  enableOccurences,
  products,
  isPublished,
  onFieldInteraction,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { symbol, timePrecision, timeFormat } = useSelector(getDisplayConfiguration);

  const timeDisplayFormat =
    timeFormat === '24h'
      ? (timePrecision || 'HH:mm').replace(/hh/g, 'HH')
      : /[Aa]/.test(timePrecision || '')
        ? timePrecision
        : `${timePrecision || 'hh:mm'} A`;
  const dispatch = useDispatch();

  const tenantInfo = useSelector((state) => state.auth.tenantInfo);

  const repeatAfterOptions = repeatAfterTenureOptions(t);
  const monthOption = repeatAfterOptions.find((opt) => opt.value === 'month');

  const services = useSelector((state) => state.contractServices?.services);
  const errorMessages = useSelector((state) => state.contractServices?.errorMessages);

  const showRepeatMode = false;
  const [priceRateDrawer, setPriceRateDrawer] = useState(false);

  const service = services[index];
  const visits = services[index]?.[FormKeys.VISITS] || [];

  const disabledDays = useMemo(() => {
    const serviceStartDate =
      !isPublished && enableOccurences && service[FormKeys.SERVICE_START_DATE];

    if (!serviceStartDate) {
      return [];
    }

    const selectedDayOfWeek = serviceStartDate.day();

    return days.filter((day) => day.value !== selectedDayOfWeek).map((day) => day.value);
  }, [service, days, enableOccurences, isPublished]);

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
    onFieldInteraction?.();
    const { name, visitIndex } = customEvent;
    let { value } = customEvent;

    removeNestedErrorKey(index, FormKeys.VISITS, visitIndex, name);

    if (name === FormKeys.PRODUCTS) {
      const prefix = `${ActiveStepsKeys.SERVICES},${index},${FormKeys.VISITS},${visitIndex},${FormKeys.PRODUCTS},`;
      dispatch(removeContractErrorKeysByPrefix(prefix));
    }

    if (name === FormKeys.NUMBER_OF_VISITS && value > MAX_NUMBER_OF_VISITS)
      value = MAX_NUMBER_OF_VISITS;

    if (name === FormKeys.REPEAT_AFTER_FREQUENCY) {
      if (value !== '' && value !== null && value !== undefined) {
        const numValue = parseFloat(value);

        if (numValue < 0 || !Number.isInteger(numValue)) {
          value = Math.max(1, Math.floor(Math.abs(numValue)));
        } else {
          value = Math.floor(numValue);
        }

        const currentVisit = visits[visitIndex];
        const tenure = currentVisit?.[FormKeys.REPEAT_AFTER_TENURE]?.value;

        if (tenure === 'week' && value > 52) {
          value = 52;
        } else if (tenure === 'month' && value > 12) {
          value = 12;
        }
      }
    }

    if (name === FormKeys.REPEAT_AFTER_TENURE) {
      const currentVisit = visits[visitIndex];
      const currentFrequency = currentVisit?.[FormKeys.REPEAT_AFTER_FREQUENCY];

      if (currentFrequency && value?.value) {
        const numFrequency = parseInt(currentFrequency, 10);
        if (value.value === 'week' && numFrequency > 52) {
          dispatch(
            updateServiceVisit({
              name: FormKeys.REPEAT_AFTER_FREQUENCY,
              value: 52,
              visitIndex,
              index,
              baseRates,
            }),
          );
        } else if (value.value === 'month' && numFrequency > 12) {
          dispatch(
            updateServiceVisit({
              name: FormKeys.REPEAT_AFTER_FREQUENCY,
              value: 12,
              visitIndex,
              index,
              baseRates,
            }),
          );
        }
      }
    }

    dispatch(updateServiceVisit({ name, value, visitIndex, index, baseRates }));
  };

  const handleAddVisit = () => {
    onFieldInteraction?.();
    dispatch(addNewServiceVisit({ index }));
  };

  const handleDeleteVisit = (visitIndex) => {
    onFieldInteraction?.();
    dispatch(deleteServiceVisit({ index, deleteVisitIndex: visitIndex, baseRates }));
  };

  const getNestedError = (key, visitIndex) => {
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

  const getProductError = (visitIndex, productIndex, key) => {
    const errorKey = `${ActiveStepsKeys.SERVICES},${index},${FormKeys.VISITS},${visitIndex},${FormKeys.PRODUCTS},${productIndex},${key}`;
    return errorMessages[errorKey];
  };

  const togglePriceDetailDrawer = () => {
    setPriceRateDrawer((a) => !a);
  };

  const suggestedPatrolRate = service?.suggestedValues?.patrol?.suggestedValue;
  const suggestedPatrolMargin = service?.suggestedValues?.patrol?.suggestedMargin;

  useEffect(() => {
    if (!monthOption) return;
    visits.forEach((visit, visitIndex) => {
      if (!visit?.[FormKeys.REPEAT_AFTER_TENURE]?.value) {
        dispatch(
          updateServiceVisit({
            name: FormKeys.REPEAT_AFTER_TENURE,
            value: monthOption,
            visitIndex,
            index,
            baseRates,
          }),
        );
      }
      if (visit?.[FormKeys.VISIT_TYPE] !== visitTypes.FIXED) {
        dispatch(
          updateServiceVisit({
            name: FormKeys.VISIT_TYPE,
            value: visitTypes.FIXED,
            visitIndex,
            index,
            baseRates,
          }),
        );
      }
    });
  }, [visits.length]);

  return (
    <>
      {!enableOccurences && (
        <Box className={classes.pricePerVisit}>
          <InputLabel htmlFor={FormKeys.VISITS_PER_WEEK}>
            {t('sales.contract.visitsPerWeek')}
            <RequiredAsterik />
          </InputLabel>
          <TextField
            name={FormKeys.VISITS_PER_WEEK}
            id={FormKeys.VISITS_PER_WEEK}
            fullWidth
            value={service[FormKeys.VISITS_PER_WEEK] ?? ''}
            onChange={(event) => inputChangedHandler(event)(index)}
            type="number"
            onWheel={(e) => e.target.blur()}
            placeholder="1"
            className={classes.inputField}
            error={!!getError(index, FormKeys.VISITS_PER_WEEK)}
            helperText={getError(index, FormKeys.VISITS_PER_WEEK)}
            InputProps={{
              inputProps: {
                min: 1,
              },
            }}
          />
        </Box>
      )}

      {!enableOccurences && (
        <Box className={classes.pricePerVisit}>
          <InputLabel htmlFor={FormKeys.PRICE_PER_HIT} className={classes.hourlyRateLabel}>
            <Box className={classes.hourlyRateText}>
              {t('sales.contract.pricePerVisit', { symbol })} <RequiredAsterik />
            </Box>
            {!isObjectEmpty(service?.suggestedValues?.patrol) && suggestedPatrolRate != null && (
              <Box onClick={togglePriceDetailDrawer} className={classes.suggestRateBox}>
                <Typography variant="info" className={classes.suggestRateText}>
                  {t('sales.contract.suggestedRatePatrolHint', {
                    symbol,
                    rate: toTwoDecimalPrecision(suggestedPatrolRate).toFixed(2),
                    npm:
                      suggestedPatrolMargin != null
                        ? toTwoDecimalPrecision(suggestedPatrolMargin).toFixed(0)
                        : '',
                  })}
                </Typography>
                <SuggestRateIcon />
              </Box>
            )}
          </InputLabel>
          <TextField
            name={FormKeys.PRICE_PER_HIT}
            id={FormKeys.PRICE_PER_HIT}
            fullWidth
            placeholder={`${symbol}25`}
            value={service[FormKeys.PRICE_PER_HIT] ?? ''}
            onChange={(event) => inputChangedHandler(event)(index)}
            type="number"
            onWheel={(e) => e.target.blur()}
            className={classes.inputField}
            error={!!getError(index, FormKeys.PRICE_PER_HIT)}
            helperText={getError(index, FormKeys.PRICE_PER_HIT)}
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
          />
        </Box>
      )}

      <Box className={classes.addVisitArea}>
        {visits.map((visit, visitIndex) => (
          <Box key={`${index}${visitIndex}`}>
            <Box className={classes.repeatBox}>
              <Box className={classes.repeatBoxHeader}>
                <Typography className={classes.visitSet} variant="h4">
                  {t('sales.contract.visitsSet')} {visitIndex + 1}
                </Typography>
                {visits.length > 1 && (
                  <Box className={classes.deleteBtn} onClick={() => handleDeleteVisit(visitIndex)}>
                    <DeleteIcon />
                  </Box>
                )}
              </Box>
              {!enableOccurences && (
                <Box className={classes.FullFields}>
                  <InputLabel htmlFor={FormKeys.NUMBER_OF_VISITS}>
                    {t('sales.contract.visitsPerDay')}
                  </InputLabel>
                  <TextField
                    name={FormKeys.NUMBER_OF_VISITS}
                    id={FormKeys.NUMBER_OF_VISITS}
                    fullWidth
                    value={visit?.[FormKeys.NUMBER_OF_VISITS] ?? ''}
                    onChange={(event) =>
                      handleVisitChange(
                        { name: FormKeys.NUMBER_OF_VISITS, value: event.target.value, visitIndex },
                        index,
                      )
                    }
                    type="number"
                    onWheel={(e) => e.target.blur()}
                    placeholder="1"
                    className={classes.inputField}
                    error={!!getNestedError(FormKeys.NUMBER_OF_VISITS, visitIndex)}
                    helperText={
                      getNestedError(FormKeys.NUMBER_OF_VISITS, visitIndex) &&
                      t('sales.contract.visitsPerDayError')
                    }
                    InputProps={{
                      inputProps: {
                        min: 1,
                      },
                    }}
                  />
                </Box>
              )}
              <Box className={classes.singleTime}>
                <InputLabel htmlFor="visitTime">{t('sales.contract.visitTime')}</InputLabel>
                <ResponsiveTimePickers
                  value={
                    visit?.[FormKeys.START_TIME]
                      ? convertHHMMAToDayJsDate(visit?.[FormKeys.START_TIME])
                      : null
                  }
                  onChange={(value) =>
                    handleVisitChange({ name: FormKeys.START_TIME, value, visitIndex }, index)
                  }
                  format={timeDisplayFormat}
                  placeholder="09:00 AM"
                  error={!!getNestedError(FormKeys.START_TIME, visitIndex)}
                  helperText={getNestedError(FormKeys.START_TIME, visitIndex)}
                  useLocalTimeZone={true}
                />
              </Box>
              <Box>
                <InputLabel htmlFor={FormKeys.DUTY_DAYS}>
                  {t('sales.contract.visitDays')}
                </InputLabel>
                <Box className={classes.DaysWrap}>
                  <DaysSelection
                    data={days}
                    selectedDays={visit?.[FormKeys.DUTY_DAYS]}
                    handleChange={(event) =>
                      handleVisitChange(
                        { name: FormKeys.DUTY_DAYS, value: event.target.value, visitIndex },
                        index,
                      )
                    }
                    name={FormKeys.DUTY_DAYS}
                    styledClass={classes.dutyDays}
                    truncateTo={3}
                    disabled={disabledDays}
                  />
                </Box>
                <Typography variant="info" className={classes.errorMessage}>
                  {getNestedError(FormKeys.DUTY_DAYS, visitIndex)}
                </Typography>
              </Box>
              {tenantInfo?.services?.patrol && tenantInfo?.services?.repeatModeEnabled && (
                <Box className={classes.FullFields}>
                  {showRepeatMode && (
                    <Box className={classes.repeatAfterBox}>
                      <InputLabel htmlFor={FormKeys.DUTY_DAYS}>
                        {t('sales.contract.repeatEvery')} <RequiredAsterik />
                      </InputLabel>
                      <Box sx={{ flex: '0 0 100px' }}>
                        <TextField
                          name={FormKeys.REPEAT_AFTER_FREQUENCY}
                          id={FormKeys.REPEAT_AFTER_FREQUENCY}
                          fullWidth
                          value={visit?.[FormKeys.REPEAT_AFTER_FREQUENCY]}
                          disabled={visit?.[FormKeys.REPEAT_MODE] === repeatModes.EVERY_WEEK}
                          onChange={(event) =>
                            handleVisitChange(
                              {
                                name: FormKeys.REPEAT_AFTER_FREQUENCY,
                                value: event.target.value,
                                visitIndex,
                              },
                              index,
                            )
                          }
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          placeholder="01"
                          className={classes.inputField}
                          error={!!getNestedError(FormKeys.REPEAT_AFTER_FREQUENCY, visitIndex)}
                          helperText={
                            getNestedError(FormKeys.REPEAT_AFTER_FREQUENCY, visitIndex) &&
                            t('sales.contract.requiredField')
                          }
                          InputProps={{
                            inputProps: {
                              min: 1,
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: '1' }}>
                        <CustomDropDown
                          name={FormKeys.REPEAT_AFTER_TENURE}
                          id={FormKeys.REPEAT_AFTER_TENURE}
                          placeHolder={t('sales.contract.week')}
                          options={repeatAfterOptions}
                          selectedValues={visit?.[FormKeys.REPEAT_AFTER_TENURE] || {}}
                          disabled={visit?.[FormKeys.REPEAT_MODE] === repeatModes.EVERY_WEEK}
                          handleChange={(event) =>
                            handleVisitChange(
                              {
                                name: FormKeys.REPEAT_AFTER_TENURE,
                                value: event.target.value,
                                visitIndex,
                              },
                              index,
                            )
                          }
                          className={classes.dropHeader}
                          bordered
                          isError={!!getNestedError(FormKeys.REPEAT_AFTER_TENURE, visitIndex)}
                        />
                        <FieldError
                          error={
                            !!getNestedError(FormKeys.REPEAT_AFTER_TENURE, visitIndex) &&
                            t('sales.contract.requiredField')
                          }
                        />
                      </Box>
                    </Box>
                  )}
                  <AddProducts
                    products={visit?.[FormKeys.PRODUCTS] || []}
                    onChange={handleVisitChange}
                    visitIndex={visitIndex}
                    getProductError={(productIndex, key) =>
                      getProductError(visitIndex, productIndex, key)
                    }
                    productsOptions={products}
                  />
                  <FieldError
                    error={
                      !!getNestedError(FormKeys.PRODUCTS, visitIndex) &&
                      t('sales.contract.minimumOneProduct')
                    }
                  />
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
      {!enableOccurences && (
        <Button
          disableRipple
          variant="onlyText"
          className={classes.addVisitbtn}
          onClick={handleAddVisit}
        >
          <VisitIcon /> {t('sales.contract.addVisit')}
        </Button>
      )}

      {priceRateDrawer && (
        <SuggestRateDrawer
          open={priceRateDrawer}
          onClose={togglePriceDetailDrawer}
          services={[service]}
          serviceIndex={index}
          baseRates={baseRates}
        />
      )}
    </>
  );
};

PatrolVisits.propTypes = {
  index: PropTypes.number,
  inputChangedHandler: PropTypes.func,
  baseRates: PropTypes.object,
  getError: PropTypes.func,
  days: PropTypes.any,
  enableOccurences: PropTypes.bool,
  products: PropTypes.array,
  isPublished: PropTypes.bool,
  onFieldInteraction: PropTypes.func,
};

export default PatrolVisits;
