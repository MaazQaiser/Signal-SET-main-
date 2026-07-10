import { Box, InputLabel, TextField, Typography } from '@mui/material';
import classNames from 'classnames';
import CustomDropDown from 'commonComponents/customDropDown';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import {
  ActiveStepsKeys,
  getErrorKey,
  getViewDisabledContractClass,
  showError,
} from 'src/app/sales/pages/contractCreation/helper';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { MAX_4_DIGIT_VALUE, MAX_5_DIGIT_VALUE, proposalTypeEnum } from 'src/utils/constants';
import { checkAndAddDot } from 'src/utils/string/addDotInEnd';

import { useStyles } from '../onDemandServices';

export const MONTHLY_RATE = 0;

const rates = {
  0: 'pricePerMonth',
  1: 'pricePerHit',
  2: 'pricePerHour',
};

export const systemServicesConstant = {
  SYSTEM: 'system',
  DISPATCH_REQUEST: 'Dispatch Request',
  EXTRA_JOB: 'Extra Job',
  PRICE: 'price',
  PEAK_HOUR_PRICE: 'peakHourPrice',
};

export const FormKeys = {
  dispatchRate: 'dispatchRate',
  price: 'price',
  peakHoursPrice: 'peakHoursPrice',
};

export const dispatchOptionEnums = {
  flatRate: 'flat_rate',
  chargePerAlarm: 'charge_per_alarm',
  nonBillable: 'non_billable',
};

const dispatchOptions = (t) => [
  { label: t('sales.contract.flatRate'), value: dispatchOptionEnums.flatRate },
  { label: t('sales.contract.chargePerAlarm'), value: dispatchOptionEnums.chargePerAlarm },
  { label: t('sales.contract.nonBillable'), value: dispatchOptionEnums.nonBillable },
];

