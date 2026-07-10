import { Box, Button, InputLabel } from '@mui/material';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PropTypes } from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { timeFormat12h } from 'src/helper/utilityFunctions';

import { useStyles } from './timePopover';

const StartTimePopover = ({ value, onSave, disabled = false, isLoading = false }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);

  const [time, setTime] = useState(dayjsWithStandardOffset(value));

  const handleClick = (event) => {
    if (!disabled) {
      setTime(time);
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSave = async () => {
    await onSave(time);
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Box className={classes.centerBox}>
      <TextField
        className={classes.hourFiled}
        variant="outlined"
        type="text"
        value={value ? timeFormat12h(time, true) : 'N/A'}
        aria-describedby={id}
        onClick={handleClick}
        disabled={disabled}
      />
      <Popover
        className={classes.popverWrapper}
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box className={classes.popContent}>
          <Typography variant="h4"> {t('obx.payroll.updateApprovedHours')}</Typography>
          <Box className={classes.boxSpace}>
            <InputLabel>{t('obx.payroll.startTime')}</InputLabel>
            <ResponsiveTimePickers
              value={time}
              format="hh:mm aa"
              onChange={(val) => {
                setTime(dayjsWithStandardOffset(val));
              }}
              disabled={disabled}
              // timezone={'system'}
            />
          </Box>
        </Box>
        <Box className={classes.popFooter}>
          <Button variant="secondaryGrey" onClick={handleClose}>
            {t('obx.payroll.cancel')}
          </Button>
          <Button disabled={isLoading} variant="primary" onClick={handleSave}>
            {t('obx.payroll.save')}
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

StartTimePopover.propTypes = {
  value: PropTypes.string,
  onSave: PropTypes.func,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default StartTimePopover;
