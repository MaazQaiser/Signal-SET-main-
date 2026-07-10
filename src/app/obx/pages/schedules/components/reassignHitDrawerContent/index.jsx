import { Avatar, InputLabel, Skeleton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useJsApiLoader } from '@react-google-maps/api';
import { ReactComponent as DotIcon } from 'assets/svg/dot.svg';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
// import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import SearchComponent from 'src/app/components/common/search';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { DisplayDateTimeRange } from 'src/app/components/obxComponents/ShiftVisitsStatus';
import { ReactComponent as WarningIcon } from 'src/assets/svg/warning.svg';
import { useApiControllers } from 'src/helper/axios';
import {
  calculateAndDisplayRouteUtils,
  updateLastItemWithUniqueId,
} from 'src/helper/utilityFunctions';
import { addMissedHitToRunsheet, fetchRunsheetList } from 'src/services/duty.services';
import { getVisitorsLoadsOfficersOptions } from 'src/services/visitorsLoads.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';

import { NoRunsheetFound } from '../../../runSheets/listing';
import { dayjsWithTimezone, getCurrentTimeWithDisabledDlsInIso } from '../../helper';
import PatrolHeader from '../../shiftDetail/components/patrolHeader';
import { useStyles } from './reassignHitDrawerContent';
const libraries = ['places', 'drawing', 'geometry'];

