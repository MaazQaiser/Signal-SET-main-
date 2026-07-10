import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DutyIndicator from 'src/app/components/obxComponents/dutyIndicator';
import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { DUTY_COLORS } from '../../calendar';

const useStyles = makeStyles((theme) => ({
  scheduleCalendarIndicators: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    background: theme.palette.surfaceWhite,
    padding: '0 0px 0px',
  },
}));

const ScheduleIndicators = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.scheduleCalendarIndicators}>
      <DutyIndicator
        color={DUTY_COLORS[SCHEDULE_DUTIES.DEDICATED]}
        label={t('obx.schedules.legends.dedicated')}
      ></DutyIndicator>
      <DutyIndicator
        color={DUTY_COLORS[SCHEDULE_DUTIES.PATROL]}
        label={t('obx.schedules.legends.patrol')}
      ></DutyIndicator>
      <DutyIndicator
        color={DUTY_COLORS[SCHEDULE_DUTIES.EXTRA]}
        label={t('obx.schedules.legends.extra')}
      ></DutyIndicator>
      <DutyIndicator
        color={DUTY_COLORS[SCHEDULE_DUTIES.DISPATCH]}
        label={t('obx.schedules.legends.dispatch')}
      ></DutyIndicator>
      {/* <DutyIndicator color="#E43F32" label={t('obx.schedules.legends.attention')}></DutyIndicator> */}
    </Box>
  );
};

export default ScheduleIndicators;
