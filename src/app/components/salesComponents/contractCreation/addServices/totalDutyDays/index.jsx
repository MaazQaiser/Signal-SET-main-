import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

// import { daysOfWeekWithVal } from 'src/utils/constants';
import { useStyles } from '../addServices';
import { FormKeys } from '../helper';

const TotalDutyDays = ({ index, days, selectedPanType }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const truncateTo = 3;
  const service = useSelector((state) => state.contractServices?.services[index]);
  const selectedPlanCalculations = service?.[FormKeys.CALCULATIONS]?.[selectedPanType?.value] || {};
  const totalDutyDays = selectedPlanCalculations?.[FormKeys.TOTAL_DUTY_DAYS] || {};

  return (
    <Box className={classes.daysSummery}>
      <Typography className={classes.totalCount} variant="h5">
        {t('sales.contract.total')} {selectedPlanCalculations?.[FormKeys.TOTAL_VISITS] || 0}:
      </Typography>
      <Typography className={classes.summeryDays} variant="body2">
        {days
          .map((day) => `${day?.label?.substring(0, truncateTo)} ${totalDutyDays[day.value] || 0}`)
          .join(', ')}
      </Typography>
    </Box>
  );
};

TotalDutyDays.propTypes = {
  index: PropTypes.number,
  days: PropTypes.any,
  selectedPanType: PropTypes.object,
};

export default TotalDutyDays;
