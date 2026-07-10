import { Box, Tab, Tabs } from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import SideDrawer from 'src/app/components/common/sideDrawer';
import ReassignHitDrawerContent from 'src/app/obx/pages/schedules/components/reassignHitDrawerContent';
import {
  fetchShiftDetailById,
  getHitShiftDetail,
  getRunsheetShiftDetail,
} from 'src/services/duty.services';
// import NotesEmptyState from 'src/app/components/salesComponents/components/notesEmpty';
import { getSitesInstructions } from 'src/services/sites.services';
import { toastSettings } from 'src/utils/constants';
import {
  DRAWER_TYPE,
  SCHEDULE_DUTIES,
  ShiftStatus,
  TourShiftStatusEnum,
} from 'src/utils/constants/schedules';

import PatrolAssignTour from '../../sites/detail/components/jobs/PatrolAssignTour';
import {
  dayjsWithStandardOffset,
  getCurrentStandardTimeInIsoWrtTimezone,
  getStartEndTimeWithDesiredDate,
} from '../helper';
import Activities from './Activities';
import AssignmentOnRunsheet from './components/assignmentOnRunsheet';
import HitHeaderEditButtons from './components/hitHeaderEditButton';
import PatrolHeader from './components/patrolHeader';
import RunsheetHeaderEditButton from './components/runsheetHeaderEditButton';
import Details from './Details';
import Header from './Header';
import HitDetail from './hitDetail';
import Logs from './Logs';
import Notes from './Notes';
import RunsheetDetail from './RunsheetDetail';

