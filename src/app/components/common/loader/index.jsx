import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import Lottie from 'lottie-react';
import PropTypes from 'prop-types'; // Import PropTypes
import { mainDomain } from 'src/helper/utilityFunctions';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';

const useStyles = makeStyles((_theme) => ({
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    backgroundColor: 'rgba(0,0,0,0.2)', // Change this 0.2 value for backdrop brightness ==== this value maximum will be 1 and minimum 0
  },
  avatar: {
    '&.MuiAvatar-root': {
      height: 200,
      width: 200,
    },
  },
}));

const LoaderComponent = ({ className }) => {
  const classes = useStyles();

  const loader = MULTI_TENANT_AUTH[mainDomain()]?.loader;

  return (
    <Box className={classNames(className, classes.loaderContainer)}>
      <Lottie animationData={loader} loop={true} />
    </Box>
  );
};

LoaderComponent.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string,
  label: PropTypes.string,
};

LoaderComponent.defaultProps = {
  className: '',
  size: 20,
  color: 'primary',
  label: '',
};

export default LoaderComponent;
