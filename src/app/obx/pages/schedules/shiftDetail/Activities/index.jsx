import { Box, Skeleton, Typography } from '@mui/material';
import SweetAlertModal from 'commonComponents/sweetAlertModal';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { updateReportStatus } from 'services/reports.services';
import ShiftVisitsStatus from 'src/app/components/obxComponents/ShiftVisitsStatus';
import RejectReportModal from 'src/app/obx/pages/schedules/shiftDetail/Activities/RejectReportModal';
import { HO_SITES_DETAIL, OBX_SITES } from 'src/app/router/constant/ROUTE';
import { ReactComponent as CheckIcon } from 'src/assets/svg/check.svg';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { fetchShiftActivitiesById } from 'src/services/duty.services';
import {
  dataReportCheckPointShiftSummary,
  dataReportShiftSummary,
  dataShiftTourReports,
  runsheetDayEndReport,
  siteReportSummary,
  toastSettings,
} from 'src/utils/constants';
import { calendarShiftStatusEnum, SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { findTourShiftStatus } from '..';
import { useStyles } from './activities.styles';
import Report from './Report';
// import Tours from './Tours';

let siteReportSummaryNew = { ...siteReportSummary };

const Activities = ({ shiftId, shiftDate, shiftType, hitId }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [shiftActivity, setShiftActivity] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAcceptModelModal, setShowAcceptModelModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showDrawerChange, setShowDrawer] = useState(false);
  const [isSummaryAvailable, setIsSummaryAvailable] = useState(false);
  const location = useLocation();
  const { id: paramId } = useParams();

  const isSitesModule =
    location.pathname?.includes(OBX_SITES) || location.pathname?.includes(HO_SITES_DETAIL);

  const getShiftActivities = async ({ shiftId, shiftDate }) => {
    try {
      setLoading(true);
      let siteId = null;
      if (paramId) {
        siteId = paramId;
        shiftDate = null;
      }

      const response = await fetchShiftActivitiesById({ shiftId, shiftDate, siteId });
      if (response?.statusCode === 200) {
        setLoading(false);
        setIsSummaryAvailable(response?.data?.shift?.isSummaryAvailable);

        const shiftDetail = response?.data?.shift?.reassignedShift || response?.data?.shift || {};
        const completedTours = shiftDetail?.tours?.reduce((acc, tour) => {
          return !!tour?.endedAt ? acc + 1 : acc;
        }, 0);
        const tourShiftStatus = findTourShiftStatus({
          tours: shiftDetail?.tours,
          shiftStatus: shiftDetail?.shiftStatus,
          endsAt: shiftDetail?.endsAt,
          totalTours: shiftDetail?.tours?.length,
        });

        if (paramId) {
          siteReportSummaryNew.siteId = paramId;
        }

        const visitMapped = shiftDetail?.visits
          ?.filter((visit) => {
            if (isSitesModule) {
              return visit.siteId == paramId && visit?.hitId == hitId;
            }
            return true;
          })
          ?.map((visit) => {
            return {
              title: visit?.tour?.title || '',
              reportId: visit?.tour?.reportId || '',
              siteId: visit?.siteId || '',
              status: visit?.tour?.reportId ? 'submitted' : 'notSubmitted',
              submittedAt: null,
              isVisits: true,
              siteName: visit?.siteName || '',
              visitedAt: visit?.visitedAt || null,
              visitType: visit.visitType,
            };
          });

        return setShiftActivity({
          ...shiftDetail,
          tourShiftStatus,
          totalTours: shiftDetail?.tours?.length,
          completedTours,
          visits: visitMapped,
        });
      }
      setShiftActivity({});
      setLoading(false);
    } catch (error) {
      console.log({ error });
      setLoading(false);
      setShiftActivity({});
    }
  };

  const updateReportStatusButtonClick = async (comments) => {
    try {
      // setDisabled(true);
      // setLoading(true);
      const body = !showAcceptModelModal
        ? {
            status: 'rejected',
            supervisorComments: comments,
          }
        : {
            status: 'accepted',
            supervisorComments: '',
          };
      const response = await updateReportStatus({
        reportId: selectedId,
        report: body,
      });
      if (response?.statusCode == 200) {
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        // fetchReport();
        setSelectedId(null);
      }
      setShowAcceptModelModal(false);
      setShowRejectModal(false);
      setShowDrawer((a) => !a);

      getShiftActivities({ shiftId, shiftDate });

      // setDisabled(false);
      // setLoading(false);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setShowAcceptModelModal(false);
      setShowRejectModal(false);
      setShowDrawer(false);
      // setDisabled(false);
      // setLoading(false);
    }
  };

  useEffect(() => {
    getShiftActivities({ shiftId, shiftDate });
  }, [shiftId, shiftDate]);

  return (
    <>
      {loading ? (
        <Box className={classes.activitiesSkeleton}>
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
        </Box>
      ) : (
        <Box className={classes.dutyDetailActivities}>
          {shiftActivity?.shiftType === SCHEDULE_DUTIES.PATROL &&
            [
              calendarShiftStatusEnum.NOT_STARTED,
              calendarShiftStatusEnum.IN_PROGRESS,
              calendarShiftStatusEnum.COMPLETED,
            ].includes(shiftActivity?.scheduleStatus) && (
              <>
                <Typography variant="h4" className={classes.dutyDetailActivitiesTitle}>
                  {t('obx.schedules.dutyDetail.activities.shiftProgress')}
                </Typography>
                <Box className={classes.dutyDetailActivitiesStatus}>
                  <ShiftVisitsStatus
                    {...{
                      completedTours: shiftActivity?.visitedHit,
                      status: shiftActivity?.scheduleStatus,
                      totalTours: shiftActivity?.totalHits,
                      isVisit: true,
                    }}
                  />
                </Box>
              </>
            )}
          {[SCHEDULE_DUTIES.DEDICATED, SCHEDULE_DUTIES.EXTRA].includes(
            shiftActivity?.shiftType,
          ) && (
            <>
              <Typography variant="h4" className={classes.dutyDetailActivitiesTitle}>
                {t('obx.schedules.dutyDetail.activities.shiftProgress')}
              </Typography>
              <Box className={classes.dutyDetailActivitiesStatus}>
                <ShiftVisitsStatus
                  {...{
                    startsAt: shiftActivity?.startsAt,
                    endsAt: shiftActivity?.endsAt,
                    status: shiftActivity?.tourShiftStatus,
                    completedTours: shiftActivity?.completedTours,
                    totalTours: shiftActivity?.totalTours,
                  }}
                />
              </Box>
            </>
          )}

          {isObjectEmpty(shiftActivity) && (
            <Box className={classes.dutyDetailLogsCentered}>
              <NoRecordFound type="listing" data={[]} />
            </Box>
          )}

          {shiftActivity?.reports?.equipmentInspection?.title &&
            shiftType !== SCHEDULE_DUTIES.HIT && (
              <Box className={classes.dutyDetailActivitiesReports}>
                <Report
                  report={shiftActivity?.reports?.equipmentInspection || {}}
                  shiftId={null}
                  type={'equipmentInspection'}
                  setShowRejectModal={setShowRejectModal}
                  setShowAcceptModelModal={setShowAcceptModelModal}
                  setSelectedId={setSelectedId}
                  setShowDrawer={setShowDrawer}
                  showDrawerChange={showDrawerChange}
                  showEdit={false}
                />
              </Box>
            )}
          {shiftActivity?.reports?.vehicleInspection?.title &&
            shiftType !== SCHEDULE_DUTIES.HIT && (
              <Box className={classes.dutyDetailActivitiesReports}>
                <Report
                  report={shiftActivity?.reports?.vehicleInspection || {}}
                  shiftId={null}
                  type={'vehicleInspection'}
                  setShowRejectModal={setShowRejectModal}
                  setShowAcceptModelModal={setShowAcceptModelModal}
                  setSelectedId={setSelectedId}
                  setShowDrawer={setShowDrawer}
                  showDrawerChange={showDrawerChange}
                  showEdit={false}
                />
              </Box>
            )}

          {/* {shiftActivity?.reports?.extraReport?.id && (
        <Box className={classes.dutyDetailActivitiesReports}>
          <Report report={shiftData?.reports?.extraReport || {}} />
        </Box>
      )} */}

          {/*{shiftActivity?.reports?.tourReports?.length > 0 && (*/}
          {/*  <Box className={classes.dutyDetailActivitiesTours}>*/}
          {/*    <Tours*/}
          {/*      tours={shiftActivity?.reports?.tourReports}*/}
          {/*      shiftId={shiftId}*/}
          {/*      type={null}*/}
          {/*      setShowRejectModal={setShowRejectModal}*/}
          {/*      setShowAcceptModelModal={setShowAcceptModelModal}*/}
          {/*      setSelectedId={setSelectedId}*/}
          {/*      setShowDrawer={setShowDrawer}*/}
          {/*      showDrawerChange={showDrawerChange}*/}
          {/*    />*/}
          {/*  </Box>*/}
          {/*)}*/}

          {/*{shiftActivity?.reports?.incidentReport?.length > 0 && (*/}
          {/*  <Box className={classes.dutyDetailActivitiesTours}>*/}
          {/*    <Tours*/}
          {/*      tours={shiftActivity?.reports?.incidentReport}*/}
          {/*      shiftId={shiftId}*/}
          {/*      type={'incidentReport'}*/}
          {/*      setShowRejectModal={setShowRejectModal}*/}
          {/*      setShowAcceptModelModal={setShowAcceptModelModal}*/}
          {/*      setSelectedId={setSelectedId}*/}
          {/*      setShowDrawer={setShowDrawer}*/}
          {/*      showDrawerChange={showDrawerChange}*/}
          {/*    />*/}
          {/*  </Box>*/}
          {/*)}*/}

          {shiftActivity?.reports?.shiftDayEndReport?.title &&
            shiftType !== SCHEDULE_DUTIES.HIT && (
              <Box className={classes.dutyDetailActivitiesReports}>
                <Report
                  report={shiftActivity?.reports?.shiftDayEndReport}
                  shiftId={null}
                  type={'shiftDayEndReport'}
                  setShowRejectModal={setShowRejectModal}
                  setShowAcceptModelModal={setShowAcceptModelModal}
                  setSelectedId={setSelectedId}
                  setShowDrawer={setShowDrawer}
                  showDrawerChange={showDrawerChange}
                  showEdit={false}
                />
              </Box>
            )}

          {/* Visits   */}
          {shiftActivity?.visits?.map((visit, index) => {
            return (
              <Box key={index} className={classes.dutyDetailActivitiesReports}>
                <Report
                  report={visit}
                  shiftId={null}
                  type={
                    visit?.visitType === SCHEDULE_DUTIES.DISPATCH ? 'dispatch' : 'siteHitReport'
                  }
                  setShowRejectModal={setShowRejectModal}
                  setShowAcceptModelModal={setShowAcceptModelModal}
                  setSelectedId={setSelectedId}
                  setShowDrawer={setShowDrawer}
                  showDrawerChange={showDrawerChange}
                  showEdit={true}
                />
              </Box>
            );
          })}

          {(shiftActivity?.shiftStatus === 'shiftEnded' ||
            shiftActivity?.shiftStatus === 'shiftAutoEnded') &&
            (shiftActivity?.shiftType === SCHEDULE_DUTIES.DEDICATED ||
              shiftActivity?.shiftType === SCHEDULE_DUTIES.EXTRA) && (
              <Box className={classes.dutyDetailActivitiesReports}>
                <Report
                  report={dataShiftTourReports}
                  shiftId={shiftId}
                  type={'tourReports'}
                  setShowRejectModal={setShowRejectModal}
                  setShowAcceptModelModal={setShowAcceptModelModal}
                  setSelectedId={setSelectedId}
                  setShowDrawer={setShowDrawer}
                  showDrawerChange={showDrawerChange}
                  showEdit={true}
                />
              </Box>
            )}

          {(shiftActivity?.shiftStatus === 'shiftEnded' ||
            shiftActivity?.shiftStatus === 'shiftAutoEnded') &&
            shiftActivity?.shiftType === SCHEDULE_DUTIES.PATROL &&
            !paramId && (
              <Box className={classes.dutyDetailActivitiesReports}>
                <Report
                  report={runsheetDayEndReport}
                  shiftId={shiftId}
                  type={'runsheetSummaryReport'}
                  setShowRejectModal={setShowRejectModal}
                  setShowAcceptModelModal={setShowAcceptModelModal}
                  setSelectedId={setSelectedId}
                  setShowDrawer={setShowDrawer}
                  showDrawerChange={showDrawerChange}
                  showEdit={false}
                />
              </Box>
            )}

          {isSummaryAvailable ? (
            <>
              {shiftType !== SCHEDULE_DUTIES.PATROL && shiftType !== SCHEDULE_DUTIES.HIT && (
                <>
                  <Box className={classes.dutyDetailActivitiesReports}>
                    <Report
                      report={dataReportCheckPointShiftSummary}
                      shiftId={shiftId}
                      type={'checkpointSummaryReport'}
                      setShowRejectModal={setShowRejectModal}
                      setShowAcceptModelModal={setShowAcceptModelModal}
                      setSelectedId={setSelectedId}
                      setShowDrawer={setShowDrawer}
                      showDrawerChange={showDrawerChange}
                      showEdit={false}
                    />
                  </Box>
                  <Box className={classes.dutyDetailActivitiesReports}>
                    <Report
                      report={dataReportShiftSummary}
                      shiftId={shiftId}
                      type={'shiftSummaryReport'}
                      setShowRejectModal={setShowRejectModal}
                      setShowAcceptModelModal={setShowAcceptModelModal}
                      setSelectedId={setSelectedId}
                      setShowDrawer={setShowDrawer}
                      showDrawerChange={showDrawerChange}
                      showEdit={false}
                    />
                  </Box>
                </>
              )}
              {shiftType === SCHEDULE_DUTIES.PATROL && paramId && (
                <Box className={classes.dutyDetailActivitiesReports}>
                  <Report
                    report={siteReportSummaryNew}
                    shiftId={shiftId}
                    type={'siteSummaryReport'}
                    setShowRejectModal={setShowRejectModal}
                    setShowAcceptModelModal={setShowAcceptModelModal}
                    setSelectedId={setSelectedId}
                    setShowDrawer={setShowDrawer}
                    showDrawerChange={showDrawerChange}
                    showEdit={false}
                  />
                </Box>
              )}
            </>
          ) : (
            ''
          )}
          <SweetAlertModal
            customClass={{
              confirmButton: classes.sweetAlertConfirmBlueButton,
            }}
            type="warning"
            title={t('obx.schedules.dutyDetail.acceptRejectReport.approveReport')}
            text={t('obx.schedules.dutyDetail.acceptRejectReport.approveReportDesc')}
            cancelButtonText={t('links.cancel')}
            confirmButtonText={t('obx.schedules.dutyDetail.acceptRejectReport.approveReport')}
            show={showAcceptModelModal}
            handleConfirmButton={updateReportStatusButtonClick}
            handleCancelButton={() => setShowAcceptModelModal(false)}
            icon={<CheckIcon />}
          />
          {/* Reject Modal */}
          {showRejectModal && (
            <RejectReportModal
              open={showRejectModal}
              handleClose={() => setShowRejectModal(false)}
              onSubmit={updateReportStatusButtonClick}
              // isLoading={rejectLeaveLoader}
            />
          )}
        </Box>
      )}
    </>
  );
};

Activities.propTypes = {
  shiftId: PropTypes.string,
  shiftType: PropTypes.string,
  shiftDate: PropTypes.string,
  hitId: PropTypes.string,
};
export default Activities;
