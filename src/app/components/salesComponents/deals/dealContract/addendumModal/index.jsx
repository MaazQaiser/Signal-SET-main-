import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { contractTypeEnum } from 'src/utils/constants';

import { useStyles } from './addendumStyle';

const AddendumModal = ({
  open,
  handleCancelButton,
  handleConfirmButton,
  disabled,
  confirmButtonText,
  icon,
  cancelButtonText,
  modalType,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const addendumModalBody = (
    <Box className={classes.addendumModal}>
      {icon}
      <Box className={classes.addendumModalContent}>
        <Typography variant="h4" className={classes.rejectModalTitle}>
          {modalType === contractTypeEnum.addendum
            ? t('sales.contract.addendumCotractModalText')
            : t('sales.contract.cloneContractModalText')}
          {/*{`${t('sales.contract.addendumCotractModalText')}`}*/}
        </Typography>
        <Typography variant="body2" className={classes.rejectModalDescription}>
          {modalType === contractTypeEnum.addendum
            ? t('sales.contract.addendumCotractModalDesc')
            : t('sales.contract.cloneContractModalDesc')}
          {/*{`${t('sales.contract.addendumCotractModalDesc')}`}*/}
        </Typography>
        {}
        <Typography variant="body2" className={classes.rejectModalDescription}>
          {modalType === contractTypeEnum.addendum
            ? t('sales.contract.addendumCotractModalDescTwo')
            : t('sales.contract.cloneContractModalDescTwo')}
          {/*{`${t('sales.contract.addendumCotractModalDescTwo')}`}*/}
        </Typography>
      </Box>

      <Box className={classes.addendumModalActions}>
        <Button disabled={disabled} variant="secondaryGrey" onClick={handleCancelButton}>
          {cancelButtonText}
        </Button>
        <Button disabled={disabled} variant="primary" onClick={handleConfirmButton}>
          {confirmButtonText}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={handleCancelButton} body={addendumModalBody} />;
};

AddendumModal.propTypes = {
  open: PropTypes.bool,
  handleCancelButton: PropTypes.func,
  handleConfirmButton: PropTypes.func,
  disabled: PropTypes.bool,
  confirmButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  icon: PropTypes.icon,
  modalType: PropTypes.oneOf([contractTypeEnum.addendum, contractTypeEnum.clone]),
};

AddendumModal.defaultProps = {
  open: false,
};

export default AddendumModal;
