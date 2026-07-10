import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import { useStyles } from './savedPaymentMethod.js';

// Payment method icons/logos mapping
const getPaymentIcon = (type) => {
  const iconMap = {
    visa: '💳',
    mastercard: '💳',
    card: '💳',
    us_bank_account: '🏦',
    bank: '🏦',
  };
  return iconMap[type?.toLowerCase()] || '💳';
};

const _getPaymentLabel = (paymentType, type) => {
  if (paymentType === 'bank' || type === 'us_bank_account') {
    return 'Linked bank';
  }
  if (paymentType === 'card') {
    return type?.charAt(0).toUpperCase() + type?.slice(1) || 'Card';
  }
  return 'Payment method';
};

const SavedPaymentMethod = ({ paymentMethod }) => {
  const classes = useStyles();

  if (!paymentMethod) return null;

  const { type, last4, brand } = paymentMethod;
  // const label = getPaymentLabel(paymentType, type);
  const icon = getPaymentIcon(type);

  return (
    <Box className={classes.visaContainer}>
      <Box className={classes.content}>
        <Box className={classes.iconWrapper}>
          <Typography className={classes.icon}>{icon}</Typography>
        </Box>
        <Box className={classes.details}>
          <Typography className={classes.label}>{brand}</Typography>
          <Typography className={classes.cardNumber}>•••• •••• •••• {last4}</Typography>
        </Box>
      </Box>
      {/* <Button variant="text" color="error" onClick={onUpdate} className={classes.updateButton}>
        Update
      </Button> */}
    </Box>
  );
};

SavedPaymentMethod.propTypes = {
  paymentMethod: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    last4: PropTypes.string,
    brand: PropTypes.string,
  }),
};

SavedPaymentMethod.defaultProps = {
  paymentMethod: null,
};

export default SavedPaymentMethod;
