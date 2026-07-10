import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { getKeyFromUrlQueryParam } from 'src/helper/utilityFunctions';
import store from 'src/redux/store/index';
import {
  daysOfWeekWithVal,
  franchiseIdSource,
  franchiseIdUrlQueryParam,
  rolesEnum,
  timeZoneKeyUrlQueryParam,
} from 'src/utils/constants';
import { TIMEZONE_LIST } from 'src/utils/constants/timeZones';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getUTCHoursAndMinutesWithUTCDate = (timePart, datePart) => {
  // if datePart is undefined, dayjs will automatically pick current date

  return dayjs
    .utc(datePart)
    .hour(dayjs.utc(timePart).get('h'))
    .minute(dayjs.utc(timePart).get('m'))
    .second(0)
    .millisecond(0);
};

const getAuthStateFromRedux = () => {
  // grab current state
  const state = store.getState();

  return state?.auth;
};

export const extractTimeZoneAndRoleFromRedux = () => {
  // grab auth state from redux
  const stateAuth = getAuthStateFromRedux();

  return {
    role: stateAuth?.userRole?.slug,
    timeZone: stateAuth?.franchiseTimeZone,
  };
};

const extractRoleAndFranchiseIdFromRedux = () => {
  const stateAuth = getAuthStateFromRedux();

  return {
    role: stateAuth?.userRole?.slug,
    franchiseId: stateAuth?.franchiseId,
  };
};

const checkIfUserIsHOAndUrlHasTimezoneKeyInUrl = (roleAndTimeZoneObj) => {
  /**
   * check if the URL path is HO Site Details and query params contains the key franchiseId
   * then return the key extracted from URL, else return the key from auth redux
   * */
  return !!(
    roleAndTimeZoneObj?.role === rolesEnum.homeOfficer &&
    // containsSegmentInCurrentUrl(HO_SITES_DETAIL) &&
    getKeyFromUrlQueryParam(timeZoneKeyUrlQueryParam)
  );
};

const checkIfUserIsHOAndUrlHasFranchiseIdKeyInUrl = (roleAndFranchiseIdObj) => {
  /**
   * check if query params contains the key franchiseId
   * then return the key extracted from URL, else return the key from auth redux
   * */
  return !!(
    roleAndFranchiseIdObj?.role === rolesEnum.homeOfficer &&
    getKeyFromUrlQueryParam(franchiseIdUrlQueryParam)
  );
};

const checkIfTheTimeZoneIsValid = (tz) => {
  return TIMEZONE_LIST?.find((item) => item.tzCode === tz)?.tzCode;
};

export const getTimezone = () => {
  const roleAndTimeZoneFromRedux = extractTimeZoneAndRoleFromRedux();

  if (checkIfUserIsHOAndUrlHasTimezoneKeyInUrl(roleAndTimeZoneFromRedux)) {
    return (
      checkIfTheTimeZoneIsValid(getKeyFromUrlQueryParam(timeZoneKeyUrlQueryParam)) ||
      dayjs.tz.guess()
    );
  }
  const timezone =
    roleAndTimeZoneFromRedux?.role !== rolesEnum.homeOfficer &&
    roleAndTimeZoneFromRedux.role !== rolesEnum.salesManager
      ? checkIfTheTimeZoneIsValid(roleAndTimeZoneFromRedux.timeZone) || dayjs.tz.guess()
      : dayjs.tz.guess();

  return timezone;
};

export const getFranchiseIdWithRoleAndSource = () => {
  const roleAndFranchiseIdFromRedux = extractRoleAndFranchiseIdFromRedux();

  if (checkIfUserIsHOAndUrlHasFranchiseIdKeyInUrl(roleAndFranchiseIdFromRedux)) {
    return {
      [franchiseIdUrlQueryParam]: getKeyFromUrlQueryParam(franchiseIdUrlQueryParam) || null,
      source: franchiseIdSource.url,
      role: roleAndFranchiseIdFromRedux.role,
    };
  }

  return {
    [franchiseIdUrlQueryParam]: roleAndFranchiseIdFromRedux.franchiseId || null,
    source: franchiseIdSource.redux,
    role: roleAndFranchiseIdFromRedux.role,
  };
};

