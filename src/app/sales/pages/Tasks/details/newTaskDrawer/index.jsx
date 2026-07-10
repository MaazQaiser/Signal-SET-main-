import { InputLabel, Stack, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import classNames from 'classnames';
import FieldError from 'commonComponents/fieldError';
import LoaderComponent from 'commonComponents/loader';
import RichTextEditor, { convertDataToHtml, convertToDraft } from 'commonComponents/richText';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDateTimePickers from 'src/app/components/common/dateTimePicker';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import DrawerFooter from 'src/app/components/salesComponents/components/drawerFooter';
import DrawerHeader from 'src/app/components/salesComponents/components/drawerHeader';
import { useApiControllers } from 'src/helper/axios';
import { isObjectEmpty, removeKeysFromObject } from 'src/helper/utilityFunctions';
import { getContacts } from 'src/services/contact.service';
import { getDeals } from 'src/services/deal.service';
import { getCompaniesOption } from 'src/services/location.service';
import { getLocationOptions } from 'src/services/location.service';
import { createWebTask, updateWebTask } from 'src/services/webTasks.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { taskableTypes } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from './newTaskDrawer.js';
import { i18PriorityTypes, i18TaskTypes } from './task.constant';

const dateFormat = 'MM/DD/YYYY hh:mm A';

const TASK_FOR_TYPES = {
  COMPANY: 'company',
  PROPERTY: 'property',
  DEAL: 'deal',
  CONTACT: 'contact',
};

dayjs.extend(utc);

const NewTaskDrawer = ({ anchor, locationCloseDrawer, width, selectedTask, fetchTasks }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getNewApiController } = useApiControllers();

  const taskTypeOptions = i18TaskTypes(t).filter((a) => a.value !== 'all');
  const taskPriorityOptions = i18PriorityTypes(t).filter((a) => a.value !== 'all');

  const getTaskForValue = (taskableType) => {
    if (!taskableType) return '';
    const typeLower = taskableType.toLowerCase();
    if (typeLower === 'location') return TASK_FOR_TYPES.PROPERTY;
    return typeLower;
  };

  const getInitialEntityValue = (taskableId, taskable) => {
    if (!taskableId) return null;
    if (taskable) {
      const label =
        taskable?.name ||
        taskable?.dealName ||
        taskable?.location_name ||
        taskable?.property_name ||
        taskable?.fullName ||
        (taskable?.firstname && taskable?.lastname
          ? `${taskable.firstname} ${taskable.lastname}`
          : '') ||
        '';
      return {
        value: taskableId,
        id: taskableId,
        label: label || String(taskableId),
      };
    }
    return {
      value: taskableId,
      id: taskableId,
    };
  };

  const getInitialFormData = (task) => {
    if (!task) {
      return {
        taskTitle: '',
        taskDescription: EditorState.createEmpty(),
        taskType: {},
        taskPriority: {},
        taskFor: '',
        selectedEntity: null,
      };
    }

    const taskForValue = getTaskForValue(task.taskable_type || task.taskableType);
    const entityValue = getInitialEntityValue(task.taskable_id || task.taskableId, task.taskable);

    return {
      taskTitle: task.title || '',
      taskDescription: task.description?.length
        ? convertToDraft(task.description)
        : EditorState.createEmpty(),
      taskType: taskTypeOptions.find((option) => option.value === task.type) || {},
      taskPriority: taskPriorityOptions.find((option) => option.value === task.priority) || {},
      taskFor: taskForValue,
      selectedEntity: entityValue,
    };
  };

  const [formData, setFormData] = useState(() => getInitialFormData(selectedTask));
  const [errorMessages, setErrorMessages] = useState({});
  const [dueDate, setDueDate] = useState(
    selectedTask?.dueDate ? dayjs(selectedTask.dueDate) : dayjs(),
  );
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [loadingDropdown, setLoadingDropdown] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1 });
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  const taskForOptions = [
    { value: TASK_FOR_TYPES.COMPANY, label: t('sales.companies.company') },
    { value: TASK_FOR_TYPES.PROPERTY, label: t('sales.locations.location') },
    { value: TASK_FOR_TYPES.DEAL, label: t('sales.deals.deal') },
    { value: TASK_FOR_TYPES.CONTACT, label: t('sales.contacts.contacts') },
  ];

  const getTaskableType = (taskForValue) => {
    const mapping = {
      [TASK_FOR_TYPES.COMPANY]: taskableTypes.company,
      [TASK_FOR_TYPES.PROPERTY]: taskableTypes.location,
      [TASK_FOR_TYPES.DEAL]: taskableTypes.deal,
      [TASK_FOR_TYPES.CONTACT]: taskableTypes.contact,
    };
    return mapping[taskForValue] || '';
  };

  const updateFormHandler = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (value) {
      const { [name]: _key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }

    if (name === 'taskFor') {
      updateFormHandler(name, value);
      updateFormHandler('selectedEntity', null);
      setDropdownOptions([]);
      return;
    }

    if (
      name === TASK_FOR_TYPES.COMPANY ||
      name === TASK_FOR_TYPES.PROPERTY ||
      name === TASK_FOR_TYPES.DEAL ||
      name === TASK_FOR_TYPES.CONTACT
    ) {
      updateFormHandler('selectedEntity', value);
      return;
    }

    updateFormHandler(name, value);
  };

  const fetchEntityOptions = async (refetch = false, search = '') => {
    const apiController = getNewApiController();
    const taskFor = formData?.taskFor;
    if (!taskFor) return;

    try {
      setLoadingDropdown(true);

      let currentPage = 1;
      if (refetch && search === '') {
        currentPage = (pagination?.currentPage || 1) + 1;
      }

      let response;
      if (taskFor === TASK_FOR_TYPES.COMPANY) {
        response = await getCompaniesOption(currentPage, search, { signal: apiController.signal });
      } else if (taskFor === TASK_FOR_TYPES.PROPERTY) {
        response = await getLocationOptions({ search }, { signal: apiController.signal });
      } else if (taskFor === TASK_FOR_TYPES.DEAL) {
        response = await getDeals(currentPage, 20, { search }, { signal: apiController.signal });
      } else if (taskFor === TASK_FOR_TYPES.CONTACT) {
        response = await getContacts({ search }, { signal: apiController.signal });
      }

      if (response?.statusCode === 200) {
        let transformedOptions = [];
        const selectedId = formData?.selectedEntity?.id || formData?.selectedEntity?.value;

        if (taskFor === TASK_FOR_TYPES.COMPANY) {
          transformedOptions = transformArrayForOptions(
            response?.data?.companies || [],
            'name',
            'id',
          );
        } else if (taskFor === TASK_FOR_TYPES.PROPERTY) {
          transformedOptions = transformArrayForOptions(
            response?.data?.location_options || [],
            'name',
            'id',
          );
        } else if (taskFor === TASK_FOR_TYPES.DEAL) {
          transformedOptions = transformArrayForOptions(
            response?.data?.deals || [],
            'dealName',
            'dealId',
          );
        } else if (taskFor === TASK_FOR_TYPES.CONTACT) {
          transformedOptions = transformArrayForOptions(
            response?.data?.contacts || [],
            'fullName',
            'id',
          );
        }

        if (formData?.selectedEntity && selectedId) {
          const entityInOptions = transformedOptions.find(
            (opt) =>
              opt.value?.toString() === selectedId?.toString() ||
              opt.id?.toString() === selectedId?.toString(),
          );

          if (!entityInOptions) {
            transformedOptions.unshift({
              value: selectedId,
              id: selectedId,
              label: formData.selectedEntity.label || String(selectedId),
            });
          } else {
            if (
              formData.selectedEntity.label &&
              entityInOptions.label !== formData.selectedEntity.label
            ) {
              entityInOptions.label = formData.selectedEntity.label;
            }
            if (!entityInOptions.id) {
              entityInOptions.id = selectedId;
            }
          }
        }

        if (refetch && transformedOptions.length) {
          setDropdownOptions((prev) => [...prev, ...transformedOptions]);
        } else {
          setDropdownOptions(transformedOptions);
        }

        if (response?.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      if (error?.code === 'ERR_CANCELED') return;
      if (!apiController.signal.aborted) {
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } finally {
      setLoadingDropdown(false);
    }
  };

  useEffect(() => {
    if (!selectedTask) {
      setFormData({
        taskTitle: '',
        taskDescription: EditorState.createEmpty(),
        taskType: {},
        taskPriority: {},
        taskFor: '',
        selectedEntity: null,
      });
      setDueDate(dayjs());
      setDropdownOptions([]);
      return;
    }

    const newFormData = getInitialFormData(selectedTask);
    setFormData(newFormData);

    if (selectedTask.dueDate) {
      setDueDate(dayjs(selectedTask.dueDate));
    }
  }, [selectedTask?.id]);

  useEffect(() => {
    if (formData?.taskFor) {
      fetchEntityOptions(false, '');
    }
  }, [formData?.taskFor]);

  const handleDateTimeChange = (value) => {
    setDueDate(value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskableType = getTaskableType(formData?.taskFor);
      const taskableId = formData?.selectedEntity?.id || formData?.selectedEntity?.value || '';

      const validationData = {
        ...formData,
        taskPriority: formData?.taskPriority?.value || '',
        taskType: formData?.taskType?.value || '',
        dueDate: dueDate ? dayjs(dueDate)?.utc()?.format() : null,
        taskDescription: convertDataToHtml(formData?.taskDescription),
        taskableType,
        taskableId,
      };

      const dropdownName = formData?.taskFor;
      if (dropdownName) {
        validationData[dropdownName] = formData?.selectedEntity || {};
      }

      const errors = await formValidatorJoi(validationData, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }
      setFormSubmitLoading(true);

      let payload = {
        ...validationData,
        title: validationData?.taskTitle,
        description: validationData?.taskDescription,
        priority: validationData?.taskPriority,
        type: validationData?.taskType,
        taskable_type: taskableType,
        taskable_id: taskableId,
      };
      payload = removeKeysFromObject(payload, [
        'taskTitle',
        'taskDescription',
        'taskType',
        'taskPriority',
        'taskFor',
        'selectedEntity',
      ]);
      const response = selectedTask?.id
        ? await updateWebTask(selectedTask.id, payload)
        : await createWebTask(payload);

      if (response?.statusCode === 200) {
        toast.success(
          selectedTask?.id ? t('sales.tasks.taskUpdated') : t('sales.tasks.taskCreated'),
          {
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          },
        );
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

  const getEntityLabel = () => {
    const taskFor = formData?.taskFor;
    if (taskFor === TASK_FOR_TYPES.COMPANY) return t('sales.companies.company');
    if (taskFor === TASK_FOR_TYPES.PROPERTY) return t('sales.locations.location');
    if (taskFor === TASK_FOR_TYPES.DEAL) return t('sales.deals.deal');
    if (taskFor === TASK_FOR_TYPES.CONTACT) return t('sales.contacts.contacts');
    return '';
  };

  const getEntityPlaceholder = () => {
    const taskFor = formData?.taskFor;
    if (taskFor === TASK_FOR_TYPES.COMPANY) return t('sales.companies.selectCompany');
    if (taskFor === TASK_FOR_TYPES.PROPERTY) return t('sales.locations.propertyNamePlaceholder');
    if (taskFor === TASK_FOR_TYPES.DEAL) return t('sales.deals.selectDeal');
    if (taskFor === TASK_FOR_TYPES.CONTACT) return t('sales.contacts.selectContact');
    return '';
  };

  const getEntityError = () => {
    const taskFor = formData?.taskFor;
    if (taskFor === TASK_FOR_TYPES.COMPANY) return errorMessages?.company;
    if (taskFor === TASK_FOR_TYPES.PROPERTY) return errorMessages?.property;
    if (taskFor === TASK_FOR_TYPES.DEAL) return errorMessages?.deal;
    if (taskFor === TASK_FOR_TYPES.CONTACT) return errorMessages?.contact;
    return null;
  };

  const supportsPagination =
    formData?.taskFor === TASK_FOR_TYPES.COMPANY || formData?.taskFor === TASK_FOR_TYPES.DEAL;

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
                {isObjectEmpty(selectedTask)
                  ? t('sales.companies.createTaskFor')
                  : t('sales.companies.updateTaskFor')}
                <RequiredAsterik />
              </InputLabel>
              <Box className={classes.radioWrapper}>
                <RadioGroup
                  name="taskFor"
                  value={formData?.taskFor || ''}
                  onChange={inputChangedHandler}
                  row
                >
                  {taskForOptions.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={option.label}
                    />
                  ))}
                </RadioGroup>
              </Box>
              <FieldError error={errorMessages?.taskFor} />
            </Box>

            {formData?.taskFor && (
              <Box className={`${classes.fieldWrapper}  ${classes.Input}`}>
                <InputLabel>
                  {getEntityLabel()}
                  <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  name={formData.taskFor}
                  id={formData.taskFor}
                  selectedValues={formData?.selectedEntity || {}}
                  handleChange={inputChangedHandler}
                  options={dropdownOptions}
                  placeHolder={getEntityPlaceholder()}
                  className={classes.dropHigh}
                  placeHolderClassName={classes.placeHolderText}
                  bordered
                  showDescription={false}
                  searchable
                  isLoading={loadingDropdown}
                  pagination={supportsPagination ? pagination : undefined}
                  fetchMoreOptions={supportsPagination ? fetchEntityOptions : undefined}
                  isError={!!getEntityError()}
                  error={getEntityError()}
                />
                <FieldError error={getEntityError()} />
              </Box>
            )}

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
                onChange={handleDateTimeChange}
                placeholder={dayjs().format(dateFormat)}
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
  selectedTask: PropTypes.object,
  fetchTasks: PropTypes.func,
};

export default NewTaskDrawer;
