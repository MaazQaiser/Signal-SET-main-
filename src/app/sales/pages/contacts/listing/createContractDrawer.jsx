import { Box, InputLabel, Stack, TextField, Typography } from '@mui/material';
import classNames from 'classnames';
import PhoneNumberWithCountry from 'commonComponents/phoneNumberWithCountry';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { checkIfContactExists, createContact, updateContact } from 'services/contact.service';
import DrawerFooter from 'src/app/components/salesComponents/components/drawerFooter';
import DrawerHeader from 'src/app/components/salesComponents/components/drawerHeader';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import useFormHook from 'src/hooks/useFormHook';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from './listing';

const initialFormData = {
  email: '',
  firstName: '',
  lastName: '',
  jobTitle: '',
  contact: '',
};

const CreateContractDrawer = ({ anchor, width, creationCloseDrawer, contactData, refresh }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);

  const { handleInputChange, formData, isChanged, setFormData, errorMessages, setErrorMessages } =
    useFormHook({
      defaultFormData: initialFormData,
    });

  const renderError = (name) => {
    let message = null;

    if (errorMessages[name]) {
      message = errorMessages[name];
    }
    return message;
  };

  const checkContactExist = async (event) => {
    event.preventDefault();

    try {
      const email = event?.target?.value;
      if (!email) return;
      setLoading(true);

      const payload = {
        email: email,
      };

      const errors = await formValidatorJoi(payload, t);

      if (errors && Object.keys(errors).length) {
        setErrorMessages((prev) => ({ ...prev, ...errors }));
        return;
      }

      const response = await checkIfContactExists(payload);

      if (response?.statusCode === 200) {
        if (response?.data?.exists) {
          toast.error(t('sales.contacts.contactEmailExists'), {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          setErrorMessages((prev) => ({
            ...prev,
            email: t('sales.contacts.contactEmailExists'),
          }));
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const updateContactHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let payload = { ...formData };

      const errors = await formValidatorJoi(payload, t);

      if (errors && Object.keys(errors).length) {
        setLoading(false);
        setErrorMessages((prev) => ({ ...prev, ...errors }));
        return;
      }

      payload = {
        firstname: formData?.firstName,
        lastname: formData?.lastName,
        jobtitle: formData?.jobTitle,
        phone: formData?.contact,
        cellNumber: formData?.cellNumber,
      };

      const response = await updateContact(contactData?.id, payload);

      if (response?.statusCode === 200) {
        setLoading(false);
        creationCloseDrawer();
        refresh();
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      setLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let payload = { ...formData };

      const errors = await formValidatorJoi(payload, t);

      if (errors && Object.keys(errors).length) {
        setLoading(false);
        setErrorMessages((prev) => ({ ...prev, ...errors }));
        return;
      }

      payload = {
        firstname: formData?.firstName,
        lastname: formData?.lastName,
        email: formData?.email,
        jobtitle: formData?.jobTitle,
        phone: formData?.contact,
        cellNumber: formData?.cellNumber,
      };

      const response = await createContact(payload);

      if (response?.statusCode === 200) {
        setLoading(false);
        creationCloseDrawer();
        refresh();
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      setLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (contactData && !isObjectEmpty(contactData)) {
      setLoading(false);
      setFormData({
        email: contactData.email,
        firstName: contactData?.firstname,
        lastName: contactData?.lastname,
        jobTitle: contactData?.jobtitle,
        contact: contactData?.phone,
        cellNumber: contactData?.cellNumber,
      });
    }
  }, []);

  return (
    <Box
      className={classes?.siderBarBox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
      role="presentation"
      component="form"
    >
      <Stack className={classes?.boxInner} justifyContent="space-between">
        <Box className={classes?.sideHeader}>
          <DrawerHeader
            title={
              contactData?.id ? t('sales.contacts.editContact') : t('sales.contacts.createContact')
            }
            subtext={t('sales.contacts.createContactSubtext')}
            handleCloseDrawer={creationCloseDrawer}
            anchor={anchor}
          />
        </Box>
        <Box className={classNames(classes.locationForm, 'innerScrollBar')}>
          <Box className={`${classes.fieldWrapper}  ${classes.Input}`}>
            <InputLabel htmlFor="email">{t('sales.contacts.email')}</InputLabel>
            <TextField
              id="email"
              name="email"
              fullWidth
              placeholder={t('sales.contacts.addEmail')}
              className={classes.dropdownWrap}
              type={'email'}
              onChange={handleInputChange}
              onBlur={(event) => {
                !contactData?.email && checkContactExist(event);
              }}
              value={formData?.email}
              disabled={!isObjectEmpty(contactData) && contactData?.email}
              error={!!errorMessages?.email}
              helperText={errorMessages?.email || ''}
            />
          </Box>
          <Box className={classes.sideBySideCol}>
            <Box className={classes.fieldWrapper}>
              <InputLabel htmlFor="firstName">{t('sales.contacts.firstName')}</InputLabel>
              <TextField
                id="firstName"
                name="firstName"
                fullWidth
                Disabled
                placeholder={t('sales.contacts.firstName')}
                className={classes.dropdownWrap}
                disabled={loading}
                onChange={handleInputChange}
                value={formData?.firstName}
                error={!!errorMessages?.firstName}
                helperText={errorMessages?.firstName || ''}
              />
            </Box>
            <Box className={classes.fieldWrapper}>
              <InputLabel htmlFor="lastName">{t('sales.contacts.lastName')}</InputLabel>
              <TextField
                id="lastName"
                name="lastName"
                fullWidth
                Disabled
                placeholder={t('sales.contacts.lastName')}
                className={classes.dropdownWrap}
                disabled={loading}
                onChange={handleInputChange}
                value={formData?.lastName}
                error={!!errorMessages?.lastName}
                helperText={errorMessages?.lastName || ''}
              />
            </Box>
          </Box>
          <Box className={`${classes.fieldWrapper} ${classes.Input}`}>
            <InputLabel htmlFor="jobTitle">{t('sales.contacts.jobTitle')}</InputLabel>
            <TextField
              id="jobTitle"
              name="jobTitle"
              fullWidth
              Disabled
              placeholder={t('sales.contacts.jobTitle')}
              className={classes.dropdownWrap}
              disabled={loading}
              onChange={handleInputChange}
              value={formData?.jobTitle}
              error={!!errorMessages?.jobTitle}
              helperText={errorMessages?.jobTitle || ''}
            />
          </Box>
          <Box className={classes.contactField}>
            <Typography variant="h4" className={classes.approveTextBoxTitle}>
              {t('sales.locations.contactDetails')}
            </Typography>
            <Box className={`${classes.sideBySideCol}`}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="contact">{t('sales.contacts.contact')} #</InputLabel>
                {/*<TextField*/}
                {/*  id="contact"*/}
                {/*  name="contact"*/}
                {/*  fullWidth*/}
                {/*  Disabled*/}
                {/*  placeholder={t('sales.contacts.contact')}*/}
                {/*  className={classes.dropdownWrap}*/}
                {/*  disabled={loading}*/}
                {/*  onChange={handleInputChange}*/}
                {/*  value={formData?.contact}*/}
                {/*  error={!!errorMessages?.contact}*/}
                {/*  helperText={errorMessages?.contact || ''}*/}
                {/*/>*/}
                <PhoneNumberWithCountry
                  value={formData.contact || ''}
                  onChange={(value) => handleInputChange({ target: { name: 'contact', value } })}
                  name={'contact'}
                  isError={!!renderError('contact')}
                  international={true}
                  error={renderError('contact')}
                  className={classes.countryPhnNumber}
                  disabled={loading}
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="cellNumber">{t('sales.contacts.cellNumber')} #</InputLabel>
                {/*<TextField*/}
                {/*  id="cellNumber"*/}
                {/*  name="cellNumber"*/}
                {/*  fullWidth*/}
                {/*  Disabled*/}
                {/*  placeholder={t('sales.contacts.cellNumber')}*/}
                {/*  className={classes.dropdownWrap}*/}
                {/*  disabled={loading}*/}
                {/*  onChange={handleInputChange}*/}
                {/*  value={formData?.cellNumber}*/}
                {/*  error={!!errorMessages?.cellNumber}*/}
                {/*  helperText={errorMessages?.cellNumber || ''}*/}
                {/*/>*/}
                <PhoneNumberWithCountry
                  value={formData.cellNumber || ''}
                  onChange={(value) => handleInputChange({ target: { name: 'cellNumber', value } })}
                  name={'cellNumber'}
                  isError={!!renderError('cellNumber')}
                  international={true}
                  error={renderError('cellNumber')}
                  className={classes.countryPhnNumber}
                  disabled={loading}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        <DrawerFooter
          bulkApply={
            contactData?.id ? t('sales.contacts.saveContact') : t('sales.contacts.createContact')
          }
          bulkCancel={t('sales.locations.cancel')}
          handleCloseDrawer={creationCloseDrawer}
          anchor={anchor}
          type="submit"
          classNameFooter={classes.sideDrawerFooter}
          onSubmit={
            contactData && !isObjectEmpty(contactData) ? updateContactHandler : formSubmitHandler
          }
          disabled={loading || !isChanged}
        />
      </Stack>
    </Box>
  );
};

CreateContractDrawer.propTypes = {
  anchor: PropTypes.string,
  width: PropTypes.number,
  creationCloseDrawer: PropTypes.func,
  contactData: PropTypes.object,
  refresh: PropTypes.func,
};
export default CreateContractDrawer;
