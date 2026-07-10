import { Box, Button, Drawer, IconButton, InputLabel, TextField, Typography } from '@mui/material';
import FieldError from 'commonComponents/fieldError';
import RichTextEditor, { convertDataToHtml } from 'commonComponents/richText';
import SweetAlertModal from 'commonComponents/sweetAlertModal';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { createEmail } from 'services/email.services';
// import { ReactComponent as AttachmentIcon } from 'src/assets/svg/attachment.svg';
import { ReactComponent as CloseIcon } from 'src/assets/svg/close.svg';
import { ReactComponent as CrossIcon } from 'src/assets/svg/close.svg';
// import { ReactComponent as LinkIcon } from 'src/assets/svg/link.svg';
import { isObjectEmpty, removeKey, removeKeysFromObject } from 'src/helper/utilityFunctions';
import useFormHook from 'src/hooks/useFormHook';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './styles';

const formKeys = {
  to: 'to',
  toInput: 'to-Input',
  cc: 'cc',
  ccInput: 'cc-Input',
  bcc: 'bcc',
  bccInput: 'bcc-Input',
  subject: 'subject',
  description: 'description',
};

const initialForm = {
  [formKeys.to]: [],
  [formKeys.cc]: [],
  [formKeys.bcc]: [],
  [formKeys.subject]: '',
  [formKeys.description]: EditorState.createEmpty(),
};

