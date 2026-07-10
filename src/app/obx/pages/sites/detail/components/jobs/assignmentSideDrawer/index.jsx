import { Box } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { convertDataToHtml, convertToDraft } from 'src/app/components/common/richText';
import SideDrawer from 'src/app/components/common/sideDrawer';
import {
  dayjsWithStandardOffset,
  getCurrentStandardTimeInIsoWrtTimezone,
  getDaysBetweenDatesRangeWrtStandardDate,
  getDaysWrtTimezoneAsPerStandardTime,
  getEmbededDateAndTimeWRTStandardOffset,
  getHoursDiff24HourFormat,
  getLastShiftStartEndTimeOfJob,
  getStartEndTimeWithDesiredDate,
} from 'src/app/obx/pages/schedules/helper';
import { useApiControllers } from 'src/helper/axios';
import useFormHook from 'src/hooks/useFormHook';
import {
  assignShift,
  createTourTemplate,
  fetchCheckpointsBySiteId,
  fetchShiftDetailForAssignmentById,
  getActiveAndInActiveOfficers,
  getReportTemplatesList,
  reassignShift,
} from 'src/services/duty.services';
import { getSitesAllLocations } from 'src/services/sites.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import {
  DRAWER_TYPE,
  SCHEDULE_DUTIES_TOUR_TEMPLATES,
  ShiftStatus,
} from 'src/utils/constants/schedules';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { assignmentMinDate } from '..';
import { getStartEndTimeForValidation } from '../splitJobSideDrawer';
import { useStyles } from './assignmentSideDrawer.styles';
import AssignShift from './AssignShift';
import Layout from './Layout';
import ReassignShift from './ReassignShift';
import CreateTourTemplate from './tourTemplate/CreateTourTemplate';
import { INFINITE_REPEAT_TOUR } from './tourTemplate/Occurances';

export const hourlyRateAssignmentFor = {
  THIS_SHIFT: 'thisShift',
  UPCOMMING_SHIFT_OMWARDS: 'upcommingShiftOnwards',
};

export const defaultCreateTourTemplateValues = {
  name: '',
  checkpoints: [],
  report: {},
  startTime: null,
  duration: {},
  occurances: null,
};
const assignmentDefaultValues = {
  location: {
    selectedDates: [],
    value: null,
    error: {
      date: '',
      value: '',
    },
  },
  officer: {
    selectedDates: [],
    selectedDays: [],
    value: null,
    error: {
      date: '',
      value: '',
      days: [],
    },
  },
  reassignedOfficer: {
    selectedDates: [],
    value: null,
    error: {
      date: '',
      value: '',
    },
  },
  hourlyRate: {
    checked: false,
    value: '',
    assignmentFor: hourlyRateAssignmentFor.THIS_SHIFT,
    error: {
      value: '',
    },
  },
};
const unassignOfficerValue = 'unassign';

const dateForValidation = dayjs('2024-01-01'); // choose this date, because it will always return standard time and not DLS time in any case.

