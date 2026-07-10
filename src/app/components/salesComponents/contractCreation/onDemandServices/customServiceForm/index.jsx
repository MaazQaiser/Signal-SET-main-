import { Box, Button, InputLabel, TextField } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { removeKeysFromObject } from 'src/helper/utilityFunctions';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { checkAndAddDot } from 'src/utils/string/addDotInEnd';

import formValidatorJoi from '../../../../../../utils/formValidator/formValidator.requiredCheck';
import { intentTypes } from '..';
import { useStyles } from '../onDemandServices';

const CustomServiceForm = ({
  resetForm,
  setData,
  editIndex,
  formData,
  setFormData,
  enableOccurences,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [errorMessages, setErrorMessages] = useState({});
  const { symbol } = useSelector(getDisplayConfiguration);

  /**
   * common function to update data to formData object
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

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;

    /**
     * It will only store floating values upto 2 decimel places
     */
    if (name === 'price' && !value.match(/^(\d*\.{0,1}\d{0,2}$)/)) {
      return;
    }

    /**
     * It will only store number values
     */
    if (value && name === 'quantity' && !value.match(/^\d+$/)) {
      return;
    }

    /**
     * only includes special characters
     */
    if (value && name === 'title' && !value.match(/^(?!.*[.']{2,})(?!^[.'])(?!^[ ])[a-zA-Z.' ]+$/))
      return;

    if (value) {
      const { [name]: _key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    updateFormHandler(name, value);
  };

  const handleAddService = async () => {
    // Remove specified keys from formData
    const tempValidate = removeKeysFromObject(formData, ['description']);

    const errors = await formValidatorJoi(tempValidate, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      return;
    }

    const onDemandService = { ...formData, intent: intentTypes.CUSTOM };

    setData((prevData) =>
      editIndex !== null
        ? [...prevData.slice(0, editIndex), onDemandService, ...prevData.slice(editIndex + 1)]
        : [...prevData, onDemandService],
    );

    setErrorMessages({});
    resetForm();
  };

  const handleCancel = () => {
    setErrorMessages({});
    resetForm();
  };
  return (
    <Box className={classes.onDemandFieldsWrapper}>
      <Box className={classes.onDemandFields}>
        <Box className={classes.inputFieldTitle}>
          <InputLabel htmlFor="title">
            {t('sales.contract.title')} <RequiredAsterik />
          </InputLabel>
          <TextField
            name="title"
            id="title"
            fullWidth
            placeholder={t('sales.contract.title')}
            type="text"
            className={classes.inputField}
            onChange={inputChangedHandler}
            value={formData?.title || ''}
            error={!!errorMessages?.title}
            helperText={errorMessages?.title && checkAndAddDot(errorMessages?.title)}
            inputProps={{ maxLength: 55 }}
          />
        </Box>
        <Box className={classes.DemandInline}>
          <InputLabel htmlFor="price">
            {!enableOccurences
              ? t('sales.contract.pricePerMonth', { symbol })
              : t('sales.contract.price')}
            <RequiredAsterik />
          </InputLabel>
          <TextField
            name="price"
            id="price"
            fullWidth
            placeholder={t('sales.contract.pricePlaceHolder', { symbol })}
            type="number"
            className={classes.inputField}
            onChange={inputChangedHandler}
            value={formData?.price}
            error={!!errorMessages?.price}
            helperText={errorMessages?.price && checkAndAddDot(errorMessages?.price)}
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
          />
        </Box>
        <Box className={classes.DemandInline}>
          <InputLabel htmlFor="quantity">
            {t('sales.contract.quantity')} <RequiredAsterik />
          </InputLabel>
          <TextField
            name="quantity"
            id="quantity"
            fullWidth
            placeholder={t('sales.contract.quantityPlaceHolder')}
            type="number"
            className={classes.inputField}
            onChange={inputChangedHandler}
            value={formData?.quantity}
            error={!!errorMessages?.quantity}
            helperText={errorMessages?.quantity && checkAndAddDot(errorMessages?.quantity)}
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
          />
        </Box>

        <Box className={classes.DemandInline}>
          <InputLabel htmlFor="total">{t('sales.contract.total')}</InputLabel>
          <TextField
            disabled
            name="total"
            id="total"
            fullWidth
            type="number"
            className={classNames(classes.inputField, classes.inputFieldTotal)}
            value={formData?.price * formData?.quantity || 0}
          />
        </Box>
      </Box>
      <Box className={classes.DemandInlineButton}>
        <Button
          variant="secondaryGrey"
          type="button"
          disableRipple
          className={classes.saveButton}
          onClick={handleCancel}
        >
          {t('sales.contract.cancel')}
        </Button>

        <Button
          variant="primary"
          type="button"
          disableRipple
          className={classes.saveButton}
          onClick={handleAddService}
        >
          {t('sales.contract.save')}
        </Button>
      </Box>
    </Box>
  );
};

CustomServiceForm.propTypes = {
  setData: PropTypes.func,
  resetForm: PropTypes.func,
  editIndex: PropTypes.number,
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  enableOccurences: PropTypes.bool,
};

export default CustomServiceForm;