const CreateEmailDrawer = ({ contacts, open, onClose, fetchEmails }) => {
  const { t } = useTranslation();

  const { id: locationId } = useParams();

  const classes = useStyles();
  const inputRef = useRef(null);
  const [activeField, setActiveField] = useState(null);
  const [addCc, setAddCc] = useState(false);
  const [addBcc, setAddBcc] = useState(false);

  const [loading, setLoading] = useState(false);

  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const { handleInputChange, formData, setFormData, errorMessages, setErrorMessages } = useFormHook(
    {
      defaultFormData: { ...initialForm, [formKeys.to]: contacts?.map((c) => c?.email) || [] },
    },
  );

  const toggleCancelAlert = () => {
    setShowCancelAlert((a) => !a);
  };

  const closeModalAndClearFunction = () => {
    clearForm();
    onClose();
  };

  const clearForm = () => {
    setFormData(initialForm);
    setErrorMessages({});
  };

  const concatEmailInputs = (currentFormData) => {
    const updatedFormData = { ...currentFormData };

    if (currentFormData?.[formKeys.toInput]?.trim()) {
      updatedFormData[formKeys.to] = [
        ...(currentFormData[formKeys.to] || []),
        currentFormData[formKeys.toInput].trim(),
      ];
      updatedFormData[formKeys.toInput] = '';
    }

    if (currentFormData?.[formKeys.ccInput]?.trim()) {
      updatedFormData[formKeys.cc] = [
        ...(currentFormData[formKeys.cc] || []),
        currentFormData[formKeys.ccInput].trim(),
      ];
      updatedFormData[formKeys.ccInput] = '';
    }

    if (currentFormData?.[formKeys.bccInput]?.trim()) {
      updatedFormData[formKeys.bcc] = [
        ...(currentFormData[formKeys.bcc] || []),
        currentFormData[formKeys.bccInput].trim(),
      ];
      updatedFormData[formKeys.bccInput] = '';
    }

    return updatedFormData;
  };

  const convertEmailStringArrayToObjectsArray = (emailStringsArray) => {
    return emailStringsArray.map((email) => ({ email }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFormData = concatEmailInputs(formData);
    setFormData(updatedFormData); // still update state if needed

    let payload = {
      ...updatedFormData,
      description: convertDataToHtml(updatedFormData?.[formKeys.description]),
    };

    const errors = await joiValidate(payload, t);

    if (errors && Object.keys(errors).length) {
      console.log('errors', { errors });
      setErrorMessages(errors);
      return;
    }

    setLoading(true);
    payload = {
      ...payload,
      to: convertEmailStringArrayToObjectsArray(payload?.to),
      cc: convertEmailStringArrayToObjectsArray(payload?.cc),
      bcc: convertEmailStringArrayToObjectsArray(payload?.bcc),
      body: payload.description,
    };

    payload = removeKeysFromObject(payload, [
      formKeys?.toInput,
      formKeys?.ccInput,
      formKeys?.bccInput,
      formKeys?.description,
    ]);

    try {
      const response = await createEmail(locationId, payload);
      if (response?.statusCode === 200) {
        fetchEmails();

        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      fetchEmails();

      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
      closeModalAndClearFunction();
    }
  };

  const handleInputChangeForEmails = (e) => {
    const { name, value } = e.target;
    // if (name === 'to') {
    setFormData((prev) => ({
      ...prev,
      [`${name}-Input`]: value,
    }));
    // }
  };

  const handleEditorChange = (event) => {
    const {
      target: { value },
    } = event;
    if (value) {
      setErrorMessages((prev) => removeKey('description', prev));
    }
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));
  };

  const handleRemoveEmail = (key, emailToRemove) => {
    setFormData((prev) => ({
      ...prev,
      [key]: formData?.[key]?.filter((email) => email !== emailToRemove),
    }));
    // setEmails((prev) => prev.filter((email) => email !== emailToRemove));
  };

  const handleKeyDown = async (e) => {
    const value = e?.target?.value?.trim();
    const name = e?.target?.name;
    if (e.key === 'Enter' && value) {
      e.preventDefault();
      if (value.includes('@')) {
        const error = await joiValidate({ email: value }, t);
        if (!isObjectEmpty(error)) {
          return;
        }
        setFormData((prev) => ({
          ...prev,
          [`${name}-Input`]: '',
          [name]: [...prev[name], value],
        }));
        e.target.value = ''; // Clear the input field after adding the email
      }
    }
  };

  const hasEmailErrors = (formKey) => {
    let exist = false;
    let exactMatch = false;

    Object.keys(errorMessages).forEach((key) => {
      if (key === formKey) {
        exist = true;
        exactMatch = true;
      } else if (key.includes(`${formKey},`)) {
        exist = true;
      }
    });

    return { exist, exactMatch };
  };

  const handleInputBlur = async (e) => {
    const value = e?.target?.value?.trim();
    const name = e?.target?.name;
    if (value) {
      e.preventDefault();
      if (value.includes('@')) {
        const error = await joiValidate({ email: value }, t);
        if (!isObjectEmpty(error)) {
          return;
        }
        setFormData((prev) => ({
          ...prev,
          [`${name}-Input`]: '',
          [name]: [...prev[name], value],
        }));
        e.target.value = ''; // Clear the input field after adding the email
      }
    }
  };

  const handleContainerClick = (fieldName) => {
    setActiveField(fieldName);
  };

  // One effect to handle all focus operations
  useEffect(() => {
    if (activeField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeField]);

  useEffect(() => {
    console.log('called');
    setFormData((prev) => ({
      ...prev,
      [formKeys.to]: contacts?.map((c) => c?.email) || [],
    }));
  }, []);

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={closeModalAndClearFunction}
      classes={{
        paper: classes.drawerPaper,
      }}
      SlideProps={{
        direction: 'up',
      }}
    >
      <Box className={classes.drawerHeader}>
        <Typography variant="h3">{t('sales.locations.newMessage')}</Typography>
        <IconButton onClick={closeModalAndClearFunction}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box component="form" onSubmit={handleSubmit} className={classes.form}>
        <Box className={classes.subjectContainer}>
          <InputLabel htmlFor="to">{t('sales.locations.to')}</InputLabel>
          <Box className={classes.emailChipsContainer} onClick={() => handleContainerClick('to')}>
            {formData?.[formKeys.to]?.map((email) => (
              <Box key={email} className={classes.emailChip}>
                <span className="chipText">{email}</span>
                <CrossIcon
                  className="deleteIcon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveEmail(formKeys?.to, email);
                  }}
                />
              </Box>
            ))}
            <TextField
              inputRef={activeField === formKeys.to ? inputRef : null}
              id="to"
              value={formData?.[formKeys.toInput]}
              onChange={handleInputChangeForEmails}
              name={formKeys.to}
              variant="outlined"
              placeholder={
                formData?.[formKeys?.to]?.length === 0 ? 'Enter email address' : 'Add email'
              }
              size="small"
              onKeyDown={handleKeyDown}
              onBlur={handleInputBlur}
            />
          </Box>
          {hasEmailErrors(formKeys.to)?.exist && (
            <FieldError
              error={
                hasEmailErrors(formKeys.to)?.exactMatch
                  ? 'To must contain at-least 1 recipient'
                  : 'There is an invalid email in the field'
              }
            />
          )}
          <Box className={classes.ccBccContainer}>
            <Button variant="textOnly" onClick={() => setAddCc(true)} size={'small'}>
              Cc
            </Button>
            <Button variant="textOnly" onClick={() => setAddBcc(true)}>
              Bcc
            </Button>
          </Box>
        </Box>
        {addCc && (
          <Box className={classes.subjectContainer}>
            <InputLabel htmlFor="cc">cc</InputLabel>
            <Box
              className={classes.emailChipsContainer}
              onClick={() => handleContainerClick(formKeys.cc)}
            >
              {formData?.[formKeys.cc]?.map((email) => (
                <Box key={email} className={classes.emailChip}>
                  <span className="chipText">{email}</span>
                  <CrossIcon
                    className="deleteIcon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveEmail(formKeys.cc, email);
                    }}
                  />
                </Box>
              ))}
              <TextField
                inputRef={activeField === formKeys.cc ? inputRef : null}
                id="cc"
                value={formData?.[formKeys.ccInput]}
                onChange={handleInputChangeForEmails}
                name={formKeys.cc}
                variant="outlined"
                placeholder={
                  formData?.[formKeys.cc]?.length === 0 ? 'Enter email address' : 'Add email'
                }
                size="small"
                onKeyDown={handleKeyDown}
                onBlur={handleInputBlur}
              />
            </Box>
            {hasEmailErrors(formKeys.cc)?.exist && (
              <FieldError
                error={
                  hasEmailErrors(formKeys.cc)?.exactMatch
                    ? 'cc must contain at-least 1 recipient'
                    : 'There is an invalid email in the field'
                }
              />
            )}
          </Box>
        )}
        {addBcc && (
          <Box className={classes.subjectContainer}>
            <InputLabel htmlFor="bcc">bcc</InputLabel>
            <Box
              className={classes.emailChipsContainer}
              onClick={() => handleContainerClick(formKeys.bcc)}
            >
              {formData?.[formKeys.bcc]?.map((email) => (
                <Box key={email} className={classes.emailChip}>
                  <span className="chipText">{email}</span>
                  <CrossIcon
                    className="deleteIcon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveEmail(formKeys.bcc, email);
                    }}
                  />
                </Box>
              ))}
              <TextField
                inputRef={activeField === formKeys.bcc ? inputRef : null}
                id="bcc"
                value={formData?.[formKeys.bccInput]}
                onChange={handleInputChangeForEmails}
                name={formKeys.bcc}
                variant="outlined"
                placeholder={
                  formData?.[formKeys.bcc]?.length === 0 ? 'Enter email address' : 'Add email'
                }
                size="small"
                onKeyDown={handleKeyDown}
                onBlur={handleInputBlur}
              />
            </Box>
            {hasEmailErrors(formKeys.bcc)?.exist && (
              <FieldError
                error={
                  hasEmailErrors(formKeys.bcc)?.exactMatch
                    ? 'To must contain at-least 1 recipient'
                    : 'There is an invalid email in the field'
                }
              />
            )}
          </Box>
        )}
        <Box className={classes.subjectContainer}>
          <InputLabel htmlFor="subject">{t('sales.locations.subject')}</InputLabel>
          <TextField
            id="subject"
            value={formData?.[formKeys.subject]}
            onChange={handleInputChange}
            name={formKeys.subject}
            variant="outlined"
            fullWidth
            error={!!errorMessages[formKeys.subject]}
            helperText={!!errorMessages[formKeys.subject] ? errorMessages[formKeys.subject] : null}
          />
        </Box>
        <Box className={classes.subjectContainer}>
          <InputLabel htmlFor="subject">{t('form.input.textField.description.label')}</InputLabel>
          <RichTextEditor
            handleChange={handleEditorChange}
            name={formKeys.description}
            placeholder={t('sales.companies.rictTextPlaceholder')}
            value={formData?.[formKeys.description] || EditorState.createEmpty()}
          />
          {!!errorMessages?.description && <FieldError error={errorMessages?.description} />}
        </Box>
        <Box className={classes.actionButtons}>
          {/*Hide attachments and link button as they are not functional now*/}
          <Box className="leftActions">
            {/*<IconButton className="iconButton" onClick={() => {}}>*/}
            {/*  <AttachmentIcon />*/}
            {/*</IconButton>*/}
            {/*<IconButton className="iconButton" onClick={() => {}}>*/}
            {/*  <LinkIcon />*/}
            {/*</IconButton>*/}
          </Box>
          <Box className="rightActions">
            <Button variant="secondaryGrey" onClick={toggleCancelAlert}>
              {t('sales.locations.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={formData?.[formKeys.to].length === 0 || loading}
            >
              {t('sales.locations.sendEmail')}
            </Button>
          </Box>
        </Box>
      </Box>
      {showCancelAlert && (
        <SweetAlertModal
          type="warning" // 'success', 'error', 'warning', 'info', etc.
          title={t('commonText.modal.areYouSure.title')}
          text={`This email will not be saved if you proceed with discarding it.`}
          cancelButtonText={t('buttons.no')}
          confirmButtonText={t('buttons.yes')}
          show={showCancelAlert}
          handleConfirmButton={closeModalAndClearFunction}
          handleCancelButton={toggleCancelAlert}
          // icon={<DeleteIcon />}
        />
      )}
    </Drawer>
  );
};

CreateEmailDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  contacts: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchEmails: PropTypes.func.isRequired,
};

export default CreateEmailDrawer;
