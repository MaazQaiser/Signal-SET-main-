import { Box, Button, TextField, Typography } from '@mui/material';
import { InputAdornment } from '@mui/material';
import { LOGIN } from 'app/router/constant/ROUTE';
import history from 'app/router/utils/history';
import { ReactComponent as Email } from 'assets/images/mail.svg';
import { ReactComponent as Logo } from 'assets/images/signalLogo.svg';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgetPassword } from 'services/auth.services';
import { toastSettings } from 'src/utils/constants';

import formValidatorJoi from '../../../../utils/formValidator/formValidator.requiredCheck';
import { useStyles } from './forgetPassword.styles';

const initialFormData = {
  email: '',
};

const ForgetPassEmail = () => {
  const classes = useStyles();

  const [formData, setFormData] = useState(initialFormData);
  const [errorMessages, setErrorMessages] = useState({});

  const [disabled, setDisabled] = useState(false);

  const { t } = useTranslation();

  const windowLocation = window.location;

  const updateFormHandler = (name, value) => {
    setFormData((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };
  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);
  };

  const handleSubmit = async (event) => {
    // Prevent page reload
    event.preventDefault();
    setDisabled(true);

    const errors = await formValidatorJoi(formData, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      setDisabled(false);
      return;
    }

    try {
      const payload = {
        user: {
          redirectUrl: `${windowLocation.origin}`,
          email: formData.email,
        },
      };
      const response = await forgetPassword(payload);
      if (response?.statusCode === 200) {
        history.push(LOGIN);
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */

      setDisabled(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setDisabled(false);
    }
  };

  // JSX code for login form
  const renderForm = (
    <Box component="form" onSubmit={handleSubmit} className={classes.passwordContent}>
      <TextField
        error={errorMessages?.email ? true : false}
        type="text"
        name="email"
        helperText={errorMessages?.email}
        placeholder={t('form.input.textField.email.label')}
        defaultValue={formData.email}
        onChange={(e) => inputChangedHandler(e)}
        className={classes.passwordTextField}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email />
            </InputAdornment>
          ),
        }}
      />

      <Button
        className={classes.passwordloginButton}
        variant="primary"
        type="submit"
        disabled={disabled}
      >
        {t('buttons.continue')}
      </Button>
    </Box>
  );

  return (
    <Box className={classes.mainContainer}>
      <Box className={classes.mainPasswordSection}>
        <Box className={classes.passwordContent}>
          <Box className={classes.passwordLogoImage}>
            <Logo alt="signalLogo" />
          </Box>
          <Box className={classes.passwordTextContent}>
            <Typography variant="h1" className={classes.passwordTextContentTitle}>
              {t('commonText.forgetPassword.title')}
            </Typography>
            <Typography className={classes.passwordTextContentDescription} variant="body2">
              {t('commonText.forgetPassword.desc')}
            </Typography>
          </Box>
          {renderForm}
        </Box>
        <Link to={LOGIN}>
          <Button variant="tertiaryGrey" className={classes.passwordBackBtn}>
            {t('links.backToLogin')}
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

export default ForgetPassEmail;
