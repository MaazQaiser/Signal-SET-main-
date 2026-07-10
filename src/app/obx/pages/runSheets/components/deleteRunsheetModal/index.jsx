import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as DustinBinIcon } from 'assets/svg/delete-modal.svg';
import PropTypes from 'prop-types';
import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ModalComponent from 'src/app/components/common/modal';
import { OBX_RUNSHEET } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { deleteRunsheetById } from 'src/services/runsheet.services';
import { toastSettings } from 'src/utils/constants';

import { useStyles } from './deleteRunsheetModal.style';

const DeleteRunsheetModal = ({ openModal, handleCloseModal, runsheetTemplateId }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const deleteRunsheet = async () => {
    try {
      setButtonDisabled(true);
      const response = await deleteRunsheetById(runsheetTemplateId);

      if (response.statusCode === 200) {
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleCloseModal();
        setButtonDisabled(false);
        history.push(`${OBX_RUNSHEET}`);
      }
    } catch (error) {
      setButtonDisabled(false);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleDelete = () => {
    if (runsheetTemplateId) {
      deleteRunsheet();
    }
  };

  const deleteModalBody = (
    <Box className={classes.modalWrapper}>
      <DustinBinIcon />
      <Box>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.runsheet.deleteRunsheet!')}
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.runsheet.deleteText')}
        </Typography>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button
          onClick={() => handleCloseModal()}
          disabled={buttonDisabled}
          variant="secondaryGrey"
        >
          {t('obx.runsheet.cancel')}
        </Button>
        <Button variant="destructive" onClick={() => handleDelete()} disabled={buttonDisabled}>
          {t('obx.runsheet.deleteRunsheet')}
        </Button>
      </Box>
    </Box>
  );

  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={deleteModalBody}
    />
  );
};

DeleteRunsheetModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  runsheetTemplateId: PropTypes.number,
};

export default DeleteRunsheetModal;
