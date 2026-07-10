import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as DustinBinIcon } from 'assets/svg/warning.svg';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';

import { useStyles } from './confirmAssignment';
const DeleteBody = ({ handleCloseModal, handleSubmit }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleClose = () => {
    handleCloseModal();
  };

  return (
    <Box className={classes.modalWrapper}>
      <DustinBinIcon />
      <Box>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.runsheet.confirmAssignment')}
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.runsheet.confirmAssignmentText')}
        </Typography>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button onClick={handleClose} variant="secondaryGrey">
          {t('obx.runsheet.cancel')}
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {t('obx.runsheet.assignHits')}
        </Button>
      </Box>
    </Box>
  );
};

DeleteBody.propTypes = {
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

const ConfirmAssignmentModal = ({ openModal, handleCloseModal, handleSubmit }) => {
  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={<DeleteBody handleCloseModal={handleCloseModal} handleSubmit={handleSubmit} />}
    />
  );
};

ConfirmAssignmentModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

export default ConfirmAssignmentModal;