const AssignmentSideDrawer = ({
  drawerData,
  closeSideDrawer,
  callbackUponAssignment,
  changeOnlyDrawerType,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [reports, setReports] = useState(undefined);
  const [checkpoints, setCheckpoints] = useState([]);
  const { formData, setFormData, handleInputChange, errorMessages, setErrorMessages } = useFormHook(
    {
      defaultFormData: defaultCreateTourTemplateValues,
    },
  );
  const { formData: formDataTours, setFormData: setFormDataTours } = useFormHook({
    defaultFormData: [],
  });
  const [errorMessagesTours, setErrorMessagesTours] = useState([]);
  const [reassignmentErrors, setReassignmentErrors] = useState({ startTime: '', officer: '' });
  const [deletedTours, setDeletedTours] = useState([]);

  const [assignmentValue, setAssignmentValue] = useState({
    ...assignmentDefaultValues,
    shiftDate: dayjsWithStandardOffset(drawerData?.shiftDate),
  });
  const [shiftDetail, setShiftDetail] = useState(null);
  const [allOfficers, setAllOfficers] = useState(undefined);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [disableActionBtn, setDisableActionBtn] = useState(false);

  const { getNewApiController } = useApiControllers();

  const joiValidateTourTemplate = async () => {
    const joiValidatePayload = {
      name: formData?.name,
      startTime: formData?.startTime?.toISOString() || '',
      duration: formData?.duration?.value || '',
      report: formData?.report?.value || '',
      // checkpoints: formData?.checkpoints?.map((checkpoint) => ({
      //   checkpointId: checkpoint?.value,
      //   description: null,
      // })),
    };

    const errors = await joiValidate({ tourTemplate: joiValidatePayload }, t);

    if (errors && Object.keys(errors).length) {
      const updatedErrors = Object.entries(errors)?.reduce((acc, [key, value]) => {
        const [_joiKey, fieldName] = key.split(',');
        return { ...acc, [fieldName]: value };
      }, {});
      setErrorMessages(updatedErrors);

      return true;
    }
    return false;
  };
  const joiValidateTours = async () => {
    // validation
    const joiValidatePayload =
      formDataTours?.length > 0
        ? formDataTours?.map((tour) => ({
            name: tour?.name,
            startTime: tour?.startTime?.toISOString?.() || '',
            duration: tour?.duration?.value || '',
            report: tour?.report?.id ? tour?.report?.id + '' : '',
            // checkpoints: tour?.checkpoints?.map((checkpoint) => ({
            //   checkpointId: checkpoint?.id,
            //   description: null,
            // })),
            occurances: tour?.occurances
              ? {
                  repeatTour: tour?.occurances?.repeatTour?.value || '',
                  repeatAfterTime: tour?.occurances?.repeatAfterTime?.value || '',
                }
              : null,
          }))
        : undefined;

    const errors = await joiValidate({ tours: joiValidatePayload }, t);
    if (errors && Object.keys(errors).length) {
      const updatedErrors = Object.entries(errors)?.reduce((acc, [key, value]) => {
        const [_joiKey, index, fieldName, secondaryFieldname] = key.split(',');

        acc[index] = {
          ...acc[index],
          [fieldName]: secondaryFieldname
            ? { ...(acc[index]?.[fieldName] || {}), [secondaryFieldname]: value }
            : value,
        };
        return [...acc];
      }, []);

      setErrorMessagesTours(updatedErrors);
      return true;
    }
    return false;
  };

  const updateAssignmentError = (key, error) => {
    setAssignmentValue((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        error: error,
      },
    }));
  };

  const locationOfficerValidations = ({
    id,
    isValidStartDate,
    isValidEndDate,
    officerDays,
    key,
    t,
  }) => {
    const error = {
      value: '',
      date: '',
    };

    if (!id && isValidStartDate) {
      error.value = t('obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.required', {
        name: key,
      });
    }
    if (id && !isValidStartDate) {
      error.date = t(
        'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.dateRequiredError',
      );
    }
    if (isValidStartDate && !isValidEndDate) {
      error.date = t(
        'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.endDateRequiredError',
      );
    }
    if (officerDays?.length === 0) {
      error.days = t(
        'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.officerDaysRequiredError',
      );
    }

    updateAssignmentError(key, error);
    const isError = !!error.date || !!error.value || !!error?.days;
    return { isError };
  };
  const findHourlyRateValues = () => {
    const checked = assignmentValue?.hourlyRate?.checked;
    const hourlyRateValue = assignmentValue?.hourlyRate?.value;

    const thisShift =
      assignmentValue?.hourlyRate?.assignmentFor === hourlyRateAssignmentFor.THIS_SHIFT
        ? true
        : false;
    const hourlyRateValues = checked
      ? {
          thisShift,
          assignDate: thisShift ? assignmentValue?.shiftDate?.toISOString?.() : null,
          rate: hourlyRateValue ? Number(hourlyRateValue) : 0,
        }
      : undefined;

    return hourlyRateValues;
  };

  const handleSubmit = async () => {
    if (drawerData?.type === DRAWER_TYPE.TOUR_TEMPLATE) {
      const isError = await joiValidateTourTemplate();
      if (isError) return;

      // Create Tour Template
      const payload = {
        name: formData?.name,
        startTime: dayjs(formData?.startTime).toISOString(),
        duration: formData?.duration?.value,
        reportId: formData?.report?.value,
        jobType: SCHEDULE_DUTIES_TOUR_TEMPLATES.DEDICATED,
        checkpoints: formData?.checkpoints?.map((checkpoint) => ({
          checkpointId: checkpoint?.value,
          description: checkpoint?.moreDescription
            ? convertDataToHtml(checkpoint?.moreDescription)
            : null,
        })),
      };

      try {
        setDisableActionBtn(true);
        const response = await createTourTemplate({ payload, siteId: drawerData?.siteId });
        changeOnlyDrawerType(DRAWER_TYPE.ASSIGN)();
        setFormData(defaultCreateTourTemplateValues);
        setDisableActionBtn(false);
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } catch (error) {
        setDisableActionBtn(false);
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      return;
    }

    if ([DRAWER_TYPE.REASSIGNMENT, DRAWER_TYPE.EDIT_REASSIGNMENT].includes(drawerData?.type)) {
      // Create Reassignment Payload
      const payload = {
        logId: shiftDetail?.logId,
        officerId: assignmentValue?.reassignedOfficer?.value?.id,
        start: dayjs(assignmentValue?.reassignedOfficer?.selectedDates?.[0]).toISOString(),
        id:
          drawerData?.type === DRAWER_TYPE.EDIT_REASSIGNMENT
            ? shiftDetail?.reassignOfficer?.id
            : undefined,
      };

      const validatorPayload = {
        officer: assignmentValue?.reassignedOfficer?.value || {},
        startTime: payload.start,
      };

      const errors = await joiValidate({ reassignment: validatorPayload }, t);
      if (errors && Object.keys(errors).length) {
        const updatedErrors = Object.entries(errors)?.reduce((acc, [key, value]) => {
          const [_joiKey, fieldName] = key.split(',');
          return { ...acc, [fieldName]: value };
        }, {});
        setReassignmentErrors(updatedErrors);
        return;
      }
      if (payload.start < getCurrentStandardTimeInIsoWrtTimezone()) {
        setReassignmentErrors((prev) => ({
          ...prev,
          startTime: t(
            'obx.schedules.assignDedicatedDuty.assignShift.reassignment.startTimeBelowError',
          ),
        }));
        return;
      }

      try {
        setDisableActionBtn(true);
        const response = await reassignShift({ payload, shiftId: drawerData?.shiftId });
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        getShiftDetailById(assignmentValue?.shiftDate);
        changeOnlyDrawerType(DRAWER_TYPE.ASSIGN)();
        setDisableActionBtn(false);
      } catch (error) {
        setDisableActionBtn(false);
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      return;
    }

    const locationId = assignmentValue?.location?.value?.id ?? undefined;
    const isValidLocationStartDate = assignmentValue?.location?.selectedDates?.[0]?.isValid();
    const isValidLocationEndDate = assignmentValue?.location?.selectedDates?.[1]?.isValid();

    const officerId = assignmentValue?.officer?.value?.id ?? undefined;
    const isValidOfficerStartDate = assignmentValue?.officer?.selectedDates?.[0]?.isValid();
    const isValidOfficerEndDate = assignmentValue?.officer?.selectedDates?.[1]?.isValid();

    const { isError: isLocationError } = locationOfficerValidations({
      id: locationId,
      isValidStartDate: isValidLocationStartDate,
      isValidEndDate: isValidLocationEndDate,
      key: 'location',
      t,
    });
    // const { isError: isOfficerError } = locationOfficerValidations({
    //   id: officerId,
    //   isValidStartDate: isValidOfficerStartDate,
    //   isValidEndDate: isValidOfficerEndDate,
    //   officerDays: assignmentValue?.officer?.selectedDays || [],
    //   key: 'officer',
    //   t,
    // });

    const isTourErrors = await joiValidateTours();
    if (isLocationError || isTourErrors) {
      return;
    }

    // Location Assignment
    const location =
      locationId && isValidLocationStartDate && isValidLocationEndDate
        ? {
            id: locationId,
            assignmentDuration: {
              start: assignmentValue?.location?.selectedDates?.[0],
              end: assignmentValue?.location?.selectedDates?.[1],
            },
          }
        : undefined;

    let officer = undefined;
    if (officerId && isValidOfficerStartDate && isValidOfficerEndDate) {
      const startDate = assignmentValue?.officer?.selectedDates?.[0];
      const endDate = assignmentValue?.officer?.selectedDates?.[1];
      const assignedDays = getDaysWrtTimezoneAsPerStandardTime(
        startDate,
        assignmentValue?.officer?.selectedDays,
        true,
      );

      officer = {
        id: officerId === unassignOfficerValue ? undefined : officerId,
        assignedDays: assignedDays,
        assignmentDuration: {
          start: startDate,
          end: endDate,
        },
      };
    }

    const { isError: isValidationError, updatedTours } = toursValidation();
    setFormDataTours([...updatedTours]);
    if (isValidationError) {
      return toaster.info({
        text: t('obx.schedules.assignDedicatedDuty.assignShift.error.infoMsg'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }

    const tours =
      updatedTours?.length > 0
        ? updatedTours?.map((tour) => ({
            id: tour?.id,
            title: tour?.name,
            checkpoints: tour?.checkpoints?.map((checkpoint) => ({
              ...checkpoint,
              reportTemplateId: checkpoint?.templateId,
              description: checkpoint?.moreDescription
                ? convertDataToHtml(checkpoint?.moreDescription)
                : null,
            })),
            windowStart: dayjs(tour?.startTime).toISOString(),
            duration: tour?.duration?.value ? Number(tour?.duration?.value) : null,
            reportTemplateId: tour?.report?.id,
            occurances:
              tour?.occurances?.repeatTour?.value && tour?.occurances?.repeatAfterTime?.value
                ? {
                    infinite: tour?.occurances?.repeatTour?.value === INFINITE_REPEAT_TOUR,
                    repeat: Number(tour?.repeatTourValue),
                    delay: Number(tour?.occurances?.repeatAfterTime?.value),
                  }
                : null,
          }))
        : undefined;
    const payload = {
      location,
      officer,
      hourlyRate: findHourlyRateValues(),
      tours,
      deletedTours: deletedTours?.map((deletedTour) => deletedTour?.id),
    };

    try {
      setDisableActionBtn(true);
      const response = await assignShift({ payload, shiftId: drawerData?.shiftId });
      setFormDataTours([]);
      setDeletedTours([]);
      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      closeSideDrawer();
      callbackUponAssignment();
      setDisableActionBtn(false);
    } catch (error) {
      setDisableActionBtn(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const toursWithStartEndTime = () => {
    return formDataTours?.map((tour) => {
      const tourEndTime = dayjs(tour?.startTime)
        .add(Number(tour?.duration?.value), 'm')
        .toISOString(); // find tour end time from duration of tour
      const { startTime, endTime } = getStartEndTimeForValidation({
        selectedStartTime: dayjs(tour?.startTime).toISOString(),
        selectedEndTime: tourEndTime,
        isEndTimeOnNextDateWrtStandardTime: shiftDetail?.isEndTimeOnNextDateWrtStandardTime,
        shiftStartTime: shiftDetail?.shiftStartTime,
      });

      const timeRange = { startTime, endTime }; // values are in ISO

      let repeatTourValue = tour?.occurances?.repeatTour?.value;
      if (repeatTourValue && tour?.occurances?.repeatAfterTime?.value) {
        const delay = Number(tour?.occurances?.repeatAfterTime?.value); // in minutes

        if (repeatTourValue === INFINITE_REPEAT_TOUR) {
          repeatTourValue = 0;

          // calculate total number of tour repetations if value is 'infinite'
          const maxTourEndTime = shiftDetail?.shiftEndTime;
          const remainingTourDurationInMins = dayjs(maxTourEndTime).diff(endTime, 'm', true) % 1440; // 1440 is total minutes in a day. taking remainder will return exact remainingTourDuration even if dates are wrong

          const minsRequiredForATour = delay + Number(tour?.duration?.value);
          if (remainingTourDurationInMins >= minsRequiredForATour) {
            repeatTourValue = Math.floor(remainingTourDurationInMins / minsRequiredForATour);
            ++repeatTourValue; // incrementing by one because calculation. if repeatTourValue is 7, it means repeatition is 7 and incremented one value is a tour which is initially set
          }
        }

        // calculate tour end time
        const repeat = Number(repeatTourValue); // if repeat = 4, means repeat a tour 4 times. As we have already created 1st tour end time and now we need to create remaining three tour's end time
        for (let i = 1; i < repeat; i++) {
          const newStartTime = dayjs(timeRange.endTime).add(delay, 'm');
          const newEndTime = dayjs(newStartTime).add(Number(tour?.duration?.value), 'm');
          timeRange.endTime = newEndTime?.toISOString();
        }
      }

      return { ...tour, timeRange, repeatTourValue };
    });
  };
  const invalidStartEndTimeErrors = (tourStartTime, tourEndTime) => {
    const errors = [];

    if (tourStartTime < shiftDetail?.shiftStartTime || tourStartTime >= shiftDetail?.shiftEndTime) {
      errors.push(t('obx.schedules.assignDedicatedDuty.assignShift.error.invalidStartTime'));
    }
    if (tourEndTime < shiftDetail?.shiftStartTime || tourEndTime > shiftDetail?.shiftEndTime) {
      errors.push(t('obx.schedules.assignDedicatedDuty.assignShift.error.invalidEndTime'));
    }

    return errors;
  };
  const startTimeOverlappedError = ({ tourStartTime, tourKey, tours }) => {
    let errors = [];

    const matchedTourIdx = tours?.findIndex((tour) => {
      if (
        tour?.key !== tourKey && // Same tour should not be checked
        tourStartTime >= tour?.timeRange?.startTime &&
        tourStartTime < tour?.timeRange?.endTime
      ) {
        return true;
      }
      return false;
    });

    if (matchedTourIdx !== -1) {
      errors.push(
        t('obx.schedules.assignDedicatedDuty.assignShift.error.timeOverlapped', {
          name: t('obx.schedules.assignDedicatedDuty.assignShift.defaultTourName', {
            index: tours[matchedTourIdx]?.key,
          }),
        }),
      );
    }

    return errors;
  };
  const toursValidation = () => {
    let isError = false;
    const tours = toursWithStartEndTime() || [];

    const tourWithErrors = tours.map((tour) => {
      const { startTime: tourStartTime, endTime: tourEndTime } = tour.timeRange || {};
      const invalidErrors = invalidStartEndTimeErrors(tourStartTime, tourEndTime);
      if (invalidErrors?.length > 0) {
        isError = true;
        return { ...tour, errors: invalidErrors };
      }
      // tour overlap errors
      const overlapErrors = startTimeOverlappedError({ tourStartTime, tourKey: tour?.key, tours });
      if (overlapErrors?.length > 0) {
        isError = true;
        return { ...tour, errors: overlapErrors };
      }

      return { ...tour, errors: [] };
    });

    return { isError, updatedTours: tourWithErrors };
  };

  const clearTemplateStates = () => {
    setFormData(defaultCreateTourTemplateValues);
  };

  const getReportTemplates = async (siteId) => {
    try {
      setReports(undefined);
      const response = await getReportTemplatesList(siteId);
      const reportTemplatesRes =
        transformArrayForOptions(response.data?.templates, 'title', 'id', 'description') || [];
      setReports(reportTemplatesRes);
    } catch (error) {
      setReports([]);
    }
  };
  const getCheckpointsOfSite = async (siteId) => {
    try {
      const response = await fetchCheckpointsBySiteId(siteId);
      const updatedCheckpoints = response?.data?.checkpoints?.map((checkpoint) => ({
        ...checkpoint,
        locationName: checkpoint?.location?.locationName,
      }));
      const checkpointsRes =
        transformArrayForOptions(updatedCheckpoints, 'checkpointType', 'id', 'locationName') || [];
      setCheckpoints(checkpointsRes);
    } catch (error) {
      setCheckpoints([]);
    }
  };

  const getShiftDetailById = async (shiftDate) => {
    try {
      const shiftDateInISO = shiftDate?.toISOString?.();
      setLoading(true);

      setAllOfficers(undefined);
      setShiftDetail({});
      setFormDataTours([]);
      setAssignmentValue((prev) => ({
        ...prev,
        ...assignmentDefaultValues,
      }));

      const response = await fetchShiftDetailForAssignmentById({
        shiftId: drawerData?.shiftId,
        shiftDate: shiftDateInISO,
      });

      const shiftDetail = response?.data?.shift || {};
      const { startsAt, endsAt } = shiftDetail;

      const shiftDays = getDaysWrtTimezoneAsPerStandardTime(
        shiftDetail?.selectedShiftStartTime,
        shiftDetail?.shiftDays,
      ); // update shift days as per timezone

      const { startTime, endTime, isEndTimeOnNextDate, isEndTimeOnNextDateWrtStandardTime } =
        getStartEndTimeWithDesiredDate(dateForValidation, startsAt, endsAt);

      const shiftDurationInHrs = getHoursDiff24HourFormat(startsAt, endsAt);
      const { lastShiftStartTime, lastShiftEndTime } = getLastShiftStartEndTimeOfJob(
        startsAt,
        endsAt,
      );

      const allowReassignment =
        [
          ShiftStatus.SHIFT_STARTED,
          ShiftStatus.BREAK_STARTED,
          ShiftStatus.BREAK_ENDED,
          ShiftStatus.SHIFT_ENDED,
        ].includes(shiftDetail.shiftStatus) &&
        getCurrentStandardTimeInIsoWrtTimezone() >= shiftDetail?.selectedShiftStartTime &&
        getCurrentStandardTimeInIsoWrtTimezone() < shiftDetail?.selectedShiftEndTime;

      const assignmentSelectionMinDate = () => {
        if (shiftDetail?.onGoingShift) {
          // If shift contains ongoing shift, minimum date will be that shift startsAt
          return dayjsWithStandardOffset(shiftDetail?.onGoingShift?.startsAt);
        }

        return assignmentMinDate(shiftDetail?.startsAt, endTime);
      };

      const updatedShiftDetail = {
        ...shiftDetail,
        shiftDurationInHrs,
        shiftStartTime: startTime,
        shiftEndTime: endTime,
        isEndTimeOnNextDate,
        isEndTimeOnNextDateWrtStandardTime,
        allowReassignment,
        lastShiftStartTime,
        lastShiftEndTime,
        shiftDays,
        shiftDateInISO,
        assignmentReadOnlyMode: shiftDetail.shiftStatus !== ShiftStatus.SHIFT_NOT_STARTED,
        assignmentMinDate: assignmentSelectionMinDate(),
      };

      setShiftDetail(updatedShiftDetail);
      setInitialAssignment(shiftDateInISO, updatedShiftDetail);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setShiftDetail({});
    }
  };

  const defaultAssignmentDates = (shiftDateInISO, startsAt, endsAt) => {
    // Default location and officer assignment date ranges
    const isSelectedDateWithinShiftDuration =
      shiftDateInISO >= startsAt && shiftDateInISO <= endsAt;
    const assignmentStartDate = isSelectedDateWithinShiftDuration
      ? dayjsWithStandardOffset(shiftDateInISO)
      : null;
    let assignmentEndDate = null;
    if (assignmentStartDate) {
      const assignmentExpectedEndDate = assignmentStartDate
        ? assignmentStartDate.add(1, 'month')
        : null;
      assignmentEndDate =
        assignmentExpectedEndDate?.toISOString() <= endsAt
          ? assignmentExpectedEndDate
          : getEmbededDateAndTimeWRTStandardOffset(shiftDateInISO, endsAt);
    }

    return { assignmentStartDate, assignmentEndDate };
  };
  const getAssignmentDates = (shiftDateInISO, shiftDetail) => {
    const { assignmentStartDate, assignmentEndDate } = defaultAssignmentDates(
      shiftDateInISO,
      shiftDetail?.startsAt,
      shiftDetail?.lastShiftStartTime,
    );

    const defaultValue =
      assignmentStartDate && assignmentEndDate ? [assignmentStartDate, assignmentEndDate] : [];
    let officerSelectedDates = defaultValue;
    let locationSelectedDates = defaultValue;
    // set assigned officer date range and value
    if (shiftDetail?.officer?.startsAt && shiftDetail?.officer?.endsAt) {
      officerSelectedDates = [
        dayjsWithStandardOffset(shiftDetail?.officer?.startsAt),
        dayjsWithStandardOffset(shiftDetail?.officer?.endsAt),
      ];
    }

    // set assigned location date range and value
    if (shiftDetail?.location?.startsAt && shiftDetail?.location?.endsAt) {
      locationSelectedDates = [
        dayjsWithStandardOffset(shiftDetail?.location?.startsAt),
        dayjsWithStandardOffset(shiftDetail?.location?.endsAt),
      ];
    }

    if (shiftDetail?.location && shiftDetail?.officer) {
      locationSelectedDates = [
        dayjsWithStandardOffset(shiftDateInISO),
        dayjsWithStandardOffset(shiftDateInISO),
      ];
      officerSelectedDates = [
        dayjsWithStandardOffset(shiftDateInISO),
        dayjsWithStandardOffset(shiftDateInISO),
      ];
    }
    return { locationSelectedDates, officerSelectedDates };
  };
  const setInitialAssignment = (shiftDateInISO, shiftDetail) => {
    const { locationSelectedDates, officerSelectedDates } = getAssignmentDates(
      shiftDateInISO,
      shiftDetail,
    );

    let selectedDaysFromDates = [];

    if (officerSelectedDates.length) {
      const days = getDaysBetweenDatesRangeWrtStandardDate(
        officerSelectedDates[0],
        officerSelectedDates[1],
      );
      selectedDaysFromDates = days.filter((day) => shiftDetail?.shiftDays.includes(day));
    }

    setAssignmentValue((prev) => ({
      ...prev,
      location: {
        ...prev?.location,
        selectedDates: locationSelectedDates,
      },
      officer: {
        ...prev?.officer,
        selectedDates: officerSelectedDates,
        selectedDays: selectedDaysFromDates.length
          ? selectedDaysFromDates
          : getDaysWrtTimezoneAsPerStandardTime(
              shiftDetail?.selectedShiftStartTime,
              shiftDetail?.officer?.shiftDays,
            ) || [],
        value: shiftDetail?.officer?.id
          ? {
              ...shiftDetail?.officer,
              image: shiftDetail?.officer?.imageUrl,
              label: shiftDetail?.officer?.name,
            }
          : {},
      },
      hourlyRate: shiftDetail?.hourlyRate
        ? {
            ...prev?.hourlyRate,
            checked: !!shiftDetail?.hourlyRate,
            value: shiftDetail?.hourlyRate?.rate + '',
            assignmentFor: shiftDetail?.hourlyRate?.thisShift
              ? hourlyRateAssignmentFor.THIS_SHIFT
              : hourlyRateAssignmentFor.UPCOMMING_SHIFT_OMWARDS,
          }
        : prev?.hourlyRate,
    }));
  };

  useEffect(() => {
    getReportTemplates(drawerData?.siteId);
    getCheckpointsOfSite(drawerData?.siteId);
  }, []);

  useEffect(() => {
    if (!assignmentValue?.shiftDate?.isValid()) return;

    getShiftDetailById(assignmentValue?.shiftDate);
  }, [assignmentValue?.shiftDate]);

  const getLocationsOfSite = async (siteId) => {
    try {
      const response = await getSitesAllLocations(siteId);

      if (response?.statusCode === 200) {
        const locationsRes = response?.data?.locations || [];
        setLocations(transformArrayForOptions(locationsRes, 'name', 'id'));
      }
    } catch (error) {
      setLocations([]);
    }
  };

  // Fetch locations
  useEffect(() => {
    getLocationsOfSite(drawerData?.siteId);
  }, []);
  // populate location, if it already exists in shift detail
  useEffect(() => {
    if (locations?.length > 0 && shiftDetail?.location?.id) {
      const matchedLocation = locations?.find(
        (location) => location?.id === shiftDetail?.location?.id,
      );

      setAssignmentValue((prev) => ({
        ...prev,
        location: {
          ...prev?.location,
          value: matchedLocation,
        },
      }));
    }
  }, [locations, shiftDetail?.location?.id]);

  const getOfficersData = async ({ shiftId, start, end, selectedDays, isReassigned }) => {
    const apiController = getNewApiController();

    if (!start || !end) {
      setAllOfficers({});
      return;
    }

    try {
      setAllOfficers(undefined);
      const queryParams = {
        start,
        end,
        assignmentDays: selectedDays,
        isReassigned,
      };
      const config = { signal: apiController.signal };
      const response = await getActiveAndInActiveOfficers({ shiftId, queryParams, config });

      const data = response?.data || {};
      const assignMe = data?.assignMe && {
        ...data.assignMe,
        disabled: data.assignMe?.isAssigned,
      };
      const assigned = data?.assigned?.map((officer) => ({
        ...officer,
        disabled: officer?.isAssigned,
      }));

      const isOfficerAlreadyAssigned = shiftDetail?.officer?.id;
      const unassignOfficer =
        isOfficerAlreadyAssigned && !shiftDetail?.reassignOfficer
          ? {
              id: unassignOfficerValue,
              name: t('obx.schedules.assignDedicatedDuty.assignShift.unassignOfficer'),
              imageUrl: null,
              role: 'Officer',
              label: t('obx.schedules.assignDedicatedDuty.assignShift.unassignOfficer'),
              value: unassignOfficerValue,
              isAssigned: false,
            }
          : null;

      setAllOfficers({ ...data, assigned, assignMe, unassignOfficer });
    } catch (error) {
      if (!apiController.signal.aborted) {
        setAllOfficers(null);
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  const populateMatchedTours = ({ shiftDetail, checkpoints, reports }) => {
    const matchedTours = shiftDetail?.tours?.map((tour, index) => {
      const tourCheckpointIds = tour?.tour?.checkpoints?.map((chkpt) => chkpt?.id);
      const matchedCheckpoints = checkpoints
        ?.filter((checkpoint) => tourCheckpointIds?.includes(checkpoint?.id))
        ?.map((checkpoint) => {
          const matchedCheckpoint = tour?.tour?.checkpoints?.find(
            (chkpt) => chkpt?.id === checkpoint?.id,
          );
          return {
            ...checkpoint,
            moreDescription: matchedCheckpoint?.description
              ? convertToDraft(matchedCheckpoint?.description)
              : null,
          };
        });

      return {
        id: tour?.id,
        key: index + 1,
        name: tour?.tour?.title,
        startTime: dayjs(tour?.tour?.startsAt),
        duration: {
          value: tour?.tour?.duration + '',
          label: tour?.tour?.duration + '',
        },
        checkpoints: matchedCheckpoints,
        report: reports?.find((report) => report?.id == tour?.tour?.reportTemplateId),
        occurances: tour?.occurence?.repeat
          ? {
              repeatTour: {
                value: tour?.occurence?.infinite
                  ? INFINITE_REPEAT_TOUR
                  : tour?.occurence?.repeat + '',
                label: tour?.occurence?.infinite
                  ? t('obx.schedules.assignDedicatedDuty.assignShift.repeatInfinite')
                  : tour?.occurence?.repeat + '',
              },
              repeatAfterTime: {
                value: tour?.occurence?.delay + '',
                label: tour?.occurence?.delay + '',
              },
            }
          : null,
      };
    });
    setFormDataTours(matchedTours);
  };

  // Populate tours if tours are already assigned to selected shift date
  useEffect(() => {
    if (shiftDetail?.tours?.length > 0 && reports !== undefined) {
      populateMatchedTours({ shiftDetail, checkpoints, reports });
    }
  }, [shiftDetail?.tours, checkpoints, reports]);

  const handleChangeAssignmentValue = (e) => {
    setAssignmentValue((prev) => {
      const updatedValue =
        e.target.value?.id && prev?.[e.target?.name]?.value?.id === e.target.value?.id
          ? null
          : e.target.value;

      return {
        ...prev,
        [e.target.name]: {
          ...prev[e.target?.name],
          value: updatedValue,
          error: {
            ...prev[e.target?.name].error,
            value: '',
          },
        },
      };
    });
  };

  const officerAssignmentStart = assignmentValue?.officer?.selectedDates?.[0];
  const officerAssignmentEnd = assignmentValue?.officer?.selectedDates?.[1];
  const officerAssignmentDays = assignmentValue?.officer?.selectedDays;
  useEffect(() => {
    if (
      dayjs(officerAssignmentStart).isValid() &&
      dayjs(officerAssignmentEnd).isValid() &&
      officerAssignmentDays?.length > 0
    ) {
      getOfficersData({
        shiftId: drawerData?.shiftId,
        start: officerAssignmentStart?.toISOString(),
        end: officerAssignmentEnd?.toISOString(),
        selectedDays:
          getDaysWrtTimezoneAsPerStandardTime(
            officerAssignmentStart,
            officerAssignmentDays,
            true,
          ) || [],
      });
    }
  }, [officerAssignmentStart, officerAssignmentEnd, officerAssignmentDays]);

  const setChangeDate =
    (key) =>
    (dates = []) => {
      const firstDate = dayjs(dates?.[0]).format('YYYY-MM-DD');
      const secondDate = dayjs(dates?.[1]).format('YYYY-MM-DD');
      const startDate = getEmbededDateAndTimeWRTStandardOffset(shiftDetail?.startsAt, firstDate);
      const endDate = getEmbededDateAndTimeWRTStandardOffset(shiftDetail?.startsAt, secondDate);

      let selectedDates = [startDate, endDate];
      if (key === 'reassignedOfficer') {
        const startDate = dates?.[0] ? dates?.[0] : null;
        const endDate = dates?.[1] ? dates?.[1] : null;

        const start = dates?.[0] ? dayjs(dates?.[0]).toISOString() : null;
        const end = dates?.[1] ? dayjs(shiftDetail?.selectedShiftEndTime).toISOString() : null;

        selectedDates = [startDate, endDate];

        getOfficersData({
          shiftId: drawerData?.shiftId,
          start: start,
          end: end,
          isReassigned: true,
        });
      }

      setAssignmentValue((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          selectedDates: selectedDates,
          error: {
            ...prev[key].error,
            date: '',
          },
        },
      }));
    };

  return (
    <SideDrawer totalWidth={'720px'} isOpen={!!drawerData?.type}>
      <Layout
        drawerData={drawerData}
        changeOnlyDrawerType={changeOnlyDrawerType}
        closeSideDrawer={closeSideDrawer}
        handleSubmit={handleSubmit}
        clearTemplateStates={clearTemplateStates}
        shiftDetail={shiftDetail}
        loading={loading}
        disableActionBtn={disableActionBtn}
      >
        {drawerData?.type === DRAWER_TYPE.TOUR_TEMPLATE ? (
          <Box className={classes.TourTemplatesDrawerWrapper}>
            <CreateTourTemplate
              {...{
                formData,
                handleInputChange,
                reports: reports || [],
                checkpoints,
                errorMessages,
                setFormData,
                setErrorMessages,
                isCreateTourTemplate: drawerData?.type === DRAWER_TYPE.TOUR_TEMPLATE,
              }}
            />
          </Box>
        ) : [DRAWER_TYPE.REASSIGNMENT, DRAWER_TYPE.EDIT_REASSIGNMENT].includes(drawerData?.type) ? (
          <ReassignShift
            {...{
              handleChangeValue: handleChangeAssignmentValue,
              assignmentValue,
              allOfficers,
              shiftDetail,
              setChangeDate,
              setReassignmentErrors,
              reassignmentErrors,
              setAssignmentValue,
            }}
          />
        ) : (
          <AssignShift
            {...{
              changeOnlyDrawerType,
              handleChangeValue: handleChangeAssignmentValue,
              formDataTours,
              setFormDataTours,
              setDeletedTours,
              assignmentValue,
              setAssignmentValue,
              reports: reports || [],
              checkpoints,
              shiftDetail,
              drawerData,
              errorMessagesTours,
              setErrorMessagesTours,
              allOfficers,
              locations,
              loading,
              setChangeDate,
            }}
          />
        )}
      </Layout>
    </SideDrawer>
  );
};

export default AssignmentSideDrawer;

AssignmentSideDrawer.propTypes = {
  drawerData: PropTypes.object,
  closeSideDrawer: PropTypes.func,
  callbackUponAssignment: PropTypes.func,
  changeOnlyDrawerType: PropTypes.func,
};