const useStyles = makeStyles((theme) => ({
  dutyDetailTabFirst: {
    padding: '24px',
  },
  dutyDetail: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,

    overflow: 'auto',
    '& .MuiTabs-root': {
      padding: '0 24px',
      minHeight: '50px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      '& .MuiTabs-scroller': {
        '& .MuiTabs-indicator': {
          backgroundColor: theme.palette.surfaceBrand,
        },
        '& .MuiTabs-flexContainer': {
          gap: '16px',

          '& .MuiButtonBase-root': {
            padding: '14px 4px 14px 4px',
            color: theme.palette.textPlaceholder,
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',

            '&.Mui-selected': {
              color: theme.palette.textBrand,
              fontWeight: 500,
            },

            '&.Mui-disabled': {
              color: theme.palette.textDisabled,
            },
          },
        },
      },
    },
  },

  dutyDetailTabPanel: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    // padding: '0px 24px',
  },

  dutyDetailFooter: {
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
}));

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  const classes = useStyles();
  return (
    <Box
      className={classes.dutyDetailTabPanel}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Box>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const getShiftDetailTabs = (t, shiftType) => {
  return [
    t('obx.schedules.dutyDetail.detail.title'),
    t('obx.schedules.dutyDetail.activities.title'),
    ...(shiftType !== SCHEDULE_DUTIES.HIT
      ? [t('obx.schedules.dutyDetail.notes.title'), t('obx.schedules.dutyDetail.logs.title')]
      : []),
  ];
};

const renderTabs = (t, disabled, shiftType) => {
  const shiftDetailTabs = getShiftDetailTabs(t, shiftType);
  return shiftDetailTabs.map((tab, index) => (
    <Tab key={index} disableRipple label={tab} disabled={disabled} />
  ));
};

export const ASSIGN_RUNSHEET_OPTIONS = {
  OFFICER: 'officer',
  VEHICLE: 'vehicle',
};
const DutyDetail = ({
  isOpen,
  drawerData,
  closeDrawer,
  setShowDrawer,
  getAllDuties,
  activeIndex,
  hideButtons = false,
}) => {
  const { shiftId, shiftType, shiftDate, startsAt, endsAt, runsheetId, shiftActivityLogId, rest } =
    drawerData || {};
  const { t } = useTranslation();
  const classes = useStyles();
  const [value, setValue] = useState(activeIndex);
  const [shiftData, setShiftData] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadInstructions, setLoadInstructions] = useState(false);
  const [isReassignHit, setIsReassignHit] = useState(false);
  const [isAssign, setIsAssign] = useState(null); // officer, vehicle
  const [showTourDrawer, setShowTourDrawer] = useState({
    open: '',
    data: {},
  });

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  const getShiftDetail = async ({ shiftId }) => {
    try {
      setLoading(true);

      const response = await fetchShiftDetailById({
        shiftId,
        shiftDate: shiftDate,
      });
      const detail = response?.data?.shift;
      const totalHours = dayjs(detail?.endsAt).diff(detail?.startsAt, 'h', true);

      const tourShiftStatus = findTourShiftStatus({
        tours: detail?.tours,
        shiftStatus: detail?.shiftStatus,
        endsAt: detail?.reassignedShift?.startsAt || detail?.endsAt,
        totalTours: detail?.totalTours,
      });

      setShiftData((prev) => ({
        ...prev,
        ...detail,
        totalHours,
        tourShiftStatus,
        endsAt: detail?.reassignedShift?.startsAt || detail?.endsAt,
        reassignedShift: detail?.reassignedShift
          ? {
              ...detail?.reassignedShift,
              reassignedTourShiftStatus: findTourShiftStatus({
                tours: detail?.reassignedShift?.tours,
                shiftStatus: detail?.reassignedShift?.shiftStatus,
                endsAt: detail?.reassignedShift?.endsAt,
                totalTours: detail?.reassignedShift?.totalTours,
              }),
            }
          : null,

        // ...(response?.data?.type === SCHEDULE_DUTIES.EXTRA && {
        //   instruction: { content: response?.data?.description },
        // }),
      }));

      setLoading(false);
    } catch (error) {
      setShiftData({});
      toast.error(error.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      setLoading(false);
    }
  };

  const getHitDetail = async (hitId) => {
    try {
      setLoading(true);

      const params = {
        startsAt,
        endsAt,
        runsheetId,
      };

      const response = await getHitShiftDetail({ hitId, params });
      let hitDetail = response?.data || {};

      hitDetail = {
        ...hitDetail,
        name: hitDetail?.name || '',
        runsheetName: hitDetail?.runsheetName || '',
        startsAt,
        endsAt,
        // subTitleText: '',
      };

      setShiftData(hitDetail);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setShiftData({});
    }
  };

  const getRunsheetDetail = async ({ runsheetId }) => {
    try {
      setLoading(true);

      const params = {
        startsAt,
        endsAt,
        shiftActivityLogId,
      };

      const response = await getRunsheetShiftDetail({ runsheetId, params });

      const runsheetStartsAt = response?.data?.runsheetDetails?.startsAt;
      const runsheetEndsAt = response?.data?.runsheetDetails?.endsAt;

      let minAssignmentDate;
      if (getCurrentStandardTimeInIsoWrtTimezone() < response?.data?.contractStartTime) {
        minAssignmentDate = dayjsWithStandardOffset(response?.data?.contractStartTime).format(
          'YYYY-MM-DD',
        );
      } else {
        const currentDate = dayjsWithStandardOffset().format('YYYY-MM-DD');
        const currentDay = dayjsWithStandardOffset().day();

        const runsheetStartsAtDay = dayjsWithStandardOffset(runsheetStartsAt).day();
        const runsheetEndsAtDay = dayjsWithStandardOffset(runsheetEndsAt).day();

        let currentDateRunsheet = null;

        if (currentDay === runsheetStartsAtDay) {
          // if runsheet startAt day is on currentday(today), then this check will worl

          const { startTime, endTime } = getStartEndTimeWithDesiredDate(
            currentDate,
            runsheetStartsAt,
            runsheetEndsAt,
          );
          currentDateRunsheet = {
            startsAt: startTime,
            endsAt: endTime,
          };
        } else if (currentDay === runsheetEndsAtDay) {
          // if runsheet startsAt day is not at current day and endsAt day is at current day, then this check will work

          const yesterdayDate = dayjs(currentDate).subtract(1, 'day').format('YYYY-MM-DD');
          const { startTime, endTime } = getStartEndTimeWithDesiredDate(
            yesterdayDate,
            runsheetStartsAt,
            runsheetEndsAt,
          );
          currentDateRunsheet = {
            startsAt: startTime,
            endsAt: endTime,
          };
        }

        if (!currentDateRunsheet) {
          // if runsheet do not exist on current day, then this check will work

          minAssignmentDate = currentDate;
        } else if (
          currentDateRunsheet &&
          getCurrentStandardTimeInIsoWrtTimezone() < currentDateRunsheet.endsAt
        ) {
          // if runsheet is not started yet on current day or if runsheet is not ended yet, then this check will work
          minAssignmentDate = dayjsWithStandardOffset(currentDateRunsheet.startsAt).format(
            'YYYY-MM-DD',
          );
        } else {
          // if runsheet has ended on current day, then this check will work
          minAssignmentDate = dayjsWithStandardOffset(currentDateRunsheet.startsAt)
            .add(1, 'week')
            .format('YYYY-MM-DD');
        }
      }

      const detail = {
        ...response?.data,
        name: response?.data?.runsheetDetails?.runsheetName || '',
        startsAt: startsAt,
        endsAt: endsAt,
        minAssignmentDate,
        // subTitleText: '',
      };

      setShiftData(detail);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setShiftData({});
    }
  };

  useEffect(() => {
    if (shiftType === SCHEDULE_DUTIES.HIT) {
      getHitDetail(shiftId);
      return;
    }
    if (shiftType === SCHEDULE_DUTIES.PATROL || shiftType === SCHEDULE_DUTIES.DISPATCH) {
      getRunsheetDetail({ runsheetId: shiftId });
      return;
    }

    getShiftDetail({ shiftId });
  }, []);

  const fetchSitesInstructions = async (siteId) => {
    try {
      setLoadInstructions(true);
      const response = await getSitesInstructions(siteId);
      setShiftData((prev) => ({ ...prev, instruction: response?.data?.instruction }));
      setLoadInstructions(false);
    } catch (err) {
      setLoadInstructions(false);
      setShiftData((prev) => ({ ...prev, instruction: undefined }));
    }
  };
  useEffect(() => {
    if (!shiftData || !shiftData.site?.id) return;
    if (shiftData?.instruction?.content) return;
    fetchSitesInstructions(shiftData.site.id);
  }, [shiftData?.site?.id]);

  const handleBackFromReassignHit = () => {
    setIsReassignHit(false);
  };

  const handleBackFromAssgnment = () => {
    setIsAssign(false);
  };

  const showSideDrawer = (value) => (data) => {
    setShowTourDrawer({ open: value, data: value ? data : null });
  };
  const changeOnlyDrawerType = (value) => () => {
    setShowTourDrawer((prev) => ({ open: value, data: value ? prev?.data : null }));
  };

  return (
    <>
      <SideDrawer totalWidth={'660px'} isOpen={isOpen}>
        {isReassignHit ? (
          <ReassignHitDrawerContent
            {...{
              closeDrawer,
              handleBackBtn: handleBackFromReassignHit,
              shiftData: shiftData,
              headerTitle: t('obx.schedules.dutyDetail.reassignHit.headerTitle'),
              callbackUponReassignHit: () => {
                getHitDetail(shiftId);
                getAllDuties();
              },
            }}
          />
        ) : isAssign ? (
          <AssignmentOnRunsheet
            {...{
              closeDrawer,
              handleBackBtn: handleBackFromAssgnment,
              shiftData: shiftData,
              runsheetId: shiftId,
              name: isAssign,
              isParent: shiftData?.isParent,
              isChild: shiftData?.isChild,
              shiftType,
              callbackUponAssignment: () => {
                getRunsheetDetail({ runsheetId: shiftId });
                getAllDuties();
              },
            }}
          />
        ) : (
          <>
            {[SCHEDULE_DUTIES.PATROL, SCHEDULE_DUTIES.DISPATCH].includes(shiftType) ? (
              <PatrolHeader
                loading={loading}
                shiftData={shiftData}
                closeDrawer={closeDrawer}
                shiftType={shiftType}
                headerTitle={
                  shiftData?.name + (shiftData?.site?.name ? ` - ${shiftData?.site?.name}` : '')
                }
                editButtons={
                  <>
                    <RunsheetHeaderEditButton shiftData={{ ...shiftData, runsheetId: shiftId }} />
                  </>
                }
              />
            ) : [SCHEDULE_DUTIES.HIT].includes(shiftType) ? (
              <PatrolHeader
                loading={loading}
                shiftData={shiftData}
                closeDrawer={closeDrawer}
                headerTitle={
                  shiftData?.name + (shiftData?.runsheetName ? ` - ${shiftData?.runsheetName}` : '')
                }
                editButtons={
                  <HitHeaderEditButtons
                    {...{
                      closeDrawer,
                      getAllDuties,
                      hitData: shiftData,
                      setIsReassignHit,
                      changeOnlyDrawerType,
                    }}
                  />
                }
              />
            ) : (
              <Header
                loading={loading}
                shiftData={shiftData}
                closeDrawer={closeDrawer}
                setShowDrawer={setShowDrawer}
              />
            )}
            <Box className={classes.dutyDetail}>
              <>
                <Tabs value={value} onChange={handleChange}>
                  {renderTabs(t, loading, shiftType)}
                </Tabs>

                <CustomTabPanel value={value} index={0}>
                  <Box className={classes.dutyDetailTabFirst}>
                    {shiftType === SCHEDULE_DUTIES.HIT ? (
                      <Box>
                        <HitDetail
                          {...{
                            loading,
                            shiftData,
                            callbackUponAssignment: () => {
                              getHitDetail(shiftId);
                              getAllDuties();
                            },
                          }}
                        />
                      </Box>
                    ) : shiftType === SCHEDULE_DUTIES.PATROL ||
                      shiftType === SCHEDULE_DUTIES.DISPATCH ? (
                      <RunsheetDetail
                        hideButtons={hideButtons}
                        shiftData={shiftData}
                        loading={loading}
                        setIsAssign={setIsAssign}
                      />
                    ) : (
                      <Details
                        shiftData={shiftData}
                        loading={loading}
                        loadInstructions={loadInstructions}
                        shiftId={shiftId}
                      />
                    )}
                  </Box>
                </CustomTabPanel>

                <CustomTabPanel value={value} index={1}>
                  <Activities
                    {...{
                      shiftId:
                        shiftType === SCHEDULE_DUTIES.PATROL ||
                        shiftType === SCHEDULE_DUTIES.HIT ||
                        shiftType === SCHEDULE_DUTIES.DISPATCH
                          ? rest?.shiftActivityLogId
                          : shiftId,
                      shiftDate,
                      shiftType,
                      hitId: shiftType === SCHEDULE_DUTIES.HIT ? shiftId : null,
                    }}
                  />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                  <Notes
                    shiftActivityLogId={
                      shiftType === SCHEDULE_DUTIES.PATROL || shiftType === SCHEDULE_DUTIES.DISPATCH
                        ? shiftData?.shiftActivityLogId
                        : shiftId
                    }
                    runsheetId={
                      shiftType === SCHEDULE_DUTIES.PATROL || shiftType === SCHEDULE_DUTIES.DISPATCH
                        ? shiftId
                        : ''
                    }
                    cbUponNotesCreation={(logId) => {
                      setShiftData((prev) => ({
                        ...prev,
                        shiftActivityLogId: logId,
                      }));
                      getAllDuties();
                    }}
                    startsAt={startsAt}
                    endsAt={endsAt}
                  />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={3}>
                  <Logs
                    {...{ logId: shiftData?.shiftActivityLogId || shiftId, shiftDate, shiftType }}
                  />
                </CustomTabPanel>
              </>
            </Box>
          </>
        )}
      </SideDrawer>

      {[DRAWER_TYPE.TOUR_ASSIGNMENT, DRAWER_TYPE.TOUR_TEMPLATE_PATROL].includes(
        showTourDrawer?.open,
      ) && (
        <PatrolAssignTour
          drawerData={{
            type: showTourDrawer?.open,
            hitId: shiftData?.hitId,
            siteId: shiftData?.siteId,
          }}
          closeSideDrawer={showSideDrawer('')}
          changeOnlyDrawerType={changeOnlyDrawerType}
          callbackUponAssignment={() => {
            getHitDetail(shiftId);
            getAllDuties();
          }}
        />
      )}
    </>
  );
};

DutyDetail.propTypes = {
  isOpen: PropTypes.bool,
  drawerData: PropTypes.object,
  jobId: PropTypes.string,
  closeDrawer: PropTypes.func,
  setShowDrawer: PropTypes.func,
  getAllDuties: PropTypes.func,
  readonly: PropTypes.bool,
  hideButtons: PropTypes.bool,

  activeIndex: PropTypes.number,
};

DutyDetail.defaultProps = {
  readonly: false,
  activeIndex: 0,
};

export default DutyDetail;

export const findTourShiftStatus = ({ tours, shiftStatus, endsAt, totalTours }) => {
  if ([ShiftStatus.SHIFT_NOT_STARTED, ShiftStatus.ABSENT].includes(shiftStatus)) {
    return TourShiftStatusEnum.NOT_STARTED;
  }

  if (
    [ShiftStatus.SHIFT_ENDED].includes(shiftStatus) ||
    getCurrentStandardTimeInIsoWrtTimezone() >= endsAt
  ) {
    return TourShiftStatusEnum.COMPLETED;
  }

  if (!totalTours) {
    // shiftStatus !== ShiftStatus.SHIFT_NOT_STARTED && shiftStatus !== ShiftStatus.ABSENT
    return TourShiftStatusEnum.IN_PROGRESS;
  }

  const ascSortedTours = tours?.sort((a, b) => a?.startsAt - b?.startsAt); // ASC sorted tours by startsAt
  const firstTour = ascSortedTours?.[0];
  if (
    totalTours &&
    !firstTour?.startedAt &&
    getCurrentStandardTimeInIsoWrtTimezone() < firstTour?.endsAt
  ) {
    // shiftStatus !== ShiftStatus.SHIFT_NOT_STARTED && shiftStatus !== ShiftStatus.ABSENT
    return TourShiftStatusEnum.IN_PROGRESS;
  }

  const findOngoingTour = () => {
    const ongoingTour = tours?.find((tour) => {
      const isOngoingTour =
        getCurrentStandardTimeInIsoWrtTimezone() >= tour?.startsAt &&
        getCurrentStandardTimeInIsoWrtTimezone() < tour?.endsAt;
      if (isOngoingTour) return true;
    });
    return ongoingTour;
  };
  const findRecentlyPastTour = () => {
    const descSortedTours = tours?.sort((a, b) => b?.startsAt - a?.startsAt); // DESC sorted tours by startsAt
    const recentlyPastTour = descSortedTours?.find((tour) => {
      const pastTour = getCurrentStandardTimeInIsoWrtTimezone() >= tour?.endsAt;
      if (pastTour) return true;
    });

    return recentlyPastTour;
  };
  const ongoingTour = findOngoingTour();
  const recentlyPastTour = findRecentlyPastTour();
  const getScheduledStatus = () => {
    if (ongoingTour && ongoingTour?.startedAt) {
      return TourShiftStatusEnum.ON_SCHEDULE;
    }

    if (recentlyPastTour) {
      if (recentlyPastTour?.endedAt <= recentlyPastTour?.endsAt) {
        return TourShiftStatusEnum.ON_SCHEDULE;
      } else {
        return TourShiftStatusEnum.BEHIND_SCHEDULE;
      }
    }
  };

  // shiftStatus !== ShiftStatus.SHIFT_NOT_STARTED && shiftStatus !== ShiftStatus.ABSENT
  return getScheduledStatus();
};
