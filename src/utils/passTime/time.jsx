import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

export function convertISODateTimeToMMMdYYYY(isoDateStr) {
  let date = new Date(isoDateStr);
  return date.toLocaleString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const nthNumber = (number) => {
  if (number > 3 && number < 21) return 'th';
  switch (number % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

export function convertISODateTimeToMMMDoYYYY(isoDateStr) {
  const dateObj = new Date(isoDateStr);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('en-CA', { month: 'short' });
  const year = dateObj.getFullYear();

  const date = `${month} ${day}${nthNumber(day)}, ${year}`;
  return date; // "Jan 1st, 2023"
}

/**
 * Converts the "MM/DD/YYYY" string to DayJsObject
 * Converts a date string to DayJsObject.
 * Supports "MM/DD/YYYY" and "YYYY-MM-DD" formats.
 *
 * Uses dayjs strict parsing instead of new Date() because
 * new Date("YYYY-MM-DD") parses as UTC midnight, which shifts
 * the day back by one in timezones behind UTC.
 */
export const convertMMDDYYYYToDayJsDate = (value, convertToUtc = true) => {
  if (!value) return null;

  if (dayjs.isDayjs(value)) return value;

  const parsed = dayjs(value, ['MM/DD/YYYY', 'YYYY-MM-DD']);
  if (parsed.isValid()) {
    return convertToUtc ? parsed.utc(true) : parsed;
  }

  return convertToUtc
    ? dayjs(new Date(value).toISOString()).utc(true)
    : dayjs(new Date(value).toISOString());
};

export const adjustRenewalNotification = (startDateStr, endDateStr, renewalDays) => {
  renewalDays = Number(renewalDays) < 1 ? 1 : Number(renewalDays);
  // Define the maximum allowed renewal days
  const MAX_RENEWAL_DAYS = 30;

  // Convert input date strings to dayjs objects
  const startDate = dayjs(startDateStr);
  const endDate = dayjs(endDateStr);

  // Calculate the notification date by subtracting renewalDays from endDate
  const notificationDate = endDate.subtract(renewalDays, 'day');

  // Calculate the total days between startDate and endDate
  const totalDays = endDate.diff(startDate, 'day');

  // Ensure renewalDays is within the valid range and maximum cap
  let adjustedRenewalDays = 1;

  if (notificationDate.isBefore(startDate)) {
    // If notificationDate is before startDate, set renewalDays to the minimum valid value
    adjustedRenewalDays = Math.min(totalDays, MAX_RENEWAL_DAYS);
  } else if (notificationDate.isAfter(endDate)) {
    // If notificationDate is after endDate, set renewalDays to the maximum valid value
    adjustedRenewalDays = Math.min(totalDays, MAX_RENEWAL_DAYS);
  } else {
    // Ensure renewalDays does not exceed the maximum cap
    adjustedRenewalDays = Math.min(renewalDays, MAX_RENEWAL_DAYS);
  }

  return adjustedRenewalDays;
};

/**
 * Converts the "hh:mm A" string to DayJsObject
 */
export const convertHHMMAToDayJsDate = (value) => {
  if (value == null || value === '') return null;
  if (dayjs.isDayjs(value)) return value;
  if (typeof value !== 'string') return null;

  const [hours, minutes, period] = value.replace(' ', ':').split(':');

  const isPMTime = period === 'PM' && hours !== '12';
  const is12AMTime = period === 'AM' && hours === '12';
  const militaryHours = isPMTime ? parseInt(hours, 10) + 12 : is12AMTime ? 0 : parseInt(hours, 10);

  const date = new Date();
  date.setHours(militaryHours);
  date.setMinutes(minutes);
  return dayjs(date.toISOString()).utc(true);
};

/**
 * Converts the dayJs Date object to strings:
 * 1. "MM/DD/YYYY" format if formatType = "date"
 * 2. "hh:mm A" format if formatType = "time"
 */
export const formatDayJsDate = (dayJsDate, formatType = 'time' | 'date') => {
  if (!dayjs.isDayjs(dayJsDate) || isNaN(dayJsDate['$d'])) return '';
  return formatType === 'date' ? dayJsDate.format('MM/DD/YYYY') : dayJsDate.format('hh:mm A');
  // const utcDate = dayjs.utc(dayJsDate); // keep in UTC
  // return formatType === 'date' ? utcDate.format('MM/DD/YYYY') : utcDate.format('hh:mm A');
};
