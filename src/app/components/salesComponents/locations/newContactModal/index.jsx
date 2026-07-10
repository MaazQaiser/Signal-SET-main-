import { Button, InputLabel, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import PhoneNumberWithCountry from 'commonComponents/phoneNumberWithCountry';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { checkIfContactExists, createContact } from 'services/contact.service';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { Clossicon } from 'src/assets/svg';
import useFormHook from 'src/hooks/useFormHook';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from './newContactModal.styles';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: '760px',
  bgcolor: 'background.paper',
  boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'auto',
};

const initialFormData = {
  email: '',
  firstName: '',
  lastName: '',
  jobTitle: '',
  contact: '',
};

const NewContactModal = ({ openHandle, closeHandle, type, onContactCreated = () => {} }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);

  const { handleInputChange, formData, _setFormData, errorMessages, setErrorMessages } =
    useFormHook({
      defaultFormData: initialFormData,
    });

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

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let payload = { ...formData };

      const errors = await formValidatorJoi(payload, t);

      if (errors && Object.keys(errors).length) {
        setErrorMessages((prev) => ({ ...prev, ...errors }));
        setLoading(false);
        return;
      }

      payload = {
        firstname: formData?.firstName,
        lastname: formData?.lastName,
        email: formData?.email,
        jobtitle: formData?.jobTitle,
        phone: formData?.contact,
      };

      const response = await createContact(payload);

      if (response?.statusCode === 200) {
        setLoading(false);
        closeHandle();
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        onContactCreated(response?.data, type);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  return (
    <>
      <Modal
        open={openHandle}
        onClose={closeHandle}
        sx={{
          zIndex: '130000',
        }}
      >
        <Box
          className={classes.converModal}
          component={'form'}
          onSubmit={formSubmitHandler}
          sx={style}
        >
          <Box className={classes.boxHeader}>
            <Box className={classes.titlehead}>
              <Typography variant="h4" className={classes.sidetitle}>
                {t('sales.locations.createANewContact')}
              </Typography>
              <a className={classes.cbtn} href="#" onClick={closeHandle}>
                <Clossicon />
              </a>
            </Box>
            <Typography variant="body2" className={classes.bulkSubHeading}>
              {t('sales.locations.createNewContactModalText')}
            </Typography>
          </Box>

          <Box className={classNames(classes.locationForm)}>
            <Box className={`${classes.fieldWrapper}  ${classes.Input}`}>
              <InputLabel htmlFor="email">
                {t('sales.contacts.email')}
                <RequiredAsterik />
              </InputLabel>
              <TextField
                id="email"
                name="email"
                fullWidth
                Disabled
                error={!!errorMessages?.email}
                placeholder={t('sales.contacts.addEmail')}
                className={classes.dropdownWrap}
                type={'email'}
                onChange={handleInputChange}
                onBlur={(event) => {
                  checkContactExist(event);
                }}
                value={formData?.email}
                helperText={errorMessages?.email || ''}
              />
            </Box>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="firstName">
                  {t('sales.contacts.firstName')}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  id="firstName"
                  name="firstName"
                  fullWidth
                  Disabled
                  error={!!errorMessages?.firstName}
                  placeholder={t('sales.contacts.firstName')}
                  className={classes.dropdownWrap}
                  disabled={loading}
                  onChange={handleInputChange}
                  value={formData?.firstName}
                  helperText={errorMessages?.firstName || ''}
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="lastName">
                  {t('sales.contacts.lastName')}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  id="lastName"
                  name="lastName"
                  fullWidth
                  Disabled
                  error={!!errorMessages?.lastName}
                  placeholder={t('sales.contacts.lastName')}
                  className={classes.dropdownWrap}
                  disabled={loading}
                  onChange={handleInputChange}
                  value={formData?.lastName}
                  helperText={errorMessages?.lastName || ''}
                />
              </Box>
            </Box>
            <Box className={classes.sideBySideCol}>
              <Box className={`${classes.fieldWrapper}`}>
                <InputLabel htmlFor="jobTitle">
                  {t('sales.contacts.jobTitle')}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  id="jobTitle"
                  name="jobTitle"
                  fullWidth
                  Disabled
                  error={!!errorMessages?.jobTitle}
                  placeholder={t('sales.contacts.jobTitle')}
                  className={classes.dropdownWrap}
                  disabled={loading}
                  onChange={handleInputChange}
                  value={formData?.jobTitle}
                  helperText={errorMessages?.jobTitle || ''}
                />
              </Box>
              <Box className={`${classes.fieldWrapper}`}>
                <InputLabel htmlFor="contact">
                  {t('sales.contacts.contact')}#
                  <RequiredAsterik />
                </InputLabel>
                <PhoneNumberWithCountry
                  value={formData.contact || ''}
                  onChange={(value) => handleInputChange({ target: { name: 'contact', value } })}
                  name="contact"
                  isError={!!errorMessages?.contact}
                  international={true}
                  error={errorMessages?.contact || ''}
                  className={classes.dropdownWrap}
                  disabled={loading}
                  placeholder={t('sales.contacts.contact')}
                />
              </Box>
            </Box>
          </Box>

          <Box className={classes.sidefooter}>
            <Box className={classes.footerButtons}>
              <Button
                variant="secondaryGrey"
                onClick={closeHandle}
                disabled={loading}
                className={classNames(classes.blessbtn, classes.btn)}
              >
                {t('sales.locations.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className={classNames(classes.bluebtn, classes.btn)}
              >
                {t('sales.locations.createContact')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

NewContactModal.propTypes = {
  openHandle: PropTypes.bool,
  closeHandle: PropTypes.func,
  onContactCreated: PropTypes.func,
  type: PropTypes.string,
};

export default NewContactModal;