export const dayjsWithTimezone = (date) => dayjs.tz(date, getTimezone());
export const utcDayjsWithTimezone = (date) => dayjs.utc(date).tz(getTimezone());

export const getStandardOffsetWithVariableTimeZone = (date, timezone) =>
  dayjs.tz(dayjs(date).startOf('year').toDate(), timezone).utcOffset();

/**
 * @description get offset for given value
 * @param {*} offsetFloat
 * @returns
 */
export const formatOffset = (offsetFloat) => {
  // Ensure we use the absolute value for calculations
  const absOffset = Math.abs(offsetFloat);

  // Extract hours and minutes
  const hours = Math.floor(absOffset);
  const minutes = Math.round((absOffset - hours) * 60);

  // Format hours and minutes
  const formattedHours = (offsetFloat < 0 ? '-' : '') + Math.abs(hours).toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');

  // Construct the formatted offset string
  return `${formattedHours}:${formattedMinutes}`;
};
export const getOffsetWithStandardTime = () => {
  // '2024-01-01' -- this date will always contains standard offset and not DLS(daylight-saving) offset even for timezones where DLS gets enabled
  return dayjsWithTimezone('2024-01-01').utcOffset();
};

export const checkDLSWrtDate = (date) => {
  // if date is undefined, it means we are picking current date and time
  return {
    isDLSWrtDate: getOffsetWithStandardTime() !== dayjsWithTimezone(date).utcOffset(),
    offsetDiff: getOffsetWithStandardTime() - dayjsWithTimezone(date).utcOffset(), // offsetDiff will be negative if DLS is enabled and current timezone is at negative offset and vice versa
  };
};

export const dayjsWithStandardOffset = (date, keepLocalTime) => {
  const standardOffset = getOffsetWithStandardTime();
  if (!dayjs(date).isValid()) {
    date = undefined;
  }

  const utcDate = dayjs(date)?.toISOString();
  return dayjs(utcDate).utcOffset(standardOffset, !!keepLocalTime);
};

/**
 * @description convert dayjs date and time objects into foreign time zone
 * @param {*} date
 * @param {*} time
 * @param {*} convertToUTC
 * @returns
 */
export const mergeDateTimeAndReturnInForeignTimeZone = (date, time) =>
  dayjsWithStandardOffset(
    `${date.format('YYYY-MM-DD')}T${time?.format('HH:mm:ss')}`,
    true,
  ).toISOString();

/**
 * This function will be used to populate time on time pickers as per Diabled DLS.
 *
 * Time Pickers, pick DLS time if current time is at DLS and pick standard time if current time is at Standard Time.
 * Lets say, current time is at DLS and timezone offset is -6 as per standard time and -5 as per DLS time.
 * In this case, if ISOString has time 12:00 then time picker will show it as 07:00 (according to DLS) but WRT standard time time picker should show 06:00.
 * For achieving 06:00 in timepicker, we need to apply, standard time offset difference with current time offset. In our case, difference will be -1 and ISOString time will become 11:00 and hence time picker will show 06:00
 * Lets say, if current time is at Standard time, then offset difference will be 0. Hence no need to change ISOString time
 */
export const adjustHourForTimePopulationWrtCurrentDate = (dateTimeToPopulate) => {
  const { offsetDiff: offsetDiffWRTCurrentDate } = checkDLSWrtDate(dateTimeToPopulate);
  return dayjs(dateTimeToPopulate).add(offsetDiffWRTCurrentDate, 'minute');
};

export const adjustHourForTimePayloadInIso = (dateTime) => {
  const { offsetDiff: offsetDiffWRTCurrentDate } = checkDLSWrtDate(dateTime);
  const dateTimeInIso = dayjs(dateTime)?.toISOString();
  return dayjs(dateTimeInIso).add(-offsetDiffWRTCurrentDate, 'minute').toISOString();
};

