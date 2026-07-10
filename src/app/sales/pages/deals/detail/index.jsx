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
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { toast } from 'react-toastify';
import LoaderComponent from 'src/app/components/common/loader';
import ActivityBarSkeleton from 'src/app/components/common/skeletonLoader/activityBarSkeleton';
import FollowUp from 'src/app/components/salesComponents/components/followUp';
import NotesModal from 'src/app/components/salesComponents/components/notesModal';
import DealAlerts from 'src/app/components/salesComponents/deals/dealAlerts';
import DealCloseModal from 'src/app/components/salesComponents/deals/dealCloseModal/index.jsx';
import DealDrawer from 'src/app/components/salesComponents/deals/dealDrawer';
import DealFollowUpModal from 'src/app/components/salesComponents/deals/dealFollowUpModal';
import DealsDetailsAccordians from 'src/app/components/salesComponents/deals/dealsAccordians/index.jsx';
import DealsDropdowns from 'src/app/components/salesComponents/deals/dealsDropdowns/index.jsx';
import DealStages from 'src/app/components/salesComponents/deals/dealStages/index.jsx';
import { stageValues } from 'src/app/components/salesComponents/deals/dealStages/stage.constant';
import DealTabs from 'src/app/components/salesComponents/deals/dealTabs';
// import { adjustHourForTimePayloadInIso } from 'src/app/obx/pages/schedules/helper';
import {
  SALES_DEAL,
  SALES_DEAL_DETAIL_CONTRACT_DETAIL,
  SALES_DEALS,
} from 'src/app/router/constant/ROUTE';
import {
  ACL_DEAL_CONTRACTS_UPDATE,
  ACL_DEAL_CONTRACTS_VIEW,
  ACL_DEAL_FOLLOWUPS_CREATE,
  ACL_DEAL_FOLLOWUPS_UPDATE,
  ACL_DEAL_FOLLOWUPS_VIEW,
  ACL_DEAL_NOTES_CREATE,
  ACL_DEALS_UPDATE,
} from 'src/app/router/constant/SALESMODULE';
import { AddIcon } from 'src/assets/svg/index.jsx';
import { useApiControllers } from 'src/helper/axios';
import {
  checkIfTimeIsPassedAlready,
  checkIfTimeIsSame,
  removeKey,
} from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import {
  notesTasksCountReducer,
  taskNotesCountInitialState,
  UPDATE_COUNT_STATE,
} from 'src/redux/reducers/taskCount.reducer';
import { clearApiServicesData } from 'src/redux/store/slices/contractServices';
import { deleteCompanyNote } from 'src/services/company.service';
import {
  createDealNote,
  getContractDetails,
  getDealActivities,
  getDealDetails,
  getDealNotes,
  getDealOwnerOptions,
  getDealStageOptions,
  getPipelineOptions,
  updateDeal,
  updateDealNote,
} from 'src/services/deal.service';
import {
  createFollowUp,
  getCompaniesOption,
  getFranchiseDetail,
  updateDealFollowUp,
} from 'src/services/location.service';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { toastSettings } from 'src/utils/constants';
import { companiesPaginationEmptyState } from 'src/utils/constants/emptyStates/companiesPagination';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import { updateDatesWithVisitAt } from 'src/utils/date';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
// import ContractCreation from '../../contractCreation';
import { followUpActionTypeConstant, formKeys } from '../deals.constant';
import { useStyles } from './detail.js';

/**
 * empty state for add follow-up
 */
const followUpEmptyState = {
  reason: null,
  startTime: null,
  endTime: null,
  followUpDate: null,
};

