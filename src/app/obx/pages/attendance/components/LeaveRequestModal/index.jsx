import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';
import ModalComponent from 'commonComponents/modal';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';
import ResponsiveDateTimePickers from 'src/app/components/common/dateTimePicker';
import { useStyles } from 'src/app/obx/pages/attendance/listing/listingStyles';
import useFormHook from 'src/hooks/useFormHook';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';

import { getCurrentTimeWithDisabledDlsInIso } from '../../../schedules/helper';

const dateFormat = 'DD-MM-YYYY HH:mm A';
const LeaveRequestModal = ({ open, handleClose, onSubmit, isLoading, t }) => {
  const classes = useStyles();

  const { handleInputChange, formData, errorMessages, setErrorMessages } = useFormHook({
    defaultFormData: {
      leaveReason: '',
      startDateTime: null,
      endDateTime: null,
    },
  });

  const onApplyLeave = async () => {
    const finalPayLoad = {
      ...formData,
      startDateTime: getCurrentTimeWithDisabledDlsInIso(formData?.startDateTime) || null,
      endDateTime: getCurrentTimeWithDisabledDlsInIso(formData?.endDateTime) || null,
    };
    const errors = await formValidatorJoi(finalPayLoad, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));

      return;
    }

    onSubmit(finalPayLoad);
  };

  const handleDateChange = (name, value) => {
    const event = {
      target: {
        name: name,
        value: value,
      },
    };
    handleInputChange(event);
  };

  const leaveRequestModalBody = (
    <Box className={classes.rejectLeaveModalBody}>
      <Typography variant="h3" className={classes.leaveRequestModalBodyTitle}>
        {t('obx.attendance.leaveRequestForm.title')}
      </Typography>
      <Typography variant="body2" className={classes.rejectLeaveModalBodyText}>
        {t('obx.attendance.leaveRequestForm.desc')}
      </Typography>

      <Box className={classes.rejectLeaveModalBodyDateTime}>
        <Box className={classes.modalDateTimePicker}>
          <InputLabel>{t('obx.attendance.leaveRequestForm.startDateTime')}</InputLabel>
          {/*<ResponsiveDatePickers />*/}
          <ResponsiveDateTimePickers
            name={'startDateTime'}
            value={formData?.startDateTime}
            onChange={(value) => {
              handleDateChange('startDateTime', value);
              handleDateChange('endDateTime', null);
            }}
            timeStepsMinutes={1}
            format={dateFormat}
            placeholder={dayjs().format(dateFormat)}
            minDateTime={dayjs()}
            helperText={errorMessages.startDateTime}
            error={!!errorMessages.startDateTime}
          />
        </Box>

        <Box className={classes.modalDateTimePicker}>
          <InputLabel>{t('obx.attendance.leaveRequestForm.endDateTime')}</InputLabel>
          <ResponsiveDateTimePickers
            name={'endDateTime'}
            timeStepsMinutes={1}
            value={formData?.endDateTime}
            disabled={!formData?.startDateTime}
            onChange={(value) => handleDateChange('endDateTime', value)}
            format={dateFormat}
            placeholder={dayjs().format(dateFormat)}
            minDateTime={formData?.startDateTime ? dayjs(formData?.startDateTime) : dayjs()}
            helperText={errorMessages.endDateTime}
            error={!!errorMessages.endDateTime}
          />
        </Box>
      </Box>

      <Box className={classes.leaveRequestModalBodyField}>
        <TextField
          placeholder={t('obx.attendance.leaveRequestForm.reason')}
          minRows={5}
          maxRows={5}
          multiline
          onChange={handleInputChange}
          name="leaveReason"
          value={formData?.leaveReason}
          helperText={errorMessages?.leaveReason || ''}
          error={!!errorMessages?.leaveReason}
        />
      </Box>
      <Box className={classes.leaveRequestModalBodyActions}>
        <Button variant="secondaryGrey" onClick={handleClose} disabled={isLoading}>
          {t('buttons.cancel')}
        </Button>
        <Button variant="primary" onClick={onApplyLeave} disabled={isLoading}>
          {t('obx.attendance.leaveRequestForm.applyLeave')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={handleClose} body={leaveRequestModalBody} />;
};

export default LeaveRequestModal;

LeaveRequestModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  isLoading: PropTypes.bool,
  onSubmit: PropTypes.func,
  t: PropTypes.node,
};
