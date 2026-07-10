import dayjs from 'dayjs';

export const DateToday = dayjs().format('MM/DD/YYYY');

export const formatIsoDateToMmDdYyyy = (isoDate) => {
  if (!isoDate) return null;
  const date = new Date(isoDate);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  const formattedDate = `${month}/${day}/${year}`;

  return formattedDate;
};

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const monthAbbr = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

export const convertISODateToCustomFormat = (isoDate) => {
  const date = new Date(isoDate);

  // Get the day of the week (e.g., "Mon")
  const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });

  // Get the day of the month with "st," "nd," "rd," or "th" suffix (e.g., "19th")
  const dayOfMonth = date.getDate();
  const daySuffix =
    dayOfMonth % 10 === 1 && dayOfMonth !== 11
      ? 'st'
      : dayOfMonth % 10 === 2 && dayOfMonth !== 12
        ? 'nd'
        : dayOfMonth % 10 === 3 && dayOfMonth !== 13
          ? 'rd'
          : 'th';

  // Get the month (e.g., "June")
  const month = months[date.getMonth()];

  // Construct the formatted date string
  const formattedDate = `${dayOfWeek}, ${dayOfMonth}${daySuffix} ${month}`;

  return formattedDate;
};

export const combineAndConvertDateTimeToISOFormat = (date, time) => {
  const providedDate = dayjs(date);

  const dateTime = time
    .set('day', providedDate?.day())
    .set('month', providedDate?.month())
    .set('year', providedDate?.year());

  return dateTime?.toISOString();
};

export function isValidiOSDateFormat(dateString) {
  // Define the regular expression for iOS date format
  var iOSDateFormat =
    /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
  // Test the input string against the regular expression
  return iOSDateFormat.test(dateString);
}

export function formatTimeAndDatefromTimestamp(
  isoTimestamp,
  format = 'MM/DD/YYYY',
  timePrecision = 'HH:mm',
) {
  if (!isoTimestamp) return;
  return dayjs(isoTimestamp).format(`${format} ${timePrecision}`);
}

export function formatISOTimestampToDate(isoTimestamp, format = 'MM/DD/YYYY') {
  if (!isoTimestamp) return;
  return dayjs(isoTimestamp).format(format);
}

/**
 * parase the time startTime and endTime
 * it will recieve an object
 * replace the date inside startDate and endDate with data of visitAt
 * @param {*} followUpObj
 * @returns
 */
export function updateDatesWithVisitAt(followUpObj) {
  const { startTime, endTime, followUpDate, ...rest } = followUpObj;

  // Extracting time from startTime
  const timePart = startTime.slice(11);

  // Extracting time from endTime
  const endTimePart = endTime.slice(11);

  // Creating new dates by replacing the date part with followUpDate
  const newStartDate = new Date(followUpDate);
  newStartDate.setHours(parseInt(timePart.slice(0, 2), 10));
  newStartDate.setMinutes(parseInt(timePart.slice(3, 5), 10));
  newStartDate.setSeconds(parseInt(timePart.slice(6, 8), 10));

  const newEndDate = new Date(followUpDate);
  newEndDate.setHours(parseInt(endTimePart.slice(0, 2), 10));
  newEndDate.setMinutes(parseInt(endTimePart.slice(3, 5), 10));
  newEndDate.setSeconds(parseInt(endTimePart.slice(6, 8), 10));

  // Updating the object with new dates in ISO format
  const updatedObject = {
    startTime: newStartDate.toISOString(),
    endTime: newEndDate.toISOString(),
    ...rest,
  };

  return updatedObject;
}
