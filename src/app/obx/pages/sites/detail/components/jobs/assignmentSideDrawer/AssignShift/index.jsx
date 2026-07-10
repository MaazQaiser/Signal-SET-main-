import { Avatar, Box, Button, Chip, Skeleton, Typography } from '@mui/material';
import { ReactComponent as AlertIcon } from 'assets/svg/alertCircle.svg';
import { ReactComponent as ClockIcon } from 'assets/svg/DedicatedDuty/schedule.svg';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import {
  dayjsWithStandardOffset,
  getEmbededDateAndTimeWRTStandardOffset,
} from 'src/app/obx/pages/schedules/helper';
import { ReactComponent as _CheckBoxCheckedDisabled } from 'src/assets/svg/checkbox-checked-disabled.svg';
import { ReactComponent as _CheckboxDisabled } from 'src/assets/svg/checkbox-disabled.svg';
import { ReactComponent as EditIcon } from 'src/assets/svg/edit.svg';
import { ReactComponent as PlusIcon } from 'src/assets/svg/plus.svg';
import { ReactComponent as ReassignmentIcon } from 'src/assets/svg/reassignment-icon.svg';
import { formatDate, timeFormat12h } from 'src/helper/utilityFunctions';
import { DRAWER_TYPE, ShiftStatus } from 'src/utils/constants/schedules';

import { defaultCreateTourTemplateValues } from '..';
import { useStyles } from '../assignmentSideDrawer.styles';
// import HourlyRateAssignment from './HourlyRateAssignment';
import LocationAssignment from './LocationAssignment';
import OfficerAssignment from './OfficerAssignment';
import Tours from './Tours';