export const adjustHourForTimePayload = (dateTime) => {
  const { offsetDiff: offsetDiffWRTCurrentDate } = checkDLSWrtDate(dateTime);
  const dateTimeInIso = dayjs(dateTime)?.toISOString();
  return dayjs(dateTimeInIso).add(-offsetDiffWRTCurrentDate, 'minute');
};
export const getCurrentStandardTimeInIsoWrtTimezone = () => adjustHourForTimePayloadInIso();

export const getHoursAndMinutesWithCurrentDate = (timePart, datePart, isAssignment) => {
  // if datePart is undefined, then dayjs will pick current date.

  const datePartUtcOffset = dayjs(datePart).utcOffset();
  const updatedTimePart = dayjs(timePart).utcOffset(datePartUtcOffset);

  let calculatedDate = dayjs(datePart)
    .hour(dayjs(updatedTimePart).get('h'))
    .minute(dayjs(updatedTimePart).get('m'))
    .second(0)
    .millisecond(0);

  const { isDLSWrtDate: checkDlsWrtCurrentDate, offsetDiff } = checkDLSWrtDate();
  if (
    isAssignment &&
    checkDlsWrtCurrentDate &&
    dayjsWithStandardOffset(calculatedDate).date() !== dayjs(datePart).date()
  ) {
    // this condition will work, when DLS time is 12am and standard time is 11p as per negative offset, and when DLS time is 11p and standard time is 12a as per positive offset
    const dayValueToAdd = offsetDiff < 0 ? 1 : -1;
    calculatedDate = calculatedDate.add(dayValueToAdd, 'day');
  }

  return calculatedDate;
};

const isMidnightWRTStandardTime = (isoString) => {
  const date = dayjsWithStandardOffset(isoString);
  return date.hour() === 0 && date.minute() === 0;
};

// timePart should be in utc
// datePart should be in YYYY-MM-DD format (preferred way) or dayjs object
export const getEmbededDateAndTimeWRTStandardOffset = (timePart, datePart) => {
  // if datePart is undefined, then dayjs will pick current date.

  const formattedDate = dayjs(datePart).format('YYYY-MM-DD');

  const standardOffset = getOffsetWithStandardTime();
  const updatedTimePart = dayjsWithStandardOffset(timePart).utcOffset(standardOffset);

  let calculatedDate = dayjsWithStandardOffset(formattedDate, true)
    .hour(dayjsWithStandardOffset(updatedTimePart).get('h'))
    .minute(dayjsWithStandardOffset(updatedTimePart).get('m'))
    .second(0)
    .millisecond(0);

  return calculatedDate;
};

// get start and end time with max 24 hour difference and append any desired date into start/end time
// "date" should be in YYYY-MM-DD format (preferred way) or dayjs object
export const getStartEndTimeWithDesiredDate = (
  date,
  startTime,
  endTime,
  fullDateWithOutIso = false,
  moveEndDateToNextDayOn12Am = false,
) => {
  if (!dayjs(date).isValid() || !dayjs(startTime).isValid() || !dayjs(endTime).isValid()) return {};
  let newStartTime = getEmbededDateAndTimeWRTStandardOffset(startTime, date);
  let newEndTime = getEmbededDateAndTimeWRTStandardOffset(endTime, date);

  const isNextDate = newEndTime.isBefore(newStartTime) || newEndTime.isSame(newStartTime); // if isNextDate is true, it means endTime is at next date
  const updatedNewEndTime = isNextDate
    ? dayjs(newEndTime).set('date', dayjs(newEndTime).get('date') + 1) // add 1 date to updated end date
    : dayjs(newEndTime);

  let isEndTimeOnNextDateWrtStandardTime =
    dayjsWithStandardOffset(newStartTime).date() !==
    dayjsWithStandardOffset(updatedNewEndTime).date();

  if (!moveEndDateToNextDayOn12Am) {
    isEndTimeOnNextDateWrtStandardTime =
      isEndTimeOnNextDateWrtStandardTime && !isMidnightWRTStandardTime(updatedNewEndTime);
  } // endTime should not be equal to 12 am

  return {
    startTime: fullDateWithOutIso ? newStartTime : newStartTime?.toISOString(),
    endTime: fullDateWithOutIso ? updatedNewEndTime : updatedNewEndTime?.toISOString(),
    isEndTimeOnNextDate: isNextDate,
    isEndTimeOnNextDateWrtStandardTime,
  };
};

