import {
  Box,
  Button,
  Drawer,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ActivityBarSkeleton from 'src/app/components/common/skeletonLoader/activityBarSkeleton';
import BasicTabs from 'src/app/components/salesComponents/companies/tabs';
import FollowUp from 'src/app/components/salesComponents/components/followUp';
import NotesModal from 'src/app/components/salesComponents/components/notesModal';
import DealFollowUpModal from 'src/app/components/salesComponents/deals/dealFollowUpModal';
import ConvertLocationModal from 'src/app/components/salesComponents/locations/convertLocation';
import DetailsAccordians from 'src/app/components/salesComponents/locations/detailsAccordians';
import LocationAlerts from 'src/app/components/salesComponents/locations/locationAlerts';
// import LocationCloseModal from 'src/app/components/salesComponents/locations/locationClose';
import LocationStages from 'src/app/components/salesComponents/locations/locationStages';
// import { stageValues } from 'src/app/components/salesComponents/locations/locationStages/stage.constant';
import {
  assignToEnums,
  locationSourceOptions,
  locationStatuses,
} from 'src/app/components/salesComponents/locations/newLocationsDrawer/location.constant';
import SidebarDropdowns from 'src/app/components/salesComponents/locations/sidebarDropdowns';
import UpdateLocationDrawer from 'src/app/components/salesComponents/locations/updateLocationsDrawer';
import { locationDrawerTypes } from 'src/app/components/salesComponents/users/newLocationsDrawer/location.constant';
import { SALES_LOCATIONS } from 'src/app/router/constant/ROUTE';
import {
  ACL_DEALS_CREATE,
  ACL_PROPERTIES_UPDATE,
  ACL_PROPERTY_ACTIVITIES_VIEW,
  ACL_PROPERTY_CLASSIFICATION_QUESTION_VIEW,
  ACL_PROPERTY_EMAILS_CREATE,
  ACL_PROPERTY_EMAILS_DELETE,
  ACL_PROPERTY_EMAILS_UPDATE,
  ACL_PROPERTY_EMAILS_VIEW,
  ACL_PROPERTY_FOLLOWUPS_UPDATE,
  ACL_PROPERTY_FOLLOWUPS_VIEW,
  ACL_PROPERTY_MEETINGS_CREATE,
  ACL_PROPERTY_MEETINGS_DELETE,
  ACL_PROPERTY_MEETINGS_UPDATE,
  ACL_PROPERTY_MEETINGS_VIEW,
  ACL_PROPERTY_NOTES_CREATE,
  ACL_PROPERTY_NOTES_DELETE,
  ACL_PROPERTY_NOTES_UPDATE,
  ACL_PROPERTY_NOTES_VIEW,
  ACL_PROPERTY_TASKS_CREATE,
  ACL_PROPERTY_TASKS_DELETE,
  ACL_PROPERTY_TASKS_UPDATE,
  ACL_PROPERTY_TASKS_VIEW,
  ACL_SETTINGS_EMAIL_CONFIGURATIONS_CREATE,
} from 'src/app/router/constant/SALESMODULE';
import history from 'src/app/router/utils/history';
import { AddIcon } from 'src/assets/svg';
import { removeKey } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import {
  notesTasksCountReducer,
  taskNotesCountInitialState,
  UPDATE_COUNT_STATE,
} from 'src/redux/reducers/taskCount.reducer';
import { updateCompanyNote } from 'src/services/company.service';
import {
  createLocationNote,
  deleteLocation,
  getFranchiseDetail,
  getLeadStageOptions,
  getLocationActivities,
  getLocationDetail,
  getLocationNotes,
  updateFollowUp,
  updateLocationDetail,
} from 'src/services/location.service';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { taskableTypes, toastSettings } from 'src/utils/constants';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import { updateDatesWithVisitAt } from 'src/utils/date';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import { followUpActionTypeConstant, formKeys } from '../../deals/deals.constant';
import { useStyles } from './detail';

const followUpEmptyState = {
  reason: null,
  startTime: null,
  endTime: null,
  followUpDate: null,
};

const LocationDetails = () => {
  const [notesLoading, setNotesLoading] = useState(false);
  const [openConvert, setOpenConvert] = useState(false);
  const handleOpenConvert = () => setOpenConvert(true);
  const handleCloseConvert = () => setOpenConvert(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showMakeDeal, setShowMakeDeal] = useState(false);

  const [confirmationModal, setConfirmationModal] = useState(false);
  const handleChangeCofirmationModal = () => setConfirmationModal(!confirmationModal);

  const [confirmationModalClose, setConfirmationModalClose] = useState(false);
  const _handleCloseCofirmationModal = () => setConfirmationModalClose(!confirmationModalClose);

  const [propertyDrawer, setPropertDrawer] = useState(false);

  /**
   * @description it will recieve stages look for the following condition
   * if Qualified stage exist and have a status current
   * @param {*} stages [{}] array of object
   */
  // Changed from this approach to BE Key
  // const checkLocationStage = (stages) => {
  //   const hasCurrentStage = stages?.some(
  //     (stage) => stage.status === stageStatus.CURRENT && stage.value === stageValues.QUALIFIED,
  //   );
  //   // set a boolean to state
  //   setShowMakeDeal(hasCurrentStage);
  // };
  /**
   * get today date and time
   */
  const today = dayjs();

  // Convert dates to Day.js objects to match followUpDayjs with current date
  const todayDayjs = dayjs(today);

  const handleOpenModalFollowUp = () => {
    setFormData({
      ...data?.followUp,
      followUpDate: data?.followUp?.startTime,
    });
    setShowFollowUpModal(true);
  };
  const handleCloseModalFollowUp = () => {
    setShowFollowUpModal(false);
    setFormData(followUpEmptyState);
    setErrorMessages({});
  };

  const [locationState, setLocationState] = useState({
    right: false,
  });
  const _toggleDrawerLocation = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setLocationState({ ...locationState, [anchor]: open });
  };
  const _locationCloseDrawer = (anchor) => {
    setLocationState({ ...locationState, [anchor]: false });
  };

  const _toggleFiltersDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setmoreFilterState({ ...moreFilterState, [anchor]: open });
  };

  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');

  // const [_companies, setCompanies] = useState([]);

  // /**
  //  * Fetch companies listing
  //  */
  // const fetchCompanies = async () => {
  //   try {
  //     const response = await getCompaniesOption();
  //     if (response.statusCode === 200) {
  //       setCompanies(response?.data?.companies);
  //     }
  //   } catch (error) {
  //     /**
  //      * show error
  //      */
  //     toast.error(error?.message, {
  //       position: 'top-right',
  //       autoClose: toastSettings.AUTO_CLOSE,
  //     });
  //   }
  // };

  // useEffect(() => {
  //   // Wrap each function call in Promise.resolve to ensure they return promises
  //   const promises = [Promise.resolve(fetchCompanies())];
  //   Promise.allSettled(promises);
  // }, []);

  const [isFetchingLocationDetails, setIsFetchingLocationDetails] = useState(true);
  const [stageLoading, setStageLoading] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [data, setData] = useState({});
  const [options, setOptions] = useState({
    franchise: [],
    stages: [],
  });
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [isSecondTabActive, setIsSecondTabActive] = useState(false); // Flag for second tab
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [state, dispatch] = useReducer(notesTasksCountReducer, taskNotesCountInitialState);

  const notQualifiedForDeal = !data?.isConvertable;

  const handleChange = () => setOpen(!open);
  const { id } = useParams();

  const [formData, setFormData] = useState(followUpEmptyState);
  const [errorMessages, setErrorMessages] = useState({});

  const fetchFranchise = async (id) => {
    try {
      const response = await getFranchiseDetail(id);
      if (response.statusCode === 200)
        setOptions((prevOptions) => ({
          ...prevOptions,
          franchise: response.data.franchise,
        }));
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchLocation = async () => {
    try {
      setIsFetchingLocationDetails(true);
      const response = await getLocationDetail(id);
      if (response.statusCode === 200) {
        const locationStatus = response?.data?.location?.status;
        if (
          !locationStatus ||
          [locationStatuses.PENDING, locationStatuses.REJECTED].includes(locationStatus)
        ) {
          history.push(`${SALES_LOCATIONS}`);
          toast.error(t('sales.locations.locationNeedsApproval'), {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          return;
        }
        setData(response?.data?.location);
        setFormData({
          ...response?.data?.location?.followUp,
          followUpDate: response?.data?.location?.followUp?.startTime,
        });

        /**
         * check if to show make a deal button or not
         * Changed the previous logic from Stepper to BE approach
         * */
        if (response?.data?.location?.isConvertable) setShowMakeDeal(true);

        const franchiseId = response?.data?.location?.franchiseId;
        if (franchiseId) fetchFranchise(franchiseId);
      }
    } catch (error) {
      //If location not found then redirect back to listing page
      if (error?.statusCode === 404) history.push(`${SALES_LOCATIONS}`);
      /**
       * show error in the corresponding field
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsFetchingLocationDetails(false);
    }
  };

  const _onConfirm = async () => {
    try {
      const deleteResp = await deleteLocation(id);
      if (deleteResp?.statusCode === 200) {
        toast.success(deleteResp.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        history.push(`${SALES_LOCATIONS}`);
        handleChangeCofirmationModal();
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const fetchActivities = async (locationId) => {
    try {
      setActivitiesLoading(true);
      const response = await getLocationActivities(locationId);
      if (response.statusCode === 200) {
        setActivities(response?.data?.activities);
        setActivitiesLoading(false);
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       */
      setActivitiesLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const createNote = async (note) => {
    try {
      setLoading(true);
      const response = await createLocationNote(id, note);
      if (response.statusCode === 200) {
        addNoteToMonthlyData(response?.data);
        dispatch({
          type: UPDATE_COUNT_STATE,
          payload: {
            key: 'notesCount',
            value: state?.notesCount + 1,
          },
        });
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (noteId, note) => {
    try {
      setNotesLoading(true);
      const response = await updateCompanyNote(noteId, note);
      if (response.statusCode === 200) {
        fetchNotesListing();
      }
    } catch (error) {
      setNotesLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  /**
   * to get stages for unqalified
   */
  const fetchLeadStageOptions = async (stage) => {
    try {
      setStageLoading(true);
      const response = await getLeadStageOptions(stage);
      if (response.statusCode === 200) {
        setOptions((prevOptions) => ({
          ...prevOptions,
          stages: response.data.stages,
        }));
        setStageLoading(false);
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       */
      setStageLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  /**
   * update location
   */
  const updateLocation = async (data) => {
    try {
      setLoading(true);
      // const updatedLocationStageKey = data?.locationStage;
      const update = await updateLocationDetail(id, data);
      if (update?.statusCode === 200) {
        setData(update?.data?.location);

        /**
         * check if to show make a deal button or not
         * Changed the previous logic from Stepper to BE approach
         * */
        if (update?.data?.location?.isConvertable) {
          setShowMakeDeal(true);
        }

        /**
         * close unqalify location model
         */
        // handleCloseModal();

        if (update?.data?.location?.isConvertable) {
          setShowLocationAlert(true);
        } else {
          toast.success(update.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
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
      setLoading(false);
    }
  };

  /**
   * edit follow-up functions
   */
  const updateFormHandler = useCallback(
    (name, value, startTimeVal, endTime) => {
      setFormData((prevState) => ({
        ...prevState,
        ...(name === formKeys.FOLLOW_UP_DATE && { startTime: startTimeVal, endTime: endTime }),
        ...(name === formKeys.START_TIME && { endTime: endTime }),
        [name]: value,
      }));
    },
    [setFormData],
  );

  const handleInputChange = useCallback(
    (name, value) => {
      if (value) {
        setErrorMessages((prev) => removeKey(name, prev));
        /**
         * @description remove endTIme validation error if use select start time
         */
        if (name === formKeys.START_TIME)
          setErrorMessages((prev) => removeKey(formKeys.END_TIME, prev));
      }

      // start and end time to manuplate time picker user experience
      let startTime = null;
      let endTime = null;

      /**
       * @description if user select follow-up date then set default start time by adding 1 min in current date&time
       * also set endTime by add one hour in default start time
       */
      if (
        name === formKeys.FOLLOW_UP_DATE &&
        !formData?.startTime &&
        dayjs(value).isSame(todayDayjs, 'day')
      ) {
        startTime = today.add(1, 'minute').toISOString();
        endTime = dayjs(startTime).add(1, 'hour').toISOString();
      }

      /**
       * @description if user choose start time then
       * set default endTime by adding one hour in start time
       */
      if (name === formKeys.START_TIME) endTime = dayjs(value).add(1, 'hour').toISOString();

      updateFormHandler(name, value, startTime, endTime);
    },
    [updateFormHandler],
  );

  const handleFormSubmit = async (e) => {
    e.persist();
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      const errors = await formValidatorJoi(formData, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }

      const updateObj = updateDatesWithVisitAt(formData);

      const payload = {
        startTime: updateObj?.startTime,
        endTime: updateObj?.endTime,
        reason: updateObj?.reason,
      };

      try {
        const response = await updateFollowUp(data?.locationId, data?.followUp?.id, payload);
        if (response?.statusCode === 200) {
          const followUpResp = {
            ...response?.data?.visit,
            followUpDate: response?.data?.visit?.startTime,
          };

          /**
           * update follow-up object in side location detail
           */
          setData({
            ...data,
            followUp: followUpResp,
          });

          toast.success(response.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          handleCloseModalFollowUp();
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

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchLocation();
    if (userHasPermission(ACL_PROPERTY_ACTIVITIES_VIEW)) fetchActivities(id);
  }, [id]);

  const addNoteToMonthlyData = (newNote, monthlyData = notes) => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', {
      month: 'long',
    });
    const currentYear = currentDate.getFullYear();
    const currentMonthYear = `${currentMonth}, ${currentYear}`;

    const updatedMonthlyData = [...monthlyData];

    const matchingEntry = updatedMonthlyData.find((entry) => entry.month === currentMonthYear);

    if (matchingEntry) {
      matchingEntry.monthlyNotes.unshift(newNote);
    } else {
      updatedMonthlyData.unshift({
        month: currentMonthYear,
        monthlyNotes: [newNote],
      });
    }

    setNotes(updatedMonthlyData);
  };

  const fetchNotesListing = async () => {
    try {
      setNotesLoading(true);
      const response = await getLocationNotes(id);
      if (response?.statusCode === 200) {
        setNotes(response?.data?.notes);
        // Initialize a counter to sum all the notes
        let totalNotes = 0;

        // Iterate through the notes and sum up the number of notes
        response.data.notes.forEach((monthData) => {
          const monthlyNotes = monthData.monthlyNotes;
          totalNotes += monthlyNotes.length; // Add the number of notes in this month
        });
        dispatch({
          type: UPDATE_COUNT_STATE,
          payload: {
            key: 'notesCount',
            value: totalNotes,
          },
        });
      }
      setNotesLoading(false);
    } catch (error) {
      setNotesLoading(false);
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
    }
  };

  // const [openModal, setOpenModal] = useState(false);
  // const handleOpenModal = () => setOpenModal(true);
  // const handleCloseModal = () => setOpenModal(false);

  return (
    <>
      <Box className={classes.detailsnWrapper}>
        <Box className={classes.detailsSplitWrapper}>
          <Box className={classNames(classes.leftSideArea, 'innerScrollBar')}>
            {isFetchingLocationDetails || loading ? (
              <>
                <Box className={classes.locationDetailSkeletonWrapper}>
                  <Skeleton animation="wave" width={'100%'} height={50}></Skeleton>
                  <Skeleton animation="wave" width={'75%'} height={20}></Skeleton>
                  <Skeleton animation="wave" width={'50%'} height={20}></Skeleton>
                </Box>
              </>
            ) : (
              <Box className={classes.locationAddress}>
                <h1 className={classes.title}>{capitalizeFirstLetter(data?.locationName) || NA}</h1>
                <Typography className={classes.addressDetails}>
                  {/* {data?.street || NA}, {data?.city || NA}, {data?.state || NA}, {''}
                  {data?.postalCode || NA} */}
                  {data?.fullAddress || NA}
                </Typography>
                <Typography className={classes.addressDetails}>
                  {data?.hubspotId ? `#${data.hubspotId}` : NA}
                  {data?.type ? `, ${data?.type}` : NA}{' '}
                </Typography>
                {/*<Box className={classes.chipWrapper}>*/}
                {/*  {(!isObjectEmpty(data?.companies) &&*/}
                {/*    data?.locationAffiliation?.length &&*/}
                {/*    data?.locationAffiliation?.map((loc, index) => (*/}
                {/*      <Chip*/}
                {/*        key={index}*/}
                {/*        label={capitalizeFirstLetter(loc?.name || NA)}*/}
                {/*        size="small"*/}
                {/*        variant="outlined"*/}
                {/*        style={locationAffiliationChipColors[loc?.key]}*/}
                {/*        sx={{ border: 'none' }}*/}
                {/*      />*/}
                {/*    ))) ||*/}
                {/*    NA}*/}
                {/*</Box>*/}
              </Box>
            )}
            {isFetchingLocationDetails ? (
              <Skeleton animation="wave" width={'100%'} height={50}></Skeleton>
            ) : (
              <Box className={classes.statesButtonsWrap}>
                <ToggleButtonGroup variant="outlined" className={classes.statesButtons}>
                  {/*
                   * edit and delete will be used later
                   */}
                  {/* <ToggleButton
                onClick={toggleDrawerLocation(locationDrawerTypes.RIGHT, true)}
                className={`${classes.firstButton}  ${classes.gropBtn}`}
              >
                {t('sales.locations.edit')}
              </ToggleButton>
              <Drawer
                anchor={locationDrawerTypes.RIGHT}
                open={locationState[locationDrawerTypes.RIGHT]}
                onClose={toggleDrawerLocation(locationDrawerTypes.RIGHT, false)}
              >
                <NewLocationDrawer
                  anchor={locationDrawerTypes.RIGHT}
                  locationCloseDrawer={locationCloseDrawer}
                  width={796}
                  companies={companies}
                  editLocationData={getEditLocationData(data)}
                  onSuccess={fetchLocation}
                />
              </Drawer>
              <ToggleButton
                onClick={handleChangeCofirmationModal}
                className={`${classes.centerBtn}  ${classes.gropBtn}`}
              >
                {t('sales.locations.delete')}
              </ToggleButton>
              <Box className={classes.sweetAlertWrapper}>
                <SweetAlertModal
                  type="warning"
                  title={t('commonText.modal.leadDelete.deleteNote')}
                  text={t('commonText.modal.leadDelete.deleteMessage')}
                  confirmButtonText={t('buttons.yes')}
                  cancelButtonText={t('buttons.no')}
                  show={confirmationModal}
                  handleConfirmButton={onConfirm}
                  handleCancelButton={handleChangeCofirmationModal}
                  icon={<DeleteAlter />}
                />
              </Box> */}
                  {/*A Location cannot be closed now so commenting this code here*/}
                  {/*{notQualified && (*/}
                  {/*  <ToggleButton*/}
                  {/*    onClick={handleOpenModal}*/}
                  {/*    className={`${classes.centerBtn}  ${classes.gropBtn}`}*/}
                  {/*    value=""*/}
                  {/*  >*/}
                  {/*    {t('sales.locations.close')}*/}
                  {/*  </ToggleButton>*/}
                  {/*)}*/}
                  {/*{openModal && (*/}
                  {/*    <Box className={classes.sweetAlertWrapper}>*/}
                  {/*      <LocationCloseModal*/}
                  {/*          openModal={openModal}*/}
                  {/*          handleCloseModal={handleCloseModal}*/}
                  {/*          stages={options?.stages}*/}
                  {/*          updateLocation={updateLocation}*/}
                  {/*          fetchStageOptions={fetchLeadStageOptions}*/}
                  {/*      />*/}
                  {/*    </Box>*/}
                  {/*)}*/}
                  <RenderIfHasPermission name={ACL_PROPERTIES_UPDATE}>
                    <ToggleButton
                      onClick={() => setPropertDrawer(true)}
                      className={`${classes.firstButton}  ${classes.gropBtn}`}
                    >
                      {t('sales.locations.edit')}
                    </ToggleButton>
                  </RenderIfHasPermission>
                  {showMakeDeal && (
                    <RenderIfHasPermission name={ACL_DEALS_CREATE}>
                      <ToggleButton
                        onClick={handleOpenConvert}
                        className={`${!notQualifiedForDeal ? classes.lastButton : ''}  ${classes.gropBtn}`}
                        value=""
                      >
                        {t('sales.locations.makeDeal')}
                      </ToggleButton>
                    </RenderIfHasPermission>
                  )}
                  {openConvert && (
                    <Box className={classes.convertModal}>
                      <ConvertLocationModal
                        openHandle={openConvert}
                        closeHandle={handleCloseConvert}
                        data={data}
                        id={id}
                      />
                    </Box>
                  )}
                </ToggleButtonGroup>
              </Box>
            )}
            {data?.followUp && (
              <RenderIfHasPermission name={ACL_PROPERTY_FOLLOWUPS_VIEW}>
                <Box className={classes.followUpContent}>
                  <FollowUp
                    followUp={data?.followUp}
                    followUpText={data?.followUp?.reason || ''}
                    maxLength={72}
                    handleOpenEditModalFollowUp={handleOpenModalFollowUp}
                    id={data?.locationId}
                    data={data}
                    setData={setData}
                    module="Location"
                    setFormData={setFormData}
                    followUpEmptyState={followUpEmptyState}
                    permission={ACL_PROPERTY_FOLLOWUPS_UPDATE}
                  />
                </Box>
              </RenderIfHasPermission>
            )}
            <Box className={classes.dropdwonWrapper}>
              <SidebarDropdowns
                data={data}
                setData={setData}
                loading={loading}
                fetchFranchise={fetchFranchise}
                isFetchingLocationDetails={isFetchingLocationDetails}
              />
            </Box>
            {isFetchingLocationDetails || loading ? (
              <ActivityBarSkeleton onlyBar={true} noOfRows={6} />
            ) : (
              <Box className={classes.locationAccordian}>
                <DetailsAccordians
                  data={data}
                  setData={setData}
                  franchise={options?.franchise}
                  id={id}
                  fetchLocation={fetchLocation}
                />
              </Box>
            )}
          </Box>

          <Box className={classNames(classes.rightSideArea, 'innerScrollBar')}>
            <LocationAlerts
              convertToDealAlert={data?.isConvertable}
              show={showLocationAlert}
              setShow={setShowLocationAlert}
              handleOpenConvert={handleOpenConvert}
              dealName={data.locationName}
            />

            <Box className={classes.rightTopWrapper}>
              <LocationStages
                data={data}
                updateLocation={updateLocation}
                fetchStageOptions={fetchLeadStageOptions}
                stageLoading={stageLoading}
                stageOptions={options.stages}
                setOptions={setOptions}
                notQualified={notQualifiedForDeal}
                isLoading={isFetchingLocationDetails}
              />
            </Box>
            <Box className={classes.rightInnerWrapper}>
              <Box className={classes.overHeadr}>
                <Box className={classes.overviewHeading}>
                  <h2 className={classes.overHeading}>{t('sales.companies.overview')}</h2>
                </Box>

                {isSecondTabActive && userHasPermission(ACL_PROPERTY_NOTES_CREATE) && (
                  <Box className={classes.noteBtn}>
                    <Button onClick={handleChange} variant="primary">
                      <AddIcon /> {t('sales.companies.createNewNote')}
                    </Button>
                    {open && (
                      <NotesModal
                        open={open}
                        handleClose={handleChange}
                        onSaveCreate={createNote}
                      />
                    )}
                  </Box>
                )}
              </Box>
              <BasicTabs
                activities={activities}
                notes={notes}
                id={id}
                updateNote={updateNote}
                isSecondTabActive={isSecondTabActive}
                setIsSecondTabActive={setIsSecondTabActive}
                fetchActivities={fetchActivities}
                fetchNotesListing={fetchNotesListing}
                loadingActvities={activitiesLoading}
                notesLoading={notesLoading || loading}
                setNotesLoading={setNotesLoading}
                showQuestions={userHasPermission(ACL_PROPERTY_CLASSIFICATION_QUESTION_VIEW)}
                setData={setData}
                data={data}
                renderFrom={taskableTypes.location}
                state={state}
                dispatch={dispatch}
                showEmailTab={true}
                permissionSet={{
                  questionPermission: ACL_PROPERTY_CLASSIFICATION_QUESTION_VIEW,
                  activityPermission: ACL_PROPERTY_ACTIVITIES_VIEW,
                  notesPermission: ACL_PROPERTY_NOTES_VIEW,
                  noteUpdatePermission: ACL_PROPERTY_NOTES_UPDATE,
                  noteDeletePermission: ACL_PROPERTY_NOTES_DELETE,
                  tasksPermission: ACL_PROPERTY_TASKS_VIEW,
                  emailPermission: ACL_PROPERTY_EMAILS_VIEW,
                  meetingPermission: ACL_PROPERTY_MEETINGS_VIEW,
                  createTaskPermission: ACL_PROPERTY_TASKS_CREATE,
                  updateTaskPermission: ACL_PROPERTY_TASKS_UPDATE,
                  deleteTaskPermission: ACL_PROPERTY_TASKS_DELETE,
                  createEmailPermission: ACL_PROPERTY_EMAILS_CREATE,
                  updateEmailPermission: ACL_PROPERTY_EMAILS_UPDATE,
                  deleteEmailPermission: ACL_PROPERTY_EMAILS_DELETE,
                  createMeetingPermission: ACL_PROPERTY_MEETINGS_CREATE,
                  updateMeetingPermission: ACL_PROPERTY_MEETINGS_UPDATE,
                  deleteMeetingPermission: ACL_PROPERTY_MEETINGS_DELETE,
                  connectEmailPermission: ACL_SETTINGS_EMAIL_CONFIGURATIONS_CREATE,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      <DealFollowUpModal
        handleCloseModalFollowUp={handleCloseModalFollowUp}
        showFollowUpModal={showFollowUpModal}
        setFormData={setFormData}
        formData={formData}
        handleInputChange={handleInputChange}
        errorMessages={errorMessages}
        isSubmittingForm={isSubmittingForm}
        handleFormSubmit={handleFormSubmit}
        followUpActionType={followUpActionTypeConstant.EDIT}
      />

      {propertyDrawer && (
        <Drawer
          anchor={locationDrawerTypes.RIGHT}
          open={propertyDrawer}
          onClose={() => setPropertDrawer(false)}
        >
          <UpdateLocationDrawer
            anchor={locationDrawerTypes.RIGHT}
            locationCloseDrawer={() => setPropertDrawer(false)}
            width={796}
            location={data}
            onSuccess={fetchLocation}
          />
        </Drawer>
      )}
    </>
  );
};

export default LocationDetails;

const _getEditLocationData = (data) => {
  const getSalesPerson = () => {
    if (data.assignTo?.intent === assignToEnums.SALES_MANAGER)
      return {
        fullName: data.assignTo?.assignedUserName,
        label: data.assignTo?.assignedUserName,
        id: data.assignTo?.assignedUserId,
        value: data.assignTo?.assignedUserId?.toString(),
      };
    if (data.assignTo?.intent === assignToEnums.SALES_PERSON)
      return {
        fullName: data.assignTo?.assignedSupervisorName,
        label: data.assignTo?.assignedSupervisorName,
        id: data.assignTo?.assignedSupervisorId,
        value: data.assignTo?.assignedSupervisorId?.toString(),
      };
    return '';
  };

  const getIntern = () => {
    if (data.assignTo?.intent === assignToEnums.SALES_PERSON)
      return {
        fullName: data.assignTo?.assignedUserName,
        label: data.assignTo?.assignedUserName,
        id: data.assignTo?.assignedUserId,
        value: data.assignTo?.assignedUserId?.toString(),
      };
    return '';
  };

  return {
    id: data.locationId,
    city: data.cityId,
    state: data.stateId,
    country: data.countryId,
    countryCode: data.countryId,
    company: {
      id: data.company?.id,
      parentCompanyName: data.company?.parentCompany,
      value: data.company?.id,
      label: data.company?.name,
    },
    propertyName: data.locationName,
    associatedFranchise: {
      id: data.franchiseId,
      value: data.franchiseId,
      label: data.franchiseName,
    },
    locationSource: locationSourceOptions.find(
      (locationSourceOption) => locationSourceOption.label === data.type,
    ),
    name: data.contact?.firstName?.concat(' ', data.contact?.lastName),
    email: data.contact?.email,
    postalCode: data.postalCode,
    address: data.street,
    address2: data.addressLine2,
    title: data.contact?.jobTitle,
    phoneNumber: data.contact?.phone,
    assignTo: data.assignTo,
    salesPerson: getSalesPerson(),
    intern: getIntern(),
  };
};