const DealsDetails = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const history = useHistory();

  const dispatch = useDispatch();

  const controllerRef = useRef(null);

  const { getNewApiController } = useApiControllers();

  const [showModal, setShowModal] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const { id: dealId } = useParams();
  const [isFetchingDealDetails, setIsFetchingDealDetails] = useState(false);

  const [notesLoading, setNotesLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [value, setValue] = useState(0); // Initialize 'value' state variable
  const [isNotesTabActive, setIsNotesTabActive] = useState(false); // Initialize 'value' state variable
  const [notes, setNotes] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [open, setOpen] = useState(false);
  const handleChange = () => setOpen(!open);
  const [showDealAlert, setShowDealAlert] = useState(false);
  const [data, setData] = useState({});
  const [contractData, setContractData] = useState({});
  const [isFetchingContractDetails, setIsFetchingContractDetails] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const [followUpActionType, setFollowUpActionType] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  const handleShowContractForm = () => {
    setShowContractForm(true);

    if (
      userHasPermission(ACL_DEAL_CONTRACTS_VIEW) ||
      userHasPermission(ACL_DEAL_CONTRACTS_UPDATE)
    ) {
      const addDealId = SALES_DEAL_DETAIL_CONTRACT_DETAIL.replace(':id', dealId);

      const addFranchiseId = addDealId.replace(':franchiseId', data?.franchiseInfo?.franchiseId);

      history.push(addFranchiseId);
      setData((prevDeal) => ({ ...prevDeal, hasContract: true }));
      return;
    } else {
      fetchDealDetails();
    }
  };
  /**
   * get today date and time
   */
  // const today = dayjs();

  // Convert dates to Day.js objects to match followUpDayjs with current date
  // const todayDayjs = dayjs(today);

  const [questions, setQuestions] = useState({});
  const [questionsLoading, _setQuestionsLoading] = useState({});
  const { location = {} } = data;
  const dealStageKey = data?.dealStage?.value;
  const isClosed =
    dealStageKey === stageValues.CLOSED_LOST || dealStageKey === stageValues.CLOSED_WON;
  const [options, setOptions] = useState({
    dealOwners: [],
    pipelines: [],
    stages: [],
    companies: [],
    locations: [],
  });
  const [companiesPagination, setCompaniesPagination] = useState(companiesPaginationEmptyState);

  const previousSearchText = useRef(null);

  const [formData, setFormData] = useState(followUpEmptyState);
  const [errorMessages, setErrorMessages] = useState({});

  const [state, dispatchNotesTasks] = useReducer(
    notesTasksCountReducer,
    taskNotesCountInitialState,
  );

  /**
   * Fetch companies listing
   */
  const fetchCompanies = async (refetch = false, search = '') => {
    try {
      let currentPage = companiesPagination?.currentPage;
      if (!search && !previousSearchText.current && !refetch) {
        currentPage = 1;
      }
      if (!refetch && search && !previousSearchText.current) {
        currentPage = 1;
      }
      if (refetch && search && !previousSearchText.current) {
        currentPage = 1;
      }
      if (
        refetch &&
        search &&
        previousSearchText.current &&
        search !== previousSearchText.current
      ) {
        currentPage = 1;
      }
      if (
        !refetch &&
        search &&
        previousSearchText.current &&
        search !== previousSearchText.current
      ) {
        currentPage = 1;
      }
      if (
        refetch &&
        search &&
        previousSearchText.current &&
        search === previousSearchText.current
      ) {
        currentPage = companiesPagination?.currentPage + 1;
      }
      if (previousSearchText.current && !search) {
        currentPage = 1;
      }
      if (!search && !previousSearchText.current && refetch) {
        currentPage = companiesPagination?.currentPage + 1;
      }

      const response = await getCompaniesOption(currentPage, search);
      if (response.statusCode === 200) {
        if (refetch && response?.data?.companies?.length) {
          setOptions((prevOptions) => ({
            ...prevOptions,
            companies: [
              ...(prevOptions.companies || []), // Ensure prevOptions.companies is an array
              ...(response?.data?.companies || []), // Ensure response.data.companies is an array
            ],
          }));
        } else {
          setOptions((prevOptions) => ({
            ...prevOptions,
            companies: response?.data?.companies,
          }));
        }
        // setCompanies(response?.data?.companies);
        setCompaniesPagination(response?.pagination);
        previousSearchText.current = search;
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
   * Fetch pipelines listing
   */
  const fetchPipelines = async () => {
    try {
      const response = await getPipelineOptions();
      if (response?.statusCode === 200) {
        setOptions((prevOptions) => ({
          ...prevOptions,
          pipelines: response?.data?.pipelines,
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

  useEffect(() => {
    // Wrap each function call in Promise.resolve to ensure they return promises
    const promises = [
      Promise.resolve(fetchCompanies()),
      Promise.resolve(fetchPipelines()),
      Promise.resolve(fetchDealOwners()),
    ];
    Promise.allSettled(promises);
  }, []);

  const hasContractViewPermission = userHasPermission(ACL_DEAL_CONTRACTS_VIEW);

  const fetchFranchise = async (id) => {
    try {
      const response = await getFranchiseDetail(id);
      if (response.statusCode === 200)
        setData((prevData) => ({
          ...prevData,
          franchise: response.data.franchise,
        }));
      setDataLoading(false);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDataLoading(false);
    }
  };

  const fetchContractDetails = async () => {
    try {
      setContractData(null);
      dispatch(clearApiServicesData());
      setIsFetchingContractDetails(true);
      const response = await getContractDetails(dealId);
      if (response.statusCode === 200) {
        setContractData(response?.data?.contract);
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsFetchingContractDetails(false);
    }
  };

  const fetchDealDetails = async () => {
    try {
      setIsFetchingDealDetails(true);
      const response = await getDealDetails(dealId);
      if (response.statusCode === 200) {
        const deal = response?.data?.deal;
        setData(deal);
        const franchiseId = deal?.franchiseInfo?.franchiseId;
        if (franchiseId) fetchFranchise(franchiseId);

        // Show Deal Alerts is closed or open
        if ([stageValues.CLOSED_LOST, stageValues.CLOSED_WON].includes(deal?.dealStage?.key))
          setShowDealAlert(true);

        // Show Contract & Terms Tab is Questions step is Completed
        // const isQuestionsStepCompleted =
        //   deal?.stepperDetails?.[0]?.status === stageStatus.COMPLETED;
        // if (isQuestionsStepCompleted) setValue(1);

        const hasContract = deal?.hasContract;
        if (hasContract && hasContractViewPermission) fetchContractDetails();
      }
      setDataLoading(false);
    } catch (error) {
      //If deal not found then redirect back to listing page
      if (error?.statusCode === 404) history.push(`${SALES_DEALS}`);
      /**
       * show error in the corresponding field
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDataLoading(false);
    } finally {
      setIsFetchingDealDetails(false);
    }
  };

  const locationDrawerTypes = {
    RIGHT: 'right',
    // Add other anchor positions if needed
  };
  const toggleDealDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setDealState({ ...dealState, [anchor]: open });
  };
  const [dealState, setDealState] = useState({
    right: false,
  });
  const dealCloseDrawer = (anchor) => {
    setDealState({ ...dealState, [anchor]: false });
  };
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleOpenModalFollowUp = (type) => {
    setFollowUpActionType(type);

    /**
     * pre-populate data in edit follow-up case
     */
    if (type === followUpActionTypeConstant.EDIT) {
      setFormData({
        ...data?.followUp,
        followUpDate: data?.followUp?.startTime,
      });
    }

    setShowFollowUpModal(true);
  };
  const handleCloseModalFollowUp = () => {
    setShowFollowUpModal(false);
    setFormData(followUpEmptyState);
    setErrorMessages({});
  };

  const _toggleDeleteModal = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    if (dealId) {
      fetchDealDetails();
      // fetchQuestions();
    }
  }, [dealId]);

  // This is a chepi pattern, Todo need to create seprate url for contract form
  useEffect(() => {
    return () => {
      if (history.action === 'POP' && showContractForm) {
        history.push(`${SALES_DEAL}/${dealId}`);
      }
    };
  }, [history, showContractForm]);

  /**
   * update deal
   */
  const updateDealStage = async (payload) => {
    try {
      const updatedDealStageKey = payload?.dealStage;
      const response = await updateDeal(dealId, { ...payload, pipelineId: data.pipeline?.id });

      if (response.statusCode === 200) {
        setData(response?.data?.deal);
        const franchiseId = response?.data?.deal?.franchiseInfo?.franchiseId;
        if (franchiseId) fetchFranchise(franchiseId);

        if ([stageValues.CLOSED_LOST, stageValues.CLOSED_WON].includes(updatedDealStageKey)) {
          setShowDealAlert(true);
        } else {
          toast.success(response.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
        /**
         * close the modal after successful response
         */
        handleCloseModal();
      }
      setDataLoading(false);
    } catch (error) {
      /**
       * show error
       */
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDataLoading(false);
    }
  };

  /**
   * Get Deal stages
   */
  const fetchDealStageOptions = async (stage) => {
    // Abort previous request if still pending
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const apiController = getNewApiController();
    controllerRef.current = apiController;

    try {
      const response = await getDealStageOptions(stage, data.pipeline?.id, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        controllerRef.current = null;
        setOptions((prevOptions) => ({
          ...prevOptions,
          stages: response?.data?.stages,
        }));
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       */
      controllerRef.current = null;
      // toast.error(error?.message, {
      //   position: 'top-right',
      //   autoClose: toastSettings.AUTO_CLOSE,
      // });
    }
  };

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

  const getOnDelete = async (id) => {
    try {
      setNotesLoading(true);
      const apiResponse = await deleteCompanyNote(id);
      if (apiResponse.statusCode === 200) {
        fetchNotesListing();
        toast.success(apiResponse.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      setNotesLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const updateNote = async (noteId, note) => {
    try {
      setNotesLoading(true);
      const response = await updateDealNote(noteId, note);
      if (response?.statusCode === 200) {
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

  const fetchActivities = async (dealId) => {
    try {
      setActivitiesLoading(true);
      const response = await getDealActivities(dealId);
      if (response?.statusCode === 200) {
        setActivities(response?.data?.activities);
        setActivitiesLoading(false);
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      setActivitiesLoading(false);
    }
  };

  const fetchNotesListing = async () => {
    try {
      setNotesLoading(true);
      const response = await getDealNotes(dealId);
      if (response?.statusCode === 200) {
        setNotes(response?.data?.notes);
        // Initialize a counter to sum all the notes
        let totalNotes = 0;

        // Iterate through the notes and sum up the number of notes
        response.data.notes.forEach((monthData) => {
          const monthlyNotes = monthData.monthlyNotes;
          totalNotes += monthlyNotes.length; // Add the number of notes in this month
        });
        dispatchNotesTasks({
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
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const createNote = async (note) => {
    try {
      setNotesLoading(true);
      const response = await createDealNote(dealId, note);
      if (response.statusCode === 200) {
        addNoteToMonthlyData(response?.data);
        dispatchNotesTasks({
          type: UPDATE_COUNT_STATE,
          payload: {
            key: 'notesCount',
            value: state?.notesCount + 1,
          },
        });
      }
      setNotesLoading(false);
    } catch (error) {
      setNotesLoading(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  // show loder when on Contract & Terms DealsTab and contractdetails are fetching
  const contractLoading = (isFetchingContractDetails || isFetchingDealDetails) && value === 1;

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
      setErrorMessages((prev) => ({
        ...prev,
        ...(name === formKeys.FOLLOW_UP_DATE && removeKey(['startTime', 'endTime'], prev)),
        ...(name === formKeys.START_TIME && removeKey(['endTime'], prev)),
        ...removeKey([name], prev),
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
        dayjs(value).isSame(dayjs(), 'day')
      ) {
        startTime = dayjs().add(1, 'minute').toISOString();
        endTime = dayjs(startTime).add(1, 'hour').toISOString();
      }

      /**
       * @description if user choose start time then
       * set default endTime by adding one hour in start time
       */
      if (name === formKeys.START_TIME) {
        endTime =
          dayjs(value).hour() < 23
            ? dayjs(value).add(1, 'hour').toISOString()
            : dayjs(value).add(1, 'minute').toISOString();
      }
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

      if (checkIfTimeIsPassedAlready(formData?.followUpDate, formData.startTime)) {
        setErrorMessages((prev) => ({
          ...prev,
          startTime: t('sales.deals.startTimePassedAlready'),
        }));
        return;
      }

      if (checkIfTimeIsSame(formData?.startTime, formData?.endTime)) {
        setErrorMessages((prev) => ({
          ...prev,
          startTime: t('sales.deals.startTimeAndEndTimeCannotBeSame'),
          endTime: t('sales.deals.startTimeAndEndTimeCannotBeSame'),
        }));
        return;
      }

      const updateObj = updateDatesWithVisitAt(formData);

      const payload = {
        startTime: dayjs(updateObj?.startTime).utc(true).format(),
        endTime: dayjs(updateObj?.endTime).utc(true).format(),
        reason: updateObj?.reason,
      };

      try {
        let response;

        /**
         * handle create and edit API call
         */
        if (followUpActionType === followUpActionTypeConstant.CREATE)
          response = await createFollowUp(data?.id, payload);
        else response = await updateDealFollowUp(data?.id, data?.followUp?.id, payload);

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

          /**
           * choose toast message according to the action item
           */
          const toastMessage =
            followUpActionType === followUpActionTypeConstant.CREATE
              ? t('sales.locations.followUpCreated')
              : t('sales.locations.followUpUpdated');

          toast.success(toastMessage, {
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

  return (
    <>
      <Box className={classes.detailsnWrapper}>
        {contractLoading && (
          <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />
        )}
        <Box className={classes.detailsSplitWrapper}>
          <Box className={classNames(classes.leftSideArea, 'innerScrollBar')}>
            {isFetchingDealDetails ? (
              <>
                <Box className={classes.locationDetailSkeletonWrapper}>
                  <Skeleton animation="wave" width={'100%'} height={50}></Skeleton>
                  <Skeleton animation="wave" width={'75%'} height={20}></Skeleton>
                  <Skeleton animation="wave" width={'50%'} height={20}></Skeleton>
                </Box>
              </>
            ) : (
              <Box className={classes.locationAddress}>
                <Typography variant="h2" className={classes.title}>
                  {capitalizeFirstLetter(data?.dealName) || NA}
                </Typography>
                <Typography variant="body2" className={classes.addressDetails}>
                  {location?.address || NA}, {location?.city || NA}, {location?.state || NA},{' '}
                  {location?.postalCode || NA}
                </Typography>
                <Typography variant="body2" className={classes.addressDetails}>
                  {
                    // this needs to be updated after discussion with Ahsan, something related to Grade B
                  }
                  {data?.hubspotDealId ? `# ${data?.hubspotDealId}` : NA}{' '}
                  {data?.type ? `, ${data?.type}` : null}
                  {/* <Box component="span" className={classes.gradeColor}>
                Grade B
              </Box> */}
                </Typography>
              </Box>
            )}
            {isFetchingDealDetails ? (
              <Skeleton animation="wave" width={'100%'} height={50}></Skeleton>
            ) : !isClosed || !data?.followUp ? (
              //above condition is added to hide the complete section if both conditons are failed
              <Box className={classes.statesButtonsWrap}>
                <ToggleButtonGroup variant="outlined" className={classes.statesButtons}>
                  {!isClosed ? (
                    <>
                      <RenderIfHasPermission name={ACL_DEALS_UPDATE}>
                        <ToggleButton
                          onClick={toggleDealDrawer(locationDrawerTypes.RIGHT, true)}
                          disabled={isClosed}
                          className={`${classes.firstButton}  ${classes.gropBtn}`}
                          value=""
                        >
                          {t('sales.locations.edit')}
                        </ToggleButton>
                      </RenderIfHasPermission>
                      <Drawer
                        anchor={locationDrawerTypes.RIGHT}
                        open={dealState[locationDrawerTypes.RIGHT]}
                        onClose={toggleDealDrawer(locationDrawerTypes.RIGHT, false)}
                      >
                        <DealDrawer
                          anchor={locationDrawerTypes.RIGHT}
                          dealCloseDrawer={dealCloseDrawer}
                          width={796}
                          options={options}
                          setOptions={setOptions}
                          editDealData={getEditDealData(data, dealStageKey)}
                          onSuccess={setData}
                          companiesPagination={companiesPagination}
                          fetchMoreOptions={fetchCompanies}
                        />
                      </Drawer>
                      {/* <ToggleButton
                    onClick={() => setShowModal(true)}
                    className={`${classes.middleBtn}  ${classes.gropBtn}`}
                  >
                    {t('sales.locations.delete')}
                  </ToggleButton>
                  <Box className={classes.sweetAlertWrapper}>
                    <SweetAlertModal
                      type="warning" // 'success', 'error', 'warning', 'info', etc.
                      title={t('sales.deals.deleteHeading')}
                      text={t('sales.deals.deleteText')}
                      confirmButtonText={t('buttons.yes')}
                      cancelButtonText={t('buttons.no')}
                      show={showModal}
                      icon={<AlertDelIcon />}
                      handleConfirmButton={() => {}}
                      handleCancelButton={toggleDeleteModal}
                      reverseButtons={true}
                    />
                  </Box> */}

                      <RenderIfHasPermission name={ACL_DEALS_UPDATE}>
                        <ToggleButton
                          onClick={handleOpenModal}
                          className={`${classes.middleBtn}  ${classes.gropBtn}`}
                          value=""
                        >
                          {t('sales.locations.close')}
                        </ToggleButton>
                      </RenderIfHasPermission>
                      <Box className={classes.sweetAlertWrapper}>
                        <DealCloseModal
                          data={data}
                          openModal={openModal}
                          handleCloseModal={handleCloseModal}
                          updateDealStage={updateDealStage}
                          fetchStageOptions={fetchDealStageOptions}
                          stages={options?.stages}
                          setStages={(stages) => {
                            setOptions((prevData) => ({
                              ...prevData,
                              stages,
                            }));
                          }}
                        />
                      </Box>
                    </>
                  ) : null}

                  {!data?.followUp && (
                    <RenderIfHasPermission name={ACL_DEAL_FOLLOWUPS_CREATE}>
                      <ToggleButton
                        onClick={() => handleOpenModalFollowUp(followUpActionTypeConstant.CREATE)}
                        className={
                          isClosed
                            ? `${classes.gropBtn} ${classes.onlyButton} `
                            : `${classes.centerBtn} ${classes.gropBtn}`
                        }
                        value=""
                      >
                        {t('sales.locations.followUp')}
                      </ToggleButton>
                    </RenderIfHasPermission>
                  )}
                </ToggleButtonGroup>
              </Box>
            ) : null}

            <RenderIfHasPermission name={ACL_DEAL_FOLLOWUPS_VIEW}>
              {data?.followUp && (
                <FollowUp
                  followUp={data?.followUp}
                  followUpText={data?.followUp?.reason || ''}
                  maxLength={72}
                  handleOpenEditModalFollowUp={handleOpenModalFollowUp}
                  id={data?.id}
                  data={data}
                  setData={setData}
                  module="Deal"
                  setFormData={setFormData}
                  followUpEmptyState={followUpEmptyState}
                  permission={{
                    updatePermission: ACL_DEAL_FOLLOWUPS_UPDATE,
                    viewFollowUpPermission: ACL_DEAL_FOLLOWUPS_VIEW,
                  }}
                />
              )}
            </RenderIfHasPermission>

            <Box className={classes.dropdwonWrapper}>
              <DealsDropdowns
                amount={data?.amount}
                pipeline={data?.pipeline?.name}
                dealOwner={data?.owner}
                loading={dataLoading}
                dealId={data?.id}
                onSuccess={setData}
                isNotClosed={!isClosed}
              />
            </Box>
            {isFetchingDealDetails ? (
              <ActivityBarSkeleton onlyBar={true} noOfRows={6} />
            ) : (
              <Box className={classes.locationAccordian}>
                <DealsDetailsAccordians data={data} setData={setData} id={dealId} />
              </Box>
            )}
          </Box>
          <Box className={classNames(classes.rightSideArea, 'innerScrollBar')}>
            <DealAlerts
              closedStage={dealStageKey}
              show={showDealAlert}
              setShow={setShowDealAlert}
              dealName={data.dealName}
            />
            <Box className={classes.rightTopWrapper}>
              <DealStages
                data={data}
                updateDealStage={updateDealStage}
                fetchStageOptions={fetchDealStageOptions}
                stages={options?.stages}
                setStages={(stages) => {
                  setOptions((prevData) => ({
                    ...prevData,
                    stages,
                  }));
                }}
                isNotClosed={!isClosed}
                isLoading={isFetchingDealDetails}
                // setValue 1 indicates to show Contracts & Terms tab
                goToContractsAndTermsTab={() => setValue(1)}
                handleOpenCloseDealModal={handleOpenModal}
              />
            </Box>
            <Box className={classes.rightInnerWrapper}>
              <Box className={classes.overHeadr}>
                <Box className={classes.overviewHeading}>
                  <h2 className={classes.overHeading}>{t('sales.companies.overview')}</h2>
                </Box>

                <RenderIfHasPermission name={ACL_DEAL_NOTES_CREATE}>
                  {isNotesTabActive && (
                    <Box className={classes.noteBtn}>
                      <Button onClick={handleChange} variant="primary">
                        <AddIcon /> {t('sales.companies.createNewNote')}
                      </Button>
                      <NotesModal
                        open={open}
                        handleClose={handleChange}
                        onSaveCreate={createNote}
                      />
                    </Box>
                  )}
                </RenderIfHasPermission>
              </Box>

              <DealTabs
                dealId={dealId}
                dealName={data.dealName}
                updateNote={updateNote}
                fetchActivities={fetchActivities}
                fetchNotes={fetchNotesListing}
                activities={activities}
                activitiesLoading={activitiesLoading}
                notes={notes}
                notesLoading={notesLoading}
                getOnDelete={getOnDelete}
                setValue={setValue}
                setIsNotesTabActive={setIsNotesTabActive}
                value={value}
                questions={questions}
                setQuestions={setQuestions}
                questionsLoading={questionsLoading}
                data={data}
                setData={setData}
                hasContract={data?.hasContract}
                contractLoading={contractLoading}
                isDealClosed={isClosed}
                openModalCloseDeal={handleOpenModal}
                contractData={contractData}
                setContractData={setContractData}
                handleShowContractForm={handleShowContractForm}
                isFetchingDealDetails={isFetchingDealDetails}
                isFetchingContractDetails={isFetchingContractDetails}
                state={state}
                dispatch={dispatchNotesTasks}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {showFollowUpModal && (
        <DealFollowUpModal
          handleCloseModalFollowUp={handleCloseModalFollowUp}
          showFollowUpModal={showFollowUpModal}
          setFormData={setFormData}
          formData={formData}
          handleInputChange={handleInputChange}
          errorMessages={errorMessages}
          setErrorMessages={setErrorMessages}
          isSubmittingForm={isSubmittingForm}
          handleFormSubmit={handleFormSubmit}
          followUpActionType={followUpActionType}
        />
      )}
    </>
  );
};

DealsDetails.propTypes = {
  id: PropTypes.number,
  showFollowUpModal: PropTypes.bool,
  handleCloseModalFollowUp: PropTypes.func,
};
export default DealsDetails;

const getEditDealData = (data, dealStageKey) => {
  return {
    id: data.id,
    dealName: data.dealName,
    dealOwner: {
      id: data.owner?.id,
      value: data.owner?.id,
      label: data.owner?.name,
    },
    pipeline: {
      id: data.pipeline?.id,
      value: data.pipeline?.id,
      label: data.pipeline?.name,
    },
    company: {
      id: data.company?.id,
      parentCompanyName: data.company?.parentCompanyName,
      value: data.company?.id,
      label: data.company?.name,
    },
    property: {
      id: data.location?.id,
      value: data.location?.id,
      label: data.location?.name,
    },
    stage: {
      id: data.stage?.id,
      value: data.stage?.id,
      label: data.stage?.name,
    },
    dealStageKey,
  };
};
