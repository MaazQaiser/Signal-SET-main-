import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import { ReactComponent as BriefcaseIcon } from 'assets/svg/briefcase.svg';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg';
import { ReactComponent as CalendarIcon } from 'assets/svg/DedicatedDuty/calendar.svg';
import { ReactComponent as DurationIcon } from 'assets/svg/DedicatedDuty/durationIcon.svg';
import { ReactComponent as ClockIcon } from 'assets/svg/DedicatedDuty/schedule.svg';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import {
  convertMinutesToHMFormat,
  formatDate,
  getDaysStringFromNumbers,
  timeFormat12h,
} from 'src/helper/utilityFunctions';
import { DRAWER_TYPE } from 'src/utils/constants/schedules';

import { sortDays } from '..';
import { useStyles } from './assignmentSideDrawer.styles';

const Layout = ({
  drawerData,
  changeOnlyDrawerType,
  closeSideDrawer,
  handleSubmit,
  children,
  clearTemplateStates,
  shiftDetail,
  loading,
  disableActionBtn,
  isPatrol,
  title,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const headerTitle = {
    [DRAWER_TYPE.ASSIGN]: t('obx.schedules.assignDedicatedDuty.assignShift.title.shift'),
    [DRAWER_TYPE.TOUR_TEMPLATE]: t(
      'obx.schedules.assignDedicatedDuty.assignShift.title.tourTemplate',
    ),
    [DRAWER_TYPE.REASSIGNMENT]: t(
      'obx.schedules.assignDedicatedDuty.assignShift.title.reassignment',
    ),
    [DRAWER_TYPE.EDIT_REASSIGNMENT]: t(
      'obx.schedules.assignDedicatedDuty.assignShift.title.editReassignment',
    ),
    [DRAWER_TYPE.SPLIT]: shiftDetail?.name,
    [DRAWER_TYPE.TOUR_ASSIGNMENT]: t(
      'obx.schedules.assignDedicatedDuty.assignShift.title.tourAssignment',
    ),
    [DRAWER_TYPE.TOUR_TEMPLATE_PATROL]: t(
      'obx.schedules.assignDedicatedDuty.assignShift.title.tourTemplate',
    ),
  };

  return (
    <Box className={classes.assignDrawer}>
      {/* Header */}
      <Box className={classes.assignDrawerHeader}>
        <Box className={classes.assignDrawerHeaderTop}>
          <Box className={classes.assignDrawerHeaderTours}>
            {[
              DRAWER_TYPE.TOUR_TEMPLATE,
              DRAWER_TYPE.REASSIGNMENT,
              DRAWER_TYPE.EDIT_REASSIGNMENT,
              DRAWER_TYPE.TOUR_TEMPLATE_PATROL,
            ].includes(drawerData?.type) && (
              <Button
                variant="secondaryGrey"
                className={classes.assignDrawerHeaderToursBtn}
                onClick={() => {
                  clearTemplateStates();
                  changeOnlyDrawerType?.(
                    isPatrol ? DRAWER_TYPE.TOUR_ASSIGNMENT : DRAWER_TYPE.ASSIGN,
                  )?.();
                }}
              >
                <ArrowBackIcon />
              </Button>
            )}
            {loading ? (
              <Skeleton animation="wave" className={classes.titleSkeleton} />
            ) : (
              <Typography variant="h3" className={classes.assignDrawerHeaderTitle}>
                {title || headerTitle[drawerData?.type]}
              </Typography>
            )}
          </Box>

          <Box className={classes.assignDrawerHeaderTopRight}>
            <Button
              disableRipple
              className={classes.assignDrawerHeaderCloseBtn}
              onClick={() => closeSideDrawer()}
            >
              <CloseIcon />
            </Button>
          </Box>
        </Box>
        {!isPatrol && (
          <>
            {loading ? (
              <Box className={classes.assignDrawerHeaderBottomSkeleton}>
                <Skeleton animation="wave" />
                <Skeleton animation="wave" />
                <Skeleton animation="wave" />
                <Skeleton animation="wave" />
              </Box>
            ) : (
              <Box className={classes.assignDrawerHeaderBottom}>
                <Box className={classes.assignDrawerHeaderBottomContent}>
                  <ClockIcon className={classes.assignDrawerCalendarIcon} />
                  <Typography className={classes.assignDrawerHeaderBottomText} variant="body2">
                    {timeFormat12h(shiftDetail?.shiftStartTime, true) +
                      '  - ' +
                      timeFormat12h(shiftDetail?.shiftEndTime, true)}
                  </Typography>
                </Box>
                <Box className={classes.assignDrawerHeaderBottomContent}>
                  <DurationIcon />
                  <Typography className={classes.assignDrawerHeaderBottomText} variant="body2">
                    {convertMinutesToHMFormat(shiftDetail?.shiftDurationInHrs * 60)}
                  </Typography>
                </Box>
                <Box className={classes.assignDrawerHeaderBottomContent}>
                  <CalendarIcon className={classes.assignDrawerCalendarIcon} />
                  <Typography className={classes.assignDrawerHeaderBottomText} variant="body2">
                    {`${formatDate(dayjsWithStandardOffset(shiftDetail?.startsAt))} - ${formatDate(dayjsWithStandardOffset(shiftDetail?.lastShiftStartTime))}`}
                  </Typography>
                </Box>
                <Box className={classes.assignDrawerHeaderBottomContent}>
                  <BriefcaseIcon />
                  <Typography className={classes.assignDrawerHeaderBottomText} variant="body2">
                    {getDaysStringFromNumbers(sortDays(shiftDetail?.shiftDays))}
                  </Typography>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>

      {children}

      {/* Footer */}
      <Box className={classes.assignDrawerFooter}>
        <Button
          variant="secondaryGrey"
          onClick={() => closeSideDrawer()}
          disabled={disableActionBtn || loading}
        >
          {t('obx.schedules.assignDedicatedDuty.assignShift.cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={
            disableActionBtn ||
            loading ||
            (shiftDetail?.assignmentReadOnlyMode && drawerData?.type === DRAWER_TYPE.ASSIGN)
          }
        >
          {t('obx.schedules.assignDedicatedDuty.assignShift.save')}
        </Button>
      </Box>
    </Box>
  );
};

export default Layout;

Layout.propTypes = {
  drawerData: PropTypes.object,
  changeOnlyDrawerType: PropTypes.func,
  closeSideDrawer: PropTypes.func,
  handleSubmit: PropTypes.func,
  children: PropTypes.node,
  clearTemplateStates: PropTypes.func,
  shiftDetail: PropTypes.object,
  loading: PropTypes.bool,
  disableActionBtn: PropTypes.bool,
  isPatrol: PropTypes.bool,
  title: PropTypes.string,
};

Layout.defaultProps = {
  drawerData: {},
  changeOnlyDrawerType: () => {},
  closeSideDrawer: () => {},
  handleSubmit: () => {},
  children: null,
  clearTemplateStates: () => {},
  shiftDetail: {},
  loading: false,
  disableActionBtn: false,
  isPatrol: false,
};