const ReassignHitDrawerContent = ({
  closeDrawer,
  handleBackBtn,
  shiftData,
  headerTitle,
  loading,
  callbackUponReassignHit,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getNewApiController } = useApiControllers();

  const currentStandardDate = dayjs(dayjsWithTimezone().format('YYYY-MM-DD')); // date of franchise timezone as per DLS enabled or not
  const weekendWrtCurrentStandardDate = currentStandardDate.add(6, 'day').endOf('day');
  const [selectedDates, setSelectedDates] = useState([
    currentStandardDate,
    weekendWrtCurrentStandardDate,
  ]);
  const { isLoaded: _isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const [queryParams, setQueryParams] = useState({
    search: '',
    selectedOfficers: [],
  });
  const [runsheetListOriginal, setRunsheetListOriginal] = useState(null);
  const [runsheetList, setRunsheetList] = useState(null);
  const [officersList, setOfficersList] = useState();
  const [selectedRunsheet, setSelectedRunsheet] = useState(null);

  const onChangeSearch = (e) => {
    const value = e.target?.value;
    setQueryParams((prev) => ({
      ...prev,
      search: value,
    }));

    // Filter runsheets as per filter value
    if (runsheetListOriginal?.length > 0) {
      const updatedList = runsheetListOriginal?.filter((val) =>
        val?.name?.toLowerCase()?.includes(value?.toLowerCase()),
      );
      setRunsheetList([...updatedList]);
    }
  };
  const handleChangeSelectedOfficers = (e) => {
    setQueryParams((prev) => ({
      ...prev,
      selectedOfficers: e.target?.value,
    }));
  };

  const selectDatesHandler = (dates) => {
    setSelectedDates([dates?.[0], dayjs(dates?.[1]).endOf('day')]);
  };

  const getRunsheetList = async ({ startsAt, endsAt, selectedOfficers }) => {
    const apiController = getNewApiController();
    try {
      setRunsheetList(undefined);
      setRunsheetListOriginal(undefined);
      const config = { signal: apiController.signal };

      const params = {
        startsAt: getCurrentTimeWithDisabledDlsInIso(startsAt),
        endsAt: getCurrentTimeWithDisabledDlsInIso(endsAt),
        officerId: selectedOfficers?.map((officer) => officer?.id),
      };

      const response = await fetchRunsheetList({
        params,
        config,
      });
      setRunsheetList(response?.data || []);
      setRunsheetListOriginal(response?.data || []);
    } catch (err) {
      if (!apiController.signal.aborted) {
        setRunsheetList(null);
        setRunsheetListOriginal(null);
        toast.error(err?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };
  const getOfficersList = async () => {
    try {
      setOfficersList(undefined);
      const response = await getVisitorsLoadsOfficersOptions();
      setOfficersList(response?.data?.officers || []);
    } catch (err) {
      setOfficersList(null);
    }
  };

  // get runsheets listing as per selected date range
  useEffect(() => {
    if (
      selectedDates[0] &&
      selectedDates[1] &&
      dayjs(selectedDates[0]).isValid() &&
      dayjs(selectedDates[1]).isValid()
    ) {
      getRunsheetList({
        startsAt: selectedDates[0],
        endsAt: selectedDates[1],
        selectedOfficers: queryParams?.selectedOfficers,
      });
    }
  }, [selectedDates[0], selectedDates[1], queryParams?.selectedOfficers]);

  // Get Officers List
  useEffect(() => {
    getOfficersList();
  }, []);

  const showReassignHitConfirmationModal = (runsheet) => {
    setSelectedRunsheet(runsheet);
  };

  const handleCancelConfirmationModal = () => {
    setSelectedRunsheet(null);
  };

  const handleReassignHit = async () => {
    try {
      // Start --> Creating path data
      const hitPayload = {
        endsAt: shiftData?.endsAt,
        hitId: shiftData?.hitId,
        name: shiftData?.hitName || shiftData?.name,
        startsAt: shiftData?.startsAt,
        position: shiftData?.position,
        siteName: shiftData?.siteName,
        siteImage: shiftData?.siteImage,
        start_location: shiftData?.position,
      };
      const updatedPathData = [...(selectedRunsheet?.pathData || []), hitPayload];
      const waypoints = updatedPathData?.slice(1);

      const result = await calculateAndDisplayRouteUtils(updatedPathData?.[0], waypoints, t);

      let pathData = result?.visitSetPolyLines;
      if (selectedRunsheet?.startEndLocation?.id) {
        pathData = updateLastItemWithUniqueId(
          { pathData: pathData },
          selectedRunsheet?.startEndLocation?.id,
        );
      }
      // End --> Creating path data
      const payload = {
        runsheetDate: selectedRunsheet?.startsAt,
        hitId: shiftData?.hitId,
        siteId: shiftData?.siteId,
        hitRunsheetId: shiftData?.runsheetId,
        pathData,
        missedHitId: shiftData?.missedHitId,
      };

      const res = await addMissedHitToRunsheet({
        runsheetId: selectedRunsheet?.id,
        payload,
      });

      handleCancelConfirmationModal();
      handleBackBtn();
      callbackUponReassignHit?.();

      toast.success(res?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } catch (error) {
      handleCancelConfirmationModal();
      toast.error(error?.message || error?.e, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  return (
    <>
      <PatrolHeader
        {...{
          handleBackBtn,
          shiftData,
          subTitleText: shiftData?.hitName || shiftData?.name,
          closeDrawer,
          headerTitle,
          loading,
        }}
      />

      {/* Body */}
      <Box className={classes.drawerInnerNew}>
        <Box className={classes.drawerBodyTop}>
          <Typography variant="h5" className={classes.drawerBodyTitle}>
            {t('obx.schedules.dutyDetail.reassignHit.description')}
          </Typography>
          <Box className={classes.drawerDateRange}>
            <InputLabel htmlFor="start-date">
              {t('obx.schedules.dutyDetail.reassignHit.selectDatesLabel')}
            </InputLabel>
            <DateRangePickerWithButtons
              className={classes.drawerDateRangePicker}
              placeHolder="MM/DD/YYYY - MM/DD/YYYY"
              selectedDates={selectedDates}
              setDates={selectDatesHandler}
              minDate={currentStandardDate}
            />
          </Box>
          <Box className={classes.drawerFilters}>
            <SearchComponent
              className={classes.searchComponent}
              placeholder={t('obx.schedules.dutyDetail.reassignHit.searchPlaceholder')}
              onSearch={onChangeSearch}
            />

            <CustomDropDown
              label={t('obx.schedules.dutyDetail.reassignHit.officersLabel')}
              name="officers"
              options={transformArrayForOptions(officersList, 'name', 'id')}
              selectedValues={queryParams?.selectedOfficers}
              handleChange={handleChangeSelectedOfficers}
              multiSelect={true}
              checkmark={true}
              searchable={true}
              searchPlaceholder={t(
                'obx.schedules.dutyDetail.reassignHit.officersSearchPlaceholder',
              )}
              clearAll
            />
          </Box>
        </Box>

        <Box className={classes.drawerBody}>
          {runsheetList === undefined && (
            <Box className={classes.loaderBox}>
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
            </Box>
          )}
          {runsheetList?.length === 0 && <NoRunsheetFound />}

          {runsheetList?.map((runsheet) => {
            return (
              <Box
                key={runsheet?.id}
                className={classes.reassignHit}
                onClick={() => showReassignHitConfirmationModal(runsheet)}
              >
                <Typography variant="h4" className={classes.reassignHitTitle}>
                  {runsheet?.name}
                </Typography>
                <Box className={classes.reassignHitBody}>
                  <Typography variant="subtitle4" className={classes.reassignHitText}>
                    {DisplayDateTimeRange({
                      startsAt: runsheet?.startsAt,
                      endsAt: runsheet?.endsAt,
                    })}
                    {/* <Box component={'span'}>12/12/2023 09:00am</Box> <Box component={'span'}>-</Box>
                <Box component={'span'}>12/12/2023 05:00pm</Box> */}
                  </Typography>
                  <DotIcon />
                  <Box className={classes.reassignHitUser}>
                    <Avatar alt={''} src={runsheet?.officer?.imageUrl} />
                    <Typography variant="subtitle3"> {runsheet?.officer?.name}</Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <SweetAlertModal
        type="warning"
        title={t('obx.schedules.dutyDetail.reassignHit.confirmationModal.title')}
        text={t('obx.schedules.dutyDetail.reassignHit.confirmationModal.description')}
        confirmButtonText={'Reassign'}
        cancelButtonText={'Cancel'}
        show={!!selectedRunsheet}
        handleConfirmButton={handleReassignHit}
        handleCancelButton={handleCancelConfirmationModal}
        reverseButtons={true}
        icon={<WarningIcon />}
      />
    </>
  );
};

export default ReassignHitDrawerContent;

ReassignHitDrawerContent.propTypes = {
  closeDrawer: PropTypes.func,
  handleBackBtn: PropTypes.func,
  shiftData: PropTypes.object,
  headerTitle: PropTypes.string,
  loading: PropTypes.bool,
  callbackUponReassignHit: PropTypes.func,
};
