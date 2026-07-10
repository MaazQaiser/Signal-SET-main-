import { Box, Button, Dialog, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import { useStyles } from './confirmationDialog';

const ConfirmationDialog = ({
  title,
  description,
  open,
  handleClose,
  handleConfirm,
  disabled,
  action,
  icon,
}) => {
  const classes = useStyles();

  return (
    <Dialog className={classes.stageModal} open={open} onClose={handleClose}>
      <Box className={classes.modalTopArea}>
        {icon}
        <Box className={classes.modalTypoBox}>
          <Box variant="body3" className={classes.modalTextBody}>
            <Typography className={classes.modalHeading}>{title}</Typography>
            <Typography variant="body3" className={classes.modalTextUpper}>
              {description}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center"></Box>
      </Box>
      <Box className={classes.modalBottomArea}>
        <Button variant="secondaryGrey" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={disabled}>
          {action}
        </Button>
      </Box>
    </Dialog>
  );
};

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.string,
  icon: PropTypes.node,
};

export default ConfirmationDialog;
