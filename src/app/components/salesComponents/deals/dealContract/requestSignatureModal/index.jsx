import { Box, Button, Checkbox, Chip } from '@mui/material';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ModalComponent from 'src/app/components/common/modal';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg';
import { defaultImage, toastSettings } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './requestSignatureStyle';

const RequestSignatureModal = ({
  open,
  handleCancelButton,
  handleConfirmButton,
  disabled,
  confirmButtonText,
  icon,
  cancelButtonText,
  contractData,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const NA = t('commonText.nA');

  const { signees } = contractData;

  const [selectAll, setSelectAll] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);

    if (isChecked) {
      /**
       * If "Select All" is checked, select all items that are not signed
       */
      const unsignedSignees = signees.filter((signee) => signee?.signatureStatus !== 'Signed');
      setSelectedItems(unsignedSignees.map((row) => row.id));
      return; // Return early
    }
    /**
     * If "Select All" is unchecked, clear selected items
     */
    setSelectedItems([]);
  };

  const handleCheckboxChange = (event, id) => {
    if (event.target.checked) {
      /**
       * If the checkbox is checked
       * add the item to the selectedItems array
       */
      const updatedSelectedItems = [...selectedItems, id];
      setSelectedItems(updatedSelectedItems);

      const unsignedSignees = signees.filter((signee) => signee?.signatureStatus !== 'Signed');

      setSelectAll(unsignedSignees.length === updatedSelectedItems.length);
      return; // Return early
    }
    /**
     * If the checkbox is unchecked
     * remove the item from the selectedItems  array
     */
    setSelectedItems(selectedItems.filter((item) => item !== id));
    setSelectAll(false);
  };

  const validateSignature = (event) => {
    event.preventDefault();

    if (selectedItems?.length < 1) {
      toast.error(t('sales.deals.pleaseSelectAtLeastOneSignee'), {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }
    handleConfirmButton(event, selectedItems);
  };

  const requestSignatureModalBody = (
    <Box className={classes.addendumModal}>
      {icon}
      <Typography variant="h4" className={classes.selectSigneesText}>
        {t('sales.contract.selectSigneesToRequest')}
      </Typography>
      {/*Checkbox for Select All*/}
      <Box className={classes.selectAllWrapper}>
        <Checkbox
          checked={selectAll}
          onChange={handleSelectAllChange}
          icon={<CheckBoxRegularIcon />}
          checkedIcon={<CheckBoxCheckedIcon />}
          className={classes.checkBoxCustom}
        />
        <Typography className={classes.selectAllText}>{t('sales.contract.selectAll')}</Typography>
      </Box>

      {signees?.map((signee) => (
        <>
          <Box className={classes.contactContent}>
            <Box className={classes.signeeInfoWrapper}>
              <Checkbox
                checked={selectedItems.includes(signee.id)}
                onChange={(event) => handleCheckboxChange(event, signee?.id)}
                icon={<CheckBoxRegularIcon />}
                checkedIcon={<CheckBoxCheckedIcon />}
                className={classes.checkBoxCustom}
                disabled={signee?.signatureStatus === 'Signed'}
              />

              <Box className={classes.imageBox}>
                <img src={signee?.avatarUrl || defaultImage} className={classes.userImage} />
              </Box>
              <Box className={classes.contactDetailsWrapper}>
                <Typography className={classes.dataColmLabelContact}>
                  {capitalizeFirstLetter(signee?.name) || `${t('sales.contract.name')}: ${NA}`}
                </Typography>
                {signee?.email ? (
                  <Typography className={classes.emailText}>{signee?.email}</Typography>
                ) : (
                  <Typography
                    className={classes.emailText}
                  >{`${t('sales.contacts.email')}: ${NA}`}</Typography>
                )}
              </Box>
            </Box>
            <SignatureRequestChip status={signee?.signatureStatus || 'Not Requested'} t={t} />
          </Box>
        </>
      ))}
      <Box className={classes.addendumModalActions}>
        <Button disabled={disabled} variant="secondaryGrey" onClick={handleCancelButton}>
          {cancelButtonText}
        </Button>
        <Button disabled={disabled} variant="primary" onClick={validateSignature}>
          {confirmButtonText}
        </Button>
      </Box>
    </Box>
  );

  return (
    <ModalComponent open={open} handleClose={handleCancelButton} body={requestSignatureModalBody} />
  );
};

const SIGNATURE_STATUS_KEYS = {
  Signed: 'sales.contract.signatureStatusSigned',
  'Pending Sign': 'sales.contract.signatureStatusPendingSign',
  'Not Requested': 'sales.contract.signatureStatusNotRequested',
};

const SignatureRequestChip = ({ status = '', t }) => {
  const getChipColorClass = () => {
    switch (status) {
      case 'Signed':
        return 'success';
      case 'Pending Sign':
        return 'warning';
      case 'Not Requested':
        return 'error';
      default:
        return 'default';
    }
  };
  const label = t && SIGNATURE_STATUS_KEYS[status] ? t(SIGNATURE_STATUS_KEYS[status]) : status;
  return <Chip label={label} color={getChipColorClass()} size="small" />;
};

SignatureRequestChip.propTypes = {
  status: PropTypes.string.isRequired,
  t: PropTypes.func,
};

RequestSignatureModal.propTypes = {
  open: PropTypes.bool,
  handleCancelButton: PropTypes.func,
  handleConfirmButton: PropTypes.func,
  disabled: PropTypes.bool,
  confirmButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  icon: PropTypes.icon,
  contractData: PropTypes.object,
};

RequestSignatureModal.defaultProps = {
  open: false,
};

export default RequestSignatureModal;
