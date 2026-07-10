import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as AlertYellowIcon } from 'assets/svg/AlertYellowIcon.svg';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';

import { useStyles } from './AddTemplateModal';
const AddBody = ({ handleCloseModal }) => {
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
          {t('obx.runsheet.noTourTemplateSelected!')}
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.runsheet.noTourTemplateSelectedText')}
        </Typography>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button onClick={handleClose} variant="secondaryGrey">
          {t('obx.runsheet.cancel')}
        </Button>
        <Button variant="primary">{t('obx.runsheet.addTemplate')}</Button>
      </Box>
    </Box>
  );
};

AddBody.propTypes = {
  handleCloseModal: PropTypes.func,
};

const AddTemplateModal = ({ openModal, handleCloseModal }) => {
  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={<AddBody handleCloseModal={handleCloseModal} />}
    />
  );
};

AddTemplateModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
};

export default AddTemplateModal;
