import { Box, CircularProgress, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles((_theme) => ({
  widget: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '16px',
  },
  progressContainer: {
    position: 'relative',
    display: 'inline-flex',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      border: '7px solid #F5F5F6',
      boxSizing: 'border-box',
    },
  },
  progress: {
    color: ({ color }) => color,
  },
  progressValue: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '12px',
    fontWeight: '700 !important',
    color: '#262527',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#262527',
    marginBottom: '8px',
  },
  currentValue: {
    color: '#262527',
  },
  requirement: {
    '&.MuiTypography-root': {
      color: '#6A6A70',
      fontSize: '12px',
      fontWeight: '500',
      lineHeight: '15px',
    },
  },
}));

const NetProfitWidget = ({
  title = 'Net Profit',
  value = 44.12,
  requirement = 'Required >12%',
  color = '#FF9800',
  size = 60,
  thickness = 6,
  sign = '≥',
}) => {
  const classes = useStyles({ color });

  return (
    <Box className={classes.widget}>
      <Box className={classes.progressContainer}>
        <CircularProgress
          variant="determinate"
          // color={color}
          value={value}
          size={size}
          thickness={thickness}
          className={classes.progress}
          // sx={{ color }} // ✅ apply custom hex color
          sx={{
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
              color: color,
            },
          }}
        />
        {/* <Typography className={classes.progressValue} style={{ color }}>
          {Number(value)}
        </Typography> */}
      </Box>

      <Box className={classes.content}>
        <Typography variant="subtitle4" className={classes.title}>
          {title}
        </Typography>
        <Typography variant="h1" className={classes.currentValue}>
          {Number(value)}%
        </Typography>
        <Typography variant="subtitle4" className={classes.requirement}>
          {`Required ${sign} ${Number(requirement)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

NetProfitWidget.propTypes = {
  title: PropTypes.string,
  value: PropTypes.number.isRequired,
  requirement: PropTypes.string,
  color: PropTypes.string,
  sign: PropTypes.string,
  size: PropTypes.number,
  thickness: PropTypes.number,
};

export default NetProfitWidget;
