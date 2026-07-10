import { Button, InputLabel, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { useJsApiLoader } from '@react-google-maps/api';
import classNames from 'classnames';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import GoogleMapViewComponent from 'src/app/components/common/googleMap/googleMapView';
import GoogleMapSearchAddressComponent from 'src/app/components/common/googleMap/searchAddress';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { Clossicon } from 'src/assets/svg';
import { mainDomain, removeKeysFromObject } from 'src/helper/utilityFunctions';
import { createCompany, getIndustryTypes, updateCompany } from 'src/services/company.service';
import { getDealOwnerOptions } from 'src/services/deal.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { rolesEnum, toastSettings } from 'src/utils/constants';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';
import { checkAndAddDot } from 'src/utils/string/addDotInEnd';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import { companyPartnershipStatusOptions } from './company.constant';
import { useStyles } from './createNewCompany';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: '796px',
  bgcolor: 'background.paper',
  padding: '24px 24px',
  boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
  borderRadius: '12px',
};

const emptyState = {
  companyName: null,
  companyDomain: null,
  companyIndustry: {},
  // companyOwner: {},
  numberOfEmployees: null,
  revenue: null,
  googleAddress: {},
  spStatuses: {},
  subVertical: null,
  naicsCodes: null,
  numberOfLocations: null,
  foundedYear: null,
};

const defaultCenter = { lat: 41.216362, lng: -96.13607 };
const libraries = ['places', 'drawing', 'geometry'];

