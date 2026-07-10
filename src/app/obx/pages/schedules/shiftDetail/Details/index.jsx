import { Avatar, Box, Skeleton, Switch, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ShiftVisitsStatus from 'src/app/components/obxComponents/ShiftVisitsStatus';
import { ReactComponent as CheckoutShiftIcon } from 'src/assets/svg/CheckoutShiftIcon.svg';
import {
  convertMinutesToHMFormat,
  formatDate,
  isObjectEmpty,
  timeFormat12h,
} from 'src/helper/utilityFunctions';
import { toggleAutoCheckoutStatus } from 'src/services/runsheet.services';
import { toastSettings } from 'src/utils/constants';

import HitsAccordionListing from '../../../runSheets/components/hitsAccordionListing';
import { dayjsWithStandardOffset } from '../../helper';
import { useStyles } from './details.styles';

const Details = ({ shiftData, loading, loadInstructions, shiftId }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [checkpoints, setCheckpoints] = useState([]);
  const [autoShiftToggle, setAutoShiftToggle] = useState(null);

  useEffect(() => {
    if (shiftData?.tours) {
      const checkpoints = shiftData?.tours?.reduce((acc, tour) => {
        acc.push(...(tour?.checkpoints || []));
        return acc;
      }, []);
      setCheckpoints(checkpoints);
    }
    setAutoShiftToggle(shiftData?.autoClockoutOff);
  }, [shiftData]);

  const toggleAutoShift = async () => {
    try {
      if (!shiftId) return;
      const response = await toggleAutoCheckoutStatus(shiftId);
      if (response && response?.statusCode === 200) {
        setAutoShiftToggle(!autoShiftToggle);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const dispatchTours = shiftData?.tours?.filter((tour) => !!tour.dispatchId) || [];

  return (
    <>
      <Box className={classes.dutyDetailTabs}>
        {loading ? (
          <Box className={classes.detailsSkeletonWrapper}>
            <Box className={classes.detailsSkeletonTitle}>
              <Skeleton />
            </Box>
            <Box className={classes.detailsSkeletonContent}>
              <Skeleton />
              <Skeleton />
            </Box>
            <Box className={classes.detailsSkeletonContent}>
              <Skeleton />
              <Skeleton />
            </Box>
            <Box className={classes.detailsSkeletonContent}>
              <Skeleton />
              <Skeleton />
            </Box>
            <Box className={classes.detailsSkeletonCard}>
              <Skeleton />
            </Box>
            <Box className={classes.detailsSkeletonCard}>
              <Skeleton />
            </Box>
          </Box>
        ) : (
          <>
            <Box className={classes.dutyDetailGI}>
              <Typography variant="h4" className={classes.dutyDetailGITitle}>
                {t('obx.schedules.dutyDetail.detail.generalInfo')}
              </Typography>
              <Box className={classes.dutyDetailGIList}>
                <Box className={classes.dutyDetailGIListItem}>
                  <Typography className={classes.dutyDetailGIListItemTitle} variant="subtitle2">
                    {t('obx.schedules.dutyDetail.detail.tours')}:
                  </Typography>
                  <Typography className={classes.dutyDetailGIListItemText} variant="subtitle1">
                    {shiftData?.totalTours
                      ? t('obx.schedules.dutyDetail.detail.toursCompletionRatio', {
                          completedTours: shiftData?.completedTours,
                          totalNoOfTours: shiftData?.totalTours,
                        })
                      : 0}
                  </Typography>
                </Box>

                <Box className={classes.dutyDetailGIListItem}>
                  <Typography className={classes.dutyDetailGIListItemTitle} variant="subtitle2">
                    {t('obx.schedules.dutyDetail.detail.dutyTime')}:
                  </Typography>
                  <Typography className={classes.dutyDetailGIListItemText} variant="subtitle1">
                    {convertMinutesToHMFormat(shiftData?.totalHours * 60)}
                  </Typography>
                </Box>
                <Box className={classes.dutyDetailGIListItem}>
                  <Typography className={classes.dutyDetailGIListItemTitle} variant="subtitle2">
                    {t('obx.schedules.dutyDetail.detail.assignedTo')}:
                  </Typography>
                  <Box className={classes.dutyDetailGIListPerson}>
                    <Avatar
                      className={classes.dutyDetailGIListAvatar}
                      alt={''}
                      src={shiftData?.officer?.imageUrl}
                    />
                    <Typography className={classes.dutyDetailGIListItemText} variant="subtitle1">
                      {shiftData?.officer?.name}
                    </Typography>
                  </Box>
                </Box>
                {/* <Box className={classes.dutyDetailGIListItem}>
            <Typography className={classes.dutyDetailGIListItemTitle} variant="subtitle2">
              {t('obx.schedules.dutyDetail.detail.payRate')}:
            </Typography>
            <Typography className={classes.dutyDetailGIListItemText} variant="subtitle1">
              ${shiftData?.hourlyRate}/{t('commonText.perHour')}
            </Typography>
          </Box> */}
              </Box>

              <ShiftVisitsStatus
                {...{
                  startsAt: shiftData?.startsAt,
                  endsAt: shiftData?.endsAt,
                  status: shiftData?.tourShiftStatus,
                  completedTours: shiftData?.completedTours,
                  totalTours: shiftData?.totalTours,
                }}
              />
            </Box>

            {/* Reassigned Officer Detail */}
            {shiftData?.reassignedShift && (
              <Box>
                <Box className={classes.reassignedShift}>
                  <Typography variant="subtitle2" className={classes.reassignedShiftTitle}>
                    {t('obx.schedules.dutyDetail.detail.reassignedTo')}:
                  </Typography>
                  <Box className={classes.reassignedShiftDetail}>
                    <Avatar
                      src={shiftData?.reassignedShift?.officer?.imageUrl}
                      className={classes.reassignedShiftAvatar}
                    />
                    <Typography variant="body2" className={classes.reassignedShiftText}>
                      {shiftData?.reassignedShift?.officer?.name} •{' '}
                      {formatDate(dayjsWithStandardOffset(shiftData?.reassignedShift?.startsAt))} •{' '}
                      {timeFormat12h(shiftData?.reassignedShift?.startsAt, true)}
                    </Typography>
                  </Box>
                </Box>
                <ShiftVisitsStatus
                  {...{
                    startsAt: shiftData?.reassignedShift?.startsAt,
                    endsAt: shiftData?.reassignedShift?.endsAt,
                    status: shiftData?.reassignedShift?.reassignedTourShiftStatus,
                    completedTours: shiftData?.reassignedShift?.completedTours,
                    totalTours: shiftData?.reassignedShift?.totalTours,
                  }}
                />
              </Box>
            )}

            {autoShiftToggle !== null && (
              <Box className={classes.autoCheckout}>
                <Box className={classes.autoLeft}>
                  <CheckoutShiftIcon />
                  <Typography variant="h5">{t('obx.schedules.autoClockoutShift')}</Typography>
                </Box>
                <Box className={classes.autoRight}>
                  <Switch checked={!autoShiftToggle} onChange={toggleAutoShift} />
                </Box>
              </Box>
            )}

            {dispatchTours?.length ? (
              <>
                <Typography variant="h4" className={classes.dutyDetailGITitle}>
                  {t('obx.schedules.dutyDetail.dispatchTour')}
                </Typography>
                <HitsAccordionListing
                  showOrder={true}
                  showMissedHits={false}
                  shiftDetails={shiftData}
                  state={shiftData}
                  hitsList={dispatchTours}
                  showVisitedPoints={true}
                  isDispatched={true}
                />
              </>
            ) : null}
            {checkpoints && checkpoints?.length > 0 && (
              <>
                <Typography variant="h4" className={classes.dutyDetailGITitle}>
                  {t('obx.schedules.dutyDetail.detail.checkpoints')}:
                </Typography>
                <Box className={classes.dutyDetailCheckpoints}>
                  {checkpoints?.map((checkpoint) => (
                    <Box key={checkpoint?.id} className={classes.dutyDetailCheckpoint}>
                      {checkpoint?.imageUrl ? (
                        <img
                          src={checkpoint?.imageUrl}
                          className={classes.dutyDetailCheckpointImage}
                          alt="device"
                        />
                      ) : (
                        <div className={classes.dutyDetailCheckpointImage}></div>
                      )}
                      <Box className={classes.dutyDetailCheckpointDetail}>
                        <Typography className={classes.dutyDetailCheckpointTitle} variant="h4">
                          {checkpoint?.checkpointType}
                        </Typography>
                        <Typography
                          className={classes.dutyDetailCheckpointText}
                          variant="subtitle3"
                        >
                          {checkpoint?.location?.locationName}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </>
        )}

        {loadInstructions ? (
          <Box className={classes.detailsSkeletonWrapper}>
            <Box className={classes.detailsSkeletonCard}>
              <Skeleton />
            </Box>
          </Box>
        ) : (
          shiftData?.instruction?.content && (
            <Box className={classes.dutyDetailInstructions}>
              <Typography variant="h4" className={classes.dutyDetailGITitle}>
                {t('obx.schedules.dutyDetail.detail.instructions')}:
              </Typography>

              {!isObjectEmpty(shiftData?.instruction) && (
                <>
                  <Box
                    className={classes.instructionContent}
                    dangerouslySetInnerHTML={{
                      __html: shiftData?.instruction?.content,
                    }}
                  />
                </>
              )}
            </Box>
          )
        )}
      </Box>
    </>
  );
};

Details.propTypes = {
  shiftData: PropTypes.object,
  loading: PropTypes.bool,
  loadInstructions: PropTypes.bool,
  shiftId: PropTypes.string,
};

export default Details;
