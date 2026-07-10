import { Box, Button, Grow, Modal } from '@mui/material';
import { ReactComponent as CloseExpendIcon } from 'assets/svg/closeExpend.svg';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RichTextEditor from 'src/app/components/common/richText';

import { useStyles } from './styles';

const FormKeys = {
  SERVICES: 'services',
};

const DescriptionModal = ({ open, handleClose, updateFormHandler, formData, isPublished }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [formDescription, setFormDescription] = useState({
    [FormKeys.SERVICES]: formData?.[FormKeys.SERVICES] ?? EditorState.createEmpty(),
  });

  const handleChangeEditor = (event) => {
    const {
      target: { value, name },
    } = event;

    updateFormDescriptionHandler(name, value);
  };

  const updateFormDescriptionHandler = useCallback((name, value) => {
    setFormDescription((prevState) => {
      // Only update if the value has changed
      if (prevState[name] === value) {
        return prevState;
      }
      return {
        ...prevState,
        [name]: value,
      };
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    updateFormHandler(FormKeys?.SERVICES, formDescription?.[FormKeys?.SERVICES]);
    handleClose();
  }, [formDescription, handleClose, updateFormHandler]);

  useEffect(() => {
    setFormDescription({
      [FormKeys.SERVICES]: formData?.[FormKeys.SERVICES] ?? EditorState.createEmpty(),
    });
  }, [formData]);

  return (
    <Modal
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className={classes.notesModalContainer}
      disableEnforceFocus
    >
      <Grow in={open} timeout={300} style={{ transformOrigin: 'center' }}>
        <Box className={classes.popStyle}>
          <Box className={classes.icon}>
            <Button
              startIcon={<CloseExpendIcon />}
              variant="none"
              onClick={handleCloseModal}
            ></Button>
          </Box>
          <Box className={classes.descriptionText}>
            <RichTextEditor
              handleChange={handleChangeEditor}
              name={FormKeys.SERVICES}
              placeholder={t('sales.contract.typeHere')}
              value={
                formDescription?.[FormKeys.SERVICES] ||
                // formData?.[FormKeys.SERVICES] ||
                EditorState.createEmpty()
              }
              className={classes.descriptionTextArea}
              readOnly={isPublished}
              customClassEditor={classes.editorCustomHeight}
              textLimit={5000}
            />
          </Box>
        </Box>
      </Grow>
    </Modal>
  );
};

DescriptionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  updateFormHandler: PropTypes.func.isRequired,
  formData: PropTypes.object,
  handleChange: PropTypes.func,
  isPublished: PropTypes.bool,
};

export default DescriptionModal;
