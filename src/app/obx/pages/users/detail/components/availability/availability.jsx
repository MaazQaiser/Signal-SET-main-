import { Box, Button, Skeleton, Typography } from '@mui/material';
import { ReactComponent as ResetIcon } from 'assets/svg/reset-clock.svg';
import classNames from 'classnames';
// import LoaderComponent from 'commonComponents/loader';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getUsersAvailability, updateUsersAvailability } from 'services/user.services';
import {
  dayjsWithStandardOffset,
  getOffsetWithStandardTime,
} from 'src/app/obx/pages/schedules/helper';
import AvailabilitySelectionRow from 'src/app/obx/pages/users/detail/components/availability/components/availabilitySelectionRow';
import { getErrorKey, removeKey } from 'src/helper/utilityFunctions';
import { resetAvailabilityData, toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from './avalibilityStyle';
dayjs.extend(utc);
const enums = {
  availability: 'availability',
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Availability = ({ id }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});

  // const NA = t('commonText.nA');

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await getUsersAvailability(id);

      if (response?.statusCode === 200) {
        const data = response?.data?.availability?.map((a, _index) => {
          let startTime = a?.startTime === 'none' ? '' : a?.startTime;
          let endTime = a?.endTime === 'none' ? '' : a?.endTime;

          if (startTime) {
            const timeInUTC = dayjs.utc(startTime, 'hh:mm A');

            startTime = dayjsWithStandardOffset(timeInUTC).format('hh:mm A');
          }

          if (endTime) {
            const timeInUTC = dayjs.utc(endTime, 'hh:mm A');
            endTime = dayjsWithStandardOffset(timeInUTC).format('hh:mm A');
          }

          // const currentDay = days[index];

          return {
            ...a,
            // day: currentDay,
            startTime: {
              value: startTime || 'none',
              label: startTime || 'None',
            },
            endTime: {
              value: endTime,
              label: endTime,
            },
          };
        });

        const afterRevertion = revertDays(data);

        setData(afterRevertion);
      }

      setLoading(false);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const revertDays = (schedule) => {
    schedule.forEach((item, index) => {
      let startTime = item?.startTime?.value === 'none' ? '' : item?.startTime?.value;

      if (startTime) {
        const currentDayIndex = index;

        const nextDay = days[currentDayIndex];

        const timezoneOffset = getOffsetWithStandardTime();
        const isoDate = dayjsWithStandardOffset(startTime).add(timezoneOffset, 'minute');
        const localDate = dayjsWithStandardOffset(startTime);

        if (localDate.isAfter(isoDate, 'date')) {
          item.day = nextDay;
        }
      }
    });

    return schedule;
  };

  const convertDay = (schedule) => {
    schedule.forEach((item, index) => {
      let startTime = item?.startTime === 'none' ? '' : item?.startTime;

      if (startTime) {
        const currentDayIndex = index;
        const previousDayIndex = (currentDayIndex - 1 + 7) % 7; // Handles negative values

        const previousDay = days[previousDayIndex];

        const selectedStartTime = dayjs(startTime, 'hh:mm A');

        const currentDayWithTime = dayjsWithStandardOffset()
          .set('hour', selectedStartTime.hour())
          .set('minute', selectedStartTime.minute());

        const currentDayWithTimeAfterUtcConversion = currentDayWithTime.utc();

        if (currentDayWithTimeAfterUtcConversion.date() > currentDayWithTime.date()) {
          item.day = previousDay;
        }
      }
    });
    return schedule;
  };

  const resetAvailability = () => {
    setData(JSON.parse(JSON.stringify(resetAvailabilityData)));
  };

  const updateAvailability = async () => {
    try {
      const validateFormData = {
        availability: data?.map((a) => {
          return {
            id: a?.id,
            startTime: a?.startTime?.value,
            endTime: !a?.endTime?.value ? undefined : a?.endTime?.value,
            day: a?.day,
          };
        }),
      };
      let finalPayload = JSON.parse(JSON.stringify(validateFormData));
      const errors = await formValidatorJoi(finalPayload, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages((prev) => ({ ...prev, ...errors }));

        return;
      }
      setLoading(true);

      const convertedSchedule = convertDay(JSON.parse(JSON.stringify(finalPayload.availability)));

      const payload = {
        availability: convertedSchedule.map((a) => {
          let startTime = a?.startTime === 'none' ? '' : a?.startTime;

          if (startTime) {
            const selectedStartTime = dayjs(startTime, 'hh:mm A');

            startTime = dayjsWithStandardOffset()
              .set('hour', selectedStartTime.hour())
              .set('minute', selectedStartTime.minute());

            startTime = startTime.utc().format('hh:mm A');
          }

          let endTime = a?.endTime || '';

          if (endTime) {
            const selectedEndTime = dayjs(endTime, 'hh:mm A');

            endTime = dayjsWithStandardOffset()
              .set('hour', selectedEndTime.hour())
              .set('minute', selectedEndTime.minute());

            endTime = endTime.utc().format('hh:mm A');
          }

          return {
            ...a,
            id: a?.id,
            startTime: startTime,
            endTime: endTime,
          };
        }),
      };

      const response = await updateUsersAvailability(id, payload);

      if (response?.statusCode === 200) {
        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      setLoading(false);
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const handleAvailabilityChanges = (name, value, index, removeError = true) => {
    const formDataAvailability = [...data];

    formDataAvailability[index][name] = value;

    setData(formDataAvailability);

    if (removeError) {
      const errorKey = getErrorKey(name, enums.availability, index);

      setErrorMessages((prev) => removeKey([errorKey], prev));
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [id]);

  return (
    <Box className={classes.sitesListingCommonContainer}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}

      <Box className={classes.availabilityHeader}>
        <Box className={classes.availabilityHeaderLeft}>
          <Typography variant="h4" className={classes.zoneCustomText}>
            {t('obx.users.usersAvailability.heading')}
          </Typography>
          <Typography variant="body2" className={classes.zoneDetailText}>
            {t('obx.users.usersAvailability.desc')}
          </Typography>
        </Box>
        <Button
          variant="primary"
          type="button"
          startIcon={<ResetIcon />}
          onClick={resetAvailability}
        >
          {t('obx.buttons.resetTo247')}
        </Button>
      </Box>

      <Box className={classes.tableWrapperOne}>
        <Box className={classes.timeHeader}>
          <Typography
            variant="subtitle3"
            className={classNames(classes.tableCalendarHeading, classes.tableCalendarHeadingOne)}
          >
            {t('obx.users.usersAvailability.listing.columns.days')}
          </Typography>
          <Typography
            variant="subtitle3"
            className={classNames(classes.tableCalendarHeading, classes.tableCalendarHeadingTwo)}
          >
            {t('obx.users.usersAvailability.listing.columns.startTime')}
          </Typography>
          <Typography
            variant="subtitle3"
            className={classNames(classes.tableCalendarHeading, classes.tableCalendarHeadingThree)}
          >
            {t('obx.users.usersAvailability.listing.columns.endTime')}
          </Typography>

          {/*<Typography*/}
          {/*  variant="subtitle3"*/}
          {/*  className={classNames(classes.tableCalendarHeading, classes.tableCalendarHeadingFour)}*/}
          {/*>*/}
          {/*  {t('obx.users.usersAvailability.listing.columns.dayEnd')}*/}
          {/*</Typography>*/}
        </Box>

        <Box className={classes.tableWrapperCalendar}>
          {loading ? (
            <>
              <Skeleton className={classes.rowSkeleton} />
              <Skeleton className={classes.rowSkeleton} />
              <Skeleton className={classes.rowSkeleton} />
              <Skeleton className={classes.rowSkeleton} />
              <Skeleton className={classes.rowSkeleton} />
              <Skeleton className={classes.rowSkeleton} />
              <Skeleton className={classes.rowSkeleton} />
            </>
          ) : (
            data?.map((a, index) => {
              return (
                <React.Fragment key={index}>
                  <AvailabilitySelectionRow
                    index={index}
                    data={a}
                    onAvailabilityChange={handleAvailabilityChanges}
                    errors={errorMessages}
                  />
                </React.Fragment>
              );
            })
          )}
        </Box>
      </Box>
      <Box className={classes.saveBtnWrapper}>
        <Button variant="primary" type="button" onClick={updateAvailability}>
          {t('obx.buttons.save')}
        </Button>
      </Box>
    </Box>
  );
};

Availability.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Availability;
