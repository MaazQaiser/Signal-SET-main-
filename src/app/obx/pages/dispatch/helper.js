import { dayjsWithStandardOffset } from '../schedules/helper';

export const stateToQueryParams = (obj, key) => {
  if (Array.isArray(obj[key])) {
    return obj[key].map((item) => item.value);
  } else if (typeof obj[key] === 'object' && obj[key] !== null && 'value' in obj[key]) {
    return obj[key].value;
  }
  return obj[key];
};

export const getTimeElapsed = (optionValue) => {
  const now = dayjsWithStandardOffset();
  const timeRanges = {
    'upto-10': [10, 0],
    '10-30': [30, 10],
    '30-60': [60, 30],
    more_than_1_hour: [60 * 24, 60],
  };
  if (timeRanges[optionValue]) {
    const [fromMinutes, toMinutes] = timeRanges[optionValue];
    return [
      dayjsWithStandardOffset(now.valueOf() - fromMinutes * 60 * 1000).toISOString(),
      dayjsWithStandardOffset(now.valueOf() - toMinutes * 60 * 1000).toISOString(),
    ];
  }
  return [];
};

// Create Dispatch - Hardcoded Options for Dispatch Type Dropdown
export const dispatchTypeOptions = [
  { value: 'alarmResponse', label: 'Alarm Response' },
  { value: 'newAlarm', label: 'New Alarm' },
];

// Create Dispatch - Hardcoded Options for Caller Request Officer Call Back
export const callerRequestOfficerCallBackOptions = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
];

// Create Dispatch - Hardcoded Options for Call from Monitoring Service Type
export const callFromMonitoringServiceTypeOptions = [
  { value: 'N/A', label: 'No monitoring service' },
  { value: 'MapCommunications(SpanishSpeaking)', label: 'Map Communications (Spanish Speaking)' },
  { value: 'RSPNDR', label: 'RSPNDR' },
  { value: 'securitas', label: 'Securitas' },
  { value: 'stealthMonitoring', label: 'Stealth Monitoring' },
  { value: 'stMoritz', label: 'St. Moritz' },
];