const SystemService = ({
  item,
  index,
  data,
  setData,
  errorMessages,
  setErrorMessages,
  isPublished,
  proposalType,
}) => {
  const { t } = useTranslation();

  const options = useMemo(() => dispatchOptions(t), [t]);

  const classes = useStyles();
  const { symbol } = useSelector(getDisplayConfiguration);
  const NA = t('commonText.nA');
  const rate = item.rate;

  /**
   * conditon to show steric *
   * Hide for Dispatch Request & Extra Job
   */
  const requiredCondition =
    item.intent === systemServicesConstant.SYSTEM &&
    (item.title === systemServicesConstant.DISPATCH_REQUEST ||
      item.title === systemServicesConstant.EXTRA_JOB);

  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setData((prevState) => {
        const newData = prevState.map((item, i) => {
          if (i === index) {
            return { ...item, [name]: value };
          }
          return item;
        });
        return newData;
      });
    },
    [setData],
  );

  const inputChangedHandler = (event) => {
    let { name, value } = event.target;

    /**
     * It will only store floating values upto 2 decimel places
     */
    if (
      (name === FormKeys.price || name === FormKeys.peakHoursPrice) &&
      !value.match(/^(\d*\.{0,1}\d{0,2}$)/)
    ) {
      return;
    }

    if (value) {
      const {
        [getErrorKey({ activeStep: ActiveStepsKeys.ON_DEMAND_SERVICES, index, key: name })]: _key,
        ...rest
      } = errorMessages;
      setErrorMessages(rest);
    }

    if (rate !== MONTHLY_RATE && value > MAX_4_DIGIT_VALUE) value = MAX_4_DIGIT_VALUE;

    if (rate === MONTHLY_RATE && value > MAX_5_DIGIT_VALUE) value = MAX_5_DIGIT_VALUE;

    if (name === FormKeys.dispatchRate && value?.value === dispatchOptionEnums.nonBillable) {
      updateFormHandler(FormKeys.price, null);
      updateFormHandler(FormKeys.peakHoursPrice, null);
      const {
        [getErrorKey({
          activeStep: ActiveStepsKeys.ON_DEMAND_SERVICES,
          index,
          key: FormKeys.price,
        })]: _key1,
        [getErrorKey({
          activeStep: ActiveStepsKeys.ON_DEMAND_SERVICES,
          index,
          key: FormKeys.peakHoursPrice,
        })]: _key2,
        [getErrorKey({
          activeStep: ActiveStepsKeys.ON_DEMAND_SERVICES,
          index,
          key: FormKeys.dispatchRate,
        })]: _key3,
        ...rest
      } = errorMessages;
      setErrorMessages(rest);
    }

    if (name === FormKeys.dispatchRate && value?.value === dispatchOptionEnums.flatRate) {
      updateFormHandler(FormKeys.price, null);
      updateFormHandler(FormKeys.peakHoursPrice, null);
      const {
        [getErrorKey({
          activeStep: ActiveStepsKeys.ON_DEMAND_SERVICES,
          index,
          key: FormKeys.price,
        })]: _key1,
        [getErrorKey({
          activeStep: ActiveStepsKeys.ON_DEMAND_SERVICES,
          index,
          key: FormKeys.peakHoursPrice,
        })]: _key2,
        [getErrorKey({
          activeStep: ActiveStepsKeys.ON_DEMAND_SERVICES,
          index,
          key: FormKeys.dispatchRate,
        })]: _key3,
        ...rest
      } = errorMessages;
      setErrorMessages(rest);
    }

    if (name === FormKeys.dispatchRate && value?.value === dispatchOptionEnums.chargePerAlarm) {
      updateFormHandler(FormKeys.price, null);
      updateFormHandler(FormKeys.peakHoursPrice, null);
      const {
        [getErrorKey({
          activeStep: ActiveStepsKeys.ON_DEMAND_SERVICES,
          index,
          key: FormKeys.price,
        })]: _key1,
        [getErrorKey({
          activeStep: ActiveStepsKeys.ON_DEMAND_SERVICES,
          index,
          key: FormKeys.peakHoursPrice,
        })]: _key2,
        [getErrorKey({
          activeStep: ActiveStepsKeys.ON_DEMAND_SERVICES,
          index,
          key: FormKeys.dispatchRate,
        })]: _key3,
        ...rest
      } = errorMessages;
      setErrorMessages(rest);
    }

    updateFormHandler(name, value);
  };

  const getError = (key) => {
    return showError({
      activeStep: ActiveStepsKeys.ON_DEMAND_SERVICES,
      index,
      key: key,
      errorMessages,
    });
  };

  return (
    <Box className={classNames(classes.demandPricesRow, getViewDisabledContractClass(isPublished))}>
      <Box className={classes.priceLeftSide}>
        <Box className={classes.priceLeftSideInner}>
          <Box className={classes.labelCount}>{index + 1}.</Box>
          <Box className={classes.labelTextColum}>
            <Typography variant="body2" className={classes.labelHeading}>
              {item?.tenantLabel || NA}
            </Typography>
            <Typography variant="body2" className={classes.labelSubText}>
              {item?.description}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box className={'classes.priceRightSide'}>
        <Box className={'classes.priceRightSideInner'}>
          {item?.title === systemServicesConstant.DISPATCH_REQUEST ? (
            <Box className={classes.demandInlineWrrap}>
              <Box className={classes.DemandInline}>
                <InputLabel htmlFor="price">
                  {t('sales.contract.billingType')}{' '}
                  {proposalType === proposalTypeEnum.default && <RequiredAsterik />}
                </InputLabel>
                <CustomDropDown
                  label={`${t('sales.contract.billingType')}`}
                  placeHolder={t('sales.contract.notIncluded')}
                  name={FormKeys.dispatchRate}
                  options={options || []}
                  selectedValues={data?.[index]?.dispatchRate || {}}
                  handleChange={inputChangedHandler}
                  bordered
                  className={classes.customDropDown}
                  isError={
                    !!getError(FormKeys.dispatchRate) ? getError(FormKeys.dispatchRate) : null
                  }
                />
                <Box className={classes.invalidFeedback}>
                  {!!getError(FormKeys.dispatchRate) ? getError(FormKeys.dispatchRate) : null}
                </Box>
              </Box>
              {data?.[index]?.dispatchRate?.value === dispatchOptionEnums.flatRate && (
                <Box className={'classes.DemandInline'}>
                  <InputLabel htmlFor="price">
                    {t('sales.contract.ratePerWeek', { symbol })} <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    name={FormKeys.price}
                    id={FormKeys.price}
                    fullWidth
                    placeholder={t('sales.contract.ratePerWeek', { symbol })}
                    type="number"
                    onWheel={(e) => e.target.blur()} // disables scroll on input
                    className={classes.inputField}
                    onChange={inputChangedHandler}
                    value={data[index]?.price}
                    InputProps={{
                      inputProps: {
                        min: 0,
                      },
                    }}
                    error={!!getError(FormKeys.price)}
                    helperText={
                      getError(FormKeys.price) && checkAndAddDot(getError(FormKeys.price))
                    }
                  />
                </Box>
              )}
              {data?.[index]?.dispatchRate?.value === dispatchOptionEnums.chargePerAlarm && (
                <>
                  <Box className={'classes.DemandInline'}>
                    <InputLabel htmlFor="price">
                      {t('sales.contract.rateWithSymbol', { symbol })}
                      <RequiredAsterik />
                    </InputLabel>
                    <TextField
                      name={FormKeys.price}
                      id={FormKeys.price}
                      fullWidth
                      placeholder={t('sales.contract.rateWithSymbol', { symbol })}
                      type="number"
                      onWheel={(e) => e.target.blur()} // disables scroll on input
                      className={classes.inputField}
                      onChange={inputChangedHandler}
                      value={data[index]?.price}
                      InputProps={{
                        inputProps: {
                          min: 0,
                        },
                      }}
                      error={!!getError(FormKeys.price)}
                      helperText={
                        getError(FormKeys.price) && checkAndAddDot(getError(FormKeys.price))
                      }
                    />
                  </Box>
                  <Box className={'classes.DemandInline'}>
                    <InputLabel htmlFor={FormKeys.peakHoursPrice}>
                      {t('sales.contract.peakHours', { symbol })}
                    </InputLabel>
                    <TextField
                      name={FormKeys.peakHoursPrice}
                      id={FormKeys.peakHoursPrice}
                      fullWidth
                      placeholder={t('sales.contract.peakHours', { symbol })}
                      type="number"
                      onWheel={(e) => e.target.blur()} // disables scroll on input
                      className={classes.inputField}
                      onChange={inputChangedHandler}
                      value={data[index]?.peakHoursPrice}
                      InputProps={{
                        inputProps: {
                          min: 0,
                        },
                      }}
                      error={!!getError(FormKeys.peakHoursPrice)}
                      helperText={
                        getError(FormKeys.peakHoursPrice) &&
                        checkAndAddDot(getError(FormKeys.peakHoursPrice))
                      }
                    />
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <Box className={classes.DemandInline}>
              <InputLabel htmlFor={FormKeys.price}>
                {t(`sales.contract.${rates[rate]}`, { symbol })}{' '}
                {requiredCondition && <RequiredAsterik />}
              </InputLabel>
              <TextField
                name={FormKeys.price}
                id={FormKeys.price}
                fullWidth
                placeholder={t(`sales.contract.add${rates[rate]}`)}
                type="number"
                onWheel={(e) => e.target.blur()} // disables scroll on input
                className={classes.inputField}
                onChange={inputChangedHandler}
                value={data[index]?.price}
                InputProps={{
                  inputProps: {
                    min: 0,
                  },
                }}
                error={!!getError(FormKeys.price)}
                helperText={getError(FormKeys.price) && checkAndAddDot(getError(FormKeys.price))}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

SystemService.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number,
  data: PropTypes.array,
  setData: PropTypes.number,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
  isPublished: PropTypes.bool,
  proposalType: PropTypes.string,
};

export default SystemService;
