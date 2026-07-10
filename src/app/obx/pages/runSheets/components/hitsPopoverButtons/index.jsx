import { Box, Typography } from '@mui/material';
import { MoreVert } from 'assets/svg';
import { EditIcon, TrashIcon } from 'assets/svg';
import { ReactComponent as DuplicateIcon } from 'assets/svg/copy.svg';
import PropTypes from 'prop-types'; // Import PropTypes
import React from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton';

import { useStyles } from './HitsPopoverButtons.js';

const HitsActions = ({ setOpenDeleteModal, setIsEditing, setDuplicateRunsheetModal }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <>
      <PopoverButton
        className={classes.questionBankActions}
        variant="icon"
        Icon={MoreVert}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Box className={classes.questionBankActionsMenu}>
          <Box className={classes.questionBankActionsRegular} onClick={() => setIsEditing(true)}>
            <EditIcon className={classes.questionBankActionsIconRegular} />
            <Typography className={classes.questionBankActionsTextRegular} variant="subtitle2">
              {t('obx.runsheet.editRunsheet')}
            </Typography>
          </Box>
          <Box
            className={classes.questionBankActionsRegular}
            onClick={() => setDuplicateRunsheetModal(true)}
          >
            <DuplicateIcon className={classes.questionBankActionsIconRegular} />
            <Typography className={classes.questionBankActionsTextRegular} variant="subtitle2">
              {t('obx.runsheet.duplicateRunsheet')}
            </Typography>
          </Box>
          <Box
            className={classes.questionBankActionsDelete}
            onClick={() => setOpenDeleteModal(true)}
          >
            <TrashIcon className={classes.questionBankActionsIconDelete} />
            <Typography className={classes.questionBankActionsTextDelete} variant="subtitle2">
              {t('obx.runsheet.deleteRunsheet')}
            </Typography>
          </Box>
        </Box>
      </PopoverButton>
    </>
  );
};

// // Define propTypes for your component
HitsActions.propTypes = {
  handleOpenLocationModal: PropTypes.func,
  setOpenDeleteModal: PropTypes.func,
  setDuplicateRunsheetModal: PropTypes.func,
  handleOpenDuplicateRunsheetModal: PropTypes.func,
  setIsEditing: PropTypes.func,
};

export default HitsActions;
