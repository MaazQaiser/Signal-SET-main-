import {
  Avatar,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { timeFormat12h } from 'src/helper/utilityFunctions';
import { _statusEnum } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './JobsBar.style';

const JobsBar = ({ job, selectedJob, handleJobChange, type }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');

  const onclick = () => {
    handleJobChange(job);
  };

  return (
    <Box className={classes.jobGrayBar} onClick={onclick}>
      <Box className={classes.jobDetails}>
        <Box className={classes.chipAndText}>
          {type === 'dedicated' ? (
            <Typography>{`${capitalizeFirstLetter(job?.name) || NA} - ${job?.site?.name || ''} (${timeFormat12h(job?.startsAt)} - ${timeFormat12h(job?.endsAt)})`}</Typography>
          ) : (
            <Typography>{capitalizeFirstLetter(job?.runsheetName) || NA}</Typography>
          )}
          <Chip
            className={classes.eventSiteNameColor}
            size="small"
            variant="Filled"
            color="primary"
            label={_statusEnum[job?.status] || job?.status}
          />
        </Box>
        <Box className={classes.inlineValue}>
          <Typography variant="subtitle3">
            {dayjsWithStandardOffset(job.startsAt).format('MM/DD/YYYY hh:mma')}
          </Typography>
          <Typography>-</Typography>
          <Typography variant="subtitle3">
            {dayjsWithStandardOffset(job.endsAt).format('MM/DD/YYYY hh:mma')}
          </Typography>
          <Typography variant="subtitle3" className={classes.smallDot}>
            •
          </Typography>
          <Avatar alt="Remy Sharp" src={job?.officer?.image} />
          <Typography variant="subtitle3">
            {capitalizeFirstLetter(job?.officer?.name) || NA}
          </Typography>
          {job?.officer?.phoneNumber && (
            <Typography variant="subtitle3">({job?.officer?.phoneNumber})</Typography>
          )}
        </Box>
      </Box>
      <Box className={classes.jobCheckbox}>
        <FormControl>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
          >
            <FormControlLabel
              value="Select"
              control={
                <Radio key={job?.uniqueId} checked={job?.uniqueId === selectedJob?.uniqueId} />
              }
              label="Select"
            />
          </RadioGroup>
        </FormControl>
      </Box>
    </Box>
  );
};

JobsBar.propTypes = {
  job: PropTypes.object,
  selectedJob: PropTypes.object,
  handleJobChange: PropTypes.func,
  type: PropTypes.string,
};

export default JobsBar;
