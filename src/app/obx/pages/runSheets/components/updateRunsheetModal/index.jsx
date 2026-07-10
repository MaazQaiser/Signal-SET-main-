import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as AlertYellowIcon } from 'assets/svg/AlertYellowIcon.svg';
import PropTypes from 'prop-types';
import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';

import { useStyles } from './UpdateRunsheetModal';
const UpdateBody = ({ handleCloseModal, handleSubmit }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    handleCloseModal();
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    await handleSubmit();
    setIsLoading(false);
  };

  return (
    <Box className={classes.modalWrapper}>
      <AlertYellowIcon />
      <Box>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.runsheet.updateRunsheet!')}
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.runsheet.updateRunsheetText')}
        </Typography>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button onClick={handleClose} disabled={isLoading} variant="secondaryGrey">
          {t('obx.runsheet.cancel')}
        </Button>
        <Button variant="primary" disabled={isLoading} onClick={handleUpdate}>
          {t('obx.runsheet.updateRunsheet')}
        </Button>
      </Box>
    </Box>
  );
};

UpdateBody.propTypes = {
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

const UpdateRunsheetModal = ({ openModal, handleCloseModal, handleSubmit }) => {
  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={<UpdateBody handleCloseModal={handleCloseModal} handleSubmit={handleSubmit} />}
    />
  );
};

UpdateRunsheetModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

export default UpdateRunsheetModal;
