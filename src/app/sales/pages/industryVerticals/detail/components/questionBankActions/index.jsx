import { Box, Typography } from '@mui/material';
import { MoreVert } from 'assets/svg';
import { EditIcon, TrashIcon } from 'assets/svg';
import PropTypes from 'prop-types'; // Import PropTypes
import React from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton';
import {
  ACL_MARKET_VERTICALS_QUESTIONS_DELETE,
  ACL_MARKET_VERTICALS_QUESTIONS_UPDATE,
} from 'src/app/router/constant/SALESMODULE.jsx';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission.jsx';

import { useStyles } from './questionBankActions.styles.js';

const QuestionBankActions = ({ handleDelete, handleEdit, question }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const handleOnClickDelete = () => {
    handleDelete(question);
  };
  const handleOnClickEdit = () => {
    handleEdit(question);
  };

  return (
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
        <RenderIfHasPermission name={ACL_MARKET_VERTICALS_QUESTIONS_UPDATE}>
          <Box onClick={handleOnClickEdit} className={classes.questionBankActionsRegular}>
            <EditIcon className={classes.questionBankActionsIconRegular} />
            <Typography className={classes.questionBankActionsTextRegular} variant="subtitle2">
              {t('ho.templates.listing.actions.edit')}
            </Typography>
          </Box>
        </RenderIfHasPermission>
        <RenderIfHasPermission name={ACL_MARKET_VERTICALS_QUESTIONS_DELETE}>
          <Box onClick={handleOnClickDelete} className={classes.questionBankActionsDelete}>
            <TrashIcon className={classes.questionBankActionsIconDelete} />
            <Typography className={classes.questionBankActionsTextDelete} variant="subtitle2">
              {t('ho.templates.listing.actions.delete')}
            </Typography>
          </Box>
        </RenderIfHasPermission>
      </Box>
    </PopoverButton>
  );
};

// Define propTypes for your component
QuestionBankActions.propTypes = {
  question: PropTypes.object.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default QuestionBankActions;
