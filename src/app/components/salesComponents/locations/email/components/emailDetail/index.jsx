import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import SweetAlertModal from 'commonComponents/sweetAlertModal';
import dayjs from 'dayjs';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  deleteMessage,
  getEmailDetailAndThread,
  markAsUnread,
  replyMessage,
  threadDelete,
} from 'services/email.services';
import FieldError from 'src/app/components/common/fieldError';
import RichTextEditor, { convertDataToHtml } from 'src/app/components/common/richText';
import ActivityBarSkeleton from 'src/app/components/common/skeletonLoader/activityBarSkeleton';
import { ReactComponent as AttachmentIcon } from 'src/assets/svg/attachment.svg';
import { ReactComponent as CrossIcon } from 'src/assets/svg/close.svg';
import { ReactComponent as DeleteIcon } from 'src/assets/svg/DeleteIconBin.svg';
import { ReactComponent as BackIcon } from 'src/assets/svg/emailarrow.svg';
import { ReactComponent as EmailReplyIcon } from 'src/assets/svg/emailreply.svg';
// import { ReactComponent as EmailTrash } from 'src/assets/svg/emailTrash.svg';
import { ReactComponent as LinkIcon } from 'src/assets/svg/link.svg';
import { ReactComponent as MenuIcon } from 'src/assets/svg/more-vertical.svg';
import { ReactComponent as SendIcon } from 'src/assets/svg/send.svg';
import { useApiControllers } from 'src/helper/axios';
import { isObjectEmpty, removeKey, removeKeysFromObject } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/renderIfHasPermission';
import useFormHook from 'src/hooks/useFormHook';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import capitalize from 'src/utils/string/capitalize';
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
  toFullText: 'toFullText',
};

const _replyOption = {
  reply: 'reply',
  replyAll: 'replyAll',
};

const messageType = {
  message: 'message',
  thread: 'thread',
};

const initialForm = {
  [formKeys.to]: [],
  [formKeys.cc]: [],
  [formKeys.bcc]: [],
  [formKeys.subject]: '',
  [formKeys.description]: EditorState.createEmpty(),
};

