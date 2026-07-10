import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  quantityGroup: {
    border: '0px',
    '&.MuiButtonGroup-grouped': {
      minWidth: '30px',
    },
  },
  quantityButton: {
    '&.MuiButtonBase-root': {
      position: 'relative',
      zIndex: '2',
      width: '30px',
      height: '30px',
      minWidth: '30px !important',
      borderRadius: '100px !important',
      border: `1px solid ${theme.palette.borderSubtle1} !important`,
      backgroundColor: theme.palette.surfaceWhite,
      color: theme.palette.textPlaceholder,
      '&:hover': {
        backgroundColor: theme.palette.surfaceWhite,
        color: theme.palette.textPlaceholder,
      },
    },
  },
  quantityNumber: {
    '&.MuiButtonBase-root': {
      position: 'relative',
      width: '66px',
      borderRadius: '0',
      border: '0',
      backgroundColor: theme.palette.borderSubtle1,
      color: theme.palette.textPlaceholder,
      '&:disabled': {
        color: theme.palette.textPlaceholder,
        backgroundColor: theme.palette.borderSubtle1,
        border: '0',
      },
      '&:before': {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '-15px',
        width: '20px',
        height: '100%',
        background: theme.palette.borderSubtle1,
        zIndex: '1',
      },
      '&:after': {
        content: '""',
        position: 'absolute',
        top: '0',
        right: '-15px',
        width: '20px',
        height: '100%',
        background: theme.palette.borderSubtle1,

        zIndex: '1',
      },
    },
  },
}));

const QuantityButton = ({ value, handleIncrease, handleDecrease }) => {
  const classes = useStyles();

  return (
    <ButtonGroup className={classes.quantityGroup}>
      <Button className={classes.quantityButton} onClick={handleDecrease}>
        -
      </Button>
      <Button className={classes.quantityNumber} disabled>
        {value}
      </Button>
      <Button className={classes.quantityButton} onClick={handleIncrease}>
        +
      </Button>
    </ButtonGroup>
  );
};

QuantityButton.propTypes = {
  value: PropTypes.number,
  handleIncrease: PropTypes.func,
  handleDecrease: PropTypes.func,
};

export default QuantityButton;
