import { Box, Button, InputLabel } from '@mui/material';
import Typography from '@mui/material/Typography';
import SignaturePad from 'commonComponents/signaturePad';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ModalComponent from 'src/app/components/common/modal';
import { defaultImage, toastSettings } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './signContractStyle';

const SignContractModal = ({
  open,
  handleCancelButton,
  handleConfirmButton,
  confirmButtonText,
  disabled,
  cancelButtonText,
  signee,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const NA = t('commonText.nA');

  const [signature, setSignature] = useState('');
  // const [disabled, setDisabled] = useState(false);

  const handleSignatureInput = (event) => {
    setSignature(event?.target?.value);
  };

  const handleConfirmClick = async (event) => {
    event.preventDefault();

    if (!signature?.length) {
      toast.error('Signatures are required', {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }

    handleConfirmButton({
      signature,
    });
  };

  const requestSignatureModalBody = (
    <Box className={classes.addendumModal}>
      <Typography variant="h4">Sign Contract</Typography>
      <Typography variant="body2" className={classes.signeeDetailWrapperitle}>
        Please add your details and signature
      </Typography>

      {/*Signee Detail*/}
      <Box className={classes.signeeDetailWrapper}>
        <img src={signee?.avatarUrl || defaultImage} className={classes.userImage} />

        <Box className={classes.contactDetailsWrapper}>
          <Typography className={classes.dataColmLabelContact}>
            {capitalizeFirstLetter(signee?.name) || `${t('sales.contract.name')}: ${NA}`}
          </Typography>
          {signee?.email ? (
            <Typography variant="body2" className={classes.emailIcon}>
              {signee?.email}
            </Typography>
          ) : (
            <Typography
              variant="body2"
              className={classes.emailIcon}
            >{`${t('sales.contacts.email')}: ${NA}`}</Typography>
          )}
        </Box>
      </Box>
      <InputLabel className={classes.drawSignatureLabel}>Draw Signature</InputLabel>
      <SignaturePad nameField={'signature'} handleChange={handleSignatureInput} />

      <Box className={classes.addendumModalActions}>
        <Button disabled={disabled} variant="secondaryGrey" onClick={handleCancelButton}>
          {cancelButtonText}
        </Button>
        <Button disabled={disabled} variant="primary" onClick={handleConfirmClick}>
          {confirmButtonText}
        </Button>
      </Box>
    </Box>
  );

  return (
    <ModalComponent open={open} handleClose={handleCancelButton} body={requestSignatureModalBody} />
  );
};

SignContractModal.propTypes = {
  open: PropTypes.bool,
  handleCancelButton: PropTypes.func,
  handleConfirmButton: PropTypes.func,
  disabled: PropTypes.bool,
  confirmButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  signee: PropTypes.object,
  contractId: PropTypes.string,
  resourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

SignContractModal.defaultProps = {
  open: false,
  resourceId: undefined,
};

export default SignContractModal;