export const getHoursDiff = (startsAt, endsAt) => {
  const { startTime, endTime } = getStartEndTimeWithDesiredDate(
    dayjs(),
    dayjs(startsAt),
    dayjs(endsAt),
  );
  return dayjs(endTime).diff(dayjs(startTime), 'h', true);
};

export const getHoursDiff24HourFormat = (startsAt, endsAt) => {
  const timeDiff = getHoursDiff(startsAt, endsAt);
  const totalHours = timeDiff < 0 ? 24 + timeDiff : timeDiff === 0 ? 24 : timeDiff;

  return totalHours;
};

const getAlphabetAscii = (input) => 65 + (input % 26); // input can only range from 0 - 26
export const getSplittedShiftName = (t, shiftNumber, input) => {
  let alphabetsAscii = getAlphabetAscii(input);
  let alphabetStr = String.fromCharCode(alphabetsAscii);

  const noOfAsciiIterations = Math.floor(input / 26);
  const prefixAlphabet = String.fromCharCode(getAlphabetAscii(noOfAsciiIterations));

  for (let i = 0; i < noOfAsciiIterations; i++) {
    alphabetStr = prefixAlphabet + alphabetStr;
  }

  return t('obx.schedules.assignDedicatedDuty.splitDuties.defaultShiftName', {
    index: `${shiftNumber}-${alphabetStr}`,
  });
};

export const selectDayNumber = (day) => {
  return day === -1 ? 6 : day === 7 ? 0 : day;
};

export const getDaysWrtTimezone = (startTime, shiftDays, isIso) => {
  // if isIso is true, then it means convert days WRT. ISO time otherwise convert days to local time

  const timezoneOffset = new Date().getTimezoneOffset();
  const isoDate = dayjs(startTime).add(timezoneOffset, 'minute');
  const localDate = dayjs(startTime);

  // if local date is at next date than ISO date
  if (localDate.isAfter(isoDate, 'date')) {
    return shiftDays?.map((shiftDay) => {
      // for ISO time, subtract 1 day from shift day. For Local time, add 1 day to shift day.
      const day = isIso ? shiftDay - 1 : shiftDay + 1;
      return selectDayNumber(day);
    });
  }

  // if local date is at previous date than ISO date
  if (localDate.isBefore(isoDate, 'date')) {
    return shiftDays?.map((shiftDay) => {
      // for ISO time, add 1 day to shift day. For Local time, subtract 1 day from shift day.
      const day = isIso ? shiftDay + 1 : shiftDay - 1;
      return selectDayNumber(day);
    });
  }

  return shiftDays;
};

export const getDaysWrtTimezoneAsPerStandardTime = (startTime, shiftDays, isIso) => {
  // if isIso is true, then it means convert days WRT. ISO time otherwise convert days to local time

  const timezoneOffset = getOffsetWithStandardTime();
  const isoDate = dayjsWithStandardOffset(startTime).add(-timezoneOffset, 'minute');
  const localDate = dayjsWithStandardOffset(startTime);

  // if local date is at next date than ISO date

  if (localDate.isAfter(isoDate, 'date')) {
    return shiftDays?.map((shiftDay) => {
      // for ISO time, subtract 1 day from shift day. For Local time, add 1 day to shift day.
      const day = isIso ? shiftDay - 1 : shiftDay + 1;
      return selectDayNumber(day);
    });
  }

  // if local date is at previous date than ISO date
  if (localDate.isBefore(isoDate, 'date')) {
    return shiftDays?.map((shiftDay) => {
      // for ISO time, add 1 day to shift day. For Local time, subtract 1 day from shift day.
      const day = isIso ? shiftDay + 1 : shiftDay - 1;
      return selectDayNumber(day);
    });
  }

  return shiftDays;
};

