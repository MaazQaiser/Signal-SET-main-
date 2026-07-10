import {
  Autocomplete,
  Box,
  Button,
  Chip,
  InputLabel,
  Switch,
  TextField,
  Tooltip,
} from '@mui/material';
import { ReactComponent as InfoIcon } from 'assets/svg/InfoIcon.svg';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { useCustomAddressHook } from 'src/app/components/hooks/customAddressHook';
import { useApiControllers } from 'src/helper/axios';
import { getBillingDetail, updateBillingDetails } from 'src/services/billing.service';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './billingDetails';

const emptyState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  sameAsSite: false,
  recepientEmails: [],
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  country: '',
  state: '',
  city: '',
  timesheet: false,
};

const BillingDetails = ({ siteId }) => {
  const [formData, setFormData] = useState(emptyState);
  const [errorMessages, setErrorMessages] = useState({});

  const { t } = useTranslation();
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const { getNewApiController } = useApiControllers();

  // const label = { inputProps: { 'aria-label': 'Switch demo' } };
  const getErrorKey = (key) => {
    return `billingDetails,${key}`;
  };

  const { CityHookComponent, StateHookComponent, CountrySelectHookComponent } =
    useCustomAddressHook({
      formData,
      setFormData,
      errorMessages: {
        ...errorMessages,
        city: errorMessages[getErrorKey('city')],
        state: errorMessages[getErrorKey('state')],
        country: errorMessages[getErrorKey('country')],
      },
      setErrorMessages: () => {},
    });

  const fetchBillingDetails = async (siteId) => {
    const apiController = getNewApiController();

    setLoading(true);
    try {
      const response = await getBillingDetail(siteId);

      if (response && response?.statusCode === 200) {
        setFormData((prevState) => ({
          ...prevState,
          ...response?.data?.billingDetail,
          recepientEmails: response?.data?.billingDetail?.recepientEmails || [],
          countryCode: response?.data?.billingDetail?.country?.countryCode,
          country: response?.data?.billingDetail?.country?.id,
          state: response?.data?.billingDetail?.state?.id,
          city: response?.data?.billingDetail?.city?.id,
        }));
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleMultipleSelectedValues = async (event, field) => {
    if (event.target.value) {
      setFormData((prevState) => ({
        ...prevState,
        [field]: [...prevState[field], event.target.value],
      }));
    }
  };

  const handleChipDelete = (e, index) => {
    e.stopPropagation(); // Prevent onChange from being called

    const data = [...formData['recepientEmails']];

    const afterRemove = data.filter((_a, i) => i !== index);

    setFormData((prevState) => ({
      ...prevState,
      ['recepientEmails']: afterRemove,
    }));
  };

  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;

      updateFormHandler(name, value);
    },
    [updateFormHandler],
  );

  const hasEmailRecipientsError = (errors) => {
    return Object.keys(errors).some((key) => key.includes('billingDetails,recepientEmails'));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessages({});
    const id = formData?.id;
    const billingDetails = formData;

    const errors = await joiValidate({ billingDetails: billingDetails }, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await updateBillingDetails(id, formData);
      setErrorMessages({});
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        fetchBillingDetails(siteId);
      }

      setLoading(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteId) {
      fetchBillingDetails(siteId);
    }
  }, [siteId]);

  return (
    <Box className={classes.siteWrapper}>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box noValidate autoComplete="off">
        <Box className={classes.upperWrap}>
          <Box className={classes.siteDetais}>
            <Box className={classes.siteDetaisWrapper}>
              <Box className={classes.siteDetaisFields}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="firstName">
                    {t('obx.billing.firstName')} <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    fullWidth
                    placeholder={t('obx.billing.john')}
                    type="text"
                    value={formData?.firstName || ''}
                    name="firstName"
                    onChange={handleInputChange}
                    className={classes?.textFiledFilter}
                    error={!!errorMessages[getErrorKey('firstName')]}
                    helperText={
                      !!errorMessages[getErrorKey('firstName')]
                        ? errorMessages[getErrorKey('firstName')]
                        : null
                    }
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="lastName">
                    {t('obx.billing.lastName')} <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    fullWidth
                    placeholder={t('obx.billing.snow')}
                    type="text"
                    value={formData?.lastName || ''}
                    name="lastName"
                    onChange={handleInputChange}
                    className={classes?.textFiledFilter}
                    error={!!errorMessages[getErrorKey('lastName')]}
                    helperText={
                      !!errorMessages[getErrorKey('lastName')]
                        ? errorMessages[getErrorKey('lastName')]
                        : null
                    }
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="email">
                    {t('obx.billing.email')} <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    fullWidth
                    placeholder={t('obx.billing.emailPlaceholder')}
                    type="email"
                    value={formData?.email || ''}
                    name="email"
                    onChange={handleInputChange}
                    className={classes?.textFiledFilter}
                    error={!!errorMessages[getErrorKey('email')]}
                    helperText={
                      !!errorMessages[getErrorKey('email')]
                        ? errorMessages[getErrorKey('email')]
                        : null
                    }
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="phoneNumber">
                    {t('obx.billing.phoneNumber')} <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    fullWidth
                    placeholder={t('obx.billing.phoneNumberPlaceHolder')}
                    type="tel"
                    value={formData?.phoneNumber || ''}
                    name="phoneNumber"
                    onChange={handleInputChange}
                    className={classes?.textFiledFilter}
                    error={!!errorMessages[getErrorKey('phoneNumber')]}
                    helperText={
                      !!errorMessages[getErrorKey('phoneNumber')]
                        ? errorMessages[getErrorKey('phoneNumber')]
                        : null
                    }
                  />
                </Box>
              </Box>
            </Box>
            <Box className={classes.siteDetaisWrapper}>
              <Box className={classes.siteDetaisFields}>
                <Box className={classes.emailWrapper}>
                  <Box className={classes.inlineFields}>
                    <InputLabel htmlFor="recepientEmails">
                      {t('obx.billing.emailRecipients')}
                    </InputLabel>
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
                      title={t('obx.billing.info')}
                      placement="right"
                    >
                      <InfoIcon className={classes.alertIcon} />
                    </Tooltip>
                  </Box>
                  <Autocomplete
                    multiple
                    disableClearable={true}
                    id={'recepientEmails'}
                    options={[]}
                    // defaultValue={{}}
                    value={formData?.recepientEmails || []}
                    className={classes.autoCompleteField}
                    freeSolo
                    onChange={(event) => handleMultipleSelectedValues(event, 'recepientEmails')}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({ index });

                        return (
                          <Chip
                            color="primary"
                            label={option}
                            key={key}
                            {...tagProps}
                            onDelete={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleChipDelete(event, index);
                            }}
                          />
                        );
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name={'recepientEmails'}
                        variant="filled"
                        label=""
                        placeholder={t('obx.billing.emailRecepientsPlaceholder')}
                        type="email"
                        className={classes.autoCompleteTextField}
                        error={!!errorMessages[getErrorKey('recepientEmails')]}
                        helperText={
                          !!errorMessages[getErrorKey('recepientEmails')]
                            ? errorMessages[getErrorKey('recepientEmails')]
                            : null
                        }
                      />
                    )}
                  />

                  {hasEmailRecipientsError(errorMessages) && (
                    <Box className={classes.invalidFeedback}>{t('errors.emailRecepients')}</Box>
                  )}
                </Box>
              </Box>
            </Box>
            <Box className={classes.siteDetaisWrapper}>
              <Box className={classes.siteDetaisFields}>
                <Box className={classes.oneThird}>
                  <InputLabel htmlFor="billingAddress">
                    {t('obx.billing.billingAddress')} <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    fullWidth
                    placeholder={`${t('obx.billing.type')} ${t('obx.billing.billingAddress')}`}
                    className={classes?.textFiledFilter}
                    value={formData?.addressLine1 || ''}
                    name="addressLine1"
                    onChange={handleInputChange}
                    error={!!errorMessages[getErrorKey('addressLine1')]}
                    helperText={
                      !!errorMessages[getErrorKey('addressLine1')]
                        ? errorMessages[getErrorKey('addressLine1')]
                        : null
                    }
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="country">
                    {t('obx.sites.createSite.country')} <RequiredAsterik />
                  </InputLabel>
                  <CountrySelectHookComponent />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="state">
                    {t('obx.sites.createSite.state')} <RequiredAsterik />
                  </InputLabel>
                  <StateHookComponent bordered={true} />
                </Box>
              </Box>
            </Box>
            <Box className={classes.siteDetaisWrapper}>
              <Box className={classes.siteDetaisFields}>
                <Box className={classes.onecols}>
                  <InputLabel htmlFor="city">
                    {t('obx.sites.createSite.city')} <RequiredAsterik />
                  </InputLabel>
                  <CityHookComponent bordered={true} />
                </Box>
                <Box className={classes.onecols}>
                  <InputLabel htmlFor="zipCode">
                    {t('obx.sites.createSite.zipCode')} <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    fullWidth
                    placeholder={`${t('obx.sites.createSite.add')} ${t('obx.sites.createSite.zipCode')}`}
                    type="number"
                    value={formData?.postalCode || ''}
                    name="postalCode"
                    onChange={handleInputChange}
                    className={classes?.textFiledFilter}
                    error={!!errorMessages[getErrorKey('postalCode')]}
                    helperText={
                      !!errorMessages[getErrorKey('postalCode')]
                        ? errorMessages[getErrorKey('postalCode')]
                        : null
                    }
                  />
                </Box>
              </Box>
            </Box>
            <Box className={classes.siteDetaisWrapper}>
              <Box className={classes.siteDetaisFields}>
                <Box className={classes.onecols}>
                  <Box className={classes.autoCheckout}>
                    <Box className={classes.autoLeft}>
                      <InputLabel htmlFor="zipCode">{t('obx.billing.timesheet')}</InputLabel>
                    </Box>
                    <Box className={classes.autoRight}>
                      <Switch
                        checked={formData?.timesheet}
                        name={t('obx.billing.timesheetKey')}
                        onChange={(e) => {
                          const { name, checked } = e.target;
                          handleInputChange({ target: { name, value: checked } });
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box className={classes.lowerWrap}>
          <Button variant="primary" onClick={handleSubmit}>
            {t('obx.billing.update')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

BillingDetails.propTypes = {
  siteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default BillingDetails;
