import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as ExportIcon } from 'assets/svg/ExportIcon.svg';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ModalComponent from 'src/app/components/common/modal';

import { useStyles } from './exportModal.js';
const ExportModalBody = ({ handleCloseModal, exportData, disable }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const userInfo = useSelector((state) => state.user.info);

  const NA = t('commonText.nA');

  return (
    <Box className={classes.modalWrapper}>
      <ExportIcon className={classes.warnIcon} />
      <Typography variant="h4" className={classes.headText}>
        {t('sales.dashboard.exportData!')}
      </Typography>
      <Typography variant="body2" className={classes.closetext}>
        {t('sales.dashboard.exportText')}{' '}
        <Typography component="span" variant="body2" className={classes.emailText}>
          {userInfo?.email || NA}
        </Typography>
      </Typography>

      <Box className={classes.inlineButtons}>
        <Button onClick={handleCloseModal} variant="secondaryGrey">
          {t('sales.locations.cancel')}
        </Button>
        <Button variant="primary" onClick={exportData} disabled={disable}>
          {t('sales.dashboard.exportData')}
        </Button>
      </Box>
    </Box>
  );
};

ExportModalBody.propTypes = {
  handleCloseModal: PropTypes.func,
  exportData: PropTypes.func,
  disable: PropTypes.bool,
};

const ExportModal = ({ openModal, handleCloseModal, exportData, disable }) => {
  return (
    <ModalComponent
      open={openModal}
      handleClose={handleCloseModal}
      body={
        <ExportModalBody
          handleCloseModal={handleCloseModal}
          exportData={exportData}
          disable={disable}
        />
      }
    />
  );
};

ExportModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  exportData: PropTypes.func,
  disable: PropTypes.bool,
};

export default ExportModal;
