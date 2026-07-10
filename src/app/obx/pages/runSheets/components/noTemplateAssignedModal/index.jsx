import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as AlertYellowIcon } from 'assets/svg/AlertYellowIcon.svg';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';

import { useStyles } from './noTemplateAssignedModal';
export const NoTourTemplateModalBody = ({ handleCloseModal, handleSubmit }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleClose = () => {
    handleCloseModal();
  };

  return (
    <Box className={classes.modalWrapper}>
      <AlertYellowIcon />
      <Box>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.runsheet.noTourTemplateAssigned')}
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.runsheet.noTourTemplateAssignedDescription')}
        </Typography>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button onClick={handleClose} variant="secondaryGrey">
          {t('obx.runsheet.cancel')}
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {t('obx.runsheet.addTemplate')}
        </Button>
      </Box>
    </Box>
  );
};

NoTourTemplateModalBody.propTypes = {
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

const NoTourTemplateModal = ({ openModal, handleCloseModal, handleSubmit }) => {
  return (
    <ModalComponent
      open={openModal}
      body={
        <NoTourTemplateModalBody handleCloseModal={handleCloseModal} handleSubmit={handleSubmit} />
      }
    />
  );
};

NoTourTemplateModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

export default NoTourTemplateModal;
