import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';
import { ReactComponent as ClosedDispatchIcon } from 'assets/svg/ClosedDispatchIcon.svg';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ModalComponent from 'src/app/components/common/modal';
import RequiredAsterik from 'src/app/components/common/requiredAsterik/index.jsx';
import { closeDispatch } from 'src/services/dispatch.services.js';
import { toastSettings } from 'src/utils/constants/index.js';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck.js';

import { useStyles } from './CloseDispatchModal.js';

const CloseDispatchModalBody = ({ dispatch, handleCloseModal, onDispatchClose }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCloseDispatch = async () => {
    try {
      const errors = await joiValidate({ reason }, t);
      if (errors && Object.keys(errors).length) {
        setErrors(errors);
        setTimeout(() => setErrors({}), 3000);
        return;
      }
      setLoading(true);
      const result = await closeDispatch(dispatch.id, { reason });
      if (result.statusCode === 200) {
        toast.success(result?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleCloseModal();
        onDispatchClose(dispatch);
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <Box className={classes.modalWrapper}>
      <ClosedDispatchIcon className={classes.warnIcon} />
      <Typography variant="h3" className={classes.headText}>
        {t('obx.dispatch.closeDispatch')}!
      </Typography>
      <Typography variant="body2" className={classes.closetext}>
        {t('obx.dispatch.closeDispatchText')}{' '}
      </Typography>
      <Box className={classes.banModalBodyField}>
        <InputLabel>
          {t('obx.dispatch.reason')}
          <RequiredAsterik />
        </InputLabel>
        <TextField
          className={classes.banModalBodyFieldArea}
          placeholder={t('obx.dispatch.addReason')}
          inputProps={{ maxLength: 100 }}
          multiline
          value={reason}
          onChange={(event) => setReason(event?.target?.value)}
          minRows={3}
          maxRows={3}
          name="reason"
          error={!!errors.reason}
          helperText={errors?.reason || null}
        />
      </Box>
      <Box className={classes.inlineButtons}>
        <Button onClick={handleCloseModal} variant="secondaryGrey">
          {t('obx.dispatch.cancel')}
        </Button>
        <Button onClick={handleCloseDispatch} disabled={loading} variant="destructive">
          {t('obx.dispatch.closeDispatch')}
        </Button>
      </Box>
    </Box>
  );
};

CloseDispatchModalBody.propTypes = {
  handleCloseModal: PropTypes.func,
  dispatch: PropTypes.object,
  onDispatchClose: PropTypes.func,
};

const CloseDispatchModal = ({ openModal, dispatch, handleCloseModal, onDispatchClose }) => {
  return (
    <ModalComponent
      open={openModal}
      handleClose={handleCloseModal}
      body={
        <CloseDispatchModalBody
          dispatch={dispatch}
          handleCloseModal={handleCloseModal}
          onDispatchClose={onDispatchClose}
        />
      }
    />
  );
};

CloseDispatchModal.propTypes = {
  dispatch: PropTypes.object,
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handleDispatchClose: PropTypes.func,
  onDispatchClose: PropTypes.func,
};

export default CloseDispatchModal;
