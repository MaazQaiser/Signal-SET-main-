import { Box, TextField, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import LoaderComponent from 'src/app/components/common/loader/index.jsx';
import { getViewDisabledContractClass } from 'src/app/sales/pages/contractCreation/helper.js';
import { AlertBlueIcon } from 'src/assets/svg/index.jsx';
import { useTenantLabel } from 'src/hooks/useTenantLabel.jsx';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater/index.js';

import { useStyles } from './devices.js';
import QuantityButton from './QuantityButton/index.jsx';

const FormKeys = {
  OBX_ID: 'obxId',
  NAME: 'name',
  SLUG: 'slug',
  QUANTITY: 'quantity',
  PRICE: 'price',
  IMAGE: 'image',
};

const getEmptyState = (devices) => {
  return devices?.map((device) => ({
    [FormKeys.OBX_ID]: device.id,
    [FormKeys.NAME]: device.key,
    [FormKeys.SLUG]: device.slug,
    [FormKeys.QUANTITY]: 0,
    [FormKeys.PRICE]: device.rateValue,
    [FormKeys.IMAGE]: device.image,
  }));
};

const DevicesTab = ({
  formData,
  setFormData,
  preferences,
  isFetchingPreferences,
  editData,
  oneTimePayment,
  setOneTimePayment,
  isPublished,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { symbol } = useSelector(getDisplayConfiguration);

  const { getLabel } = useTenantLabel();

  useEffect(() => {
    const devices = preferences?.devices;
    setFormData(editData?.length ? editData : getEmptyState(devices) || []);
  }, [editData, preferences]);

  useEffect(() => {
    setOneTimePayment(
      formData?.reduce(
        (total, device) => total + device[FormKeys.QUANTITY] * device[FormKeys.PRICE],
        0,
      ),
    );
  }, [formData, preferences]);

  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value, index) => {
      setFormData((prevState) => {
        const newState = [...prevState];
        newState[index][name] = value;
        return newState;
      });
    },
    [setFormData],
  );

  const inputChangedHandler = (event) => (index) => {
    const { name, type } = event.target;
    let { value } = event.target;

    if (type === 'number' && value < 0) value = 0;

    /**
     * It will only store floating values upto 2 decimel places
     */
    if (name === FormKeys.PRICE && !value.match(/^(\d*\.{0,1}\d{0,2}$)/)) {
      return;
    }

    updateFormHandler(name, value, index);
  };

  const handleIncrease = (quantity, index) => {
    updateFormHandler(FormKeys.QUANTITY, Number(quantity) + 1, index);
  };

  const handleDecrease = (quantity, index) => {
    if (quantity > 0) updateFormHandler(FormKeys.QUANTITY, Number(quantity) - 1, index);
  };

  return (
    <Box className={classes.descStep}>
      {isFetchingPreferences && !editData?.length ? (
        <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />
      ) : null}
      <Box className={classes.stepsHeader}>
        <Box className={classes.stepsHeaderInline}>
          <Typography variant="h3" className={classes.stepperHeadding}>
            {t('sales.contract.checkpointsDevices')}
          </Typography>
        </Box>

        <Typography variant="body2" className={classes.stepperSubheading}>
          {t('sales.contract.checkpointsDevicesText', {
            dedicatedTerm: getLabel('terms', 'dedicated'),
            patrolTerm: getLabel('terms', 'patrol'),
          })}
        </Typography>
      </Box>
      <Box className={classes.stepperInner}>
        <Box className={classes.pointsLabels}>
          <Typography variant="subtitle2" className={classes.labelStyle}>
            {t('sales.contract.device')}
          </Typography>
          <Typography variant="subtitle2" className={classes.labelStyle}>
            {t('sales.contract.unitPrice', { symbol })}
          </Typography>
          <Typography variant="subtitle2" className={classes.labelStyle}>
            {t('sales.contract.quantity')}
          </Typography>
          <Typography variant="subtitle2" className={classes.labelStyle}>
            {t('sales.contract.totalPrice')}
          </Typography>
        </Box>
        {formData?.map((device, index) => (
          <Box
            key={index}
            className={classNames(
              classes.quantityColums,
              getViewDisabledContractClass(isPublished),
            )}
          >
            <Box className={classes.devicesName}>
              <Box className={classes.deviceIcon}>
                <img src={device.image} alt={device.key} />
              </Box>

              <Box className={classes.inlineName}>
                <Typography className={classes.iconName} variant="subtitle2">
                  {device[FormKeys.NAME]}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.unitPriceCol}>
              <TextField
                name={FormKeys.PRICE}
                id={FormKeys.PRICE}
                fullWidth
                type="number"
                onWheel={(e) => e.target.blur()} // disables scroll on input
                value={device[FormKeys.PRICE]}
                onChange={(event) => inputChangedHandler(event)(index)}
                placeholder={t('sales.contract.unitPricePlaceHolder', { symbol })}
                className={classes.inputField}
              />
            </Box>
            <Box className={classes.devicesQuanity}>
              <QuantityButton
                value={device[FormKeys.QUANTITY]}
                handleIncrease={() => handleIncrease(device[FormKeys.QUANTITY], index)}
                handleDecrease={() => handleDecrease(device[FormKeys.QUANTITY], index)}
              />
            </Box>
            <Box className={classes.devicesPrice}>
              <Typography variant="subtitle2">
                {symbol}
                {fomatNumbersWithCommas(
                  Number(device[FormKeys.PRICE]) * Number(device[FormKeys.QUANTITY]),
                )}
              </Typography>
            </Box>
          </Box>
        ))}
        <Box className={classes.borderSeprater}></Box>
        <Box className={classNames(classes.footerValues, classes.pointsLabelsFooter)}>
          <Box className={classes.footerInneWrapper}>
            <Box className={classes.tootalCol}>
              <Typography variant="h5">
                {t('sales.contract.total')}: {symbol}
                {fomatNumbersWithCommas(oneTimePayment)}
              </Typography>
            </Box>
            <Box className={classes.iconHeading}>
              <AlertBlueIcon />
              <Typography variant="subtitle2">{t('sales.contract.BilledOnly')}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

DevicesTab.propTypes = {
  formData: PropTypes.array,
  setFormData: PropTypes.func,
  preferences: PropTypes.object,
  editData: PropTypes.array,
  oneTimePayment: PropTypes.number,
  setOneTimePayment: PropTypes.func,
  isFetchingPreferences: PropTypes.bool,
  isPublished: PropTypes.bool,
};

export default DevicesTab;
