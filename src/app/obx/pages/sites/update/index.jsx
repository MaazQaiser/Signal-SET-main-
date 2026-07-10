import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, Checkbox, InputLabel, TextField, Tooltip, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import { ReactComponent as EmailIcon } from 'assets/images/email.svg';
import { ReactComponent as CautionIcon } from 'assets/svg/caution-thin.svg';
import { ReactComponent as PhoneIcon } from 'assets/svg/phoneIcon.svg';
import classNames from 'classnames';
import AutoCompleteCommon from 'commonComponents/autoCompleteCommon';
import ProfileImageUpload from 'commonComponents/profileImageUpload';
import {
  actionItemTypeKeys,
  franchiseIdUrlQueryParam,
  geoFencingPolygonTypeKeys,
  rolesEnum,
  timeZoneKeyUrlQueryParam,
  toastSettings,
} from 'globalUtils/constants';
import {
  findParentAndSiblingsPolygon,
  isObjectEmpty,
  mapLocationInfo,
  scrollToInValidField,
} from 'helper/utilityFunctions';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { getSiteDetails, updateSite } from 'services/sites.services';
import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { useCustomAddressHook } from 'src/app/components/hooks/customAddressHook';
import { getFranchiseIdWithRoleAndSource } from 'src/app/obx/pages/schedules/helper';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg';
import { getGeoLocation } from 'src/services/franchise.services';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import EmergencyContactsComponent from '../../../../components/common/emergencyContacts/index.jsx';
import MapComponent from '../../../../components/common/geoFencing/index';
import * as routes from '../../../../router/constant/ROUTE';
import { HO_SITES_DETAIL_ROUTE } from '../../../../router/constant/ROUTE';
import history from '../../../../router/utils/history';
import { useStyles } from './update';

const userFormData = {
  siteArea: [
    [
      { lat: 31.5048493, lng: 74.3238862 },
      { lat: 31.504851, lng: 74.3338862 },
      { lat: 31.514851, lng: 74.3538862 },
    ],
  ],
  name: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  country: 'US',
  address: '',
  address2: '',
  localWorked: '',
  state: 'Utah',
  city: 'San Fransisco',
  zipCode: '',
  countryCode: '',
  primaryEmail: '',
  officerRate: '',
  contacts: [
    {
      name: '',
      contact: '',
      email: '',
      isEmergencyContact: false,
      role: '',
    },
  ],
  image: [],
  dailySiteSummaryReceivers: [],
  incidentReportReceivers: [],
  isBreakPayable: false,
};

