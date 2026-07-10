import { Box, InputLabel, TextField } from '@mui/material';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { removeKey } from 'src/helper/utilityFunctions.js';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';

import CustomDropDown from '../customDropDown/index.jsx';
import RequiredAsterik from '../requiredAsterik/index.jsx';
import RichTextEditor from '../richText/index.jsx';
import { useStyles } from './index.js';

const billingOpions = [
  { id: 1, label: 'Flat Rate', value: 'flatRate' },
  { id: 2, label: 'Charge Per Alarm', value: 'CPA' },
  { id: 3, label: 'Non-Billable', value: 'Non-Billable' },
];
const DispatchBillingInfoComponent = ({
  formDataKey = 'dispatchBillingInfo',
  errorMessages = {},
  formData = {},
  noCharge = false,
  handleFieldChange = () => {},
  index,
  parentKey = 'siteServices',
  setErrorMessages = () => {},
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const getErrorKey = (key, formDataKey, index) => {
    return `${formDataKey},${index},${key}`;
  };

  const showError = (key, formDataKey, index) => {
    return errorMessages?.[`${getErrorKey(key, formDataKey, index)}`];
  };
  const handleInputChange = (field, value) => {
    if (
      (field === 'billingRate' || field === 'peakHours') &&
      !value.match(/^(?:\d{1,3}(\.\d{1,2})?)?$/)
    ) {
      return;
    }
    handleFieldChange(index, field, value, formDataKey);

    if (value) {
      let errorKey = parentKey
        ? getErrorKey(`${formDataKey},${field}`, parentKey, index)
        : getErrorKey(field, formDataKey, index);
      setErrorMessages((prev) => removeKey([errorKey], prev));
    }
  };

  const handleEditorChange = (event) => {
    const {
      target: { value },
    } = event;
    handleInputChange('instructions', value);
  };

  const showCustomErrors = (field, formDataKey) => {
    if (parentKey) {
      return showError(`${formDataKey},${field}`, parentKey, index, errorMessages);
    }
    return showError(field, formDataKey, index, errorMessages);
  };

  const filteredData = noCharge ? billingOpions?.slice(0, -1) : billingOpions;
  return (
    <Box>
      {' '}
      <Box>{t('obx.sites.createSite.dispatchBillingInfoComponent')}</Box>
      <Box className={classes.siteDetaisFields}>
        <Box className={classes.fieldWrapper}>
          <InputLabel htmlFor="billingType">
            {t('obx.sites.createSite.billingType')} <RequiredAsterik />
          </InputLabel>
          <CustomDropDown
            label={t('obx.sites.createSite.billingType')}
            name="billingType"
            id="billingType"
            placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.billingType')}`}
            placeHolderClassName={classes.placeHolderColor}
            className={classes.dropdownWrap}
            options={transformArrayForOptions(filteredData, 'label', 'value')}
            selectedValues={formData?.[formDataKey]?.billingType || {}}
            handleChange={(e) => handleInputChange('billingType', e.target.value)}
            bordered
          />

          {!!showCustomErrors('billingType', formDataKey, index) && (
            <Box className={classes.invalidFeedback}>
              {showCustomErrors('billingType', formDataKey, index)}
            </Box>
          )}
        </Box>
        {formData?.[formDataKey]?.billingType?.value &&
          formData?.[formDataKey]?.billingType?.value !== filteredData[2]?.value && (
            <>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="billingRate">
                  {t('obx.sites.createSite.billingRate')} <RequiredAsterik />
                </InputLabel>

                <TextField
                  name="billingRate"
                  id="billingRate"
                  fullWidth
                  placeholder={t('obx.sites.createSite.billingRate')}
                  type="text"
                  value={formData?.[formDataKey]?.billingRate}
                  className={classes?.textFiledFilter}
                  onChange={(e) => handleInputChange('billingRate', e.target.value)}
                  error={!!showCustomErrors('billingRate', formDataKey, index)}
                  helperText={
                    !!showCustomErrors('billingRate', formDataKey, index)
                      ? showCustomErrors('billingRate', formDataKey, index)
                      : null
                  }
                />
              </Box>
              {formData?.[formDataKey]?.billingType?.value === filteredData[1]?.value && (
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="peakHours">{t('obx.sites.createSite.peakHours')}</InputLabel>

                  <TextField
                    name="peakHours"
                    id="peakHours"
                    fullWidth
                    placeholder={t('obx.sites.createSite.peakHours')}
                    type="text"
                    value={formData?.[formDataKey]?.peakHours}
                    className={classes?.textFiledFilter}
                    onChange={(e) => handleInputChange('peakHours', e.target.value)}
                    error={!!showCustomErrors('peakHours', formDataKey, index)}
                    helperText={
                      !!showCustomErrors('peakHours', formDataKey, index)
                        ? showCustomErrors('peakHours', formDataKey, index)
                        : null
                    }
                  />
                </Box>
              )}
            </>
          )}
      </Box>
      <Box className={classes.createExtraDutyEditor}>
        <RichTextEditor
          handleChange={handleEditorChange}
          name={'instructions'}
          placeholder={t('obx.obxExtraDuty.placeholders.descriptions')}
          value={formData?.[formDataKey]?.instructions || EditorState.createEmpty()}
          customClassEditor={classes.createDutyEditor}
        />
        {!!errorMessages?.instructions && (
          <Box className={classes.invalidFeedback}>{errorMessages?.instructions}</Box>
        )}
      </Box>
    </Box>
  );
};

export default DispatchBillingInfoComponent;

DispatchBillingInfoComponent.propTypes = {
  formData: PropTypes.object,
  errorMessages: PropTypes.object,
  parentKey: PropTypes.string,
  noCharge: PropTypes.bool,
  formDataKey: PropTypes.string,
  setErrorMessages: PropTypes.func,
  handleFieldChange: PropTypes.func,
  index: PropTypes.number,
};
