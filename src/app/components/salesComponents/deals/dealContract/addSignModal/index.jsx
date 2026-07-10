import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Chip, Typography } from '@mui/material';
import { ReactComponent as SignatureIcon } from 'assets/svg/signSIgnature.svg';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './addSignModalStyle';

const SIGNATURE_STATUS = {
  SIGNED: 'Signed',
};

const AddSignModal = ({ open, handleClose, contractData, icon, onAddSignClick }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const { signees } = contractData || {};

  const addSignModalBody = (
    <Box className={classes.addendumModal}>
      <Box className={classes.headerSection}>
        <Box>{icon || <SignatureIcon />}</Box>
        <Typography variant="h4" className={classes.title}>
          {t('sales.contract.addSignTitle')}
        </Typography>
      </Box>
      <Box className={classes.signeeList}>
        {signees?.map((signee) => {
          const isSigned = signee?.signatureStatus === 'Signed';
          const displayName =
            capitalizeFirstLetter(signee?.name) || `${t('sales.contract.name')}: ${NA}`;
          return (
            <Box key={signee?.id} className={classes.contactContent}>
              <Typography
                className={isSigned ? classes.signeeNameSigned : classes.signeeName}
                variant="body2"
              >
                {displayName}
              </Typography>
              {isSigned ? (
                <Chip label={SIGNATURE_STATUS.SIGNED} color="success" size="small" />
              ) : (
                <Box
                  component="span"
                  className={classes.addSignLink}
                  onClick={() => onAddSignClick?.(signee)}
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                  {t('sales.contract.addSign')}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      <Box className={classes.addendumModalActions}>
        <Button variant="secondaryGrey" onClick={handleClose} className={classes.closeButton}>
          {t('sales.contract.close')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={handleClose} body={addSignModalBody} />;
};

AddSignModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func.isRequired,
  contractData: PropTypes.object,
  icon: PropTypes.node,
  onAddSignClick: PropTypes.func,
};

AddSignModal.defaultProps = {
  open: false,
  contractData: {},
  icon: null,
  onAddSignClick: undefined,
};

export default AddSignModal;
