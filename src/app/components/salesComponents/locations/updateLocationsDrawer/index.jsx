import { Divider, InputLabel, Stack, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import classNames from 'classnames';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { franchiseStatusEnum } from 'src/app/homeOffice/pages/franchise/utils/enums';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import {
  getFranchisesOptions,
  getLocationSources,
  updateLocation,
} from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { rolesEnum, toastSettings } from 'src/utils/constants';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import ContactDropDown from '../../contacts/contactDropDown';
import { TENANCY_STATUS_OPTIONS } from '../newLocationsDrawer/location.constant';
import PropertyDropDown from '../propertyDropDown';
import { useStyles } from './updateLocationDrawer.js';

const UpdateLocationDrawer = ({
  anchor,
  locationCloseDrawer,
  width,
  location,
  onSuccess,
  refetch = () => {},
}) => {
  const userId = useSelector((state) => state.user.info?.id);
  const userRole = useSelector((state) => state.auth.userRole);

  const [formData, setFormData] = useState({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [franchises, setFranchises] = useState([]);
  const [isChanged, setIsChanged] = useState(false);
  const [locationSources, setLocationSources] = useState([]);

  const classes = useStyles();
  const { t } = useTranslation();

  const updateFormHandler = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (name === 'referredByProperty') {
      setErrorMessages({});
      updateFormHandler('referredByContact', {});
    }
    if (name === 'locationSource') {
      setErrorMessages({});
      // updateFormHandler('referredByProperty', {});
      // updateFormHandler('referredByContact', {});
      setFormData((prev) => ({
        ...prev,
        referredByProperty: {},
        referredByContact: {},
      }));
    }
    updateFormHandler(name, value);
    setIsChanged(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      const temPayload = { propertyName: formData.propertyName };
      if (formData?.locationSource?.value === 'referred') {
        temPayload.referredByProperty = formData?.referredByProperty || {};
      }
      if (!isObjectEmpty(temPayload?.referredByProperty)) {
        temPayload.referredByContact = formData?.referredByContact || {};
      }
      const errors = await formValidatorJoi(temPayload, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }

      const payload = {
        locationName: formData?.propertyName,
        locationSource: formData?.locationSource?.value,
        associatedFranchiseId: formData?.associatedFranchise?.id,
        leadStageId: formData?.leadStage?.id,
        numberOfUnits: formData.numberOfUnits,
        occupancyRate: formData?.occupancyRate,
        averageRent: formData?.averageRent,
        annualRevenue: formData?.annualRevenue,
        squareFootageOfBuilding: formData?.squareFootageOfBuilding,
        parkingSpaces: formData?.parkingSpaces,
        tenancy: formData?.tenancy?.value,
        amenities: formData?.amenities,
        numberOfBuildings: formData?.numberOfBuildings,
        buildingClass: formData?.buildingClass,
        referredByPropertyId: formData?.referredByProperty?.id,
        referredByContactId: formData?.referredByContact?.id,
      };

      const apiResponse = await updateLocation(location?.locationId, payload);

      if (apiResponse.statusCode === 200) {
        onSuccess();
        toast.success(apiResponse.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        locationCloseDrawer(anchor);
        refetch();
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const fetchFranchises = async () => {
    try {
      const response = await getFranchisesOptions();
      if (response?.statusCode === 200) {
        if (userRole?.slug === rolesEnum.franchiseOwner) {
          setFranchises(
            response?.data?.franchises.filter((f) => {
              const isFunctional = f?.status !== franchiseStatusEnum.nonFunctional;
              const matchesFranchiseId = userId ? f?.ownerId === userId : false;
              return isFunctional && matchesFranchiseId;
            }) || [],
          );
        } else {
          setFranchises(
            response?.data?.franchises?.filter((f) => {
              return f?.status !== franchiseStatusEnum.nonFunctional;
            }),
          );
        }
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchLocationSources = async () => {
    try {
      const response = await getLocationSources();
      if (response?.statusCode === 200) {
        const locationSourcesData = response?.data?.locationSources || [];
        const transformedLocationSources = transformArrayForOptions(
          locationSourcesData,
          'title',
          'value',
        );
        setLocationSources(transformedLocationSources || []);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    fetchFranchises();
    fetchLocationSources();
  }, []);

  useEffect(() => {
    const payload = {
      locationId: location?.locationId,
      propertyName: location?.locationName,
      locationSource: locationSources.find((option) => option.value === location?.source),
      tenancy: TENANCY_STATUS_OPTIONS.find((option) => option.value === location?.tenancy),
      numberOfUnits: location?.numberOfUnits,
      occupancyRate: location?.occupancyRate,
      averageRent: location?.averageRent,
      annualRevenue: location?.annualRevenue,
      squareFootageOfBuilding: location?.squareFootageOfBuilding,
      parkingSpaces: location?.parkingSpaces,
      amenities: location?.amenities,
      numberOfBuildings: location?.numberOfBuildings,
      buildingClass: location?.buildingClass,
    };
    if (location?.referredBy?.property?.id) {
      payload.referredByProperty = {
        id: location?.referredBy?.property?.id,
        value: location?.referredBy?.property?.id,
        label: location?.referredBy?.property?.name,
      };
    }
    if (location?.referredBy?.contact?.id) {
      payload.referredByContact = {
        id: location?.referredBy?.contact?.id,
        value: location?.referredBy?.contact?.id,
        label: location?.referredBy?.contact?.name,
      };
    }
    setFormData({ ...payload });
  }, [location]);

  useEffect(() => {
    const franchise = franchises?.find((franchise) => franchise.id === location?.franchiseId);
    // const leadStage = leadStages.find((option) => option.id === location?.leadStageId);
    const locationSource = locationSources.find((option) => option.value === location?.source);
    setFormData((prev) => ({
      ...prev,
      locationSource: {
        label: locationSource?.title,
        value: locationSource?.value,
        id: locationSource?.id || locationSource?.value,
      },
      associatedFranchise: { label: franchise?.name, value: franchise?.id, id: franchise?.id },
    }));
  }, [franchises]);

  const propertyFilter = useMemo(
    () => ({ locationId: formData?.locationId }),
    [formData?.locationId],
  );

  const contactFilter = useMemo(
    () => ({ locationId: formData?.referredByProperty?.id }),
    [formData.referredByProperty?.id],
  );

  return (
    <>
      {isSubmittingForm && <LoaderComponent label={t('sales.loading')} />}
      <Box
        className={classes.siderbarbox}
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
        role="presentation"
        component="form"
        onSubmit={handleFormSubmit}
      >
        <Stack className={classes.boxinner} justifyContent="space-between">
          <Box className={classes.sideheader}>
            <DrawerHeader
              title={t('sales.locations.editLocation')}
              subtext={t('sales.locations.editSubText')}
              handleCloseDrawer={locationCloseDrawer}
              anchor={anchor}
              className={classes.UpdateLocationDrawerHeader}
            />
          </Box>
          <Box className={classNames(classes.locationForm, 'innerScrollBar')}>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="propertyName">
                  {t('sales.locations.propertyName')}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  id="propertyName"
                  name="propertyName"
                  fullWidth
                  placeholder={t('sales.locations.propertyNamePlaceholder')}
                  error={!!errorMessages?.propertyName}
                  onChange={inputChangedHandler}
                  value={formData.propertyName}
                  className={classes.dropHigh}
                  placeHolderClassName={classes.placeHolderText}
                />
                <span className="errorMessage">{errorMessages?.propertyName}</span>
              </Box>
              <Box
                className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                component="div"
              >
                <InputLabel htmlFor="locationSource">
                  {t('sales.locations.locationSource')}
                  <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  id="locationSource"
                  name="locationSource"
                  label={t('sales.locations.locationSource')}
                  options={locationSources || []}
                  selectedValues={formData?.locationSource || {}}
                  handleChange={inputChangedHandler}
                  placeHolder={t('sales.locations.locationSourcePlaceholder')}
                  bordered
                  className={classes.dropHigh}
                  isError={errorMessages?.locationSource}
                  placeHolderClassName={classes.placeHolderText}
                />
                <span className="errorMessage">{errorMessages?.locationSource}</span>
              </Box>
            </Box>
            <Box className={`${classes.sideBySideCol}`}>
              <Box
                className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                component="div"
              >
                <InputLabel htmlFor="associatedFranchise">
                  {t('sales.locations.associatedFranchise')}
                </InputLabel>
                <CustomDropDown
                  name="associatedFranchise"
                  id="associatedFranchise"
                  label={t('sales.locations.associatedFranchise')}
                  options={transformArrayForOptions(franchises, 'name', 'id') || []}
                  selectedValues={formData?.associatedFranchise || {}}
                  handleChange={inputChangedHandler}
                  placeHolder={t('sales.locations.associatedFranchisePlaceholder')}
                  className={classes.dropHigh}
                  isError={errorMessages?.associatedFranchise}
                  bordered
                  placeHolderClassName={classes.placeHolderText}
                  searchable
                />
                <span className="errorMessage">{errorMessages?.associatedFranchise}</span>
              </Box>
            </Box>
            <Box className={classes.contactDetails}>
              <Box className={classes.sideBySideCol}>
                {/* NOTE: Ahsan said we will not allow to update stage from here */}
                {/* <Box
                  className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                  component="div"
                >
                  <InputLabel htmlFor="leadStage">{t('sales.locations.chooseMap')}</InputLabel>
                  <CustomDropDown
                    name="leadStage"
                    id="leadStage"
                    label={t('sales.locations.HubspotMap')}
                    options={transformArrayForOptions(leadStages, 'name', 'id') || []}
                    selectedValues={formData?.leadStage || {}}
                    handleChange={inputChangedHandler}
                    placeHolder={t('sales.locations.leadStages')}
                    className={classes.dropHigh}
                    isError={errorMessages?.leadStage}
                    placeHolderClassName={classes.placeHolderText}
                    bordered
                    showDescription={false}
                  />
                  <span className="errorMessage">{errorMessages?.leadStage}</span>
                </Box> */}
                <Box
                  className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                  component="div"
                >
                  <InputLabel htmlFor="tenancy">{t('sales.locations.tenancy')}</InputLabel>
                  <CustomDropDown
                    name="tenancy"
                    id="tenancy"
                    label={t('sales.locations.tenancy')}
                    options={TENANCY_STATUS_OPTIONS || []}
                    selectedValues={formData?.tenancy || {}}
                    handleChange={inputChangedHandler}
                    placeHolder={t('sales.locations.tenancy')}
                    className={classes.dropHigh}
                    isError={errorMessages?.tenancy}
                    bordered
                    placeHolderClassName={classes.placeHolderText}
                  />
                  <span className="errorMessage">{errorMessages?.tenancy}</span>
                </Box>
              </Box>
              {formData?.locationSource?.value === 'referred' && (
                <>
                  <Divider variant="fullWidth" className={classes.locationsDivider} />
                  <Box className={classes.referredWrapper}>
                    <Typography variant="h4" className={classes.referredByTitle}>
                      {t('sales.locations.referredBy')}
                    </Typography>
                    <Box className={classes.sideBySideCol}>
                      <PropertyDropDown
                        name="referredByProperty"
                        required={true}
                        property={formData?.referredByProperty || {}}
                        filter={propertyFilter}
                        onChange={inputChangedHandler}
                        isError={errorMessages?.referredByProperty}
                        error={errorMessages?.referredByProperty}
                      />
                      <ContactDropDown
                        name="referredByContact"
                        filter={contactFilter}
                        contact={formData?.referredByContact || {}}
                        onChange={inputChangedHandler}
                        required={true}
                        error={errorMessages?.referredByContact}
                      />
                    </Box>
                  </Box>
                  <Divider
                    variant="fullWidth"
                    className={classes.locationsDivider}
                    style={{ marginBottom: '24px' }}
                  />
                </>
              )}
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="occupancyRate">
                    {t('sales.locations.otherOccupancyRate')}
                  </InputLabel>
                  <TextField
                    name="occupancyRate"
                    id="occupancyRate"
                    fullWidth
                    type={'number'}
                    placeholder={t('sales.locations.otherOccupancyRate')}
                    error={!!errorMessages?.occupancyRate}
                    onChange={inputChangedHandler}
                    value={formData?.occupancyRate || ''}
                    className={classes.dropHigh}
                  />
                  <span className="errorMessage">{errorMessages?.occupancyRate}</span>
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="annualRevenue">
                    {t('sales.locations.annualRevenue')}
                  </InputLabel>
                  <TextField
                    name="annualRevenue"
                    id="annualRevenue"
                    fullWidth
                    type={'number'}
                    placeholder={t('sales.locations.annualRevenue')}
                    error={!!errorMessages?.annualRevenue}
                    onChange={inputChangedHandler}
                    value={formData?.annualRevenue || ''}
                    className={classes.dropHigh}
                  />
                  <span className="errorMessage">{errorMessages?.annualRevenue}</span>
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="squareFootageOfBuilding">
                    {t('sales.locations.squareFootage')}
                  </InputLabel>
                  <TextField
                    name="squareFootageOfBuilding"
                    id="squareFootageOfBuilding"
                    fullWidth
                    type={'number'}
                    placeholder={t('sales.locations.squareFootage')}
                    error={!!errorMessages?.squareFootageOfBuilding}
                    onChange={inputChangedHandler}
                    value={formData?.squareFootageOfBuilding || ''}
                    className={classes.dropHigh}
                  />
                  <span className="errorMessage">{errorMessages?.squareFootageOfBuilding}</span>
                </Box>
              </Box>

              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="noOfUnits">{t('sales.locations.otherNoOfUnits')}</InputLabel>
                  <TextField
                    name="numberOfUnits"
                    id="numberOfUnits"
                    fullWidth
                    type={'number'}
                    placeholder={t('sales.locations.otherNoOfUnits')}
                    error={!!errorMessages?.numberOfUnits}
                    onChange={inputChangedHandler}
                    value={formData?.numberOfUnits}
                    className={classes.dropHigh}
                  />
                  <span className="errorMessage">{errorMessages?.numberOfUnits}</span>
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="amenities">{t('sales.locations.amenities')}</InputLabel>
                  <TextField
                    name="amenities"
                    id="amenities"
                    fullWidth
                    placeholder={t('sales.locations.amenities')}
                    error={!!errorMessages?.amenities}
                    onChange={inputChangedHandler}
                    value={formData?.amenities || ''}
                    className={classes.dropHigh}
                  />
                  <span className="errorMessage">{errorMessages?.amenities}</span>
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="numberOfBuildings">
                    {t('sales.locations.numberOfBuildings')}
                  </InputLabel>
                  <TextField
                    name="numberOfBuildings"
                    id="numberOfBuildings"
                    type={'number'}
                    fullWidth
                    placeholder={t('sales.locations.numberOfBuildings')}
                    error={!!errorMessages?.numberOfBuildings}
                    helperText={errorMessages?.numberOfBuildings}
                    onChange={inputChangedHandler}
                    value={formData?.numberOfBuildings || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="parkingSpaces">
                    {t('sales.locations.parkingSpaces')}
                  </InputLabel>
                  <TextField
                    name="parkingSpaces"
                    id="parkingSpaces"
                    type={'number'}
                    fullWidth
                    placeholder={t('sales.locations.parkingSpaces')}
                    error={!!errorMessages?.parkingSpaces}
                    onChange={inputChangedHandler}
                    value={formData?.parkingSpaces || ''}
                    className={classes.dropHigh}
                  />
                  <span className="errorMessage">{errorMessages?.parkingSpaces}</span>
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="averageRate">
                    {t('sales.locations.otherAverageRate')}
                  </InputLabel>
                  <TextField
                    name="averageRent"
                    id="averageRent"
                    fullWidth
                    type={'number'}
                    placeholder={t('sales.locations.otherAverageRate')}
                    error={!!errorMessages?.averageRent}
                    onChange={inputChangedHandler}
                    value={formData?.averageRent || ''}
                    className={classes.dropHigh}
                  />
                  <span className="errorMessage">{errorMessages?.averageRent}</span>
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="buildingClass">
                    {t('sales.locations.buildingClass')}
                  </InputLabel>
                  <TextField
                    name="buildingClass"
                    id="buildingClass"
                    fullWidth
                    placeholder={t('sales.locations.buildingClass')}
                    error={!!errorMessages?.buildingClass}
                    onChange={inputChangedHandler}
                    value={formData?.buildingClass || ''}
                    className={classes.dropHigh}
                  />
                  <span className="errorMessage">{errorMessages?.buildingClass}</span>
                </Box>
              </Box>
            </Box>
          </Box>
          <DrawerFooter
            classNameFooter={classes.sideDrawerFooter}
            bulkApply={t('sales.locations.save')}
            bulkCancel={t('sales.locations.cancel')}
            handleCloseDrawer={locationCloseDrawer}
            anchor={anchor}
            type="submit"
            disabled={isSubmittingForm || !isChanged}
          />
        </Stack>
      </Box>
    </>
  );
};

UpdateLocationDrawer.propTypes = {
  locationInformationFromMap: PropTypes.object,
  isLoaded: PropTypes.bool.isRequired,
  anchor: PropTypes.string,
  locationCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  location: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  onSuccess: PropTypes.func,
  fetchCompanies: PropTypes.func,
  refetch: PropTypes.func,
  loadingCompaniesDropDown: PropTypes.bool,
};

export default UpdateLocationDrawer;
