import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Jobs from '../jobs';
import { useStyles } from './All.style';

const All = ({ jobs, selectedJob, showSupervisorList, handleJobChange }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.tabInnerWrapper}>
      {!showSupervisorList && !!jobs?.dedicatedJobs?.length && (
        <Jobs
          jobs={jobs?.dedicatedJobs}
          label={t('obx.dispatch.dedicatedJobs')}
          selectedJob={selectedJob}
          handleJobChange={handleJobChange}
          type="dedicated"
        />
      )}
      {!showSupervisorList && !!jobs?.patrolJobs?.length && (
        <Jobs
          jobs={jobs?.patrolJobs}
          label={t('obx.dispatch.patrolJobs')}
          selectedJob={selectedJob}
          handleJobChange={handleJobChange}
          type="patrol"
        />
      )}
    </Box>
  );
};

All.propTypes = {
  jobs: PropTypes.object,
  selectedJob: PropTypes.object,
  showSupervisorList: PropTypes.bool,
  handleJobChange: PropTypes.func,
};

export default All;
