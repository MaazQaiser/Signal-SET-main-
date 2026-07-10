import { Avatar, Box, Button, InputLabel, Skeleton, Tooltip, Typography } from '@mui/material';
import LocationPlaceHolder from 'assets/images/LocationPlaceHolder.jpeg';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DirectionsMap from 'src/app/components/common/directionsMap';
import ShiftVisitsStatus from 'src/app/components/obxComponents/ShiftVisitsStatus';
import { ReactComponent as AddedHitIcon } from 'src/assets/svg/AddedHitIcon.svg';
import { ReactComponent as AssignCarIcon } from 'src/assets/svg/AssignCarIcon.svg';
import { ReactComponent as RunsheetVehicle } from 'src/assets/svg/bluecar.svg';
import { ReactComponent as CoveredRunsheetHit } from 'src/assets/svg/CoveredRunsheetHit.svg';
import { ReactComponent as EditIcon } from 'src/assets/svg/edit-icon.svg';
import { ReactComponent as ExistingHitIcon } from 'src/assets/svg/ExistingHitIcon.svg';
import { ReactComponent as FranchiseIcon } from 'src/assets/svg/FranchiseIcon.svg';
import { ReactComponent as RunsheetIcon } from 'src/assets/svg/RunsheetIcon.svg';
import { ReactComponent as StartingPointIcon } from 'src/assets/svg/StartingPointIcon.svg';
import { ReactComponent as UnassignedOfficerIcon } from 'src/assets/svg/UnassignedOfficerIcon.svg';
import {
  convertMetersToMiles,
  convertRunSheetMinutesToHoursAndMinutes,
  isObjectEmpty,
  mapRunSheetData,
} from 'src/helper/utilityFunctions';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';
import { truncateString } from 'src/utils/string/truncate';

import HitsAccordionListing from '../../../runSheets/components/hitsAccordionListing';
import { ScheduleStatusChips } from '../../components/scheduleStatusChips';
import { getCurrentStandardTimeInIsoWrtTimezone } from '../../helper';
import { ASSIGN_RUNSHEET_OPTIONS } from '..';
import { useStyles } from './runsheetDetailsStyles';