const EmailDetail = ({
  emailData,
  onBack,
  refetchData,
  markEmailUnread,
  permissionSet = {
    updateEmailPermission: null,
    deleteEmailPermission: null,
  },
}) => {
  const classes = useStyles();
  const inputRef = useRef(null);

  const { t } = useTranslation();
  const { timePrecision } = useSelector(getDisplayConfiguration);

  const { id: locationId } = useParams();

  const { getNewApiController } = useApiControllers();
  const [activeField, setActiveField] = useState(null);
  const [expandedIds, setExpandedIds] = useState([0]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [_anchorEl2, setAnchorEl2] = useState(null);
  const [activeEmailId, setActiveEmailId] = useState(null);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [addTo, setAddTo] = useState(false);
  const [addCc, setAddCc] = useState(false);
  const [addBcc, setAddBcc] = useState(false);
  const [emailThread, setEmailThread] = useState([]);

  const [currentSelected, setCurrentSelected] = useState({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const userInfo = useSelector((state) => state.user.info);

  const { formData, setFormData, errorMessages, setErrorMessages } = useFormHook({
    defaultFormData: {
      ...initialForm,
    },
  });

  if (isObjectEmpty(emailData)) return null;

  const handleAccordionChange = (id) => (event, isExpanded) => {
    setExpandedIds((prev) => (isExpanded ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  const getPreviewText = (content) => {
    return content?.length > 120 ? content?.substring(0, 120) + '...' : content;
  };

  const handleMenuClick = (event, emailId) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveEmailId(emailId);
  };

  const _handleThreadMenuClick = (event, emailId) => {
    event.stopPropagation();
    setAnchorEl2(event.currentTarget);
    setActiveEmailId(emailId);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
    setActiveEmailId(null);
    // clearForm();
  };

  const clearForm = () => {
    setAddTo(false);
    setAddCc(false);
    setAddBcc(false);
    setFormData(initialForm);
    setErrorMessages({});
  };

  const markAsRead = async (event) => {
    event.stopPropagation();
    handleMenuClose();
    markEmailUnread();
    try {
      const response = await markAsUnread(locationId, emailData?.id);
      if (response?.statusCode === 200) {
        // toaster.success({
        //   text: response?.message,
        //   position: 'top-right',
        //   autoClose: toastSettings.AUTO_CLOSE,
        // });
      }
    } catch (error) {
      // catch the error and close reply section
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      // onBack();
    }
  };

  const handleReplyClick = (event, selectedEmail, isReplyAll) => {
    event.stopPropagation();
    handleMenuClose();
    setShowReplyBox(true);

    // Select the email we are replying to
    // const selectedEmail = currentSelected?.email || emailThread[emailThread?.length - 1];

    // check if the user is replying to his own email
    const isReplyingToOwnEmail = selectedEmail?.from?.some(
      (sender) => sender?.email === userInfo?.email,
    );

    /**
     * If the user is replying to their own email,
     * then the to field should be the original email’s recipients (to).
     * Otherwise, the (to) should be the sender (from).
     * */
    const toRecipients = isReplyingToOwnEmail
      ? selectedEmail?.to?.map((c) => c?.email)
      : selectedEmail?.from?.map((c) => c?.email);

    const toFullText = isReplyingToOwnEmail ? selectedEmail?.to : selectedEmail?.from;

    console.log({ selectedEmail });
    // Handle CC for Reply All
    let ccRecipients = [];
    if (isReplyAll) {
      const originalCC = selectedEmail?.cc || [];

      // Exclude current user and emails already in 'to'
      ccRecipients = originalCC?.map((cc) => cc.email);
    }

    setFormData((prev) => ({
      ...prev,
      [formKeys.subject]: selectedEmail?.subject || '',
      [formKeys.to]: toRecipients || [],
      [formKeys.toFullText]: toFullText || [],
      [formKeys.cc]: ccRecipients || [],
      [formKeys.bcc]: [],
    }));
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

  const handleReplySubmit = async () => {
    // setReplyText(EditorState.createEmpty());
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

    setDisabled(true);
    payload = {
      ...payload,
      to: convertEmailStringArrayToObjectsArray(payload?.to),
      cc: convertEmailStringArrayToObjectsArray(payload?.cc),
      bcc: convertEmailStringArrayToObjectsArray(payload?.bcc),
      body: payload.description,
      reply_to_message_id: currentSelected?.email?.nylasId,
    };

    payload = removeKeysFromObject(payload, [
      formKeys?.toInput,
      formKeys?.ccInput,
      formKeys?.bccInput,
      formKeys?.description,
      formKeys?.toFullText,
    ]);
    try {
      const response = await replyMessage(locationId, emailData?.id, payload);
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      // catch the error and close reply section

      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      clearForm();
      setDisabled(false);
      setShowReplyBox(false);
      getEmailThread(emailData?.id);
    }
  };

  const _handleForward = (event) => {
    event.stopPropagation();
    handleMenuClose(event);
  };

  const toggleDeleteModal = () => {
    setShowDeleteModal((a) => !a);
  };

  const handleDelete = (event, email, type = messageType.message) => {
    event.stopPropagation();
    setCurrentSelected({
      email: email,
      type: type,
    });
    toggleDeleteModal();
    handleMenuClose(event);
    clearForm();
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

  const getReplyToText = () => {
    const recipients = formData?.[formKeys.toFullText];
    if (!recipients?.length) return '';

    const displayLimit = 2;
    const visibleRecipients = recipients?.slice(0, displayLimit);
    const remainingCount =
      recipients?.length - displayLimit > 0 ? recipients?.length - displayLimit : 0;

    const formatted = visibleRecipients
      ?.map((r) => (r.name ? `${r.name} <${r.email}>` : r.email))
      ?.join(', ');

    // const baseText = formatted.join(', ');
    // const suffix = remainingCount > 0 ? ` +${remainingCount} more` : '';

    // return baseText + suffix;
    return {
      baseText: formatted,
      remainingCount,
    };
  };

  const { baseText, remainingCount } = getReplyToText();

  const getInitials = (fullName) => {
    fullName = fullName?.includes('@') ? fullName.split('@')?.[0] : fullName;
    return fullName
      ?.split(' ')
      ?.map((name) => name?.[0])
      ?.join('');
  };

  const handleContainerClick = (fieldName) => {
    setActiveField(fieldName);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleKeyDown = async (e) => {
    const value = e?.target?.value?.trim();
    const name = e?.target?.name;
    if (e.key === 'Enter' && value) {
      e.preventDefault();
      if (!validateEmail(value)) {
        setErrorMessages((prev) => ({
          ...prev,
          [name]: 'Invalid email format',
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [`${name}-Input`]: '',
        [name]: [...(prev[name] || []), value],
      }));
      setErrorMessages((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleInputBlur = async (e) => {
    const value = e?.target?.value?.trim();
    const name = e?.target?.name;
    if (value) {
      e.preventDefault();
      if (!validateEmail(value)) {
        setErrorMessages((prev) => ({
          ...prev,
          [name]: 'Invalid email format',
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [`${name}-Input`]: '',
        [name]: [...(prev[name] || []), value],
      }));
      setErrorMessages((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRemoveEmail = (key, emailToRemove) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key]?.filter((email) => email !== emailToRemove),
    }));
  };

  const handleInputChangeForEmails = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [`${name}-Input`]: value,
    }));
    if (value === '') {
      setErrorMessages((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const renderReplyBox = () => (
    <Box className={classes.replyContainer}>
      <Avatar className={classes.replyAvatar}>
        {getInitials(
          formData?.[formKeys.toFullText]?.[0]?.name || formData?.[formKeys.toFullText]?.[0]?.email,
        )}
      </Avatar>
      <Box className={classes.replyBoxContainer}>
        <Box className={classes.replyHeader}>
          {!addTo && (
            <Box className={classes.replyTo} onClick={() => setAddTo(true)}>
              <Typography className={classes.replyToLabel}>To:</Typography>
              <Typography className={classes.replyToText}>{baseText}</Typography>
              {remainingCount > 0 && (
                <Typography className={classes.replyToText}>+{remainingCount} More</Typography>
              )}
            </Box>
          )}
          {addTo && (
            <Box className={classes.subjectContainer}>
              <Box className={classes.ccContainer}>
                <Typography className={classes.replyToLabel}>To:</Typography>
                <Box
                  className={classes.emailChipsContainer}
                  onClick={() => handleContainerClick(formKeys.to)}
                >
                  {formData?.[formKeys.to]?.map((email) => (
                    <Box key={email} className={classes.emailChip}>
                      <span className="chipText">{email}</span>
                      <CrossIcon
                        className="deleteIcon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveEmail(formKeys.to, email);
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
                    placeholder={formData?.[formKeys.to]?.length === 0 ? 'Add email' : 'Add email'}
                    size="small"
                    onKeyDown={handleKeyDown}
                    onBlur={handleInputBlur}
                    className={classes.ccInput}
                  />
                </Box>
              </Box>
              {errorMessages[formKeys.to] && <FieldError error={errorMessages[formKeys.to]} />}
            </Box>
          )}
          <Box>
            <Box className={classes.ccBccContainer}>
              <Button variant="textOnly" onClick={() => setAddCc(true)} size={'small'}>
                Cc
              </Button>
              <Button variant="textOnly" onClick={() => setAddBcc(true)}>
                Bcc
              </Button>
              <IconButton
                className={classes.closeButton}
                onClick={() => setShowReplyBox(false)}
                size="small"
              >
                <CrossIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {addCc && (
          <Box className={classes.subjectContainer}>
            <Box className={classes.ccContainera}>
              <Typography className={classes.replyToLabel}>Cc:</Typography>
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
                  placeholder={formData?.[formKeys.cc]?.length === 0 ? 'Add email' : 'Add email'}
                  size="small"
                  onKeyDown={handleKeyDown}
                  onBlur={handleInputBlur}
                  className={classes.ccInput}
                />
              </Box>
            </Box>
            {errorMessages[formKeys.cc] && <FieldError error={errorMessages[formKeys.cc]} />}
          </Box>
        )}
        {addBcc && (
          <Box className={classes.subjectContainer}>
            <Box className={classes.ccContainera}>
              <Typography className={classes.replyToLabel}>Bcc:</Typography>
              <Box
                className={classes.emailChipsContainer}
                onClick={() => handleContainerClick(formKeys.bcc)}
              >
                {formData?.[formKeys.bcc]?.map((email) => (
                  <Box key={email} className={classes.emailChip}>
                    <span className="chipText">{email}</span>
                    <CrossIcon
                      className={classes.deleteIcon}
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
                  placeholder={formData?.[formKeys.bcc]?.length === 0 ? 'Add email' : 'Add email'}
                  size="small"
                  onKeyDown={handleKeyDown}
                  onBlur={handleInputBlur}
                  className={classes.ccInput}
                />
              </Box>
            </Box>
            {errorMessages[formKeys.bcc] && <FieldError error={errorMessages[formKeys.bcc]} />}
          </Box>
        )}
        <RichTextEditor
          handleChange={handleEditorChange}
          placeholder="Write here"
          name={formKeys.description}
          value={formData?.[formKeys.description] || EditorState.createEmpty()}
          className={classes.replyTextField}
        />
        <Box className={classes.replyFooter}>
          <Box className={classes.attachmentOptions}>
            <IconButton onClick={() => {}}>
              <AttachmentIcon />
            </IconButton>
            <IconButton onClick={() => {}}>
              <LinkIcon />
            </IconButton>
          </Box>
          <Button
            endIcon={<SendIcon />}
            variant="primary"
            onClick={handleReplySubmit}
            disabled={!formData?.[formKeys.description].getCurrentContent().hasText() || disabled}
            className={classes.sendButton}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderReplyButtons = () => (
    <Box className={classes.replyButtonsContainer}>
      <Button
        startIcon={<EmailReplyIcon />}
        variant="secondaryGrey"
        onClick={(event) => {
          setCurrentSelected({
            email: emailThread?.[emailThread?.length - 1],
            type: messageType.message,
          });
          handleReplyClick(event, emailThread?.[emailThread?.length - 1], false);
        }}
      >
        Reply
      </Button>
      <Button
        startIcon={<EmailReplyIcon />}
        variant="secondaryGrey"
        onClick={(event) => {
          setCurrentSelected({
            email: emailThread?.[emailThread?.length - 1],
            type: messageType.message,
          });
          handleReplyClick(event, emailThread?.[emailThread?.length - 1], true);
        }}
      >
        Reply All
      </Button>
    </Box>
  );

  const deleteThread = async () => {
    try {
      const response =
        currentSelected?.type === messageType.message && emailThread?.length > 1
          ? await deleteMessage(locationId, emailData?.id, currentSelected?.email?.id)
          : await threadDelete(locationId, emailData?.id);

      if (response?.statusCode === 200) {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        const isMessage = currentSelected?.type === messageType.message;

        if (isMessage && emailThread?.length > 1) {
          // Remove the message from the thread
          setEmailThread(emailThread.filter((f) => f.id !== currentSelected?.email?.id));
        } else {
          // Fallback for deleting thread or single message
          refetchData();
          onBack();
        }
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      toggleDeleteModal();
    }
  };

  const getEmailThread = async (id) => {
    const apiController = getNewApiController();
    setLoading(true);
    try {
      const response = await getEmailDetailAndThread(locationId, id);
      if (response?.statusCode === 200) {
        // Set Email thread in state
        setEmailThread(response?.data?.messages);
        setLoading(false);
      }
    } catch (error) {
      // catch error
      if (!apiController.signal.aborted) {
        if (error?.message) {
          toast.error(error?.message, {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Get Email thread
    getEmailThread(emailData?.id);
  }, [emailData?.id]);

  const hasAnyPermission =
    userHasPermission(permissionSet?.updateEmailPermission) ||
    userHasPermission(permissionSet?.deleteEmailPermission);

  return (
    <Box className={classes.container}>
      {/* Header */}
      <Box className={classes.header}>
        <Box className={classes.topUser}>
          <Box onClick={onBack} className={classes.cursor}>
            <BackIcon />
          </Box>
          <Typography variant="subtitle1" className={classes.subject}>
            {capitalize(emailData?.subject)}
          </Typography>
          {emailThread?.length > 1 && (
            <Chip
              label={`${emailThread?.length} Replies`}
              color="primary"
              className={classes.unreadChip}
            />
          )}
        </Box>
        <Box>
          {hasAnyPermission && (
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <RenderIfHasPermission name={permissionSet?.updateEmailPermission}>
                <MenuItem
                  onClick={(event) => {
                    markAsRead(event);
                  }}
                  className={classes.menuItem}
                >
                  Mark as Unread
                </MenuItem>
              </RenderIfHasPermission>
              <RenderIfHasPermission name={permissionSet?.deleteEmailPermission}>
                <MenuItem
                  onClick={(event) => handleDelete(event, emailThread, messageType.thread)}
                  className={classes.deleteMenuItem}
                >
                  Delete
                </MenuItem>
              </RenderIfHasPermission>
            </Menu>
          )}
        </Box>
        <IconButton
          size="small"
          className={classes.menuButton}
          // onClick={(event) => handleDelete(event, emailThread, messageType.thread)}
          onClick={(e) => handleMenuClick(e, emailThread?.id)}
        >
          <MenuIcon />
        </IconButton>
      </Box>
      {loading && (
        <Box className={classes.activityBarSkeleton}>
          <ActivityBarSkeleton noOfRows={emailThread.length || 3} onlyBar={false} />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Skeleton variant="text" width={100} height={40} />
            <Skeleton variant="text" width={100} height={40} />
          </Box>
        </Box>
      )}
      {!loading && (
        <>
          {/* Email Thread */}
          <Box className={classes.emailThreadContainer}>
            {emailThread.map((email) => {
              const isExpanded = expandedIds.includes(email?.id);
              return (
                <Accordion
                  key={email?.id}
                  expanded={isExpanded}
                  onChange={handleAccordionChange(email?.id)}
                  className={classes.accordion}
                  disableGutters
                >
                  <AccordionSummary expandIcon={null} className={classes.accordionSummary}>
                    <Box className={classes.wrapper}>
                      <Box className={classes.userInfoContainer}>
                        <Avatar className={classes.avatar} src={email?.image}>
                          {email?.from?.[0]?.name
                            ?.split(' ')
                            ?.map((name) => name?.[0])
                            ?.join('')}
                        </Avatar>
                        <Box className={classes.userDetailsContainer}>
                          <Typography className={classes.userDetails}>
                            {email?.from?.map((e) => (
                              <>{e?.name}</>
                            ))}
                            {isExpanded && (
                              <Typography component="span" className={classes.emailAddress}>
                                &#60;
                                {email?.from?.map((e) => (
                                  <>{e?.email}</>
                                ))}
                                &#62;
                              </Typography>
                            )}
                          </Typography>
                          {isExpanded ? (
                            <Typography className={classes.recipients}>
                              to: {email?.to?.map((e) => e?.email).join(', ')}
                            </Typography>
                          ) : (
                            <Typography className={classes.previewText}>
                              {getPreviewText(email?.content || '')}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box className={classes.actionContainer}>
                        <Typography variant="body3" className={classes.timestamp}>
                          {email?.date}&nbsp;&nbsp;&nbsp;
                          {dayjs(email?.timestamp).format(timePrecision)}
                        </Typography>
                        <IconButton
                          className={classes.menuButton}
                          onClick={(e) => handleMenuClick(e, email?.id)}
                          size="small"
                        >
                          <MenuIcon />
                        </IconButton>
                        {hasAnyPermission && (
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && activeEmailId === email?.id}
                            onClose={handleMenuClose}
                            onClick={(e) => e.stopPropagation()}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                            }}
                          >
                            <RenderIfHasPermission name={permissionSet?.updateEmailPermission}>
                              <MenuItem
                                onClick={(event) => {
                                  setCurrentSelected({
                                    email: email,
                                    type: messageType.message,
                                  });
                                  handleReplyClick(event, email, false);
                                }}
                                className={classes.menuItem}
                              >
                                Reply
                              </MenuItem>
                              <MenuItem
                                onClick={(event) => {
                                  setCurrentSelected({
                                    email: email,
                                    type: messageType.message,
                                  });
                                  handleReplyClick(event, email, true);
                                }}
                                className={classes.menuItem}
                              >
                                Reply All
                              </MenuItem>
                            </RenderIfHasPermission>
                            {/*Nylas does not have forward option*/}
                            {/*<MenuItem onClick={handleForward} className={classes.menuItem}>*/}
                            {/*  Forward*/}
                            {/*</MenuItem>*/}
                            <RenderIfHasPermission name={permissionSet?.deleteEmailPermission}>
                              <MenuItem
                                onClick={(event) => handleDelete(event, email, messageType.message)}
                                className={classes.deleteMenuItem}
                              >
                                Delete
                              </MenuItem>
                            </RenderIfHasPermission>
                          </Menu>
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>
                  {isExpanded && (
                    <AccordionDetails className={classes.messageContent}>
                      <Box
                        dangerouslySetInnerHTML={{
                          __html: email?.body,
                        }}
                      />
                    </AccordionDetails>
                  )}
                </Accordion>
              );
            })}
            {/* Show Reply Buttons only when reply box is closed */}
            <RenderIfHasPermission name={permissionSet?.updateEmailPermission}>
              {!showReplyBox && !loading && emailThread?.length > 0 && renderReplyButtons()}
            </RenderIfHasPermission>
          </Box>
        </>
      )}

      {/* Reply Text Area */}
      {showReplyBox && !loading && emailThread?.length > 0 && renderReplyBox()}

      {showDeleteModal && (
        <SweetAlertModal
          type="warning" // 'success', 'error', 'warning', 'info', etc.
          title={t('commonText.modal.areYouSure.title')}
          text={t('commonText.modal.areYouSure.desc')}
          cancelButtonText={t('buttons.no')}
          confirmButtonText={t('buttons.yes')}
          show={showDeleteModal}
          handleConfirmButton={deleteThread}
          handleCancelButton={toggleDeleteModal}
          icon={<DeleteIcon />}
        />
      )}
    </Box>
  );
};

EmailDetail.propTypes = {
  emailData: PropTypes.shape({
    subject: PropTypes.string.isRequired,
    from: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
  refetchData: PropTypes.func,
  onBack: PropTypes.func.isRequired,
  markEmailUnread: PropTypes.func.isRequired,
  permissionSet: PropTypes.object,
};

export default EmailDetail;
