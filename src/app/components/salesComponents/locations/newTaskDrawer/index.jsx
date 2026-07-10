// eslint-disable-next-line simple-import-sort/imports
import { InputLabel, Stack, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import classNames from 'classnames';
import LoaderComponent from 'commonComponents/loader';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDateTimePickers from 'src/app/components/common/dateTimePicker';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { createTask, updateTask } from 'src/services/task.service';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import { useStyles } from './newTaskDrawer.js';
import { i18PriorityTypes, i18TaskTypes } from './task.constant';
import { formatDate, isObjectEmpty, removeKeysFromObject } from 'src/helper/utilityFunctions';
import FieldError from 'commonComponents/fieldError';
import RichTextEditor, { convertDataToHtml, convertToDraft } from 'commonComponents/richText';
import { EditorState } from 'draft-js';
import { getDisplayConfiguration } from 'src/redux/store/slices/regionalCountryConfiguration';
import { useSelector } from 'react-redux';

dayjs.extend(utc);

const NewTaskDrawer = ({
  anchor,
  locationCloseDrawer,
  width,
  taskableType,
  selectedTask,
  fetchTasks,
}) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const { dateFormat, timePrecision } = useSelector(getDisplayConfiguration);

  const { id } = useParams();

  const taskTypeOptions = i18TaskTypes(t).filter((a) => a.value !== 'all');

  const taskPriorityOptions = i18PriorityTypes(t).filter((a) => a.value !== 'all');

  const { title, description, type, priority, dueDate: taskDate, id: taskId } = selectedTask ?? {};
  const initialValues = {
    taskTitle: title || '',
    taskDescription: description?.length ? convertToDraft(description) : EditorState.createEmpty(),
    taskType: taskTypeOptions.find((option) => option.value === type) || {},
    taskPriority: taskPriorityOptions.find((option) => option.value === priority) || {},
  };
  const [formData, setFormData] = useState(initialValues ?? {});
  const [errorMessages, setErrorMessages] = useState({});
  const [dueDate, setDueDate] = useState(taskDate ? dayjs(taskDate) : dayjs());

  const handleDateTimeChange = (value) => {
    setDueDate(value);
  };

  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );
  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    updateFormHandler(name, value);
  };
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...formData,
        taskPriority: formData?.taskPriority?.value || '',
        taskType: formData?.taskType?.value || '',
        dueDate: dueDate ? dayjs(dueDate)?.utc()?.format() : null,
        taskDescription: convertDataToHtml(formData?.taskDescription),
      };
      console.log({ formData }, { updatedData });
      const errors = await formValidatorJoi(updatedData, t);
      if (errors && Object.keys(errors).length) {
        console.log({ errors });
        setErrorMessages(errors);
        return;
      }
      setFormSubmitLoading(true);
      let payload = {
        ...updatedData,
        title: updatedData?.taskTitle,
        description: updatedData?.taskDescription,
        priority: updatedData?.taskPriority,
        type: updatedData?.taskType,
      };
      payload = removeKeysFromObject(payload, [
        'taskTitle',
        'taskDescription',
        'taskType',
        'taskPriority',
      ]);
      const taskFn = !!taskId ? updateTask : createTask;
      const response = await taskFn(taskableType, id, payload, taskId);

      if (response?.statusCode === 200) {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        fetchTasks();
        locationCloseDrawer(anchor);
      }
      setFormSubmitLoading(false);
    } catch (error) {
      setFormSubmitLoading(false);
      toast.error(error.message, {
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
        onSubmit={handleFormSubmit}
      >
        <Stack className={classes.boxinner} justifyContent="space-between">
          <Box className={classes.sideheader}>
            <DrawerHeader
              title={
                isObjectEmpty(selectedTask)
                  ? t('sales.tasks.createNewTask')
                  : t('sales.tasks.updateThisTask')
              }
              handleCloseDrawer={locationCloseDrawer}
              anchor={anchor}
              className={classes.newLocationDrawerHeader}
            />
          </Box>
          <Box className={classNames(classes.locationForm, 'innerScrollBar')}>
            <Box className={`${classes.fieldWrapper}  ${classes.Input}`}>
              <InputLabel>
                {t('sales.tasks.title')}
                <RequiredAsterik />
              </InputLabel>

              <TextField
                name="taskTitle"
                id="taskTitle"
                onChange={inputChangedHandler}
                value={formData?.taskTitle || ''}
                fullWidth
                placeholder={t('sales.tasks.title')}
                placeHolderClassName={classes.placeHolderText}
                error={!!errorMessages.taskTitle}
                helperText={errorMessages.taskTitle}
              />
            </Box>
            <Box className={`${classes.fieldWrapper}  ${classes.Input}`}>
              <InputLabel>
                {t('sales.tasks.taskDescription')}
                <RequiredAsterik />
              </InputLabel>
              {/*<TextField*/}
              {/*  name="taskDescription"*/}
              {/*  id="taskDescription"*/}
              {/*  onChange={inputChangedHandler}*/}
              {/*  value={formData?.taskDescription || ''}*/}
              {/*  fullWidth*/}
              {/*  multiline*/}
              {/*  minRows={4}*/}
              {/*  type="textArea"*/}
              {/*  placeholder={t('sales.tasks.taskDescription')}*/}
              {/*  placeHolderClassName={classes.placeHolderText}*/}
              {/*  error={!!errorMessages.taskDescription}*/}
              {/*  helperText={errorMessages.taskDescription}*/}
              {/*/>*/}
              <RichTextEditor
                placeholder={t('sales.tasks.taskDescription')}
                className={classes.placeHolderText}
                name={'taskDescription'}
                value={formData?.taskDescription}
                handleChange={inputChangedHandler}
                textLimit={500}
              />

              <FieldError error={errorMessages?.taskDescription} />
            </Box>
            <Box className={`${classes.fieldWrapper}  ${classes.Input}`} component="div">
              <InputLabel>
                {t('sales.companies.type')}
                <RequiredAsterik />
              </InputLabel>

              <CustomDropDown
                name="taskType"
                id="taskType"
                selectedValues={formData?.taskType || {}}
                handleChange={inputChangedHandler}
                options={taskTypeOptions}
                placeHolder={t('sales.tasks.selectType')}
                className={classes.dropHigh}
                placeHolderClassName={classes.placeHolderText}
                bordered
                showDescription={false}
                isError={!!errorMessages?.taskType}
                error={errorMessages?.taskType}
              />

              <FieldError error={errorMessages?.taskType} />
            </Box>
            <Box className={`${classes.fieldWrapper}  ${classes.Input}`} component="div">
              <InputLabel>
                {t('sales.companies.priority')}
                <RequiredAsterik />
              </InputLabel>

              <CustomDropDown
                name="taskPriority"
                id="taskPriority"
                selectedValues={formData?.taskPriority || {}}
                handleChange={inputChangedHandler}
                options={taskPriorityOptions}
                placeHolder={t('sales.tasks.selectPriority')}
                className={classes.dropHigh}
                placeHolderClassName={classes.placeHolderText}
                bordered
                showDescription={false}
                isError={!!errorMessages?.taskPriority}
                error={errorMessages?.taskPriority}
              />

              <FieldError error={errorMessages?.taskPriority} />
            </Box>
            <Box>
              <InputLabel>
                {t('sales.companies.dueDate')}
                <RequiredAsterik />
              </InputLabel>
              <ResponsiveDateTimePickers
                value={dueDate}
                format={`${dateFormat} ${timePrecision}`}
                onChange={handleDateTimeChange}
                placeholder={formatDate(dayjs(), `${dateFormat} ${timePrecision}`)}
                helperText={errorMessages?.dueDate}
                error={!!errorMessages?.dueDate}
                minDateTime={dayjs()}
              />
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
    </>
  );
};

NewTaskDrawer.propTypes = {
  anchor: PropTypes.string,
  locationCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  taskableType: PropTypes.string,
  selectedTask: PropTypes.object,
  fetchTasks: PropTypes.func,
};

export default NewTaskDrawer;
