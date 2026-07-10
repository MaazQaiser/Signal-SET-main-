import { Box, InputLabel, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { removeKey } from 'src/helper/utilityFunctions';
import { UPDATE_RUNSHEET_STATE } from 'src/redux/reducers/runSheetReducer';
import { daysOfWeekWithVal } from 'src/utils/constants';

import { getDayName } from '../../../schedules/helper';
import { useStyles } from './RunsheetDetailsTab';

const RunSheetDetailsTabs = (props) => {
  const { state, dispatch, errorMessages, setErrorMessages, setIsSameDate } = props;
  const [startDate, setStartDate] = useState(null);
  const { t } = useTranslation();
  const onChangeHandler = (name, e) => {
    if (e) {
      setErrorMessages((prev) => removeKey([name], prev));
    }

    if (name === 'startsAt') {
      dispatch({ type: UPDATE_RUNSHEET_STATE, payload: { key: 'endsAt', value: null } });
    }

    dispatch({ type: UPDATE_RUNSHEET_STATE, payload: { key: name, value: e } });

    if (name === 'startDate') setStartDate(e);
  };

  useEffect(() => {
    if (startDate === state?.startDate) setIsSameDate(true);
    else setIsSameDate(false);
  }, [state?.startDate]);
  const classes = useStyles();
  return (
    <>
      <Box className={classes.runsheetWrapper}>
        <Box className={classes.runsheetFields}>
          <InputLabel htmlFor="runsheetName">
            {t('obx.runsheet.runsheetName')} <RequiredAsterik />
          </InputLabel>
          <TextField
            name="runsheetName"
            id="runsheetName"
            fullWidth
            onChange={(e) => onChangeHandler('runsheetName', e.target.value)}
            placeholder={t('obx.runsheet.enterRunsheetName')}
            type="text"
            value={state?.runsheetName || null}
            error={!!errorMessages?.runsheetName}
            helperText={!!errorMessages?.runsheetName ? errorMessages?.runsheetName : null}
            className={classes?.textFiledFilter}
          />
        </Box>
        <Box className={classes.runsheetFields}>
          <Box className={classes.splitColms}>
            <Box className={classes.fifityFifty}>
              <InputLabel htmlFor="Service Name">
                {t('obx.runsheet.startDate')} <RequiredAsterik />
              </InputLabel>
              <ResponsiveDatePickers
                id="startDate"
                error={!!errorMessages?.startDate}
                helperText={!!errorMessages?.startDate ? errorMessages?.startDate : null}
                format="MM/DD/YYYY"
                inputFormat="MM/DD/YYYY"
                onChange={(e) => {
                  onChangeHandler('startDate', e);
                  onChangeHandler(
                    'dutyDay',
                    daysOfWeekWithVal.find((data) => data?.label === getDayName(e))?.value,
                  );
                }}
                placeholder={t('obx.runsheet.selectStartDate')}
                value={state.startDate || null}
                minDate={dayjs()}
              />
              {state?.startDate && (
                <Typography variant="body2" className={classes.smallText}>
                  {t('obx.runsheet.selectedDay')}:{' '}
                  <Box component="span" className={classes.dayColor}>
                    {getDayName(state?.startDate)}
                  </Box>
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
        <Box className={classes.runsheetFields}>
          <Box className={classes.splitColms}>
            <Box className={classes.fifityFifty}>
              <InputLabel htmlFor="startTime">
                {t('obx.runsheet.startTime')} <RequiredAsterik />
              </InputLabel>
              <ResponsiveTimePickers
                name="startsAt"
                timeStepsMinutes={1}
                disabled={!!!state?.startDate}
                onChange={(e) => onChangeHandler('startsAt', e)}
                id="startsAt"
                error={!!errorMessages?.startsAt}
                helperText={!!errorMessages?.startsAt ? errorMessages?.startsAt : null}
                value={state?.startsAt || null}
                placeholder={t('obx.runsheet.selectStartTime')}
              />
            </Box>
            <Box className={classes.fifityFifty}>
              <InputLabel htmlFor="Service Name">
                {t('obx.runsheet.endTime')} <RequiredAsterik />
              </InputLabel>
              <ResponsiveTimePickers
                error={!!errorMessages?.endsAt}
                helperText={!!errorMessages?.endsAt ? errorMessages?.endsAt : null}
                name="endsAt"
                timeStepsMinutes={1}
                disabled={!!!state?.startsAt}
                onChange={(e) => onChangeHandler('endsAt', e)}
                value={state?.endsAt || null}
                id="endsAt"
                placeholder={t('obx.runsheet.selectEndTime')}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};
RunSheetDetailsTabs.propTypes = {
  state: PropTypes.shape({
    runsheetName: PropTypes.string,
    startsAt: PropTypes.string,
    startDate: PropTypes.string,
    endsAt: PropTypes.string, // Ensure this line is present
    startEndLocation: PropTypes.object,
    dutyDay: PropTypes.array,
  }).isRequired,
  activeStep: PropTypes.string,
  dispatch: PropTypes.function,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
  setIsSameDate: PropTypes.func,
  isSameDate: PropTypes.bool,
};

export default RunSheetDetailsTabs;