const CreateNewCompanyModal = ({
  company,
  openHandle,
  closeHandle,
  fetchCompanies = () => {},
  onCompanyCreated = () => {},
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const tenant = MULTI_TENANT_AUTH[mainDomain()];

  const userRole = useSelector((state) => state.auth.userRole);

  const [address, setAddress] = useState('');
  const [formData, setFormData] = useState(emptyState);
  const [activeMarker, setActiveMarker] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [errorMessages, setErrorMessages] = useState({});
  const [selectedLocation, setSelectedLocation] = useState({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [options, setOptions] = useState({
    dealOwners: [],
    industries: [],
  });
  const [isChanged, setIsChanged] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const handleFormSubmit = async (e) => {
    e.persist();
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      // Remove specified keys from formData
      let tempValidate = removeKeysFromObject(formData, [
        'numberOfEmployees',
        'revenue',
        !formData?.companyDomain && 'companyDomain',
      ]);
      /**
       * validate number of employees is greater than 0 if exist
       * number of employees is optional but it will check if it exist in the form
       */
      if (formData?.numberOfEmployees) {
        tempValidate = {
          ...tempValidate,
          numberOfEmployees: parseInt(formData?.numberOfEmployees),
        };
      }

      /**
       * validate revenue is greater than 0 if exist
       * revenue is optional but it will check if it exist
       */
      if (formData?.revenue) {
        tempValidate = { ...tempValidate, revenue: parseInt(formData?.revenue) };
      }

      const errors = await formValidatorJoi(tempValidate, t);
      console.log('errors', errors);
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }
      const payload = {
        name: formData?.companyName,
        domain: formData?.companyDomain,
        industry: formData?.companyIndustry?.value,
        numberOfEmployees: formData?.numberOfEmployees,
        revenue: formData?.revenue,
        address: formData?.googleAddress?.name,
        coordinates: formData?.googleAddress?.position,
        placeId: formData?.googleAddress?.id,
        strategicPartnershipStatus: formData?.strategicPartnershipStatus?.value,
      };

      if (company?.id) {
        payload.subVertical = formData?.subVertical;
        payload.naicsCodes = formData?.naicsCodes;
        payload.numberOfLocations = formData?.numberOfLocations;
        payload.foundedYear = formData?.foundedYear;
      }

      try {
        const response = company?.id
          ? await updateCompany(company?.id, payload)
          : await createCompany(payload);
        if (response?.statusCode === 200) {
          const message =
            company?.id && userRole.slug !== rolesEnum.homeOfficer
              ? response.message
              : buildResponseMessage(response.message, company?.id);
          toast.success(message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          fetchCompanies();
          onCompanyCreated(response.data?.company);
          closeHandle();
        }
      } catch (error) {
        /**
         * show error
         */
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const buildResponseMessage = (message, id) => {
    return id ? `${id} ${message}` : message;
  };

  /**
   * common function to update data to formDat object
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

  const updateMapValue = (name, value) => {
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      const { [name]: _key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    updateFormHandler(name, value);
  };

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    setIsChanged(true);
    updateFormHandler(name, value);
  };

  /**
   * Fetch deal owners
   */
  const fetchDealOwners = async () => {
    try {
      const response = await getDealOwnerOptions();
      if (response?.statusCode === 200) {
        setOptions((prevOptions) => ({
          ...prevOptions,
          dealOwners: response?.data?.owners,
        }));
      }
    } catch (error) {
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  /**
   * fetch industry verticals
   */
  const fetchIndustryVerticalOptions = async () => {
    try {
      const response = await getIndustryTypes();
      if (response?.statusCode === 200) {
        const verticals = response?.data?.industryVerticals || {};
        const tempIndustryVerticals = Object.keys(verticals)
          .map((key) => ({
            name: verticals[key],
            id: key,
          }))
          // Sort the industry verticals based on label to show industries in alphabetic order
          .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));

        setOptions((prevOptions) => ({
          ...prevOptions,
          industries: tempIndustryVerticals,
        }));
      }
    } catch (error) {
      //error handelr
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    fetchIndustryVerticalOptions();
    fetchDealOwners();
  }, []);

  useEffect(() => {
    if (company) {
      const location = {
        id: company?.placeId,
        name: company.fullAddress,
        position: {
          lat: Number(company.latitude),
          lng: Number(company.longitude),
        },
      };
      setFormData((prev) => ({
        ...prev,
        companyName: company.name,
        companyDomain: company.companyDomain,
        numberOfEmployees: company.numberOfEmployees,
        revenue: company.revenue,
        subVertical: company.subVertical,
        naicsCodes: company?.naicsCodes,
        numberOfLocations: company?.numberOfLocations,
        foundedYear: company?.foundedYear,
        strategicPartnershipStatus:
          companyPartnershipStatusOptions(t).find(
            (opt) => opt.value === company?.strategicPartnershipStatus,
          ) || null,
        googleAddress: company.fullAddress ? location : {},
      }));
      setAddress(company.fullAddress || '');
      setSelectedLocation({ ...location });
      setCenter(location?.position || defaultCenter);
    }
  }, [company]);

  useEffect(() => {
    if (!options.industries.length || !company?.industry) return;
    setFormData((prev) => ({
      ...prev,
      companyIndustry: {
        label: company.industry.label || '',
        value: company.industry.value ?? null,
      },
    }));
  }, [options.industries, company]);

  return (
    <>
      <Modal
        open={openHandle}
        onClose={closeHandle}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          className={classes.converModal}
          sx={style}
          component="form"
          onSubmit={handleFormSubmit}
        >
          {isSubmittingForm && <LoaderComponent label={t('sales.loading')} />}
          <Box className={classes.boxHeader}>
            <Box className={classes.titlehead}>
              <Typography variant="h4" className={classes.sidetitle}>
                {company?.id
                  ? t('sales.locations.EditCompanyHeading')
                  : t('sales.locations.CreateCompanyHeading')}
              </Typography>
              <a className={classes.cbtn} href="#" onClick={closeHandle}>
                <Clossicon />
              </a>
            </Box>
            <Typography variant="body2" className={classes.bulkSubHeading}>
              {company?.id
                ? t('sales.locations.editCompanyDescription')
                : t('sales.locations.createNewCompanyTitle')}
            </Typography>
          </Box>

          <Box className={classNames(classes.converInner, 'innerScrollBar')}>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="CompanyDomain">
                  {`${t('sales.locations.companyDomain')}
              `}
                  {/* <RequiredAsterik /> */}
                </InputLabel>
                <TextField
                  name="companyDomain"
                  id="companyDomain"
                  fullWidth
                  placeholder={t('sales.locations.addCompanyDomain', {
                    companyName: tenant?.name,
                  })}
                  error={!!errorMessages?.companyDomain}
                  onChange={inputChangedHandler}
                  value={formData?.companyDomain || ''}
                  helperText={
                    errorMessages?.companyDomain && checkAndAddDot(errorMessages?.companyDomain)
                  }
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="CompanyDomain">
                  {`${t('sales.locations.companyName')}
              `}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  name="companyName"
                  id="companyName"
                  fullWidth
                  placeholder={t('sales.locations.addCompanyName')}
                  error={!!errorMessages?.companyName}
                  onChange={inputChangedHandler}
                  value={formData?.companyName || ''}
                  helperText={errorMessages?.companyName}
                />
              </Box>
            </Box>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel className={classes.blueLabel} htmlFor="industry">
                  {`${t('sales.locations.industry')}
              `}
                  <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  name="companyIndustry"
                  id="companyIndustry"
                  placeHolder={t('sales.locations.selectIndustry')}
                  placeHolderClassName={classes?.placeHolderColor}
                  options={transformArrayForOptions(options.industries, 'name', 'id') || []}
                  label={formData?.dealOwner?.description}
                  selectedValues={formData?.companyIndustry || {}}
                  handleChange={inputChangedHandler}
                  className={classes.dropHigh}
                  bordered
                  searchable
                  isError={errorMessages?.companyIndustry}
                />
                <span className="errorMessage">{errorMessages?.companyIndustry}</span>
              </Box>
              {userRole?.slug === rolesEnum.homeOfficer && (
                <Box className={classes.fieldWrapper}>
                  <InputLabel className={classes.blueLabel} htmlFor="spStatus">
                    {`${t('sales.companies.strategicPartnership')}
                `}
                  </InputLabel>
                  <CustomDropDown
                    name="strategicPartnershipStatus"
                    id="strategicPartnershipStatus"
                    placeHolder={t('sales.companies.selectStrategicPartnership')}
                    placeHolderClassName={classes?.placeHolderColor}
                    options={companyPartnershipStatusOptions(t) || []}
                    label={t('sales.companies.selectStrategicPartnership')}
                    selectedValues={formData?.strategicPartnershipStatus || {}}
                    handleChange={inputChangedHandler}
                    className={classes.dropHigh}
                    bordered
                  />
                </Box>
              )}
              {/* <Box className={classes.fieldWrapper}>
                <InputLabel className={classes.blueLabel} htmlFor="owner">
                  {`${t('sales.locations.owner')}
              `}
                  <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  name="companyOwner"
                  id="companyOwner"
                  placeHolder={t('sales.locations.selectOwner')}
                  placeHolderClassName={classes?.placeHolderColor}
                  options={
                    transformArrayForOptions(options.dealOwners, 'name', 'id', 'email') || []
                  }
                  label={formData?.dealOwner?.description}
                  selectedValues={formData?.companyOwner || {}}
                  handleChange={inputChangedHandler}
                  className={classes.dropHigh}
                  bordered
                  searchable
                  isError={errorMessages?.companyOwner}
                />
                <span className="errorMessage">{errorMessages?.companyOwner}</span>
              </Box> */}
            </Box>
            {company?.id && (
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel className={classes.blueLabel} htmlFor="subVertical">
                    {`${t('sales.companies.subMarketVertical')}
              `}
                  </InputLabel>
                  <TextField
                    name="subVertical"
                    id="subVertical"
                    type="text"
                    fullWidth
                    placeholder={t('sales.companies.subMarketVertical')}
                    error={!!errorMessages?.subVertical}
                    onChange={inputChangedHandler}
                    value={formData?.subVertical}
                    placeHolderClassName={classes.placeHolderSize}
                    helperText={errorMessages?.subVertical}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="naicsCodes">{`${t('sales.companies.naicsCodes')}`}</InputLabel>
                  <TextField
                    name="naicsCodes"
                    id="naicsCodes"
                    type="number"
                    fullWidth
                    placeholder={t('sales.companies.naicsCodes')}
                    error={!!errorMessages?.naicsCodes}
                    onChange={inputChangedHandler}
                    value={formData?.naicsCodes}
                    helperText={errorMessages?.naicsCodes}
                  />
                </Box>
              </Box>
            )}

            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel className={classes.blueLabel} htmlFor="noOfEmployees">
                  {`${t('sales.locations.noOfEmployees')}
              `}
                </InputLabel>
                <TextField
                  name="numberOfEmployees"
                  id="numberOfEmployees"
                  type="number"
                  fullWidth
                  placeholder={t('sales.locations.addNoOfEmployees')}
                  error={!!errorMessages?.numberOfEmployees}
                  onChange={inputChangedHandler}
                  value={formData?.numberOfEmployees}
                  placeHolderClassName={classes.placeHolderSize}
                  helperText={errorMessages?.numberOfEmployees}
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="revenue">{`${t('sales.locations.revenue')}`}</InputLabel>
                <TextField
                  name="revenue"
                  id="revenue"
                  type="number"
                  fullWidth
                  placeholder={t('sales.locations.addRevenue')}
                  error={!!errorMessages?.revenue}
                  onChange={inputChangedHandler}
                  value={formData?.revenue}
                  helperText={errorMessages?.revenue}
                />
              </Box>
            </Box>

            {company?.id && (
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel className={classes.blueLabel} htmlFor="numberOfLocations">
                    {`${t('sales.companies.noOfLocations')}
              `}
                  </InputLabel>
                  <TextField
                    name="numberOfLocations"
                    id="numberOfLocations"
                    type="number"
                    fullWidth
                    placeholder={t('sales.companies.noOfLocations')}
                    error={!!errorMessages?.numberOfLocations}
                    onChange={inputChangedHandler}
                    value={formData?.numberOfLocations}
                    placeHolderClassName={classes.placeHolderSize}
                    helperText={errorMessages?.numberOfLocations}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="foundedYear">{`${t('sales.companies.yearFounded')}`}</InputLabel>
                  <TextField
                    name="foundedYear"
                    id="foundedYear"
                    type="number"
                    fullWidth
                    placeholder={t('sales.companies.yearFounded')}
                    error={!!errorMessages?.foundedYear}
                    onChange={inputChangedHandler}
                    value={formData?.foundedYear}
                    helperText={errorMessages?.foundedYear}
                  />
                </Box>
              </Box>
            )}

            <Box className={classes.marginBottomCol}>
              {isLoaded && (
                <GoogleMapSearchAddressComponent
                  isLoaded={isLoaded}
                  updateMapValue={updateMapValue}
                  errorMessages={errorMessages}
                  formKey="googleAddress"
                  setAddress={setAddress}
                  address={address}
                  setActiveMarker={setActiveMarker}
                  setSelectedLocation={setSelectedLocation}
                  setCenter={setCenter}
                />
              )}
              {isLoaded && (
                <GoogleMapViewComponent
                  isLoaded={isLoaded}
                  updateMapValue={updateMapValue}
                  formKey="googleAddress"
                  setAddress={setAddress}
                  setActiveMarker={setActiveMarker}
                  activeMarker={activeMarker}
                  setSelectedLocation={setSelectedLocation}
                  selectedLocation={selectedLocation}
                  setCenter={setCenter}
                  center={center}
                  mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '10px' }}
                />
              )}
            </Box>
          </Box>
          <Box className={classes.sidefooter}>
            <Box className={classes.footerButtons}>
              <Button
                variant="secondaryGrey"
                className={classNames(classes.blessbtn, classes.btn)}
                onClick={closeHandle}
              >
                {t('sales.locations.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                className={classNames(classes.bluebtn, classes.btn)}
                disabled={isSubmittingForm || !isChanged}
              >
                {company?.id
                  ? t('sales.locations.updateCompany')
                  : t('sales.locations.createCompany')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

CreateNewCompanyModal.propTypes = {
  company: PropTypes.object,
  openHandle: PropTypes.func,
  closeHandle: PropTypes.func,
  fetchCompanies: PropTypes.func,
  onCompanyCreated: PropTypes.func,
};

export default CreateNewCompanyModal;
