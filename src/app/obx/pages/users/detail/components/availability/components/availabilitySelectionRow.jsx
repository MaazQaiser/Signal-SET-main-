import { Box, Typography } from '@mui/material';
import CustomDropDown from 'commonComponents/customDropDown';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { getTimeWithInterval, showError } from 'src/helper/utilityFunctions';

import { useStyles } from '../avalibilityStyle';
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const enums = {
  startTime: 'startTime',
  endTime: 'endTime',
  availability: 'availability',
};

const AvailabilitySelectionRow = ({ data, onAvailabilityChange, index, errors }) => {
  const onInputChange = (e) => {
    const { name, value } = e.target;

    if (enums.startTime === name) {
      onAvailabilityChange(enums.endTime, {}, index);
    }

    onAvailabilityChange(name, value, index);
  };

  const startTime = useMemo(() => {
    return [{ value: 'none', label: 'None' }, ...getTimeWithInterval({})];
  }, [data?.startTime]);

  const endTime = useMemo(() => {
    return [...getTimeWithInterval({})];
  }, [data?.startTime]);
  const classes = useStyles();

  const startTimeError = showError({
    key: enums?.startTime,
    formDataKey: enums?.availability,
    index,
    errors,
  });

  const endTimeError = showError({
    key: enums?.endTime,
    formDataKey: enums?.availability,
    index,
    errors,
  });

  return (
    <Box className={classes.rowSectionWrapper}>
      <>
        <Typography variant="subtitle2" className={classes.weekDaysName}>
          {data?.day}
        </Typography>

        <Box className={classes.dropDownSectionOne}>
          <CustomDropDown
            selectedValues={data?.startTime}
            handleChange={onInputChange}
            options={startTime}
            name={'startTime'}
            bordered
            isError={!!startTimeError}
          />
          {!!startTimeError && <div className={classes.invalidFeedback}>{startTimeError}</div>}
        </Box>

        <Box className={classes.dropDownSectionOne}>
          {data?.startTime?.value !== 'none' && (
            <>
              <CustomDropDown
                selectedValues={data?.endTime}
                handleChange={onInputChange}
                options={endTime}
                name={'endTime'}
                disabled={!data?.startTime?.value}
                bordered
                isError={!!endTimeError && data?.startTime?.value}
              />
              {!!endTimeError && data?.startTime?.value && (
                <div className={classes.invalidFeedback}>{endTimeError}</div>
              )}
            </>
          )}
        </Box>
      </>

      {/*<Typography variant="subtitle2" className={classes.weekDaysName}>*/}
      {/*  {data?.day}*/}
      {/*</Typography>*/}
    </Box>
  );
};

AvailabilitySelectionRow.propTypes = {
  showYear: PropTypes.bool,
  data: PropTypes.object,
  onAvailabilityChange: PropTypes.func,
  index: PropTypes.number,
  errors: PropTypes.object,
  loading: PropTypes.bool,
};

export default AvailabilitySelectionRow;