const typesWithMultiComplete = ['dailySiteSummaryReceivers', 'incidentReportReceivers'];
const Update = () => {
  const { t } = useTranslation();
  const { id: siteId } = useParams();
  const classes = useStyles();
  const contactRef = useRef(null);
  const location = useLocation();
  const [errorMessages, setErrorMessages] = useState({});
  const [profileImage, setImage] = useState([]);
  const [formData, setFormData] = useState(userFormData);
  const [franchiseData, setFranchiseData] = useState({});
  const [siblings, setSiblings] = useState([]);
  const [parent, setParent] = useState({});
  const [disabled, setDisabled] = useState(true);
  const [additionalData, setAdditionalData] = useState(userFormData);

  const searchParams = new URLSearchParams(location.search);

  const franchiseIdWithRoleAndSource = getFranchiseIdWithRoleAndSource();

  const franchiseTimeZoneFromUrl = searchParams.get(timeZoneKeyUrlQueryParam);

  const hookDisabled = { city: true, state: true, country: true };
  const { CityHookComponent, StateHookComponent, CountrySelectHookComponent } =
    useCustomAddressHook({
      formData,
      setFormData,
      errorMessages,
      setErrorMessages,
      hookDisabled,
    });
  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
      if (typesWithMultiComplete.includes(name)) {
        const filteredErrorMessages = Object.fromEntries(
          Object.entries(errorMessages).filter(([key]) => !key.includes(name)),
        );
        setErrorMessages(filteredErrorMessages);
      }
    }

    updateFormHandler(name, value);
  };

  const updateFormHandler = useCallback(
    (name, value) => {
      // Remove any extra decimal points beyond two
      let processedValue = value;
      if (typeof value !== 'object' && name === 'officerRate') {
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

  const getGeoLocationInfo = async () => {
    try {
      return await getGeoLocation({ entity: 'site', endpoint: 'update', id: siteId });
    } catch (e) {
      console.log({ e });
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const getSiteInfo = async () => {
    try {
      let data = await getSiteDetails(siteId);

      setAdditionalData(data?.data?.site);
      // ? NOTE: if the variable "zoneArea, supervisor" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      let { zoneArea, supervisor, ...pluckedData } = data?.data?.site ?? {};
      return pluckedData;
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      console.log({ siblings });
      setTimeout(() => {
        history.goBack();
      }, 1000);
    }
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // if (formData?.image?.length + profileImage?.length === 0) {
    //   setErrorMessages((prev) => ({
    //     ...prev,
    //     image: t('errors.emptyImage', {
    //       label: 'Image',
    //     }),
    //   }));
    //   scrollToInValidField();
    //   return;
    // }
    let data = JSON.parse(JSON.stringify(formData));

    // ? NOTE: if the variable "image" is not getting used add _ before it or this rule will suffice the need here.
    // eslint-disable-next-line no-unused-vars
    const { image, ...rest } = data;
    data = rest;
    let dataTovalidate = {
      contacts: formData?.contacts,
      firstName: formData?.firstName,
      lastName: formData?.lastName,
      primaryEmail: formData?.primaryEmail,
      email: formData?.email,
      phoneNumber: formData?.phoneNumber,
      siteArea: formData?.siteArea,
      officerRate: formData?.officerRate,
      localWorked: formData?.localWorked,
      dailySiteSummaryReceivers: formData?.dailySiteSummaryReceivers || [],
      incidentReportReceivers: formData?.incidentReportReceivers || [],
      isBreakPayable: formData.isBreakPayable || false,
    };

    if (!dataTovalidate.email) {
      delete dataTovalidate.email;
    }

    const errors = await formValidatorJoi(dataTovalidate, t);
    console.log({ errors });
    if ((errors && Object.keys(errors).length) || errorMessages?.siteArea) {
      setErrorMessages((prev) => ({ ...prev, ...errors, ...errorMessages }));
      scrollToInValidField();
      return;
    }
    setDisabled(true);
    let finalData = new FormData();
    finalData.append('images', JSON.stringify(formData?.image));
    for (let x = 0; profileImage?.length > x; x++) {
      finalData.append('newImages[]', profileImage[x]);
    }
    for (const [key, value] of Object.entries(data)) {
      let item = value;
      if (typeof item === 'object' && item !== null) {
        item = JSON.stringify(item);
      }
      if (!item) {
        item = '';
      }
      finalData.append(key, item);
    }

    try {
      const response = await updateSite(siteId, finalData);
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setDisabled(false);
        handleBack();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDisabled(false);
    }
  };
  useEffect(() => {
    if (siteId) {
      Promise.all([getSiteInfo(), getGeoLocationInfo()])
        .then((data) => {
          const { siblings, franchiseArea } = findParentAndSiblingsPolygon(
            siteId,
            data[1],
            actionItemTypeKeys.site,
          );
          setFranchiseData(franchiseArea);
          setParent(franchiseArea?.franchises?.[0]);
          setSiblings(siblings);
          let formDetails = mapLocationInfo(data?.[0]);
          setFormData(formDetails);
          setDisabled(false);
        })
        .catch((e) => {
          console.log(siblings);

          toaster.error({
            text: t('errors.somethingWentWrong'),
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          console.error(e);
          setDisabled(false);
        });
    }
  }, []);

  const showMap = !!additionalData?.zone || parent;
  useEffect(() => {
    const isQueryParamPresent = (param) => {
      return new URLSearchParams(location.search).has(param);
    };

    if (isQueryParamPresent('scrollToContacts') && !disabled) {
      contactRef.current.scrollIntoView({ behavior: 'smooth', inline: 'nearest' });
    }
  }, [location.search, parent, showMap]);

  const handleBack = () => {
    /**
     * if user is HO and Url contains franchiseId and timezone
     * then direct the back and cancel to HO site detail
     * */
    if (
      franchiseIdWithRoleAndSource?.role === rolesEnum.homeOfficer &&
      franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam]
    ) {
      const sitePath = HO_SITES_DETAIL_ROUTE.replace(':id', siteId);
      const queryParams = new URLSearchParams({
        [franchiseIdUrlQueryParam]: franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam],
        [timeZoneKeyUrlQueryParam]: franchiseTimeZoneFromUrl,
      }).toString();
      history.push(`${sitePath}?${queryParams}`);
    } else {
      history.push(`${routes.OBX_SITES_DETAIL}/${siteId}`);
    }
  };

  return (
    <Box className={classes.updateSites}>
      {disabled && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      {
        <Box
          component="form"
          onSubmit={handleFormSubmit}
          className={classes.mainBoxForm}
          noValidate
          autoComplete="off"
        >
          <Box className={classes.btnBox}>
            <Button variant="tertiaryGrey" onClick={handleBack} startIcon={<ArrowBackIcon />}>
              {t('obx.buttons.back')}
            </Button>

            <Box className={classes.buttonGroup}>
              <Button variant="secondaryGrey" onClick={handleBack}>
                {t('obx.buttons.cancel')}
              </Button>
              <Button disabled={disabled || !!!showMap} variant="primary" type="submit">
                {t('obx.buttons.save')}
              </Button>
            </Box>
          </Box>
          <>
            {!showMap && (
              <Stack sx={{ width: '100%', marginTop: '6px' }} spacing={2}>
                <Alert severity="error">
                  {t('obx.sites.siteInformation.zoneRequire').slice(0, -1)}
                </Alert>
              </Stack>
            )}
            <Box className={classes.sitesFieldsWrapper}>
              <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
                {t('form.input.textField.site.sites')} {t('form.input.textField.owner.info')}
              </Typography>
              <Box className={classes.formBox}>
                <Box className={classes.flexControl}>
                  <InputLabel>
                    {`${t('form.input.textField.site.sites')} ${t('form.input.textField.site.name')}`}
                    <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    error={!!errorMessages?.name}
                    id="outlined-search"
                    onChange={inputChangedHandler}
                    name="name"
                    placeholder={t('form.input.textField.site.placeHolderSites')}
                    variant="outlined"
                    disabled={true}
                    value={formData?.name}
                    fullWidth
                    type="text"
                    helperText={!!errorMessages?.name ? errorMessages?.name : null}
                  />
                </Box>

                <Box className={classes.flexControl}>
                  <InputLabel className={classes.inputLabel}>
                    {t('obx.form.input.textField.primaryEmail.label')}
                    <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    error={!!errorMessages?.primaryEmail}
                    id="outlined-start-adornment"
                    className={classes.customInputMessage}
                    disabled={false}
                    type="email"
                    name="primaryEmail"
                    onChange={inputChangedHandler}
                    value={formData?.primaryEmail}
                    placeholder={t('obx.form.input.textField.primaryEmail.placeHolder')}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                    helperText={!!errorMessages?.primaryEmail ? errorMessages?.primaryEmail : null}
                  />
                </Box>
              </Box>
              <Box className={classes.formBox}>
                <Box className={classes.flexControl}>
                  <InputLabel>
                    {`${t('form.input.textField.site.clients')} ${t(
                      'form.input.textField.firstName.label',
                    )}`}
                    <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    id="outlined-search"
                    error={!!errorMessages?.firstName}
                    variant="outlined"
                    name="firstName"
                    onChange={inputChangedHandler}
                    placeholder={t('form.input.textField.site.placeHolderClients')}
                    value={`${formData?.firstName || ''}`}
                    fullWidth
                    type="search"
                    helperText={!!errorMessages?.firstName ? errorMessages?.firstName : null}
                  />
                </Box>
                <Box className={classes.flexControl}>
                  <InputLabel>
                    {`${t('form.input.textField.site.clients')} ${t(
                      'obx.sites.siteInformation.lastName',
                    )}`}
                    <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    id="outlined-search"
                    error={!!errorMessages?.lastName}
                    variant="outlined"
                    name="lastName"
                    onChange={inputChangedHandler}
                    placeholder={t('obx.sites.siteInformation.lastName')}
                    value={`${formData?.lastName || ''}`}
                    fullWidth
                    type="search"
                    helperText={!!errorMessages?.lastName ? errorMessages?.lastName : null}
                  />
                </Box>
              </Box>
              <Box className={classes.formBox}>
                <Box className={classes.flexControl}>
                  <InputLabel className={classes.inputLabel}>
                    {`${t('form.input.textField.site.secondaryEmail')}`}
                    <Tooltip
                      placement="right"
                      arrow
                      title={t('obx.sites.tooltips.secondaryContactEmailTooltip')}
                    >
                      <CautionIcon />
                    </Tooltip>
                  </InputLabel>
                  <TextField
                    error={!!errorMessages?.email}
                    id="outlined-start-adornment"
                    className={classes.customInputMessage}
                    type="email"
                    name="email"
                    onChange={inputChangedHandler}
                    value={formData?.email}
                    placeholder={t('form.input.textField.email.placeHolder')}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                    helperText={!!errorMessages?.email ? errorMessages?.email : null}
                  />
                </Box>

                <Box className={classes.flexControl}>
                  <InputLabel>
                    {`${t('form.input.textField.site.clients')} ${t(
                      'form.input.textField.phoneNumber.label',
                    )} 
              `}
                    <RequiredAsterik />
                    <Tooltip
                      placement="right"
                      arrow
                      title={t('obx.sites.tooltips.clientPhoneNoTooltip')}
                    >
                      <CautionIcon />
                    </Tooltip>
                  </InputLabel>
                  <TextField
                    error={!!errorMessages?.phoneNumber}
                    id="outlined-start-adornment"
                    placeholder={t('form.input.textField.phoneNumber.placeHolder')}
                    name="phoneNumber"
                    className={classes.customInputPhone}
                    onChange={inputChangedHandler}
                    value={formData?.phoneNumber}
                    variant="outlined"
                    fullWidth
                    helperText={!!errorMessages?.phoneNumber ? errorMessages?.phoneNumber : null}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
              <Box className={classes.formBox}>
                <Box className={classes.flexControl}>
                  <InputLabel className={classes.inputLabel}>
                    {t('form.input.textField.site.localWorked')}
                  </InputLabel>
                  <TextField
                    error={!!errorMessages?.localWorked}
                    id="outlined-start-adornment"
                    className={classes.customInputMessage}
                    disabled={false}
                    type="text"
                    name="localWorked"
                    onChange={inputChangedHandler}
                    value={formData?.localWorked || ''}
                    placeholder={t('form.input.textField.site.localWorked')}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">{/* <EmailIcon /> */}</InputAdornment>
                      ),
                    }}
                    helperText={!!errorMessages?.localWorked ? errorMessages?.localWorked : null}
                  />
                </Box>

                <Box className={classes.flexControl}>
                  <InputLabel className={classes.inputLabel}>
                    {t('form.input.textField.site.siteRate')}
                    <Tooltip
                      placement="right"
                      arrow
                      title={t('obx.sites.tooltips.siteRateTooltip')}
                    >
                      <CautionIcon />
                    </Tooltip>
                  </InputLabel>
                  <TextField
                    error={!!errorMessages?.officerRate}
                    id="outlined-start-adornment"
                    className={classes.customInputMessage}
                    disabled={false}
                    type="number"
                    name="officerRate"
                    onKeyDown={preventNegativeValues}
                    onChange={inputChangedHandler}
                    value={formData?.officerRate || ''}
                    placeholder="0"
                    variant="outlined"
                    fullWidth
                    helperText={!!errorMessages?.officerRate ? errorMessages?.officerRate : null}
                  />
                </Box>
              </Box>

              <Box className={classes.formBox}>
                <Box className={classes.sitesContactCheckbox}>
                  <Checkbox
                    id="mark-emergency-contact"
                    onChange={(e) => {
                      updateFormHandler('isBreakPayable', e.target.checked);
                    }}
                    name="isBreakPayable"
                    icon={<CheckBoxRegularIcon />}
                    checked={formData.isBreakPayable}
                    checkedIcon={<CheckBoxCheckedIcon />}
                    className={classes.checkBoxCustom}
                  />
                  <InputLabel htmlFor="mark-emergency-contact">
                    {t('obx.form.input.textField.billableHours.label')}
                  </InputLabel>
                </Box>
              </Box>

              {/** Profile Image */}
              {formData?.image && Array.isArray(formData?.image) && (
                <ProfileImageUpload
                  formData={formData}
                  formImageKey="image"
                  multiple={true}
                  updateFormHandler={updateFormHandler}
                  errorMessages={errorMessages}
                  setErrorMessages={setErrorMessages}
                  image={profileImage}
                  setImage={setImage}
                />
              )}
            </Box>
          </>
          <Box className={classes.sitesFieldsWrapper}>
            <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
              {t('form.input.textField.country.header')}
            </Typography>
            <Box className={classes.formBox}>
              <Box className={classes.flexControl}>
                <InputLabel>
                  {`${t('form.input.textField.country.label')}`} <RequiredAsterik />
                </InputLabel>
                <CountrySelectHookComponent />
              </Box>
              <Box className={classes.flexControl}>
                <InputLabel>
                  {`${t('form.input.textField.address.label')}`}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  error={!!errorMessages?.address}
                  id="outlined-search"
                  onChange={inputChangedHandler}
                  disabled={true}
                  name="address"
                  placeholder={t('form.input.textField.address.placeHolder')}
                  variant="outlined"
                  value={formData?.address || ''}
                  fullWidth
                  type="text"
                  helperText={!!errorMessages?.address ? errorMessages?.address : null}
                />
              </Box>
            </Box>
            <Box className={classes.formBox}>
              <Box className={classes.flexControl}>
                <InputLabel>{`${t('form.input.textField.address2.label')}`}</InputLabel>
                <TextField
                  error={!!errorMessages?.address2}
                  id="outlined-search"
                  onChange={inputChangedHandler}
                  name="address2"
                  disabled={true}
                  value={formData?.address2 || ''}
                  placeholder={t('form.input.textField.address2.placeHolder')}
                  variant="outlined"
                  fullWidth
                  type="text"
                  helperText={!!errorMessages?.address2 ? errorMessages?.address2 : null}
                />
              </Box>
              <Box className={classes.flexControl}>
                <InputLabel>
                  {`${t('form.input.textField.state.label')}`} <RequiredAsterik />
                </InputLabel>
                <StateHookComponent />
              </Box>
            </Box>
            <Box className={classNames(classes.formBox, classes.formBoxLast)}>
              <Box className={classes.flexControl}>
                <InputLabel>
                  {`${t('form.input.textField.city.label')}`} <RequiredAsterik />
                </InputLabel>
                <CityHookComponent />
              </Box>
              <Box className={classes.flexControl}>
                <InputLabel>{`${t('form.input.textField.zipCode.label')}`}</InputLabel>
                <TextField
                  error={!!errorMessages?.zipCode}
                  id="outlined-search"
                  disabled={true}
                  onChange={inputChangedHandler}
                  name="zipCode"
                  placeholder={t('form.input.textField.zipCode.placeHolder')}
                  variant="outlined"
                  value={formData?.zipCode}
                  fullWidth
                  type="text"
                  helperText={!!errorMessages?.zipCode ? errorMessages?.zipCode : null}
                />
              </Box>
            </Box>
          </Box>
          <Box className={classes.sitesFieldsWrapper}>
            <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
              {t('form.input.textField.reportsDistribution.header')}
            </Typography>
            <Box className={classes.formBox}>
              <Box className={classes.flexControl}>
                <InputLabel>{`${t('form.input.textField.dailySiteSummaryReceivers.label')}`}</InputLabel>
                <AutoCompleteCommon
                  handleChange={inputChangedHandler}
                  name="dailySiteSummaryReceivers"
                  value={formData?.dailySiteSummaryReceivers}
                  placeholder={t('form.input.textField.dailySiteSummaryReceivers.placeHolder')}
                  errorMessages={errorMessages}
                  errorMessage={t('errors.string.email', {
                    '#label': 'Email',
                  })}
                />
              </Box>
            </Box>
            <Box className={classes.formBox}>
              <Box className={classes.flexControl}>
                <InputLabel>{`${t('form.input.textField.incidentReportReceivers.label')}`}</InputLabel>
                <AutoCompleteCommon
                  handleChange={inputChangedHandler}
                  name="incidentReportReceivers"
                  value={formData?.incidentReportReceivers}
                  placeholder={t('form.input.textField.incidentReportReceivers.placeHolder')}
                  errorMessages={errorMessages}
                  errorMessage={t('errors.string.email', {
                    '#label': 'Email',
                  })}
                />
              </Box>
            </Box>
          </Box>
          <Box className={classes.sitesFieldsWrapper}>
            <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
              {t('obx.form.input.textField.additionalContacts.header')}
            </Typography>

            <Box className={classes.sitesDynamicContent} ref={contactRef}>
              <EmergencyContactsComponent
                errorMessages={errorMessages}
                formDataKey="contacts"
                formData={formData}
                updateFormHandler={updateFormHandler}
                setErrorMessages={setErrorMessages}
                role={true}
              />
            </Box>

            {/* <Box ref={contactRef}>
              <DynamicFormComponent
                errorMessages={errorMessages}
                formDataKey="emergencyContacts"
                formData={formData}
                updateFormHandler={updateFormHandler}
                setErrorMessages={setErrorMessages}
                onlyPhone={false}
              />
            </Box> */}
          </Box>

          {/* <DynammicLocationFields
              formData={formData?.locations}
              errorMessages={errorMessages}
              updateFormHandler={updateFormHandler}
              formDataKey={'locations'}
              setErrorMessages={setErrorMessages}
            />
          */}

          <>
            {parent?.coordinates &&
              parent?.coordinates?.length > 0 &&
              !isObjectEmpty(formData?.siteLocation) &&
              showMap && (
                <MapComponent
                  siblings={[]}
                  errorMessages={errorMessages}
                  setErrorMessages={setErrorMessages}
                  parentBoundry={parent}
                  updateFormHandler={updateFormHandler}
                  createOrUpdate={true}
                  mapCenter={formData?.siteLocation}
                  franchiseData={franchiseData || []}
                  formDataKey={geoFencingPolygonTypeKeys.sites}
                  actionItem={formData || {}}
                  actionItemType={actionItemTypeKeys?.site}
                />
              )}
          </>

          <Box className={classes.buttonGroupLast}>
            <Button variant="secondaryGrey" onClick={handleBack}>
              {t('obx.buttons.cancel')}
            </Button>
            <Button disabled={disabled || !!!showMap} variant="primary" type="submit">
              {t('obx.buttons.save')}
            </Button>
          </Box>
        </Box>
      }
    </Box>
  );
};

export default Update;
