import { Box, InputLabel } from '@mui/material';
import RequiredAsterik from 'commonComponents/requiredAsterik';
import ResponsiveTimePickers from 'commonComponents/timePicker';
import PropTypes from 'prop-types';
import React, { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useStyles } from 'salesComponents/contractCreation/addServices/addServices';
import { FormKeys, ServicesTimeError } from 'salesComponents/contractCreation/addServices/helper';
import { ActiveStepsKeys, getNestedErrorKey } from 'salesPages/contractCreation/helper';
import { isSameDate } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/hooks/useTenantLabel';
import {
  removeContractErrorKey,
  setContractErrorMessages,
  updateServiceVisit,
} from 'src/redux/store/slices/contractServices';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { convertHHMMAToDayJsDate } from 'src/utils/passTime/time';
import { checkAndAddDot } from 'src/utils/string/addDotInEnd';

const SelectTimer = ({
  serviceType,
  visitIndex,
  visit,
  index,
  baseRates,
  getNestedError,
  errorMessages,
  showRequired = true,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { getLabel } = useTenantLabel();

  const dispatch = useDispatch();
  const { timePrecision, timeFormat } = useSelector(getDisplayConfiguration);

  const timeDisplayFormat =
    timeFormat === '24h'
      ? (timePrecision || 'HH:mm').replace(/hh/g, 'HH')
      : /[Aa]/.test(timePrecision || '')
        ? timePrecision
        : `${timePrecision || 'hh:mm'} A`;

  const totalServices = useSelector(
    (state) => state.contractServices[ActiveStepsKeys.SERVICES].length,
  );

  const startDate = useSelector((state) => state.contractServices[FormKeys.START_DATE]);
  const endDate = useSelector((state) => state.contractServices[FormKeys.END_DATE]);

  const setErrorMessages = (errors) => {
    dispatch(setContractErrorMessages(errors));
  };

  const [time, setTime] = useState({
    startTime: visit?.startTime || null,
    endTime: visit?.endTime || null,
  });

  const removeNestedErrorKey = (index, nestedKeyName, nestedIndex, keyName) => {
    const errorKey = getNestedErrorKey({
      activeStep: ActiveStepsKeys.SERVICES,
      index,
      nestedFormDataKey: nestedKeyName,
      nestedIndex,
      key: keyName,
    });

    dispatch(removeContractErrorKey(errorKey));
  };

  const handleTimeChange = (customEvent, index) => {
    const { name, value, visitIndex } = customEvent;

    removeNestedErrorKey(index, FormKeys.VISITS, visitIndex, name);
    if ([FormKeys.START_TIME, FormKeys.END_TIME].includes(name))
      removeNestedErrorKey(index, FormKeys.VISITS, visitIndex, ServicesTimeError);

    dispatch(updateServiceVisit({ name, value, visitIndex, index, baseRates }));
  };

  const handleChange = (name, val) => {
    setTime((t) => {
      return {
        ...t,
        [name]: val,
      };
    });
  };

  useEffect(() => {
    if (time?.startTime || time?.startTime == null)
      handleTimeChange({ name: FormKeys.START_TIME, value: time?.startTime, visitIndex }, index);
  }, [time?.startTime]);

  useEffect(() => {
    if (time?.endTime || time?.endTime == null)
      handleTimeChange({ name: FormKeys.END_TIME, value: time?.endTime, visitIndex }, index);
  }, [time?.endTime]);

  useEffect(() => {
    setTime({
      startTime: visit?.startTime || null,
      endTime: visit?.endTime || null,
    });
  }, [serviceType, startDate, endDate, totalServices]);

  return (
    <Box key={visitIndex} className={classes.marginBottomDropDown}>
      <Box className={classes.duelTime}>
        <Box>
          <InputLabel htmlFor={`${FormKeys.START_TIME}-${index}-${visitIndex}`}>
            {getLabel('terms', 'contractStartTime') || t('sales.contract.startTime')}
            {showRequired && (
              <>
                {' '}
                <RequiredAsterik />
              </>
            )}
          </InputLabel>
          <ResponsiveTimePickers
            value={
              time[FormKeys.START_TIME] ? convertHHMMAToDayJsDate(time[FormKeys.START_TIME]) : null
            }
            onChange={(value) => {
              if (
                isSameDate(startDate, endDate) &&
                time[FormKeys.END_TIME] &&
                value >= time[FormKeys.END_TIME]
              ) {
                const errorKey = getNestedErrorKey({
                  activeStep: ActiveStepsKeys.SERVICES,
                  index: index,
                  nestedFormDataKey: FormKeys.VISITS,
                  nestedIndex: visitIndex,
                  key: FormKeys.START_TIME,
                });

                const error = {
                  ...errorMessages,
                  [errorKey]: t('obx.schedules.startTimeBeforeEnd'),
                };
                setErrorMessages(error);
                return;
              }

              handleChange(FormKeys.START_TIME, value);
            }}
            format={timeDisplayFormat}
            placeholder={timeDisplayFormat}
            error={!!getNestedError(FormKeys.START_TIME, visitIndex)}
            helperText={getNestedError(FormKeys.START_TIME, visitIndex)}
            // maxValue={time[FormKeys.END_TIME] || null}
            timeStepsMinutes={1}
            // maxValue={time[FormKeys.END_TIME] || null}
            useLocalTimeZone={true}
          />
        </Box>
        <Box>
          <InputLabel htmlFor={`${FormKeys.END_TIME}-${index}-${visitIndex}`}>
            {getLabel('terms', 'contractEndTime') || t('sales.contract.endTime')}
            {showRequired && (
              <>
                {' '}
                <RequiredAsterik />
              </>
            )}
          </InputLabel>
          <ResponsiveTimePickers
            value={
              time[FormKeys.END_TIME] ? convertHHMMAToDayJsDate(time[FormKeys.END_TIME]) : null
            }
            onChange={(value) => {
              if (
                isSameDate(startDate, endDate) &&
                time[FormKeys.START_TIME] &&
                value <= time[FormKeys.START_TIME]
              ) {
                const errorKey = getNestedErrorKey({
                  activeStep: ActiveStepsKeys.SERVICES,
                  index: index,
                  nestedFormDataKey: FormKeys.VISITS,
                  nestedIndex: visitIndex,
                  key: FormKeys.END_TIME,
                });

                const error = { ...errorMessages, [errorKey]: t('obx.schedules.endTimeGreater') };
                setErrorMessages(error);
                return;
              }
              handleChange(FormKeys.END_TIME, value);
            }}
            disabled={showRequired && !time[FormKeys.START_TIME]}
            format={timeDisplayFormat}
            placeholder={timeDisplayFormat}
            error={!!getNestedError(FormKeys.END_TIME, visitIndex)}
            helperText={getNestedError(FormKeys.END_TIME, visitIndex)}
            timeStepsMinutes={1}
            useLocalTimeZone={true}
          />
        </Box>
      </Box>{' '}
      <div className={classes.invalidFeedbackTime}>
        {!!getNestedError(ServicesTimeError, visitIndex) &&
          checkAndAddDot(getNestedError(ServicesTimeError, visitIndex))}
      </div>
    </Box>
  );
};

SelectTimer.propTypes = {
  index: PropTypes.number,
  visitIndex: PropTypes.number,
  visit: PropTypes.object,
  errorMessages: PropTypes.object,
  getNestedError: PropTypes.func,
  showRequired: PropTypes.bool,
  serviceType: PropTypes.string,
  baseRates: PropTypes.object,
};
export default memo(SelectTimer);