export const getDisabledDaysFromEnabledDays = (enabledDays) => {
  const allDays = daysOfWeekWithVal?.map((val) => val.value);
  const disabledDays = allDays?.filter((day) => !enabledDays?.includes(day));
  return disabledDays;
};

export const getDaysBetweenDatesRangeWrtStandardDate = (startDate, endDate) => {
  const start = dayjsWithStandardOffset(startDate);
  const end = dayjsWithStandardOffset(endDate);
  const days = [];

  for (let date = start; date.isBefore(end) || date.isSame(end, 'day'); date = date.add(1, 'day')) {
    if (days?.length === 7) {
      // returning days because days length cannot increase from 7
      return days;
    }
    days.push(date.day()); // Get the short day of the week (Mon, Tue, etc.)
  }

  return days;
};

export const getCurrentTimeWithDisabledDlsInIso = (date) => {
  // if date is undefined, dayjs will pick current time
  return dayjsWithStandardOffset(date, true).toISOString(); // If DLS is enabled WRT "date in params" and we are in negative offset timezone then ISOstring will be one hour less than original ISOstring and vice versa
};

export const appendDefaultStartAndEndTimeWithDates = (dates) => {
  if (!dates || dates.length < 2) return [];
  const startDate = dayjsWithStandardOffset()
    .month(dates[0].get('month'))
    .date(dates[0].get('date'))
    .year(dates[0].get('year'))
    .startOf('day')
    .toISOString();

  const endDate = dayjsWithStandardOffset()
    .month(dates[1].get('month'))
    .date(dates[1].get('date'))
    .year(dates[1].get('year'))
    .endOf('day')
    .toISOString();

  return [startDate, endDate];
};

export const setTimeInDate = (date, time) => {
  const currentDate = dayjs.utc(date);
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);

    let updatedDate = currentDate
      .set('hour', hours)
      .set('minute', minutes)
      .set('second', 0) // Optional: reset seconds
      .set('millisecond', 0);

    return updatedDate;
  } else {
    return date;
  }
};

export const getLastShiftStartEndTimeOfJob = (startsAt, endsAt) => {
  const lastShiftStartTime = getUTCHoursAndMinutesWithUTCDate(startsAt, endsAt);

  const hoursDiff = getHoursDiff24HourFormat(startsAt, endsAt);
  const lastShiftEndTime = lastShiftStartTime.add(hoursDiff, 'hour').toISOString();

  return { lastShiftStartTime: lastShiftStartTime?.toISOString(), lastShiftEndTime };
};

/**
 * @description get the name of day from the date
 * @param {*} timestamp
 * @returns
 */
export const getDayName = (timestamp) => {
  // Create a Date object from the timestamp
  const date = new Date(timestamp);

  // Find the day name based on the getDay() result
  const dayName = daysOfWeekWithVal.find((day) => day.value === date.getDay());

  // Return the label property of the found day object
  return dayName ? dayName.label : '';
};

export const getTimeDiff = (start, end, unit = 'second') => {
  return dayjsWithStandardOffset(end).diff(dayjsWithStandardOffset(start), unit);
};

export const getTimeDiffWithFormat = (start, end) => {
  const diffInSeconds = dayjsWithStandardOffset(end).diff(dayjsWithStandardOffset(start), 'second');
  if (diffInSeconds < 60) return `${diffInSeconds}s`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ${diffInSeconds % 60}s`;

  const diffInHours = Math.floor(diffInSeconds / 3600);
  if (diffInHours < 24) return `${diffInHours}h ${Math.floor((diffInSeconds % 3600) / 60)}m`;

  const diffInDays = Math.floor(diffInSeconds / 86400);
  return `${diffInDays}d, ${Math.floor((diffInSeconds % 86400) / 3600)}h ${Math.floor((diffInSeconds % 3600) / 60)}m`;
};
