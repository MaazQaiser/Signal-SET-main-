import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as NoDataIcon } from 'assets/images/Nodata.svg';
import PropTypes from 'prop-types';

const useStyles = makeStyles((_theme) => ({
  notesBox: {
    '&.MuiBox-root': {
      textAlign: 'center',
      padding: '40px !important',
    },
  },
  notesError: {
    '&.MuiTypography-root': {
      fontSize: '22px',
      fontWeight: '700',
      margin: '30px 0px 16px 0px',
    },
  },
  notesMessage: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '400',
      color: '#5B5B5F',
    },
  },
}));

const NoDataFound = ({ titleText, descriptionText }) => {
  const classes = useStyles(); // Move the 'classes' assignment inside the component
  return (
    <Box className={classes.notesBox}>
      <NoDataIcon />
      {titleText && <Typography className={classes.notesError}>{titleText}</Typography>}
      {descriptionText && (
        <Typography className={classes.notesMessage}>{descriptionText}</Typography>
      )}
    </Box>
  );
};

NoDataFound.propTypes = {
  titleText: PropTypes.string,
  descriptionText: PropTypes.string,
};

export default NoDataFound;