const AssignShift = ({
  changeOnlyDrawerType,
  handleChangeValue,
  formDataTours,
  setFormDataTours,
  setDeletedTours,
  assignmentValue,
  setAssignmentValue,
  reports,
  checkpoints,
  shiftDetail,
  drawerData,
  errorMessagesTours,
  setErrorMessagesTours,
  allOfficers,
  locations,
  loading,
  setChangeDate,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const onChangeShiftDate = (value) => {
    if (!dayjs(value)?.isValid()) return;
    value = dayjs(value).hour(0).minute(0).millisecond(0);

    const shiftSelectedDate = dayjs(value)?.format('YYYY-MM-DD');
    let shiftSelectedDateWithUpdatedTime = getEmbededDateAndTimeWRTStandardOffset(
      shiftDetail?.startsAt,
      shiftSelectedDate,
    );

    setAssignmentValue((prev) => ({
      ...prev,
      shiftDate: shiftSelectedDateWithUpdatedTime,
    }));
  };

  const handleClickEditReassignment = () => {
    changeOnlyDrawerType(DRAWER_TYPE.EDIT_REASSIGNMENT)();
  };

  return (
    <Box className={classes.assignShiftBody}>
      <Box className={classes.assignShiftBodyDatePicker}>
        <ResponsiveDatePickers
          {...{
            value: dayjsWithStandardOffset(assignmentValue?.shiftDate).format('YYYY-MM-DD') || null,
            onChange: onChangeShiftDate,
            placeholder: t('obx.schedules.assignDedicatedDuty.assignShift.selectDate'),
            disabled: !shiftDetail?.startsAt,
            // minDate: shiftDetail?.assignmentMinDate,
            // maxDate: dayjs(shiftDetail?.shiftEndDate),
          }}
        />
      </Box>
      {loading ? (
        <Box className={classes.assignShiftSkeleton}>
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
        </Box>
      ) : (
        <Box className={classes.assignShiftBodyBox}>
          <Box className={classes.assignShiftBodyHeader}>
            <Box className={classes.assignShiftBodyHeaderLeft}>
              <Typography className={classes.assignShiftBodyHeaderTitle} variant="h4">
                {shiftDetail?.name}
              </Typography>
              <Box className={classes.assignDrawerHeaderBottomContent}>
                <ClockIcon className={classes.assignDrawerCalendarBodyIcon} />
                <Typography className={classes.assignDrawerHeaderBodyText} variant="subtitle2">
                  {timeFormat12h(shiftDetail?.shiftStartTime, true) +
                    '  - ' +
                    timeFormat12h(shiftDetail?.shiftEndTime, true)}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className={classes.assignShiftBodyContent}>
            <LocationAssignment
              {...{
                assignmentValue,
                handleChangeValue,
                setChangeDate,
                shiftDetail,
                locations,
              }}
            />
            <OfficerAssignment
              {...{
                assignmentValue,
                handleChangeValue,
                setChangeDate,
                shiftDetail,
                setAssignmentValue,
                shiftId: drawerData?.shiftId,
                allOfficers,
                loading,
              }}
            />
            {shiftDetail?.allowReassignment && !shiftDetail?.reassignOfficer && (
              <>
                <Box
                  className={classes.reassignmentBtn}
                  onClick={() => changeOnlyDrawerType(DRAWER_TYPE.REASSIGNMENT)()}
                >
                  <ReassignmentIcon />
                  <Typography variant="body1">
                    {t('obx.schedules.assignDedicatedDuty.assignShift.shiftReassignment')}
                  </Typography>
                </Box>
              </>
            )}
            {shiftDetail?.reassignOfficer && (
              <>
                <Box className={classes.officerLabel}>
                  <Box className={classes.reassignShiftChip}>
                    <Chip
                      icon={<AlertIcon />}
                      label={t('obx.schedules.assignDedicatedDuty.assignShift.chipText')}
                      color="primary"
                    />
                  </Box>
                  <Box className={classes.officerLabelRow}>
                    <Box className={classes.officerLabelInfo}>
                      <Avatar src={shiftDetail?.reassignOfficer?.imageUrl} />
                      <Typography variant="body1">{shiftDetail?.reassignOfficer?.name}</Typography>
                      <Typography variant="body1">
                        •{' '}
                        {formatDate(
                          dayjsWithStandardOffset(shiftDetail?.reassignOfficer?.startsAt),
                        )}{' '}
                        • {timeFormat12h(shiftDetail?.reassignOfficer?.startsAt, true)}
                      </Typography>
                    </Box>
                    <Box
                      role="button"
                      onClick={handleClickEditReassignment}
                      className={classNames(
                        classes.officerLabelBtn,
                        shiftDetail?.reassignOfficer?.shiftStatus !==
                          ShiftStatus.SHIFT_NOT_STARTED && classes.officerLabelBtnDisabled,
                      )}
                    >
                      <EditIcon />
                    </Box>
                  </Box>
                </Box>
              </>
            )}

            {/* <HourlyRateAssignment {...{ assignmentValue, shiftDetail, setAssignmentValue }} /> */}

            {formDataTours?.length === 0 && (
              <AddTourComp
                {...{
                  setFormDataTours,
                  isOptional: true,
                  readOnlyMode: shiftDetail?.assignmentReadOnlyMode,
                }}
              />
            )}
            {formDataTours?.length !== 0 && (
              <Tours
                {...{
                  changeOnlyDrawerType,
                  formDataTours,
                  setFormDataTours,
                  setDeletedTours,
                  reports,
                  checkpoints,
                  siteId: drawerData?.siteId,
                  errorMessagesTours,
                  setErrorMessagesTours,
                  readOnlyMode: shiftDetail?.assignmentReadOnlyMode,
                }}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AssignShift;

AssignShift.propTypes = {
  changeOnlyDrawerType: PropTypes.func,
  handleChangeValue: PropTypes.func,
  formDataTours: PropTypes.object,
  setFormDataTours: PropTypes.func,
  setDeletedTours: PropTypes.func,
  handleInputChangeTours: PropTypes.func,
  assignmentValue: PropTypes.object,
  setAssignmentValue: PropTypes.func,
  reports: PropTypes.array,
  checkpoints: PropTypes.array,
  shiftDetail: PropTypes.object,
  drawerData: PropTypes.object,
  errorMessagesTours: PropTypes.array,
  setErrorMessagesTours: PropTypes.func,
  allOfficers: PropTypes.array,
  locations: PropTypes.array,
  loading: PropTypes.bool,
  setChangeDate: PropTypes.func,
};

export const AddTourComp = ({ setFormDataTours, isOptional, readOnlyMode = false }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.assignShiftBodyAddTours}>
      <Button
        className={classes.assignShiftBodyAddToursBtn}
        disableRipple
        variant="onlyText"
        startIcon={<PlusIcon opacity={readOnlyMode ? 0.5 : 1} />}
        onClick={() => {
          setFormDataTours((prev) => {
            const key = (prev?.[prev?.length - 1]?.key || null) + 1;
            return [...prev, { key: key, ...defaultCreateTourTemplateValues }];
          });
        }}
        disabled={readOnlyMode}
      >
        {t('obx.schedules.assignDedicatedDuty.assignShift.addTours')}
      </Button>
      {isOptional && (
        <Typography variant="subtitle2" className={classes.assignShiftBodyAddToursText}>
          {t('obx.schedules.assignDedicatedDuty.assignShift.optional')}
        </Typography>
      )}
    </Box>
  );
};

AddTourComp.propTypes = {
  setFormDataTours: PropTypes.func,
  isOptional: PropTypes.bool,
  readOnlyMode: PropTypes.bool,
};
