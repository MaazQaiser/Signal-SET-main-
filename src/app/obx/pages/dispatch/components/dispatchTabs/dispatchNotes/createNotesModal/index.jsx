import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { createDispatchNote } from 'src/services/dispatch.services';
import { updateNote } from 'src/services/notes.service';
import { toastSettings } from 'src/utils/constants';

import NoteModal, { notesCharacterLimit } from './NoteModal';

const CreateNotesModal = ({
  open,
  objectId,
  handleClose,
  onSaveEdit,
  editableNote,
  className = null,
}) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const data = event?.target?.value;
    setDescription(data);
    data && setErrorMessage('');
  };

  const handleCancel = () => {
    setDescription(null);
    handleClose();
    setErrorMessage('');
  };

  const handleSave = async () => {
    if (!description) {
      return setErrorMessage(t('obx.schedules.dutyDetail.notes.addNotesErrorMsg'));
    }
    if (description?.length > notesCharacterLimit) {
      return setErrorMessage(
        t('obx.schedules.dutyDetail.notes.addNotesTextLimitErrorMsg', {
          limit: notesCharacterLimit,
        }),
      );
    }

    const payload = { content: description };

    try {
      let response;
      if (editableNote?.id) {
        response = await updateNote(editableNote?.id, payload);
      } else {
        response = await createDispatchNote(objectId, payload);
      }
      toast.success(response?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      onSaveEdit(response?.data?.note);
      handleClose();
      setDescription(null);
    } catch (error) {
      toast.error(error.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (editableNote) {
      setDescription(editableNote?.content);
    }
  }, [editableNote]);

  return (
    <>
      <NoteModal
        {...{
          open,
          handleCloseModal: handleClose,
          className,
          title: editableNote ? t('sales.companies.editNotes') : t('sales.companies.addNotes'),
          noteValue: description,
          errorMessage,
          handleChangeNoteValue: handleChange,
          handleCancelBtn: handleCancel,
          handleSaveBtn: handleSave,
        }}
      />
    </>
  );
};

CreateNotesModal.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  onSaveEdit: PropTypes.func,
  className: PropTypes.string,
  editableNote: PropTypes.object,
  objectId: PropTypes.string,
};

export default CreateNotesModal;
