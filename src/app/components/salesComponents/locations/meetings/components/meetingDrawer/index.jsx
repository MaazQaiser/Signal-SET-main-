import { Avatar, InputLabel, Stack, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import classNames from 'classnames';
import CustomDropDown from 'commonComponents/customDropDown';
import ResponsiveDatePickers from 'commonComponents/datePicker';
import FieldError from 'commonComponents/fieldError';
import LoaderComponent from 'commonComponents/loader';
import RichTextEditor, { convertDataToHtml, convertToDraft } from 'commonComponents/richText';
import ResponsiveTimePickers from 'commonComponents/timePicker';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import DrawerFooter from 'salesComponents/components/drawerFooter';
import DrawerHeader from 'salesComponents/components/drawerHeader';
import { createEvent, updateEvent } from 'services/meetings.services';
import ConfirmationDialog from 'src/app/components/common/confirmationDialog/index.jsx';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { ReactComponent as CrossIcon } from 'src/assets/svg/crossMeeting.svg';
// import { ReactComponent as UserIcon } from 'src/assets/svg/meetingUser.svg';
// import UserImage from 'src/assets/svg/user.svg';
import { isObjectEmpty, removeKeysFromObject } from 'src/helper/utilityFunctions';
import useFormHook from 'src/hooks/useFormHook';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { formatDayJsDate } from 'src/utils/passTime/time';
import { getNameOrEmailInitials } from 'src/utils/string/common';

// import { i18PriorityTypes, i18TaskTypes } from './meeting.constant';
import { useStyles } from './meetingDrawer.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const formKeys = {
  title: 'title',
  date: 'date',
  startTime: 'startTime',
  endTime: 'endTime',
  meetingLink: 'meetingLink',
  provider: 'provider',
  meetingDescription: 'meetingDescription',
  guests: 'guests',
  guestInput: 'guest-Input',
  timezone: 'timezone',
};

const providers = [
  {
    id: 'google_meet',
    name: 'Google Meet',
    title: 'Google Meet',
    value: 'google_meet',
  },
  {
    id: 'zoom',
    name: 'Zoom Meeting',
    title: 'Zoom Meeting',
    value: 'zoom',
  },
  {
    id: 'microsoft_teams',
    name: 'Microsoft Teams',
    title: 'Microsoft Teams',
    value: 'microsoft_teams',
  },
];