const RunsheetDetail = ({ shiftData, setIsAssign, loading, hideButtons = false }) => {
  const classes = useStyles();
  const [visitedPoints, setVisitedPoints] = useState({});
  const [runsheetDetails, setRunsheetDetails] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    if (isObjectEmpty(visitedPoints) && !isObjectEmpty(shiftData)) {
      const points = {};
      shiftData?.runsheetDetails?.hits?.forEach((hit) => {
        points[hit?.hitId] = hit?.isVisited;
      });
      setVisitedPoints(points);
      setRunsheetDetails(
        mapRunSheetData({
          ...shiftData?.runsheetDetails,
          pathData: shiftData?.pathData,
          startEndLocation: {
            ...shiftData?.runsheetDetails?.startEndLocation,
            position: {
              lat: shiftData?.runsheetDetails?.startEndLocation?.lat,
              lng: shiftData?.runsheetDetails?.startEndLocation?.lng,
            },
          },
        }),
      );
    }
  }, [shiftData]);

  const finalVisitSet = useMemo(() => {
    return shiftData?.runsheetDetails?.hits?.length
      ? shiftData?.runsheetDetails?.hits.filter((data) => data?.status !== 'deleted')
      : shiftData?.runsheetDetails?.hits;
  }, [shiftData?.runsheetDetails?.hits]);

  const totalDistance = `${convertMetersToMiles(shiftData?.pathData?.[0]?.totalDistance || 0)}`;

  const converedDistance = shiftData?.runsheetDetails?.hits?.reduce((acc, obj) => {
    const foundHit = shiftData?.pathData?.find(
      (hit) => hit?.hitId === obj?.hitId && obj?.isVisited,
    );

    return foundHit ? acc + foundHit?.distance?.value : acc;
  }, 0);

  const totalTime = shiftData?.pathData?.[0]?.totalDuration;
  const timeTravelled = shiftData?.runsheetDetails?.hits?.reduce((acc, obj) => {
    const foundHit = shiftData?.pathData?.find(
      (hit) => hit?.hitId === obj?.hitId && obj?.isVisited,
    );
    return foundHit ? acc + foundHit?.duration?.value : acc;
  }, 0);

  const finalTimeVal = `${convertRunSheetMinutesToHoursAndMinutes(timeTravelled) || `${0}s`} / ${convertRunSheetMinutesToHoursAndMinutes(totalTime) || `${0}s`}`;

  const isPastRunsheet = getCurrentStandardTimeInIsoWrtTimezone() > shiftData?.endsAt;
  const disableAssignment =
    isPastRunsheet ||
    [calendarShiftStatusEnum.IN_PROGRESS, calendarShiftStatusEnum.COMPLETED].includes(
      shiftData?.scheduleStatus,
    );

  return (
    <Box>
      <Box className={classes.hitCardWrapper}>
        <Box className={classes.HitStats}>
          <Box className={classes.hitItem}>
            <Typography variant="body3" className={classes.hitItemTitle}>
              {t('obx.schedules.dutyDetail.runsheetDetail.hitsDone')}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" className={classes.fieldSkelton} />
            ) : (
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {shiftData?.visitedHit + ' / ' + shiftData?.totalHits}
              </Typography>
            )}
          </Box>
          <Box className={classes.hitItem}>
            <Typography variant="body3" className={classes.hitItemTitle}>
              {t('obx.schedules.dutyDetail.runsheetDetail.officer')}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" className={classes.fieldSkelton} />
            ) : (
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {shiftData?.officer?.name ? (
                  <Box className={classes.nameAvatar}>
                    <Avatar alt={shiftData?.officer?.name} src={shiftData?.officer?.imageUrl} />

                    {shiftData?.officer?.name?.length > 12 ? (
                      <>
                        <Tooltip title={shiftData?.officer?.name} arrow>
                          {truncateString(shiftData?.officer?.name, 12) || NA}
                        </Tooltip>
                      </>
                    ) : (
                      <> {shiftData?.officer?.name}</>
                    )}
                    {!disableAssignment && !hideButtons && (
                      <EditIcon onClick={() => setIsAssign(ASSIGN_RUNSHEET_OPTIONS.OFFICER)} />
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Button
                      onClick={() => setIsAssign(ASSIGN_RUNSHEET_OPTIONS.OFFICER)}
                      // className={classes.assignButton}
                      className={`${classes.assignButton} ${disableAssignment ? classes.disable : ''}`}
                      disableRipple
                      startIcon={<UnassignedOfficerIcon />}
                      variant="onlyText"
                      disabled={disableAssignment}
                    >
                      {t('obx.schedules.dutyDetail.runsheetDetail.assign')}
                    </Button>
                  </Box>
                )}
              </Typography>
            )}
          </Box>
          <Box className={classes.hitItem}>
            <Typography variant="body3" className={classes.hitItemTitle}>
              {t('obx.schedules.dutyDetail.runsheetDetail.vehicle')}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" className={classes.fieldSkelton} />
            ) : (
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {shiftData?.vehicle?.name ? (
                  <Box className={classes.nameAvatar}>
                    <Avatar alt="Cindy Baker" src={shiftData?.vehicle?.images?.[0]?.url} />

                    {shiftData?.vehicle?.name?.length > 12 ? (
                      <>
                        <Tooltip title={shiftData?.vehicle?.name} arrow>
                          {truncateString(shiftData?.vehicle?.name, 12) || NA}
                        </Tooltip>
                      </>
                    ) : (
                      <> {shiftData?.vehicle?.name}</>
                    )}
                    {!disableAssignment && !hideButtons && (
                      <EditIcon onClick={() => setIsAssign(ASSIGN_RUNSHEET_OPTIONS.VEHICLE)} />
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Button
                      onClick={() => setIsAssign(ASSIGN_RUNSHEET_OPTIONS.VEHICLE)}
                      // className={classes.assignButton}
                      className={`${classes.assignButton} ${disableAssignment ? classes.disable : ''}`}
                      disableRipple
                      startIcon={<AssignCarIcon />}
                      variant="onlyText"
                      disabled={disableAssignment}
                    >
                      {t('obx.schedules.dutyDetail.runsheetDetail.assign')}
                    </Button>
                  </Box>
                )}
              </Typography>
            )}
          </Box>
        </Box>
        <Box className={classes.HitStats}>
          <Box className={classes.hitItem}>
            <Typography variant="body3" className={classes.hitItemTitle}>
              {t('obx.schedules.dutyDetail.runsheetDetail.spentTime')}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" className={classes.fieldSkelton} />
            ) : (
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {finalTimeVal}
              </Typography>
            )}
          </Box>
          <Box className={classes.hitItem}>
            <Typography variant="body3" className={classes.hitItemTitle}>
              {t('obx.schedules.dutyDetail.runsheetDetail.coveredDistance')}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" className={classes.fieldSkelton} />
            ) : (
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {`${
                  converedDistance ? convertMetersToMiles(converedDistance) : 0
                } / ${totalDistance} `}
                {t('obx.schedules.dutyDetail.runsheetDetail.milesUnit')}
              </Typography>
            )}
          </Box>
          <Box className={classes.hitItem}>
            <Typography variant="body3" className={classes.hitItemTitle}>
              {t('obx.schedules.dutyDetail.runsheetDetail.status')}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" className={classes.fieldSkelton} />
            ) : shiftData?.scheduleStatus ? (
              <ScheduleStatusChips scheduleStatus={shiftData?.scheduleStatus} />
            ) : (
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {t('commonText.nA')}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      <Box className={classes.shiftProgressWrapper}>
        {[
          calendarShiftStatusEnum.NOT_STARTED,
          calendarShiftStatusEnum.IN_PROGRESS,
          calendarShiftStatusEnum.COMPLETED,
        ].includes(shiftData?.scheduleStatus) && (
          <ShiftVisitsStatus
            {...{
              completedTours: shiftData?.visitedHit,
              status: shiftData?.scheduleStatus,
              totalTours: shiftData?.totalHits,
              isVisit: true,
            }}
          />
        )}
      </Box>
      <RunsheetMap
        runsheetDetails={runsheetDetails}
        visitedPoints={visitedPoints}
        finalVisitSet={finalVisitSet}
      />
      <RunsheetSites
        runsheetDetails={runsheetDetails}
        shiftDetails={shiftData}
        visitedPoints={visitedPoints}
        isRunsheetLoading={loading}
      />
    </Box>
  );
};

