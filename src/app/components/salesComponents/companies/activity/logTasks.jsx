import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { formatISOTimestampToDate } from 'src/utils/date';

import TaskPriority from '../../locations/taskTabs/taskPriority';
import TaskType from '../../locations/taskTabs/taskType';
import { useStyles } from './activity';

const LogTasks = ({
  typeLabel = '',
  priorityLabel = '',
  dateTimeLabel = '',
  description = '',
  statusLabel = '',
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const { dateFormat, timePrecision } = useSelector(getDisplayConfiguration);

  return (
    <Box className={classes.activityDetails2}>
      <Box className={classes.row}>
        <Box className={classes.cell}>
          <Typography variant="body3" className={classes.namee}>
            {t('sales.companies.type')}
          </Typography>
          <TaskType type={typeLabel} />
        </Box>
        <Box className={classes.cell}>
          <Typography variant="body3" className={classes.namee}>
            {t('sales.companies.priority')}
          </Typography>
          <Box className={classes.priorityRow}>
            <TaskPriority priority={priorityLabel || NA} />
          </Box>
        </Box>
        <Box className={classes.cell}>
          <Typography variant="body3" className={classes.namee}>
            {t('sales.companies.dateTime')}
          </Typography>
          <Typography variant="body3" className={classes.detail}>
            {dateTimeLabel
              ? `${formatISOTimestampToDate(dateTimeLabel, dateFormat)} at ${formatISOTimestampToDate(dateTimeLabel, timePrecision)}`
              : NA}
          </Typography>
        </Box>
        <Box className={classes.cell}>
          <Typography variant="body3" className={classes.namee}>
            {t('sales.tasks.status')}
          </Typography>
          <Typography variant="body3" className={classes.detail}>
            {statusLabel}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.sectionSpacing}>
        <Typography variant="body3" className={classes.namee}>
          {t('sales.companies.taskDescription')}
        </Typography>
        <Typography variant="body3" className={`${classes.detail} ${classes.description}`}>
          <Box dangerouslySetInnerHTML={{ __html: description }} />
        </Typography>
      </Box>
    </Box>
  );
};

export default LogTasks;

LogTasks.propTypes = {
  typeLabel: PropTypes.string,
  priorityLabel: PropTypes.string,
  dateTimeLabel: PropTypes.string,
  description: PropTypes.string,
  statusLabel: PropTypes.string,
};
