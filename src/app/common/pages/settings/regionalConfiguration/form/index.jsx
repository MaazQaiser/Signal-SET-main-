import {
  Box,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactComponent as DeleteIcon } from 'assets/svg/trash-2.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CountrySelector from 'src/app/components/common/countrySelect';
import CustomDropDown from 'src/app/components/common/customDropDown';
import {
  ACL_SETTINGS_REGIONAL_CONFIGURATIONS_DELETE,
  ACL_SETTINGS_REGIONAL_CONFIGURATIONS_UPDATE,
} from 'src/app/router/constant/SALESMODULE';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';

import { useStyles } from '../styles';

const emptyOption = {};
const isValidValue = (val) => val !== null && val !== undefined && val !== '';
const requiredFields = [
  'country',
  'currency',
  'dateFormat',
  'timeFormat',
  'timePrecision',
  'distanceUnit',
];

const RegionalConfigurationForm = ({
  title,
  configuration,
  options,
  disabled = false,
  showCancel = false,
  onCancel,
  onSaveDraft,
  onPublish,
  onDelete,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [formState, setFormState] = useState({
    id: null,
    country: emptyOption,
    currency: emptyOption,
    dateFormat: emptyOption,
    timeFormat: emptyOption,
    timePrecision: emptyOption,
    distanceUnit: emptyOption,
  });

  const countryCodes = useMemo(() => {
    return (options?.countries || [])
      .concat([configuration?.country] || [])
      .map((c) => c?.value)
      .filter(Boolean);
  }, [options]);

  const currencyOptions = useMemo(() => {
    return (options?.currencies || []).map((currency) => ({
      label: currency?.symbol ? `${currency?.label} (${currency?.symbol})` : currency?.label,
      value: String(currency?.value),
    }));
  }, [options]);

  const timePrecisionOptions = useMemo(() => {
    return (options?.timePrecisions || []).filter(
      (tp) => tp?.timeFormat == formState.timeFormat?.value,
    );
  }, [options, formState.timeFormat?.value]);

  useEffect(() => {
    if (!options) return;
    setFormState((prev) => {
      if (prev.id === configuration?.id && prev.country?.value === configuration?.country?.value) {
        return prev;
      }
      return {
        id: configuration?.id || null,
        country: configuration?.country || emptyOption,
        currency: configuration?.currency || emptyOption,
        dateFormat: configuration?.dateFormat || emptyOption,
        timeFormat: configuration?.timeFormat || options?.timeFormats?.[0] || emptyOption,
        timePrecision: configuration?.timePrecision || emptyOption,
        distanceUnit: configuration?.distanceUnit || options?.distanceUnits?.[0] || emptyOption,
      };
    });
  }, [configuration?.id, configuration?.country?.value, options]);

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value || emptyOption }));
  };

  const handleCountryChange = (countryCode) => {
    const countryOption = (options?.countries || []).find(
      (c) => String(c?.value || '').toUpperCase() === String(countryCode || '').toUpperCase(),
    );
    setFormState((prev) => ({ ...prev, country: countryOption || { value: countryCode } }));
  };

  const handleRadioChange = (name, options) => (event) => {
    const value = event.target.value;
    const option = options.find((o) => String(o.value) === String(value)) || { value };
    setFormState((prev) => ({ ...prev, [name]: option }));
  };

  const canSubmit = requiredFields.every((field) => isValidValue(formState[field]?.value));

  return (
    <Box className={classes.addFormContainer}>
      {title ? (
        <Typography variant="h5" className={classes.formTitle}>
          {title}
        </Typography>
      ) : null}

      <Box className={classes.addFormContent}>
        <Box className={classes.formRow}>
          <Typography variant="subtitle2" className={classes.formLabel}>
            {t('sales.settings.regionalConfigurations.country')}
          </Typography>
          <Box className={classes.formInput}>
            <CountrySelector
              data={formState.country?.value}
              countryCodes={countryCodes}
              updateFormHandler={handleCountryChange}
              searchable={true}
              disabled={disabled}
            />
          </Box>
        </Box>

        <Box className={classes.formRow}>
          <Typography variant="subtitle2" className={classes.formLabel}>
            {t('sales.settings.regionalConfigurations.currency')}
          </Typography>
          <Box className={classes.formInput}>
            <CustomDropDown
              name="currency"
              options={currencyOptions}
              selectedValues={formState.currency}
              handleChange={handleDropdownChange}
              placeHolder={t('sales.settings.regionalConfigurations.selectCurrency')}
              bordered
              disabled={disabled}
              className={classes.dropdown}
            />
          </Box>
        </Box>

        <Box className={classes.formRow}>
          <Typography variant="subtitle2" className={classes.formLabel}>
            {t('sales.settings.regionalConfigurations.dateFormat')}
          </Typography>
          <Box className={classes.formInput}>
            <CustomDropDown
              name="dateFormat"
              options={options?.dateFormats}
              selectedValues={formState.dateFormat}
              handleChange={handleDropdownChange}
              placeHolder={t('sales.settings.regionalConfigurations.selectDateFormat')}
              bordered
              disabled={disabled}
              className={classes.dropdown}
            />
          </Box>
        </Box>

        <Box className={classes.formRowRadio}>
          <Typography variant="subtitle2" className={classes.formLabel}>
            {t('sales.settings.regionalConfigurations.timeFormat')}
          </Typography>
          <Box className={classes.formInput}>
            <RadioGroup
              row
              value={String(formState.timeFormat?.value ?? '')}
              onChange={handleRadioChange('timeFormat', options?.timeFormats)}
              className={classes.radioGroup}
            >
              {options?.timeFormats?.map((option) => (
                <FormControlLabel
                  key={String(option.value)}
                  value={String(option.value)}
                  control={<Radio />}
                  label={option.label}
                  disabled={disabled}
                />
              ))}
            </RadioGroup>
            <Box className={classes.timeFormatDropdown}>
              <CustomDropDown
                name="timePrecision"
                options={timePrecisionOptions}
                selectedValues={formState.timePrecision}
                handleChange={handleDropdownChange}
                placeHolder={t('sales.settings.regionalConfigurations.selectPrecision')}
                bordered
                disabled={disabled}
                className={classes.dropdown}
                disableCapitalize={true}
              />
            </Box>
          </Box>
        </Box>

        <Box className={classes.formRow}>
          <Typography variant="subtitle2" className={classes.formLabel}>
            {t('sales.settings.regionalConfigurations.distanceMeasure')}
          </Typography>
          <Box className={classes.formInput}>
            <RadioGroup
              row
              value={String(formState.distanceUnit?.value ?? '')}
              onChange={handleRadioChange('distanceUnit', options?.distanceUnits)}
              className={classes.radioGroup}
            >
              {options?.distanceUnits?.map((option) => (
                <FormControlLabel
                  key={String(option.value)}
                  value={String(option.value)}
                  control={<Radio />}
                  label={option.label}
                  disabled={disabled}
                />
              ))}
            </RadioGroup>
          </Box>
        </Box>
      </Box>

      {(showCancel || onSaveDraft || onPublish || onDelete) && (
        <Box className={classes.formFooter}>
          {showCancel ? (
            <Button
              variant="secondaryGrey"
              onClick={onCancel}
              className={classes.cancelButton}
              disabled={disabled}
            >
              {t('sales.settings.regionalConfigurations.cancel')}
            </Button>
          ) : (
            <span />
          )}

          <Box className={classes.formFooterButtons}>
            {!disabled && onDelete && (
              <RenderIfHasPermission name={ACL_SETTINGS_REGIONAL_CONFIGURATIONS_DELETE}>
                <Button
                  variant="destructiveSecondary"
                  onClick={() => onDelete(configuration?.id)}
                  startIcon={<DeleteIcon />}
                >
                  {t('commonText.delete')}
                </Button>
              </RenderIfHasPermission>
            )}
            {!disabled && (
              <Tooltip
                title={
                  !canSubmit ? t('sales.settings.regionalConfigurations.selectAllOptions') : ''
                }
              >
                <span>
                  <RenderIfHasPermission name={ACL_SETTINGS_REGIONAL_CONFIGURATIONS_UPDATE}>
                    <Button
                      variant="secondaryBlue"
                      onClick={() => onSaveDraft(formState)}
                      className={classes.draftButton}
                      disabled={!canSubmit}
                    >
                      {t('sales.settings.regionalConfigurations.saveAsDraft')}
                    </Button>
                  </RenderIfHasPermission>
                </span>
              </Tooltip>
            )}
            {!disabled && (
              <Tooltip
                title={
                  !canSubmit ? t('sales.settings.regionalConfigurations.selectAllOptions') : ''
                }
              >
                <span>
                  <RenderIfHasPermission name={ACL_SETTINGS_REGIONAL_CONFIGURATIONS_UPDATE}>
                    <Button
                      variant="primary"
                      onClick={() => onPublish(formState)}
                      disabled={!canSubmit}
                    >
                      {t('sales.settings.regionalConfigurations.publish')}
                    </Button>
                  </RenderIfHasPermission>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

RegionalConfigurationForm.propTypes = {
  title: PropTypes.string,
  configuration: PropTypes.object,
  options: PropTypes.object,
  disabled: PropTypes.bool,
  showCancel: PropTypes.bool,
  onCancel: PropTypes.func,
  onSaveDraft: PropTypes.func,
  onPublish: PropTypes.func,
  onDelete: PropTypes.func,
};

export default RegionalConfigurationForm;
