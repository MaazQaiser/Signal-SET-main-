import { Box, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getTimeDiff } from 'src/app/obx/pages/schedules/helper';
import { timeFormat12h } from 'src/helper/utilityFunctions';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './runSheetPopup.style';

const RunSheetPopup = ({ data }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Box className={classes.modalWrapper}>
      <Box className={classes.textWrap}>
        <Box className={classes.textWrapInner}>
          <Typography variant="h4" className={classes.headText}>
            {capitalizeFirstLetter(data?.data?.runsheetName) || t('commonText.nA')}
          </Typography>
          <Chip color="primary" size="small" label={t('obx.runsheet.patrol')} />
        </Box>
      </Box>
      <Box>
        <Typography variant="body3" className={classes.secondText}>
          {t('obx.runsheet.estimatedTime')}
        </Typography>{' '}
        <Typography variant="body3" className={classes.thirdText}>
          {timeFormat12h(data?.data?.startsAt)} - {timeFormat12h(data?.data?.endsAt)} (
          {getTimeDiff(data?.data?.startsAt, data?.data?.endsAt, 'hour')}h)
        </Typography>
      </Box>
    </Box>
  );
};

RunSheetPopup.propTypes = {
  data: PropTypes.object,
};

export default RunSheetPopup;
