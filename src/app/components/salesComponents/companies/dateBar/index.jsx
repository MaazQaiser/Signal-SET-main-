import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import * as React from 'react';

import { useStyles } from './databar';

const DateBar = ({ date }) => {
  const classes = useStyles();
  return (
    <Box className={classes.dateBar}>
      <Typography className={classes.dateStyle} variant="body2">
        {date}
      </Typography>
    </Box>
  );
};

DateBar.propTypes = {
  date: PropTypes.string,
};

export default DateBar;