const CreateMeetingDrawer = ({
  anchor,
  locationCloseDrawer,
  width,
  selectedMeeting,
  fetchMeetings,
  calendarId,
  contacts,
}) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const { dateFormat, timePrecision } = useSelector(getDisplayConfiguration);

  const NA = t('commonText.nA');

  const { id: locationId } = useParams();

  // const taskTypeOptions = i18TaskTypes(t).filter((a) => a.value !== 'all');
  //
  // const taskPriorityOptions = i18PriorityTypes(t).filter((a) => a.value !== 'all');

  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  const {
    title = '',
    description,
    date = '',
    startTime = '',
    endTime = '',
    provider = '',
    meetingLink = '',
    id: meetingId,
  } = selectedMeeting ?? {};

  const matchedProvider = providers.find((f) => f.value === provider?.key);

  const initialValues = {
    [formKeys.title]: title || '',
    [formKeys.date]: date || '',
    [formKeys.startTime]: startTime || '',
    [formKeys.endTime]: endTime || '',
    [formKeys.meetingLink]: meetingLink || '',
    [formKeys.provider]: matchedProvider
      ? {
          ...provider,
          name: provider?.title,
          label: provider?.title,
          title: provider?.title,
          value: provider?.key,
          id: provider?.key,
        }
      : {},
    [formKeys.meetingDescription]: description?.length
      ? convertToDraft(description)
      : EditorState.createEmpty(),
    [formKeys.guests]:
      selectedMeeting?.guests?.map((c) => ({ name: c?.name, email: c?.email })) ||
      contacts?.map((c) => ({ name: c?.fullName, email: c?.email })) ||
      [],
  };

  const { formData, setFormData, handleInputChange, errorMessages, setErrorMessages } = useFormHook(
    {
      defaultFormData: initialValues,
    },
  );

  const [confirmMeetingModal, setConfirmMeetingModal] = useState(false);

  const handleRemoveEmail = (key, emailToRemove) => {
    setFormData((prev) => ({
      ...prev,
      [key]: formData?.[key]?.filter((guest) => guest?.email !== emailToRemove),
      // [key]: formData?.[key]?.filter((email) => email !== emailToRemove),
    }));
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
          // [name]: [...prev[name], value],
          [name]: [...prev[name], { email: value, name: value.split('@')[0] }],
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

  const handleInputChangeForEmails = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [`${name}-Input`]: value,
    }));
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
          // [name]: [...prev[name], value],
          [name]: [...prev[name], { email: value, name: value.split('@')[0] }],
        }));
        e.target.value = ''; // Clear the input field after adding the email
      }
    }
  };

  const concatEmailInputs = (currentFormData) => {
    const updatedFormData = { ...currentFormData };

    if (currentFormData?.[formKeys.guestInput]?.trim()) {
      updatedFormData[formKeys.guests] = [
        ...(currentFormData[formKeys.guests] || []),
        currentFormData[formKeys.guestInput].trim(),
      ];
      updatedFormData[formKeys.guestInput] = '';
    }

    return updatedFormData;
  };

  const convertEmailStringArrayToObjectsArray = (guestObjectsArray) => {
    return guestObjectsArray.map((email) => ({ email }));
  };

  const validateForm = async (e) => {
    e.preventDefault();
    let updatedData = {
      ...formData,
      [formKeys.meetingDescription]: convertDataToHtml(formData?.[formKeys.meetingDescription]),
      [formKeys.provider]: formData?.provider?.value || '',
      [formKeys.date]: formatDayJsDate(formData?.[formKeys.date] || null, 'date'),
      [formKeys.startTime]: formatDayJsDate(formData?.[formKeys.startTime] || null, 'time'),
      [formKeys.endTime]: formatDayJsDate(formData?.[formKeys.endTime] || null, 'time'),
      [formKeys.guests]: formData?.[formKeys.guests]?.map((c) => c?.email),
    };

    updatedData = concatEmailInputs(updatedData);

    // Clean up provider and meetingLink only if both are falsy
    const providerValue = updatedData?.[formKeys.provider];
    const meetingLinkValue = updatedData?.[formKeys.meetingLink];

    if (!providerValue && !meetingLinkValue) {
      updatedData = removeKeysFromObject(updatedData, [formKeys.provider, formKeys.meetingLink]);
    }

    if (!updatedData?.[formKeys.meetingDescription])
      updatedData = removeKeysFromObject(updatedData, [formKeys.meetingDescription]);

    const errors = await joiValidate(updatedData, t);
    if (errors && Object.keys(errors).length) {
      console.log({ errors });
      setErrorMessages(errors);
      return;
    }

    toggleConfirmMeetingModal();
  };

  const toggleConfirmMeetingModal = () => {
    setConfirmMeetingModal((a) => !a);
  };

  const handleFormSubmit = async () => {
    try {
      let updatedData = {
        ...formData,
        [formKeys.meetingDescription]: convertDataToHtml(formData?.[formKeys.meetingDescription]),
        [formKeys.provider]: formData?.provider?.value || '',
        [formKeys.date]: formatDayJsDate(formData?.[formKeys.date] || null, 'date'),
        [formKeys.startTime]: formatDayJsDate(formData?.[formKeys.startTime] || null, 'time'),
        [formKeys.endTime]: formatDayJsDate(formData?.[formKeys.endTime] || null, 'time'),
        [formKeys.guests]: formData?.[formKeys.guests]?.map((c) => c?.email),
        [formKeys.timezone]: dayjs.tz.guess(),
      };

      updatedData = concatEmailInputs(updatedData);

      // Clean up provider and meetingLink only if both are falsy
      const providerValue = updatedData?.[formKeys.provider];
      const meetingLinkValue = updatedData?.[formKeys.meetingLink];

      if (!providerValue && !meetingLinkValue) {
        updatedData = removeKeysFromObject(updatedData, [formKeys.provider, formKeys.meetingLink]);
      }

      if (!updatedData?.[formKeys.meetingDescription]) {
        updatedData[formKeys.meetingDescription] = '';
      }

      setFormSubmitLoading(true);
      let payload = {
        ...updatedData,
      };

      payload = {
        ...payload,
        guests: convertEmailStringArrayToObjectsArray(payload?.guests),
      };

      payload = removeKeysFromObject(payload, [formKeys?.guestInput]);

      const meetingFn = !!meetingId ? updateEvent : createEvent;
      const response = await meetingFn({
        locationId: locationId,
        calendarId: calendarId,
        data: payload,
        eventId: meetingId,
      });

      if (response?.statusCode === 200) {
        toast.success(
          !!meetingId ? 'Meeting Updated Successfully' : 'Meeting Created Successfully',
          {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          },
        );
        fetchMeetings();
        locationCloseDrawer(anchor);
      }
      setFormSubmitLoading(false);
    } catch (error) {
      setFormSubmitLoading(false);
      console.log('Error in new meeting creation', error);
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  return (
    <>
      {formSubmitLoading && <LoaderComponent label={t('sales.loading')} />}
      <Box
        className={classes.siderbarbox}
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
        role="presentation"
        component="form"
        onSubmit={validateForm}
      >
        <Stack className={classes.boxinner} justifyContent="space-between">
          <Box className={classes.sideheader}>
            <DrawerHeader
              title={isObjectEmpty(selectedMeeting) ? 'Create New Meeting' : 'Update this Meeting'}
              handleCloseDrawer={locationCloseDrawer}
              anchor={anchor}
              className={classes.newLocationDrawerHeader}
            />
          </Box>
          <Box className={classNames(classes.locationForm, 'innerScrollBar')}>
            <Box className={`${classes.fieldWrapper}  ${classes.Input}`}>
              <InputLabel>
                Title
                <RequiredAsterik />
              </InputLabel>

              <TextField
                name={formKeys.title}
                id={formKeys.title}
                onChange={handleInputChange}
                value={formData?.[formKeys.title] || ''}
                fullWidth
                placeholder={'Title'}
                placeHolderClassName={classes.placeHolderText}
                error={!!errorMessages?.[formKeys.title]}
                helperText={errorMessages?.[formKeys.title]}
              />
            </Box>

            <Box className={`${classes.fieldWrapper}  ${classes.Input}`}>
              <InputLabel>
                Date
                <RequiredAsterik />
              </InputLabel>
              <ResponsiveDatePickers
                format={dateFormat}
                inputFormat={dateFormat}
                name={formKeys.date}
                timeStepsMinutes={1}
                value={formData?.[formKeys.date]}
                onChange={(e) =>
                  handleInputChange({
                    target: { name: formKeys.date, value: e },
                  })
                }
                placeholder={dateFormat}
                helperText={
                  !!errorMessages?.[formKeys.date] ? t('errors.dynamic.date.required') : null
                }
                error={!!errorMessages?.[formKeys.date]}
              />
            </Box>

            <Box className={`${classes.fieldWrapper}  ${classes.Input}`}>
              <InputLabel>
                Start Time
                <RequiredAsterik />
              </InputLabel>
              <ResponsiveTimePickers
                useLocalTimeZone={true}
                format={timePrecision}
                name={formKeys.startTime}
                value={formData?.[formKeys.startTime] || null}
                // onChange={handleInputChange}
                onChange={(e) =>
                  handleInputChange({
                    target: { name: formKeys.startTime, value: e },
                  })
                }
                placeholder={'select time'}
                helperText={
                  !!errorMessages?.[formKeys.startTime] ? errorMessages?.[formKeys.startTime] : ''
                }
                error={!!errorMessages?.[formKeys.startTime]}
              />
            </Box>

            <Box className={`${classes.fieldWrapper}  ${classes.Input}`}>
              <InputLabel>
                End Time
                <RequiredAsterik />
              </InputLabel>
              <ResponsiveTimePickers
                useLocalTimeZone={true}
                format={timePrecision}
                name={formKeys.endTime}
                value={formData?.[formKeys.endTime] || null}
                onChange={(e) =>
                  handleInputChange({
                    target: { name: formKeys.endTime, value: e },
                  })
                }
                placeholder={'select time'}
                helperText={
                  !!errorMessages?.[formKeys.endTime] ? errorMessages?.[formKeys.endTime] : ''
                }
                error={!!errorMessages?.[formKeys.endTime]}
              />
            </Box>

            <Box className={`${classes.fieldWrapper}  ${classes.Input}`}>
              <InputLabel>
                Meeting Provider
                {/*<RequiredAsterik />*/}
              </InputLabel>

              <CustomDropDown
                name={formKeys.provider}
                id={formKeys.provider}
                placeHolder={'Select Provider'}
                options={transformArrayForOptions(providers, 'title', 'value') || []}
                selectedValues={formData?.[formKeys.provider] || {}}
                handleChange={handleInputChange}
                className={classes.borderLessDrop}
                customDropdownOptionsListClass={classes.dropdwonValues}
                customDropdownSelectHeaderCusrom={classes.dropheader}
                bordered
                isError={!!errorMessages?.[formKeys.provider]}
              />
              <FieldError error={errorMessages?.[formKeys.provider]} />
            </Box>

            <Box className={`${classes.fieldWrapper}  ${classes.Input}`}>
              <InputLabel>
                Meeting Link
                {/*<RequiredAsterik />*/}
              </InputLabel>
              <TextField
                name={formKeys.meetingLink}
                id={formKeys.meetingLink}
                onChange={handleInputChange}
                value={formData?.[formKeys.meetingLink] || ''}
                fullWidth
                placeholder={'Meeting Link'}
                placeHolderClassName={classes.placeHolderText}
                error={!!errorMessages?.[formKeys.meetingLink]}
                helperText={errorMessages?.[formKeys.meetingLink]}
              />
            </Box>

            <Box className={`${classes.fieldWrapper}  ${classes.Input}`}>
              <InputLabel>Meeting Description</InputLabel>
              <RichTextEditor
                placeholder={'Meeting Description'}
                className={classes.placeHolderText}
                name={formKeys.meetingDescription}
                value={formData?.[formKeys.meetingDescription]}
                handleChange={handleInputChange}
                textLimit={500}
              />

              <FieldError error={errorMessages?.[formKeys.meetingDescription]} />
            </Box>

            <Box className={classes.subjectContainer}>
              <InputLabel htmlFor={formKeys.guests}>
                Add Guests <RequiredAsterik />
              </InputLabel>
              <Box className={classes.emailChipsContainer}>
                <TextField
                  id={formKeys.guests}
                  value={formData?.[formKeys.guestInput]}
                  onChange={handleInputChangeForEmails}
                  name={formKeys?.guests}
                  variant="outlined"
                  placeholder={
                    formData?.[formKeys?.guests]?.length === 0 ? 'Enter email address' : 'Add email'
                  }
                  size="small"
                  onKeyDown={handleKeyDown}
                  onBlur={handleInputBlur}
                  className={classes.guestInput}
                />
                {formData?.[formKeys?.guests]?.map((guest) => (
                  <Box key={guest?.email} className={classes.emailChip}>
                    <Box className={classes.emailChipTextWrapperImage}>
                      {/*<Box className={classes.imageWrapper}>*/}
                      {/*  <img src={<UserIcon /> || UserImage} alt="user" />*/}
                      {/*</Box>*/}
                      <Avatar>{getNameOrEmailInitials(guest?.name || guest?.email)}</Avatar>

                      <Box className={classes.emailChipTextWrapper}>
                        {guest?.name && (
                          <Typography className={classes.emailChipText}>
                            {guest?.name || NA}
                          </Typography>
                        )}

                        <Typography className={classes.emailChipTextName}>
                          {guest?.email || NA}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      className={classes.deleteIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveEmail(formKeys?.guests, guest?.email);
                      }}
                    >
                      <CrossIcon />
                    </Box>
                  </Box>
                ))}
              </Box>
              {hasEmailErrors(formKeys.guests)?.exist && (
                <FieldError
                  error={
                    hasEmailErrors(formKeys.guests)?.exactMatch
                      ? 'Guest must contain at-least 1 recipient'
                      : 'There is an invalid email in the field'
                  }
                />
              )}
            </Box>
          </Box>
          <DrawerFooter
            classNameFooter={classes.sideDrawerFooter}
            bulkApply={t('sales.locations.save')}
            bulkCancel={t('sales.locations.cancel')}
            handleCloseDrawer={locationCloseDrawer}
            anchor={anchor}
            type="submit"
            disabled={formSubmitLoading}
          />
        </Stack>
      </Box>

      {confirmMeetingModal && (
        <ConfirmationDialog
          open={!!confirmMeetingModal}
          title={t('commonText.modal.areYouSure.title')}
          description={t('commonText.modal.areYouSure.createUpdateMeetingDesc')}
          action={t('buttons.yes')}
          // icon={<WarningIcon />}
          disabled={formSubmitLoading}
          handleClose={toggleConfirmMeetingModal}
          handleConfirm={handleFormSubmit}
        />
      )}
    </>
  );
};

CreateMeetingDrawer.propTypes = {
  anchor: PropTypes.string,
  locationCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  taskableType: PropTypes.string,
  selectedMeeting: PropTypes.object,
  fetchMeetings: PropTypes.func,
  calendarId: PropTypes.func,
  contacts: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CreateMeetingDrawer;
