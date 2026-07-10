import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Divider, InputLabel, TextField, Typography } from '@mui/material';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { OBX_USER, OBX_USER_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { getUsersById, updateUsersInfo } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { rolesEnum, toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from './BasicInformationForm';

const emptyState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  fileNumber: '',
  employeeType: {},
  perHourRate: null,
};

const employeeTypeEnum = [
  {
    value: 'W2',
    label: 'W2',
  },
  {
    value: 'W2Salary',
    label: 'W2 Salary',
  },
  {
    value: '1099',
    label: '1099',
  },
];

const BasicInformationForm = () => {
  const [formData, setFormData] = useState(emptyState);
  const [errorMessages, setErrorMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const { id: userId } = useParams();
  const { t } = useTranslation();
  const classes = useStyles();
  const userRole = useSelector((state) => state.auth.userRole);

  const getEmployeeTypeObject = (employeeType) => {
    if (employeeType === null) {
      return {};
    }
    return employeeTypeEnum.find((type) => type.value === employeeType);
  };

  const handleBack = () => {
    if (userId) {
      history.push(`${OBX_USER_DETAIL}/${userId}`);
    } else {
      history.push(`${OBX_USER}`);
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getUsersById(userId);
      if (response?.statusCode === 200) {
        const matchedValue = getEmployeeTypeObject(response?.data?.user?.employeeType);

        setFormData((prevState) => ({
          ...prevState,
          firstName: response?.data?.user?.firstName,
          lastName: response?.data?.user?.lastName,
          email: response?.data?.user?.email,
          phoneNumber: response?.data?.user?.phoneNumber,
          fileNumber: response?.data?.user?.fileNumber,
          employeeType: matchedValue,
          perHourRate: response?.data?.user?.perHourRate,
        }));
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);

      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const backButtonComponent = (
    <Button variant="tertiaryGrey" onClick={handleBack} startIcon={<ArrowBackIcon />}>
      {t('links.back')}
    </Button>
  );

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId]);

  const getErrorKey = (key) => {
    return `userDetails,${key}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    let formDataValue = { ...formData };

    if (formDataValue?.employeeType?.value === employeeTypeEnum[1].value) {
      delete formDataValue.perHourRate;
    }

    if (rolesEnum.supervisor === userRole?.slug) {
      delete formDataValue.perHourRate;
      delete formDataValue.employeeType;
    }

    if (rolesEnum.supervisor !== userRole?.slug) {
      formDataValue.employeeType = formDataValue?.employeeType?.value || null;
    }

    const errors = await joiValidate({ userDetails: { ...formDataValue } }, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }

    const payload = { ...formData };

    if (payload?.employeeType?.value === employeeTypeEnum[1].value) {
      payload.perHourRate = null;
    }
    const newFormData = {
      user: {
        ...payload,
        employeeType: payload?.employeeType?.value,
      },
    };

    try {
      const response = await updateUsersInfo(userId, newFormData);
      if (response?.statusCode === 200) {
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        history.push(`${OBX_USER_DETAIL}/${userId}`);
      }

      setLoading(false);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const updateFormHandler = useCallback(
    (name, value) => {
      // Remove any extra decimal points beyond two
      let processedValue = value;
      if (typeof value !== 'object' && name === 'perHourRate') {
        // First, validate that the input does not start with '0' or a dot and conforms to the pattern
        const regex = /^(?!0|\.)(\d{1,3})(\.\d{0,2})?.*$/;
        const match = processedValue.match(regex);

        if (match) {
          // If the input matches the pattern, process it to ensure only two decimal places
          processedValue = match[1]; // Digits before the decimal point
          if (match[2]) {
            // If there's a decimal part, include up to two decimal places
            processedValue += match[2].substring(0, 3);
          }
        } else {
          // If the input doesn't match the pattern, set it to an empty string or handle it accordingly
          processedValue = '';
        }
      }

      // Update the form data with the processed value
      setFormData((prevState) => ({
        ...prevState,
        [name]: processedValue,
      }));
    },
    [setFormData],
  );

  const preventNegativeValues = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;

      updateFormHandler(name, value);
    },

    [updateFormHandler],
  );

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box
        className={classes.infoWrapper}
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
      >
        <Box className={classes.buttonGroupUpper}>
          <Box className={classes.btnBox}>{backButtonComponent}</Box>
          <Box className={classes.buttonGroup}>
            <Button variant="secondaryGrey" onClick={handleBack}>
              {t('links.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('obx.buttons.save')}
            </Button>
          </Box>
        </Box>
        <Divider className={classes.zonesDivider} />
        <Box className={classes.siteDetais}>
          <Box className={classes.siteDetaisWrapper}>
            <Typography variant="h4"> {t('obx.users.userInformation.title')}</Typography>
            <Box className={classNames(classes.siteDetaisFields, classes.noMarginBottom)}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="firstName">
                  {t('obx.users.userInformation.firstName')} <RequiredAsterik />
                </InputLabel>
                <TextField
                  fullWidth
                  placeholder={t('obx.users.userInformation.john')}
                  type="text"
                  className={classes?.textFiledFilter}
                  name="firstName"
                  value={formData?.firstName || ''}
                  onChange={handleInputChange}
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
                  {t('obx.users.userInformation.lastName')} <RequiredAsterik />
                </InputLabel>
                <TextField
                  fullWidth
                  placeholder={t('obx.users.userInformation.doe')}
                  type="text"
                  className={classes?.textFiledFilter}
                  name="lastName"
                  value={formData?.lastName || ''}
                  onChange={handleInputChange}
                  error={!!errorMessages[getErrorKey('lastName')]}
                  helperText={
                    !!errorMessages[getErrorKey('lastName')]
                      ? errorMessages[getErrorKey('lastName')]
                      : null
                  }
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="email" disabled>
                  {t('obx.users.userInformation.email')} <RequiredAsterik />
                </InputLabel>
                <TextField
                  fullWidth
                  placeholder={t('obx.users.userInformation.emailPlaceholder')}
                  type="email"
                  name="email"
                  disabled
                  className={classes?.textFiledFilter}
                  value={formData?.email || ''}
                  onChange={handleInputChange}
                  error={!!errorMessages[getErrorKey('email')]}
                  helperText={
                    !!errorMessages[getErrorKey('email')]
                      ? errorMessages[getErrorKey('email')]
                      : null
                  }
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="number">
                  {t('obx.users.userInformation.number')} <RequiredAsterik />
                </InputLabel>
                <TextField
                  fullWidth
                  placeholder={t('obx.users.userInformation.phoneNumberPlaceHolder')}
                  type="text"
                  className={classes?.textFiledFilter}
                  name="phoneNumber"
                  value={formData?.phoneNumber || ''}
                  onChange={handleInputChange}
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
            <Typography variant="h4"> {t('obx.users.userInformation.jobDetails')}</Typography>
            <Box className={classes.siteDetaisFields}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="file">
                  {t('obx.users.userInformation.file')} <RequiredAsterik />
                </InputLabel>
                <TextField
                  fullWidth
                  placeholder={`${t('obx.users.userInformation.enter')} ${t('obx.users.userInformation.file')}`}
                  type="text"
                  className={classes?.textFiledFilter}
                  name="fileNumber"
                  value={formData?.fileNumber || ''}
                  onChange={handleInputChange}
                  error={!!errorMessages[getErrorKey('fileNumber')]}
                  helperText={
                    !!errorMessages[getErrorKey('fileNumber')]
                      ? errorMessages[getErrorKey('fileNumber')]
                      : null
                  }
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                {rolesEnum.supervisor !== userRole?.slug ? (
                  <>
                    <InputLabel htmlFor="type">
                      {t('obx.users.userInformation.type')} <RequiredAsterik />
                    </InputLabel>
                    <CustomDropDown
                      label={t('obx.users.userInformation.type')}
                      name="employeeType"
                      options={transformArrayForOptions(employeeTypeEnum, 'label', 'value')}
                      selectedValues={formData.employeeType}
                      handleChange={handleInputChange}
                      placeHolder={`${t('obx.users.userInformation.select')} ${t('obx.users.userInformation.type')}`}
                      placeHolderClassName={classes.placeHolderColor}
                      className={classes.dropdownWrap}
                      bordered
                      isError={!!errorMessages[getErrorKey('employeeType')]}
                    />
                    {!!errorMessages[getErrorKey('employeeType')] && (
                      <Box className={classes.invalidFeedback}>
                        {errorMessages[getErrorKey('employeeType')]}
                      </Box>
                    )}
                  </>
                ) : null}
              </Box>
              {formData.employeeType.value !== employeeTypeEnum[1].value &&
              rolesEnum.supervisor !== userRole?.slug ? (
                <>
                  {' '}
                  <Box className={classes.fieldWrapperNew}>
                    <InputLabel htmlFor="baseRate">
                      {t('obx.users.userInformation.baseRate')} <RequiredAsterik />
                    </InputLabel>
                    <TextField
                      fullWidth
                      placeholder={`${t('obx.users.userInformation.add')} ${t('obx.users.userInformation.baseRate')}`}
                      type="number"
                      className={classes?.textFiledFilter}
                      name="perHourRate"
                      onKeyDown={preventNegativeValues}
                      value={formData?.perHourRate || ''}
                      onChange={handleInputChange}
                      error={!!errorMessages[getErrorKey('perHourRate')]}
                      helperText={
                        !!errorMessages[getErrorKey('perHourRate')]
                          ? errorMessages[getErrorKey('perHourRate')]
                          : null
                      }
                    />
                  </Box>
                </>
              ) : (
                ''
              )}

              {/* <Box className={classes.fieldWrapper}>
              <InputLabel htmlFor="roll">
                {t('obx.users.userInformation.roll')} <RequiredAsterik />
              </InputLabel>
              <CustomDropDown
                label={t('obx.users.userInformation.roll')}
                name="siteType"
                id="siteType"
                placeHolder={`${t('obx.users.userInformation.select')} ${t('obx.users.userInformation.roll')}`}
                placeHolderClassName={classes.placeHolderColor}
                className={classes.dropdownWrap}
                options={finalSites}
                selectedValues={queryParams.sites}
                handleChange={inputChangedHandler}
                multiSelect={true}
                searchable={false}
                withTiles={true}
                bordered
              />
            </Box> */}
              {/* <Box className={classes.fieldWrapper}>
              <InputLabel htmlFor="designation">
                {t('obx.users.userInformation.designation')} <RequiredAsterik />
              </InputLabel>
              <CustomDropDown
                label={t('obx.users.userInformation.designation')}
                name="siteType"
                id="siteType"
                placeHolder={`${t('obx.users.userInformation.select')} ${t('obx.users.userInformation.designation')}`}
                placeHolderClassName={classes.placeHolderColor}
                className={classes.dropdownWrap}
                options={finalSites}
                selectedValues={queryParams.sites}
                handleChange={inputChangedHandler}
                multiSelect={true}
                searchable={false}
                withTiles={true}
                bordered
              />
            </Box> */}
              {/* <Box className={classes.fieldWrapper}></Box> */}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default BasicInformationForm;
