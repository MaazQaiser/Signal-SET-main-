import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './activity';

const LogMeetings = ({ meetingLink, dateLabel, timeLabel, description, guests }) => {
  const classes = useStyles();
  const { t } = useTranslation('sales');
  const NA = t('commonText.nA');

  return (
    <Box className={classes.activityDetails2}>
      <Box className={classes.row}>
        <Box className={classes.cell}>
          <Typography variant="body3" className={classes.namee}>
            {t('companies.meetingLink')}
          </Typography>
          {meetingLink ? (
            <Link
              href={meetingLink}
              target="_blank"
              className={classes.meetingLink}
              rel="noopener  noreferrer"
            >
              {meetingLink}
            </Link>
          ) : (
            <Typography variant="body3" className={classes.detail}>
              {NA}
            </Typography>
          )}
        </Box>
        <Box className={classes.cell}>
          <Typography variant="body3" className={classes.namee}>
            {t('companies.date')}
          </Typography>
          <Typography variant="body3" className={classes.detail}>
            {dateLabel || NA}
          </Typography>
        </Box>
        <Box className={classes.cell}>
          <Typography variant="body3" className={classes.namee}>
            {t('companies.time')}
          </Typography>
          <Typography variant="body3" className={classes.detail}>
            {timeLabel || NA}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.sectionSpacing}>
        <Typography variant="body3" className={classes.namee}>
          {t('companies.meetingDescription')}
        </Typography>
        <Typography variant="body3" className={`${classes.detail} ${classes.description}`}>
          <Box dangerouslySetInnerHTML={{ __html: description || NA }} />
        </Typography>
      </Box>
      <Box className={classes.sectionSpacing}>
        <Typography variant="body3" className={classes.namee}>
          {t('companies.guests')}
        </Typography>
        <Box className={classes.guestsContainer}>
          {guests?.length ? (
            guests?.map((guest, index) => <Chip color="success" key={index} label={guest} />)
          ) : (
            <Typography variant="body3" className={classes.detail}>
              {NA}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LogMeetings;

LogMeetings.propTypes = {
  meetingLink: PropTypes.string,
  dateLabel: PropTypes.string,
  timeLabel: PropTypes.string,
  description: PropTypes.string,
  guests: PropTypes.string,
};