export default RunsheetDetail;

const RunsheetMap = ({ runsheetDetails, visitedPoints, finalVisitSet }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box>
      <Box className={classes.mapWrapper}>
        <DirectionsMap
          waypoints={finalVisitSet || []}
          origin={runsheetDetails?.startEndLocation || {}}
          destination={runsheetDetails?.startEndLocation || {}}
          showPolyineAndMarkersSeparately={true}
          center={runsheetDetails?.startEndLocation?.position || {}}
          pathData={runsheetDetails?.pathData || []}
          onlyShowPolyline={true}
          showVisitedPoints={true}
          visitedPoints={visitedPoints}
        />
      </Box>
      <Box className={classes.bottomArea}>
        <Button disableRipple startIcon={<CoveredRunsheetHit />} variant="onlyText">
          {t('obx.runsheet.covered')}
        </Button>
        <Button disableRipple startIcon={<RunsheetIcon />} variant="onlyText">
          {t('obx.runsheet.runsheet')}
        </Button>
        <Button disableRipple startIcon={<ExistingHitIcon />} variant="onlyText">
          {t('obx.runsheet.unvisitedHit')}
        </Button>
        <Button disableRipple startIcon={<AddedHitIcon />} variant="onlyText">
          {t('obx.runsheet.visitedHit')}
        </Button>
        <Button disableRipple startIcon={<StartingPointIcon />} variant="onlyText">
          {t('obx.runsheet.startingEndingPoint')}
        </Button>
        <Button disableRipple startIcon={<RunsheetVehicle />} variant="onlyText">
          {t('obx.runsheet.vehicle')}
        </Button>
        <Button disableRipple startIcon={<FranchiseIcon />} variant="onlyText">
          {t('obx.runsheet.franchise')}
        </Button>
      </Box>
    </Box>
  );
};

const RunsheetSites = ({
  runsheetDetails,
  visitedPoints,
  isRunsheetLoading,
  shiftDetails = {},
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Box>
      {isRunsheetLoading ? (
        <Box className={classes.loaderBox}>
          <Skeleton variant="rectangular" />
          <Skeleton variant="rectangular" />
          <Skeleton variant="rectangular" />
        </Box>
      ) : (
        <Box>
          {(runsheetDetails?.startEndLocation?.address ||
            runsheetDetails?.startEndLocation?.name) && (
            <Box>
              <InputLabel htmlFor="runsheetName">
                {t('obx.runsheet.startingEndingLocation')}
              </InputLabel>

              <Box component="span" className={classes.editButtonInner}>
                <img
                  src={runsheetDetails?.startEndLocation?.siteImage || LocationPlaceHolder}
                  alt=""
                />{' '}
                {runsheetDetails?.startEndLocation?.address ||
                  runsheetDetails?.startEndLocation?.name}
              </Box>
            </Box>
          )}
          <HitsAccordionListing
            showOrder={true}
            showMissedHits={true}
            shiftDetails={shiftDetails}
            state={runsheetDetails}
            hitsList={runsheetDetails?.hits}
            visitedPoints={visitedPoints}
            showVisitedPoints={true}
          />
        </Box>
      )}
    </Box>
  );
};

RunsheetDetail.propTypes = {
  shiftData: PropTypes.object,
  setIsAssign: PropTypes.func,
  loading: PropTypes.bool,
  hideButtons: PropTypes.bool,
};

RunsheetMap.propTypes = {
  runsheetDetails: PropTypes.shape({
    runsheetName: PropTypes.string,
    startsAt: PropTypes.object,
    startDate: PropTypes.object,
    endsAt: PropTypes.object, // Ensure this line is present
    startEndLocation: PropTypes.object,
    dutyDay: PropTypes.array,
    visitSet: PropTypes.array,
    pathData: PropTypes.array,
    hits: PropTypes.array,
  }),
  visitedPoints: PropTypes.array,
  finalVisitSet: PropTypes.array,
};

RunsheetSites.propTypes = {
  runsheetDetails: PropTypes.shape({
    runsheetName: PropTypes.string,
    startsAt: PropTypes.object,
    startDate: PropTypes.object,
    endsAt: PropTypes.object, // Ensure this line is present
    startEndLocation: PropTypes.object,
    dutyDay: PropTypes.array,
    visitSet: PropTypes.array,
    pathData: PropTypes.array,
    hits: PropTypes.array,
  }),
  shiftDetails: PropTypes.object,
  visitedPoints: PropTypes.array,
  isRunsheetLoading: PropTypes.bool,
};
